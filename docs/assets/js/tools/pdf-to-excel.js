/**
 * PDF → Excel (XLSX/CSV) trên trình duyệt.
 * Trích chữ theo toạ độ (pdf.js) → gom cột/hàng → SheetJS.
 * PDF scan: tùy chọn OCR (Tesseract) khi trang thiếu lớp text.
 */
window.OTPdfToExcel = (function () {
  "use strict";

  const MAX_PAGES = 40;
  const MAX_BYTES = 60 * 1024 * 1024;
  const TEXT_MIN_CHARS = 18;
  const OCR_SCALE = 1.6;
  const XLSX_CDN = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";

  let xlsxReady = null;
  let sharedOcrWorker = null;
  let ocrWorkerPromise = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.XLSX) {
        resolve(window.XLSX);
        return;
      }
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.XLSX));
        existing.addEventListener("error", () => reject(new Error("Không tải được SheetJS.")));
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => (window.XLSX ? resolve(window.XLSX) : reject(new Error("SheetJS không sẵn sàng.")));
      s.onerror = () => reject(new Error("Không tải được SheetJS."));
      document.head.appendChild(s);
    });
  }

  function ensureXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (window.OTExcelConvert?.ensureXlsx) return OTExcelConvert.ensureXlsx();
    if (!xlsxReady) xlsxReady = loadScript(XLSX_CDN);
    return xlsxReady;
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

  function median(arr) {
    if (!arr.length) return 0;
    const s = arr.slice().sort((a, b) => a - b);
    const m = (s.length / 2) | 0;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function enrichItems(items) {
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const raw = String(it.str || "");
      if (!raw.trim()) continue;
      const t = it.transform || [1, 0, 0, 1, 0, 0];
      const fs = Math.max(Math.hypot(t[0], t[1]), Math.hypot(t[2], t[3])) || 10;
      out.push({
        str: raw,
        x: t[4],
        y: t[5],
        width: it.width || fs * raw.length * 0.5,
        fontSize: fs
      });
    }
    return out;
  }

  function groupLines(items) {
    if (!items.length) return [];
    const sorted = items.slice().sort((a, b) => {
      if (Math.abs(a.y - b.y) > 2.5) return b.y - a.y;
      return a.x - b.x;
    });
    const medFs = median(sorted.map((e) => e.fontSize)) || 10;
    const yTol = Math.max(3.2, medFs * 0.42);
    const lines = [];
    let cur = [sorted[0]];
    let curY = sorted[0].y;

    for (let i = 1; i < sorted.length; i++) {
      const it = sorted[i];
      if (Math.abs(it.y - curY) <= yTol) {
        cur.push(it);
        curY = (curY * (cur.length - 1) + it.y) / cur.length;
      } else {
        lines.push(cur.sort((a, b) => a.x - b.x));
        cur = [it];
        curY = it.y;
      }
    }
    lines.push(cur.sort((a, b) => a.x - b.x));
    return lines;
  }

  function detectColumns(lines) {
    const starts = [];
    lines.forEach((line) => {
      line.forEach((it) => starts.push(it.x));
    });
    if (!starts.length) return [0];

    starts.sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < starts.length; i++) gaps.push(starts[i] - starts[i - 1]);
    const medGap = median(gaps.filter((g) => g > 0.5)) || 12;
    const clusterTol = Math.max(8, Math.min(28, medGap * 0.55));

    const cols = [starts[0]];
    for (let i = 1; i < starts.length; i++) {
      const x = starts[i];
      if (x - cols[cols.length - 1] > clusterTol) cols.push(x);
      else cols[cols.length - 1] = (cols[cols.length - 1] + x) / 2;
    }

    // Nếu quá nhiều cột so với dòng → gom lại theo gap lớn trong dòng
    const avgCells = lines.reduce((n, l) => n + l.length, 0) / Math.max(1, lines.length);
    if (cols.length > Math.max(8, avgCells * 2.2)) {
      return detectColumnsByGaps(lines);
    }
    return cols;
  }

  function detectColumnsByGaps(lines) {
    const gapCuts = [];
    lines.forEach((line) => {
      for (let i = 1; i < line.length; i++) {
        const prev = line[i - 1];
        const cur = line[i];
        const gap = cur.x - (prev.x + prev.width);
        const space = Math.max(prev.fontSize, cur.fontSize) * 0.85;
        if (gap > space) gapCuts.push((prev.x + prev.width + cur.x) / 2);
      }
    });
    if (!gapCuts.length) return [0];
    gapCuts.sort((a, b) => a - b);
    const cuts = [gapCuts[0]];
    for (let i = 1; i < gapCuts.length; i++) {
      if (gapCuts[i] - cuts[cuts.length - 1] > 10) cuts.push(gapCuts[i]);
    }
    const cols = [0];
    cuts.forEach((c) => cols.push(c));
    return cols;
  }

  function assignRow(line, cols) {
    const cells = cols.map(() => "");
    line.forEach((it) => {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < cols.length; c++) {
        const d = Math.abs(it.x - cols[c]);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      // Prefer column whose start is <= item.x
      for (let c = cols.length - 1; c >= 0; c--) {
        if (it.x + 1 >= cols[c]) {
          best = c;
          break;
        }
      }
      const piece = it.str.trim();
      if (!piece) return;
      cells[best] = cells[best] ? cells[best] + " " + piece : piece;
    });
    return cells.map((c) => c.replace(/\s+/g, " ").trim());
  }

  function matrixFromLines(lines) {
    if (!lines.length) return [];
    const cols = detectColumns(lines);
    let matrix = lines.map((line) => assignRow(line, cols));
    const colCount = Math.max(1, ...matrix.map((r) => r.length));
    matrix = matrix.map((r) => {
      const row = r.slice();
      while (row.length < colCount) row.push("");
      return row;
    });
    for (let c = colCount - 1; c >= 1; c--) {
      if (matrix.every((r) => !r[c])) matrix.forEach((r) => r.splice(c, 1));
    }
    return matrix.filter((r) => r.some((cell) => cell));
  }

  async function extractPageTextMatrix(page) {
    const content = await page.getTextContent({ includeMarkedContent: false });
    const items = enrichItems(content.items || []);
    const lines = groupLines(items);
    return {
      matrix: matrixFromLines(lines),
      charCount: items.reduce((n, it) => n + it.str.replace(/\s/g, "").length, 0)
    };
  }

  async function getOcrWorker() {
    if (sharedOcrWorker) return sharedOcrWorker;
    if (ocrWorkerPromise) return ocrWorkerPromise;
    ocrWorkerPromise = (async () => {
      const Tesseract = await loadTesseract();
      sharedOcrWorker = await Tesseract.createWorker("vie+eng", 1, {
        logger: () => {}
      });
      return sharedOcrWorker;
    })();
    return ocrWorkerPromise;
  }

  async function ocrPageMatrix(page) {
    const viewport = page.getViewport({ scale: OCR_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    await page.render({ canvasContext: ctx, viewport }).promise;
    const worker = await getOcrWorker();
    const { data } = await worker.recognize(canvas, {}, { text: true });
    const raw = String(data.text || "").trim();
    if (!raw) return { matrix: [], charCount: 0 };

    // Tách dòng OCR → cột bằng khoảng trắng lớn / tab
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.replace(/\s+$/g, ""))
      .filter((l) => l.trim());
    const matrix = lines.map((line) => {
      if (line.includes("\t")) return line.split("\t").map((c) => c.trim());
      const parts = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
      return parts.length > 1 ? parts : [line.trim()];
    });
    const colCount = Math.max(1, ...matrix.map((r) => r.length));
    const normalized = matrix.map((r) => {
      const row = r.slice();
      while (row.length < colCount) row.push("");
      return row;
    });
    return {
      matrix: normalized,
      charCount: raw.replace(/\s/g, "").length
    };
  }

  function sheetName(pageNo) {
    return ("Trang " + pageNo).slice(0, 31);
  }

  async function toWorkbook(sheets) {
    const XLSX = await ensureXlsx();
    const wb = XLSX.utils.book_new();
    const used = new Set();
    sheets.forEach((s) => {
      let name = s.name || "Sheet1";
      let n = 1;
      while (used.has(name)) {
        name = ((s.name || "Sheet") + " " + (++n)).slice(0, 31);
      }
      used.add(name);
      const ws = XLSX.utils.aoa_to_sheet(s.matrix.length ? s.matrix : [[""]]);
      const colWidths = [];
      s.matrix.forEach((row) => {
        row.forEach((cell, i) => {
          const len = Math.min(48, String(cell || "").length + 2);
          colWidths[i] = Math.max(colWidths[i] || 8, len);
        });
      });
      ws["!cols"] = colWidths.map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, name);
    });
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
  }

  function toCsv(matrix) {
    const esc = (cell) => {
      const s = String(cell ?? "");
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const bom = "\uFEFF";
    return bom + matrix.map((row) => row.map(esc).join(",")).join("\r\n");
  }

  function previewHtml(matrix, maxRows) {
    const rows = matrix.slice(0, maxRows || 12);
    if (!rows.length) return "<p class=\"pe-table-empty\">Không phát hiện bảng trên trang này.</p>";
    const head = rows[0];
    const body = rows.slice(1);
    const th = head.map((c) => `<th>${escapeHtml(c || "—")}</th>`).join("");
    const tr = body
      .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
      .join("");
    return `<table class="pe-table"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function convert(file, opts) {
    if (!file) throw new Error("Chọn file PDF trước.");
    if (file.size > MAX_BYTES) throw new Error("File quá lớn (tối đa 60 MB).");

    const ocrMode = opts?.ocr || "auto";
    const sheetMode = opts?.sheetMode || "pages"; // pages | merge
    const maxPages = Math.min(MAX_PAGES, Number(opts?.maxPages) || MAX_PAGES);
    const onProgress = opts?.onProgress;

    onProgress?.({ phase: "load", page: 0, total: 1, pct: 4 });
    const pdfjs = await loadPdfJs();
    await ensureXlsx();
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const totalPages = doc.numPages;
    const limit = Math.min(totalPages, maxPages);
    const truncated = totalPages > limit;

    const pageMatrices = [];
    let ocrUsed = false;
    let totalCells = 0;

    for (let i = 1; i <= limit; i++) {
      onProgress?.({ phase: "read", page: i, total: limit, pct: 6 + Math.round((i / limit) * 70) });
      await yieldUi();
      const page = await doc.getPage(i);
      let extracted = await extractPageTextMatrix(page);
      const needOcr =
        ocrMode === "on" || (ocrMode === "auto" && extracted.charCount < TEXT_MIN_CHARS);

      if (needOcr) {
        onProgress?.({ phase: "ocr", page: i, total: limit, pct: 6 + Math.round((i / limit) * 70) });
        const ocr = await ocrPageMatrix(page);
        if (ocr.matrix.length && (ocr.charCount > extracted.charCount || !extracted.matrix.length)) {
          extracted = ocr;
          ocrUsed = true;
        }
      }

      pageMatrices.push(extracted.matrix);
      totalCells += extracted.matrix.reduce((n, r) => n + r.filter(Boolean).length, 0);
    }

    if (!totalCells) {
      throw new Error(
        "Không lấy được bảng/chữ từ PDF. Thử bật «Luôn nhận dạng ảnh chữ» hoặc dùng PDF có lớp text."
      );
    }

    onProgress?.({ phase: "build", page: limit, total: limit, pct: 88 });
    let sheets;
    let previewMatrix;

    if (sheetMode === "merge") {
      const merged = [];
      pageMatrices.forEach((m, idx) => {
        if (!m.length) return;
        if (merged.length) merged.push(Array(Math.max(m[0].length, 1)).fill(""));
        if (pageMatrices.length > 1) {
          const label = Array(Math.max(m[0].length, 1)).fill("");
          label[0] = "— Trang " + (idx + 1) + " —";
          merged.push(label);
        }
        m.forEach((row) => merged.push(row));
      });
      const colCount = Math.max(1, ...merged.map((r) => r.length));
      const normalized = merged.map((r) => {
        const row = r.slice();
        while (row.length < colCount) row.push("");
        return row;
      });
      sheets = [{ name: "PDF", matrix: normalized }];
      previewMatrix = normalized;
    } else {
      sheets = pageMatrices.map((m, idx) => ({
        name: sheetName(idx + 1),
        matrix: m.length ? m : [[""]]
      }));
      previewMatrix = pageMatrices.find((m) => m.length) || [];
    }

    const blob = await toWorkbook(sheets);
    const base = String(file.name || "document").replace(/\.pdf$/i, "");
    const fileName = base + ".xlsx";
    const csv = toCsv(previewMatrix);

    onProgress?.({ phase: "done", page: limit, total: limit, pct: 100 });

    return {
      blob,
      fileName,
      csv,
      previewHtml: previewHtml(previewMatrix, 14),
      meta: {
        pageCount: limit,
        totalPages,
        truncated,
        ocrUsed,
        sheetCount: sheets.length,
        rowCount: previewMatrix.length,
        colCount: previewMatrix[0]?.length || 0,
        cellCount: totalCells
      }
    };
  }

  function warmup() {
    ensureXlsx().catch(() => {});
    loadPdfJs().catch(() => {});
  }

  return {
    MAX_PAGES,
    MAX_BYTES,
    convert,
    toCsv,
    warmup
  };
})();
