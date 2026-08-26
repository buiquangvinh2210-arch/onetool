/**
 * OCR bảng từ ảnh → rows → Excel/CSV (Tesseract + SheetJS).
 */
window.OTOcrTable = (function () {
  "use strict";

  let tesseractMod = null;
  let worker = null;
  let workerLang = "";

  async function loadTesseract() {
    if (tesseractMod) return tesseractMod;
    tesseractMod = await import("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js");
    return tesseractMod.default || tesseractMod;
  }

  async function getWorker(lang, onProgress) {
    const Tesseract = await loadTesseract();
    const key = lang || "vie+eng";
    if (worker && workerLang === key) return worker;
    if (worker) {
      try {
        await worker.terminate();
      } catch (_) {}
      worker = null;
    }
    onProgress?.({ stage: "init", pct: 5, message: "Đang tải OCR…" });
    worker = await Tesseract.createWorker(key, 1, {
      logger: (m) => {
        if (m.status === "recognizing text" && m.progress != null) {
          onProgress?.({
            stage: "ocr",
            pct: 10 + Math.round(m.progress * 70),
            message: "Đang nhận dạng…"
          });
        }
      }
    });
    workerLang = key;
    return worker;
  }

  function clusterRows(words, yTol) {
    const sorted = [...words].sort((a, b) => a.cy - b.cy || a.cx - b.cx);
    const rows = [];
    for (const w of sorted) {
      const last = rows[rows.length - 1];
      if (!last || Math.abs(last.cy - w.cy) > yTol) {
        rows.push({ cy: w.cy, words: [w] });
      } else {
        last.words.push(w);
        last.cy = (last.cy * (last.words.length - 1) + w.cy) / last.words.length;
      }
    }
    rows.forEach((r) => r.words.sort((a, b) => a.cx - b.cx));
    return rows;
  }

  function detectColumns(rows) {
    const allX = [];
    rows.forEach((r) => r.words.forEach((w) => allX.push(w.cx)));
    if (!allX.length) return [];
    allX.sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < allX.length; i++) gaps.push({ i, gap: allX[i] - allX[i - 1] });
    const medianGap =
      gaps.length === 0
        ? 40
        : gaps.map((g) => g.gap).sort((a, b) => a - b)[Math.floor(gaps.length / 2)] || 40;
    const splitGap = Math.max(28, medianGap * 1.8);

    const centers = [];
    for (const x of allX) {
      const last = centers[centers.length - 1];
      if (last == null || x - last > splitGap) centers.push(x);
      else centers[centers.length - 1] = (last + x) / 2;
    }
    return centers;
  }

  function assignCells(rows, colCenters) {
    if (!colCenters.length) {
      return rows.map((r) => [r.words.map((w) => w.text).join(" ")]);
    }
    return rows.map((r) => {
      const cells = colCenters.map(() => []);
      for (const w of r.words) {
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < colCenters.length; i++) {
          const d = Math.abs(colCenters[i] - w.cx);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        cells[best].push(w.text);
      }
      return cells.map((c) => c.join(" ").trim());
    });
  }

  function wordsFromResult(data) {
    const words = (data.words || [])
      .filter((w) => w && String(w.text || "").trim() && (w.confidence == null || w.confidence > 35))
      .map((w) => {
        const b = w.bbox || {};
        const x0 = b.x0 ?? 0;
        const y0 = b.y0 ?? 0;
        const x1 = b.x1 ?? x0;
        const y1 = b.y1 ?? y0;
        return {
          text: String(w.text).trim(),
          cx: (x0 + x1) / 2,
          cy: (y0 + y1) / 2,
          h: Math.max(1, y1 - y0)
        };
      });
    return words;
  }

  /**
   * @param {File|Blob} image
   * @param {{ lang?: string, onProgress?: Function }} opts
   */
  async function recognizeTable(image, opts = {}) {
    if (!image) throw new Error("Chọn ảnh bảng / biên lai / screenshot.");
    const lang = opts.lang || "vie+eng";
    const w = await getWorker(lang, opts.onProgress);
    opts.onProgress?.({ stage: "ocr", pct: 12, message: "Đang OCR…" });
    const { data } = await w.recognize(image);
    opts.onProgress?.({ stage: "parse", pct: 85, message: "Đang dựng bảng…" });

    const words = wordsFromResult(data);
    if (!words.length) {
      const raw = String(data.text || "").trim();
      if (!raw) throw new Error("Không nhận ra chữ nào. Thử ảnh rõ hơn / tăng độ tương phản.");
      const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const matrix = lines.map((line) => {
        if (line.includes("\t")) return line.split("\t");
        if (line.includes("|")) return line.split("|").map((c) => c.trim()).filter(Boolean);
        const parts = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
        return parts.length > 1 ? parts : [line];
      });
      return { matrix, rawText: raw, wordCount: 0 };
    }

    const avgH = words.reduce((s, x) => s + x.h, 0) / words.length;
    const rows = clusterRows(words, Math.max(8, avgH * 0.55));
    const cols = detectColumns(rows);
    let matrix = assignCells(rows, cols);

    // Drop empty trailing columns
    if (matrix.length) {
      const colCount = Math.max(...matrix.map((r) => r.length));
      matrix = matrix.map((r) => {
        const row = r.slice();
        while (row.length < colCount) row.push("");
        return row;
      });
      for (let c = colCount - 1; c >= 1; c--) {
        if (matrix.every((r) => !r[c])) matrix.forEach((r) => r.splice(c, 1));
      }
    }

    opts.onProgress?.({ stage: "done", pct: 100, message: "Xong" });
    return {
      matrix,
      rawText: String(data.text || "").trim(),
      wordCount: words.length,
      rowCount: matrix.length,
      colCount: matrix[0]?.length || 0
    };
  }

  async function toWorkbook(matrix, sheetName) {
    const XLSX = await OTExcelConvert.ensureXlsx();
    const ws = XLSX.utils.aoa_to_sheet(matrix);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, (sheetName || "OCR").slice(0, 31));
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
    return matrix.map((row) => row.map(esc).join(",")).join("\r\n");
  }

  async function terminate() {
    if (worker) {
      try {
        await worker.terminate();
      } catch (_) {}
      worker = null;
      workerLang = "";
    }
  }

  return { recognizeTable, toWorkbook, toCsv, terminate };
})();
