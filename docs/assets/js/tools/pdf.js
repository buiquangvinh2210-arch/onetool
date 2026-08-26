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

  async function renderPageCanvas(page, scaleOrOpts = 2) {
    const opts =
      typeof scaleOrOpts === "object" && scaleOrOpts !== null
        ? scaleOrOpts
        : { scale: scaleOrOpts };
    const renderScale = resolveExportScale(page, opts);
    const viewport = page.getViewport({ scale: renderScale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    await page.render({
      canvasContext: ctx,
      viewport,
      intent: "print",
      annotationMode: 0 // DISABLE — tránh lớp phủ làm mờ ảnh xuất
    }).promise;

    return { canvas, scale: renderScale, width: canvas.width, height: canvas.height };
  }

  /** PDF user space = 72 DPI. scale 1 ≈ 72 DPI, 200 DPI ≈ 2.78× */
  function resolveExportScale(page, { scale, dpi, maxEdge = 12000 } = {}) {
    const PDF_DPI = 72;
    let s;
    if (dpi > 0) {
      s = dpi / PDF_DPI;
    } else if (scale > 0) {
      s = scale;
    } else {
      s = 200 / PDF_DPI;
    }

    const base = page.getViewport({ scale: 1 });
    const longest = Math.max(base.width, base.height);
    if (longest > 0) {
      const cap = maxEdge / longest;
      if (s > cap) s = cap;
    }
    return Math.max(0.5, s);
  }

  function exportQuality(format, quality) {
    const key = (format || "png").toLowerCase();
    if (key === "png") return undefined;
    const q = quality != null ? Number(quality) : 0.97;
    return Math.min(0.98, Math.max(0.85, q));
  }

  async function ocrPageText(page, worker) {
    const { canvas } = await renderPageCanvas(page, { dpi: 200 });
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

  async function pageToPng(file, pageNum = 1, scaleOrOpts = {}) {
    const opts =
      typeof scaleOrOpts === "number"
        ? { scale: scaleOrOpts }
        : scaleOrOpts && typeof scaleOrOpts === "object"
          ? scaleOrOpts
          : { dpi: 200 };
    const doc = await openPdfDoc(file);
    const n = Math.min(Math.max(1, pageNum), doc.numPages);
    const page = await doc.getPage(n);
    const { canvas, scale } = await renderPageCanvas(page, opts);
    const blob = await OT.canvasToBlob(canvas, "image/png");
    return {
      blob,
      pageNum: n,
      totalPages: doc.numPages,
      width: canvas.width,
      height: canvas.height,
      dpi: Math.round(scale * 72)
    };
  }

  async function firstPagePng(file) {
    const { blob } = await pageToPng(file, 1);
    return blob;
  }

  async function allPagesPngZip(file, { maxPages = 50, scale, dpi = 200, onProgress } = {}) {
    const result = await pagesToImages(file, {
      format: "png",
      maxPages,
      scale,
      dpi,
      onProgress,
      zip: true
    });
    return { blob: result.zipBlob, pageCount: result.pageCount, totalPages: result.totalPages };
  }

  function imageMimeExt(format) {
    const key = (format || "png").toLowerCase();
    if (key === "jpg" || key === "jpeg") return { type: "image/jpeg", ext: ".jpg" };
    if (key === "webp") return { type: "image/webp", ext: ".webp" };
    return { type: "image/png", ext: ".png" };
  }

  async function pagesToImages(file, {
    format = "png",
    quality = 0.97,
    scale,
    dpi = 200,
    maxPages = 80,
    pageSpec,
    zip = true,
    onProgress
  } = {}) {
    const { type, ext } = imageMimeExt(format);
    const q = exportQuality(format, quality);
    const doc = await openPdfDoc(file);
    const total = doc.numPages;
    let indices;
    if (pageSpec && String(pageSpec).trim()) {
      indices = OT.parsePageSpec(pageSpec, total);
    } else {
      const n = Math.min(total, maxPages);
      indices = Array.from({ length: n }, (_, i) => i + 1);
    }
    if (!indices.length) throw new Error("Không có trang nào để xuất.");
    if (indices.length > maxPages) {
      throw new Error(`Tối đa ${maxPages} trang mỗi lần. Đang chọn ${indices.length} trang.`);
    }

    const pages = [];
    let effectiveDpi = dpi;
    for (let i = 0; i < indices.length; i++) {
      const pageNum = indices[i];
      onProgress?.({ page: i + 1, total: indices.length, pageNum });
      const page = await doc.getPage(pageNum);
      const rendered = await renderPageCanvas(page, { scale, dpi });
      effectiveDpi = Math.round(rendered.scale * 72);
      const blob = await OT.canvasToBlob(rendered.canvas, type, q);
      pages.push({
        pageNum,
        blob,
        width: rendered.width,
        height: rendered.height,
        dpi: effectiveDpi,
        fileName: `trang-${String(pageNum).padStart(3, "0")}${ext}`
      });
    }

    let zipBlob = null;
    if (zip && pages.length > 1) {
      const JSZip = await loadJSZip();
      const z = new JSZip();
      pages.forEach((p) => z.file(p.fileName, p.blob));
      zipBlob = await z.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    }

    return {
      pages,
      zipBlob,
      pageCount: pages.length,
      totalPages: total,
      format: ext.replace(".", ""),
      dpi: effectiveDpi
    };
  }

  async function fileToEmbeddableBytes(file, { jpegQuality = 0.98, preferPngForAlpha = true } = {}) {
    const name = (file.name || "").toLowerCase();
    const mime = (file.type || "").toLowerCase();
    const isPng = mime.includes("png") || name.endsWith(".png");
    const isJpg =
      mime.includes("jpeg") ||
      mime.includes("jpg") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg");

    if (isPng || isJpg) {
      return {
        bytes: new Uint8Array(await file.arrayBuffer()),
        kind: isPng ? "png" : "jpg",
        width: null,
        height: null
      };
    }

    const img = await OT.loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const isGif = mime.includes("gif") || name.endsWith(".gif");
    const usePng = preferPngForAlpha && (isGif || mime.includes("webp"));
    if (!usePng) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    const blob = await OT.canvasToBlob(
      canvas,
      usePng ? "image/png" : "image/jpeg",
      usePng ? undefined : jpegQuality
    );
    return {
      bytes: new Uint8Array(await blob.arrayBuffer()),
      kind: usePng ? "png" : "jpg",
      width: canvas.width,
      height: canvas.height
    };
  }

  const PAGE_PRESETS = {
    a4: { w: 595.28, h: 841.89 },
    letter: { w: 612, h: 792 }
  };

  async function imagesToPdf(files, {
    pageSize = "fit",
    margin = 36,
    jpegQuality = 0.98,
    onProgress
  } = {}) {
    if (!files?.length) throw new Error("Chọn ít nhất một ảnh.");
    if (files.length > 40) throw new Error("Tối đa 40 ảnh mỗi lần.");

    const { PDFDocument } = await loadPdfLib();
    const out = await PDFDocument.create();
    const preset = PAGE_PRESETS[pageSize] || null;
    const m = Math.max(0, Number(margin) || 0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.({ page: i + 1, total: files.length, name: file.name });
      const { bytes, kind } = await fileToEmbeddableBytes(file, { jpegQuality });
      const img = kind === "png" ? await out.embedPng(bytes) : await out.embedJpg(bytes);
      const iw = img.width;
      const ih = img.height;

      let pageW;
      let pageH;
      let drawW;
      let drawH;
      let x;
      let y;

      if (!preset || pageSize === "fit") {
        // 1 pixel ≈ 1 point — giữ nguyên độ phân giải gốc
        pageW = iw;
        pageH = ih;
        drawW = iw;
        drawH = ih;
        x = 0;
        y = 0;
      } else {
        const landscape = iw > ih;
        pageW = landscape ? Math.max(preset.w, preset.h) : Math.min(preset.w, preset.h);
        pageH = landscape ? Math.min(preset.w, preset.h) : Math.max(preset.w, preset.h);
        const maxW = Math.max(10, pageW - m * 2);
        const maxH = Math.max(10, pageH - m * 2);
        const fitScale = Math.min(maxW / iw, maxH / ih, 1);
        drawW = iw * fitScale;
        drawH = ih * fitScale;
        x = (pageW - drawW) / 2;
        y = (pageH - drawH) / 2;
      }

      const page = out.addPage([pageW, pageH]);
      page.drawImage(img, { x, y, width: drawW, height: drawH });
    }

    const pdfBytes = await out.save({ useObjectStreams: true });
    return {
      bytes: pdfBytes,
      pageCount: files.length,
      blob: new Blob([pdfBytes], { type: "application/pdf" })
    };
  }

  return {
    merge, split, rotateOrDelete, compress,
    toText, pageToPng, firstPagePng, allPagesPngZip,
    pagesToImages, imagesToPdf, resolveExportScale,
    loadPdfLib, loadPdfJs,
    VERSION: 4
  };
})();