/**
 * PDF → Word (DOCX) trên trình duyệt.
 * Trích chữ theo toạ độ (pdf.js) → dựng đoạn/tiêu đề → Packer DOCX.
 * PDF scan: nhận dạng ảnh chữ (vie+eng) khi trang thiếu lớp text.
 */
window.OTPdfToWord = (function () {
  "use strict";

  const MAX_PAGES = 80;
  const MAX_BYTES = 80 * 1024 * 1024;
  /** Scale OCR: 1.55 cân tốc độ / độ rõ tiếng Việt */
  const OCR_SCALE = 1.55;
  const TEXT_MIN_CHARS = 12;

  let sharedOcrWorker = null;
  let ocrWorkerPromise = null;

  async function loadDocx() {
    if (window.docx?.Document && window.docx?.Packer) return window.docx;
    const mod = await import("https://cdn.jsdelivr.net/npm/docx@8.5.0/+esm");
    window.docx = mod;
    return mod;
  }

  async function loadPdfJs() {
    if (window.OTPdf?.loadPdfJs) return window.OTPdf.loadPdfJs();
    if (window.pdfjsLib) return window.pdfjsLib;
    window.pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.mjs");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";
    return window.pdfjsLib;
  }

  async function loadTesseract() {
    const mod = await import("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js");
    return mod.default || mod;
  }

  function yieldUi() {
    return new Promise((r) => {
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => r());
      else setTimeout(r, 0);
    });
  }

  function fontSizeOf(item) {
    const t = item.transform || [1, 0, 0, 1, 0, 0];
    const sx = Math.hypot(t[0], t[1]);
    const sy = Math.hypot(t[2], t[3]);
    return Math.max(sx, sy) || 12;
  }

  function median(arr) {
    if (!arr.length) return 0;
    const s = arr.length < 32 ? [...arr].sort((a, b) => a - b) : arr.slice().sort((a, b) => a - b);
    const m = (s.length / 2) | 0;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function groupLines(items) {
    if (!items.length) return { lines: [], medianFs: 12 };

    const enriched = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.str == null || !String(it.str).length) continue;
      const t = it.transform || [1, 0, 0, 1, 0, 0];
      enriched.push({
        str: String(it.str),
        x: t[4],
        y: t[5],
        fontSize: fontSizeOf(it),
        width: it.width || 0
      });
    }
    if (!enriched.length) return { lines: [], medianFs: 12 };

    enriched.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 2.5) return b.y - a.y;
      return a.x - b.x;
    });

    const sizes = enriched.map((e) => e.fontSize);
    const medianFs = median(sizes) || 12;
    const yTol = Math.max(3, medianFs * 0.35);

    const lines = [];
    let cur = [enriched[0]];
    let curY = enriched[0].y;

    for (let i = 1; i < enriched.length; i++) {
      const it = enriched[i];
      if (Math.abs(it.y - curY) <= yTol) {
        cur.push(it);
        curY = (curY * (cur.length - 1) + it.y) / cur.length;
      } else {
        lines.push(finalizeLine(cur, medianFs));
        cur = [it];
        curY = it.y;
      }
    }
    lines.push(finalizeLine(cur, medianFs));
    return { lines, medianFs };
  }

  function finalizeLine(items, medianFs) {
    items.sort((a, b) => a.x - b.x);
    let text = "";
    let prev = null;
    let fsSum = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const raw = it.str;
      if (!raw) continue;
      if (prev == null) {
        text = raw;
      } else {
        const gap = it.x - (prev.x + (prev.width || 0));
        const spaceW = Math.max(prev.fontSize, it.fontSize) * 0.2;
        if (gap > spaceW && !/\s$/.test(text) && !/^\s/.test(raw)) text += " ";
        text += raw;
      }
      fsSum += it.fontSize;
      prev = it;
    }
    text = text.replace(/[ \t]+/g, " ").trim();
    const fontSize = items.length ? fsSum / items.length : medianFs;
    const y = items[(items.length / 2) | 0]?.y ?? 0;
    return { text, fontSize, y, x: items[0]?.x || 0 };
  }

  function linesToBlocks(lines, medianFs) {
    if (!lines.length) return [];
    const gapBreak = Math.max(10, medianFs * 1.15);
    const blocks = [];
    let buf = [];
    let lastY = null;

    const flush = () => {
      if (!buf.length) return;
      const text = buf.map((l) => l.text).join(" ").replace(/\s+/g, " ").trim();
      if (!text) {
        buf = [];
        return;
      }
      const fs = buf.reduce((s, l) => s + l.fontSize, 0) / buf.length;
      const isHeading =
        fs >= medianFs * 1.32 && text.length < 120 && !/[.!?…:]$/.test(text);
      blocks.push({ text, fontSize: fs, heading: isHeading });
      buf = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.text) continue;
      if (lastY != null && lastY - line.y > gapBreak) flush();
      buf.push(line);
      lastY = line.y;
    }
    flush();
    return blocks;
  }

  function hasUsefulText(plain, itemCount) {
    const chars = plain.replace(/\s/g, "").length;
    if (chars >= TEXT_MIN_CHARS) return true;
    // Nhiều glyph ngắn (ký hiệu) vẫn coi là có lớp chữ
    return itemCount >= 6 && chars >= 4;
  }

  async function renderPageCanvas(page, scale) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d", { alpha: false });
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  }

  async function getOcrWorker() {
    if (sharedOcrWorker) return sharedOcrWorker;
    if (ocrWorkerPromise) return ocrWorkerPromise;
    ocrWorkerPromise = (async () => {
      const Tesseract = await loadTesseract();
      const worker = await Tesseract.createWorker("vie+eng", 1, {
        logger: () => {}
      });
      // Khối văn bản đều — nhanh hơn, vẫn ổn với trang tài liệu
      await worker.setParameters({
        tessedit_pageseg_mode: "6",
        preserve_interword_spaces: "1"
      });
      sharedOcrWorker = worker;
      return worker;
    })();
    try {
      return await ocrWorkerPromise;
    } finally {
      ocrWorkerPromise = null;
    }
  }

  async function ocrPage(page, worker) {
    const canvas = await renderPageCanvas(page, OCR_SCALE);
    try {
      const {
        data: { text }
      } = await worker.recognize(canvas);
      return (text || "").trim();
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  function ocrTextToBlocks(text) {
    return text
      .split(/\n{2,}/)
      .map((p) => p.replace(/\n+/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .map((t) => {
        const short = t.length < 80 && !/[.!?…]$/.test(t);
        const caps = t === t.toUpperCase() && /[A-ZÀ-Ỵ]/.test(t);
        return { text: t, fontSize: short && caps ? 16 : 12, heading: !!(short && caps) };
      });
  }

  async function extractDocument(file, { maxPages = MAX_PAGES, ocr = "auto", onProgress } = {}) {
    if (!file) throw new Error("Chọn file PDF trước.");
    if (file.size > MAX_BYTES) throw new Error("File hơi lớn — hãy dùng bản dưới 80 MB.");

    const pdfjs = await loadPdfJs();
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const total = doc.numPages;
    const n = Math.min(total, maxPages);

    const pages = [];
    let ocrUsed = false;
    let charCount = 0;

    for (let i = 1; i <= n; i++) {
      onProgress?.({ page: i, total: n, phase: "extract" });
      const page = await doc.getPage(i);
      const content = await page.getTextContent({
        includeMarkedContent: false,
        disableCombineTextItems: false
      });
      const items = content.items || [];
      const grouped = groupLines(items);
      let blocks = linesToBlocks(grouped.lines || [], grouped.medianFs || 12);
      let plain = blocks.map((b) => b.text).join("\n");

      const needOcr =
        ocr === "on" || (ocr === "auto" && !hasUsefulText(plain, items.length));

      if (needOcr) {
        onProgress?.({ page: i, total: n, phase: "ocr" });
        const worker = await getOcrWorker();
        const ocrText = await ocrPage(page, worker);
        if (ocrText) {
          blocks = ocrTextToBlocks(ocrText);
          plain = ocrText;
          ocrUsed = true;
        }
      }

      charCount += plain.replace(/\s/g, "").length;
      pages.push({ pageNum: i, blocks, preview: plain });
      page.cleanup?.();
      if (i % 2 === 0) await yieldUi();
    }

    try {
      await doc.destroy?.();
    } catch (_) {}

    return {
      pages,
      pageCount: n,
      totalPages: total,
      ocrUsed,
      charCount,
      truncated: total > maxPages
    };
  }

  async function buildDocx(extracted, { title } = {}) {
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      HeadingLevel,
      AlignmentType
    } = await loadDocx();

    const children = [];
    if (title) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          children: [new TextRun({ text: title, bold: true })]
        })
      );
      children.push(new Paragraph({ children: [] }));
    }

    extracted.pages.forEach((pg, idx) => {
      const pageBreakBefore = idx > 0;

      if (!pg.blocks.length) {
        children.push(
          new Paragraph({
            pageBreakBefore,
            children: [
              new TextRun({
                text: "(Trang trống)",
                italics: true,
                color: "888888"
              })
            ]
          })
        );
        return;
      }

      pg.blocks.forEach((block, bi) => {
        const sizePt = Math.min(28, Math.max(10, Math.round(block.fontSize)));
        const breakHere = pageBreakBefore && bi === 0;
        if (block.heading) {
          children.push(
            new Paragraph({
              pageBreakBefore: breakHere,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 240, after: 120 },
              children: [
                new TextRun({
                  text: block.text,
                  bold: true,
                  size: Math.max(24, sizePt * 2)
                })
              ]
            })
          );
        } else {
          children.push(
            new Paragraph({
              pageBreakBefore: breakHere,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 160, line: 276 },
              children: [
                new TextRun({
                  text: block.text,
                  size: sizePt * 2,
                  font: "Times New Roman"
                })
              ]
            })
          );
        }
      });
    });

    const doc = new Document({
      creator: "OneTool",
      title: title || "PDF to Word",
      description: "Chuyển PDF sang Word trên OneTool.vn",
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 }
            }
          },
          children
        }
      ]
    });

    return Packer.toBlob(doc);
  }

  async function convert(file, options = {}) {
    // Song song: đọc PDF + nạp thư viện Word
    const extractPromise = extractDocument(file, options);
    const docxPromise = loadDocx();
    const extracted = await extractPromise;
    await docxPromise;

    if (!extracted.charCount && !extracted.ocrUsed) {
      throw new Error("Không đọc được chữ trong file. Thử chế độ nhận dạng ảnh chữ.");
    }
    const base = (file.name || "document").replace(/\.pdf$/i, "");
    const blob = await buildDocx(extracted, { title: base });
    return {
      blob,
      fileName: OT.nameWithSuffix(file.name, "", ".docx"),
      meta: {
        pageCount: extracted.pageCount,
        totalPages: extracted.totalPages,
        ocrUsed: extracted.ocrUsed,
        charCount: extracted.charCount,
        truncated: extracted.truncated,
        preview: extracted.pages
          .map((p) => p.preview)
          .filter(Boolean)
          .join("\n\n")
          .slice(0, 4000)
      }
    };
  }

  /** Prefetch thư viện khi rảnh — lần bấm đầu nhanh hơn */
  function warmup() {
    loadPdfJs().catch(() => {});
    loadDocx().catch(() => {});
  }

  return { convert, extractDocument, buildDocx, warmup, MAX_PAGES, MAX_BYTES };
})();
