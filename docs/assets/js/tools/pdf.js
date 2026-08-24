window.OTPdf = (function () {
  "use strict";

  async function loadPdfLib() {
    if (window.PDFLib) return window.PDFLib;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Không tải được pdf-lib."));
      document.head.appendChild(s);
    });
    return window.PDFLib;
  }

  async function loadPdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    window.pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.mjs");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";
    return window.pdfjsLib;
  }

  async function merge(files) {
    const { PDFDocument } = await loadPdfLib();
    const out = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach(p => out.addPage(p));
    }
    return await out.save();
  }

  async function split(file, pageSpec) {
    const { PDFDocument } = await loadPdfLib();
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const indices = OT.parsePageSpec(pageSpec, src.getPageCount()).map(n => n - 1);
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    pages.forEach(p => out.addPage(p));
    return await out.save();
  }

  async function rotateOrDelete(file, { degrees, deletePages, rotatePages }) {
    const { PDFDocument, degrees: degFn } = await loadPdfLib();
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const count = src.getPageCount();
    const deleteSet = new Set(
      deletePages ? OT.parsePageSpec(deletePages, count) : []
    );
    const rotateSet = new Set(
      rotatePages ? OT.parsePageSpec(rotatePages, count) : [...Array(count)].map((_, i) => i + 1)
    );
    const out = await PDFDocument.create();
    const keep = [];
    for (let i = 1; i <= count; i++) {
      if (!deleteSet.has(i)) keep.push(i - 1);
    }
    if (!keep.length) throw new Error("Không còn trang nào sau khi xóa.");
    const pages = await out.copyPages(src, keep);
    pages.forEach((p, idx) => {
      const pageNum = keep[idx] + 1;
      if (degrees && rotateSet.has(pageNum)) {
        p.setRotation(degFn((p.getRotation().angle + degrees) % 360));
      }
      out.addPage(p);
    });
    return await out.save();
  }

  async function compressLight(file) {
    const { PDFDocument } = await loadPdfLib();
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach(p => out.addPage(p));
    return await out.save({ useObjectStreams: true });
  }

  async function compressAsImages(file, quality, scale) {
    const pdfjs = await loadPdfJs();
    const { PDFDocument } = await loadPdfLib();
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const out = await PDFDocument.create();
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: scale || 1.2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      const blob = await OT.canvasToBlob(canvas, "image/jpeg", quality);
      const jpg = new Uint8Array(await blob.arrayBuffer());
      const img = await out.embedJpg(jpg);
      const p = out.addPage([img.width, img.height]);
      p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    return await out.save({ useObjectStreams: true });
  }

  async function compress(file, level) {
    const before = file.size;
    let bytes;
    let levelName = level;
    if (level === "light") {
      bytes = await compressLight(file);
      levelName = "light";
    } else if (level === "strong") {
      bytes = await compressAsImages(file, 0.45, 1.0);
      levelName = "strong";
    } else {
      bytes = await compressAsImages(file, 0.72, 1.25);
      levelName = "medium";
    }
    const after = bytes.byteLength;
    const saved = Math.max(0, before - after);
    const percent = before > 0 ? Math.round((saved * 1000) / before) / 10 : 0;
    return {
      bytes,
      meta: {
        beforeBytes: before,
        afterBytes: after,
        savedBytes: saved,
        savedPercent: percent,
        level: levelName,
        note: percent >= 5
          ? `Đã giảm khoảng ${percent}% dung lượng.`
          : "Đã xử lý; mức giảm nhỏ (PDF ít ảnh / đã tối ưu)."
      }
    };
  }

  async function loadJSZip() {
    if (window.JSZip) return window.JSZip;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Không tải được JSZip."));
      document.head.appendChild(s);
    });
    return window.JSZip;
  }

  let tesseractModule = null;
  async function loadTesseract() {
    if (tesseractModule) return tesseractModule;
    tesseractModule = await import("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js");
    return tesseractModule.default || tesseractModule;
  }

  async function openPdfDoc(file) {
    const pdfjs = await loadPdfJs();
    const data = new Uint8Array(await file.arrayBuffer());
    return pdfjs.getDocument({ data }).promise;
  }

  function extractPageText(content) {
    const items = (content.items || []).filter(it => it.str && String(it.str).trim());
    if (!items.length) return "";

    items.sort((a, b) => {
      const ya = a.transform[5];
      const yb = b.transform[5];
      if (Math.abs(ya - yb) > 4) return yb - ya;
      return a.transform[4] - b.transform[4];
    });

    let text = "";
    let lastY = null;
    for (const it of items) {
      const y = it.transform[5];
      if (lastY != null && Math.abs(y - lastY) > 4) text += "\n";
      else if (text && !text.endsWith("\n")) text += " ";
      text += it.str;
      if (it.hasEOL) text += "\n";
      lastY = y;
    }
    return text.replace(/\n{3,}/g, "\n\n").trim();
  }

  async function renderPageCanvas(page, scale = 2) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    return canvas;
  }

  async function ocrPageText(page, worker) {
    const canvas = await renderPageCanvas(page, 2);
    const { data: { text } } = await worker.recognize(canvas);
    return (text || "").trim();
  }

  async function createOcrWorker() {
    const Tesseract = await loadTesseract();
    return Tesseract.createWorker("vie+eng");
  }

  async function toText(file, { maxPages = 50, onProgress } = {}) {
    const doc = await openPdfDoc(file);
    const total = doc.numPages;
    const n = Math.min(total, maxPages);
    const parts = [];
    let ocrUsed = false;
    let ocrWorker = null;

    try {
      for (let i = 1; i <= n; i++) {
        onProgress?.({ page: i, total: n, phase: "extract" });
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        let text = extractPageText(content);

        if (text.replace(/\s/g, "").length < 8) {
          onProgress?.({ page: i, total: n, phase: "ocr" });
          if (!ocrWorker) ocrWorker = await createOcrWorker();
          text = await ocrPageText(page, ocrWorker);
          ocrUsed = true;
        }

        parts.push(`--- Trang ${i} ---\n${text || "(Không đọc được nội dung trang này)"}`);
      }
    } finally {
      if (ocrWorker) await ocrWorker.terminate();
    }

    let result = parts.join("\n\n");
    if (total > maxPages) result += `\n\n… (chỉ xử lý ${maxPages}/${total} trang)`;
    if (ocrUsed) result = `[PDF scan/ảnh — đã dùng OCR để đọc chữ]\n\n${result}`;

    return { text: result, ocrUsed, pageCount: n, totalPages: total };
  }

  async function pageToPng(file, pageNum = 1, scale = 2) {
    const doc = await openPdfDoc(file);
    const n = Math.min(Math.max(1, pageNum), doc.numPages);
    const page = await doc.getPage(n);
    const canvas = await renderPageCanvas(page, scale);
    const blob = await OT.canvasToBlob(canvas, "image/png");
    return { blob, pageNum: n, totalPages: doc.numPages };
  }

  async function firstPagePng(file) {
    const { blob } = await pageToPng(file, 1);
    return blob;
  }

  async function allPagesPngZip(file, { maxPages = 50, scale = 2, onProgress } = {}) {
    const JSZip = await loadJSZip();
    const doc = await openPdfDoc(file);
    const total = doc.numPages;
    const n = Math.min(total, maxPages);
    const zip = new JSZip();

    for (let i = 1; i <= n; i++) {
      onProgress?.({ page: i, total: n });
      const page = await doc.getPage(i);
      const canvas = await renderPageCanvas(page, scale);
      const blob = await OT.canvasToBlob(canvas, "image/png");
      zip.file(`trang-${String(i).padStart(3, "0")}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    return { blob: zipBlob, pageCount: n, totalPages: total };
  }

  return {
    merge, split, rotateOrDelete, compress,
    toText, pageToPng, firstPagePng, allPagesPngZip,
    loadPdfLib, loadPdfJs,
    VERSION: 2
  };
})();
