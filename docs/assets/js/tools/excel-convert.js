/**
 * Excel ↔ CSV/JSON — SheetJS trên trình duyệt.
 */
window.OTExcelConvert = (function () {
  "use strict";

  const XLSX_CDN = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
  let xlsxReady = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing && window.XLSX) {
        resolve(window.XLSX);
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => (window.XLSX ? resolve(window.XLSX) : reject(new Error("SheetJS không sẵn sàng.")));
      s.onerror = () => reject(new Error("Không tải được thư viện Excel. Kiểm tra mạng."));
      document.head.appendChild(s);
    });
  }

  function ensureXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!xlsxReady) xlsxReady = loadScript(XLSX_CDN);
    return xlsxReady;
  }

  function extOf(name) {
    const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : "";
  }

  function detectKind(file) {
    const ext = extOf(file.name);
    const mime = String(file.type || "").toLowerCase();
    if (ext === "xlsx" || ext === "xls" || mime.includes("spreadsheetml") || mime.includes("excel")) {
      return "excel";
    }
    if (ext === "csv" || mime.includes("csv") || mime === "text/plain") return "csv";
    if (ext === "json" || mime.includes("json")) return "json";
    return "";
  }

  function normalizeCsvText(raw) {
    return String(raw || "").replace(/^\uFEFF/, "");
  }

  function parseJsonRows(raw) {
    let parsed;
    try {
      parsed = JSON.parse(String(raw || "").trim());
    } catch (_) {
      throw new Error("JSON không hợp lệ — kiểm tra dấu ngoặc và dấu phẩy.");
    }
    if (Array.isArray(parsed)) {
      if (!parsed.length) throw new Error("Mảng JSON đang trống.");
      if (!parsed.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
        throw new Error("Mỗi phần tử JSON phải là object (một dòng bảng).");
      }
      return parsed;
    }
    if (parsed && typeof parsed === "object") return [parsed];
    throw new Error("JSON phải là mảng object hoặc một object.");
  }

  /** Parse CSV → rows of objects (header row required). */
  function csvToRows(csvText) {
    const text = normalizeCsvText(csvText).trim();
    if (!text) throw new Error("CSV trống.");
    if (window.OT?.csvToJson) {
      const rows = OT.csvToJson(text);
      if (!rows.length) throw new Error("CSV không có dòng dữ liệu (chỉ header hoặc trống).");
      return rows;
    }
    // Fallback SheetJS
    const XLSX = window.XLSX;
    const wb = XLSX.read(text, { type: "string", raw: false, codepage: 65001 });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
    if (!rows.length) throw new Error("CSV không có dòng dữ liệu.");
    return rows;
  }

  function rowsToCsv(rows) {
    if (window.OT?.jsonToCsv) return OT.jsonToCsv(rows);
    const XLSX = window.XLSX;
    const sheet = XLSX.utils.json_to_sheet(rows);
    return XLSX.utils.sheet_to_csv(sheet);
  }

  function sheetToRows(sheet, { raw = false } = {}) {
    const XLSX = window.XLSX;
    return XLSX.utils.sheet_to_json(sheet, { defval: "", raw });
  }

  async function readExcelFile(file) {
    const XLSX = await ensureXlsx();
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    const sheets = {};
    wb.SheetNames.forEach((name) => {
      sheets[name] = sheetToRows(wb.Sheets[name], { raw: false });
    });
    return { names: wb.SheetNames.slice(), sheets, workbook: wb };
  }

  async function readInputFile(file) {
    const kind = detectKind(file);
    if (!kind) throw new Error("Chỉ nhận .xlsx, .xls, .csv hoặc .json.");
    if (kind === "excel") {
      const data = await readExcelFile(file);
      return { kind: "excel", name: file.name, size: file.size, ...data };
    }
    const text = normalizeCsvText(await file.text());
    if (kind === "csv") {
      const rows = csvToRows(text);
      return { kind: "csv", name: file.name, size: file.size, text, rows };
    }
    const rows = parseJsonRows(text);
    return {
      kind: "json",
      name: file.name,
      size: file.size,
      text,
      rows
    };
  }

  function buildWorkbookFromRows(rows, sheetName) {
    const XLSX = window.XLSX;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, String(sheetName || "Sheet1").slice(0, 31) || "Sheet1");
    return wb;
  }

  function workbookToArrayBuffer(wb) {
    const XLSX = window.XLSX;
    return XLSX.write(wb, { bookType: "xlsx", type: "array" });
  }

  function csvWithBom(csv) {
    return "\uFEFF" + String(csv || "");
  }

  function safeBase(name) {
    return String(name || "data")
      .replace(/\.[^.]+$/, "")
      .replace(/[<>:"/\\|?*\x00-\x1f]+/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 48) || "data";
  }

  /**
   * @param {object} opts
   * @param {"x2c"|"x2j"|"c2x"|"j2x"} opts.mode
   * @param {object} opts.source — from readInputFile or {kind,rows,text,sheets,names,activeSheet}
   * @param {string} [opts.sheetName]
   * @param {boolean} [opts.pretty]
   * @param {boolean} [opts.bom]
   */
  async function convert(opts) {
    await ensureXlsx();
    const mode = opts.mode;
    const src = opts.source;
    if (!src) throw new Error("Chưa có dữ liệu nguồn.");

    let rows = [];
    let sheetLabel = "Sheet1";

    if (mode === "x2c" || mode === "x2j") {
      if (src.kind !== "excel") throw new Error("Chế độ này cần file Excel (.xlsx / .xls).");
      const name = opts.sheetName || src.names?.[0];
      if (!name || !src.sheets?.[name]) throw new Error("Không tìm thấy sheet.");
      rows = src.sheets[name];
      sheetLabel = name;
      if (!rows.length) throw new Error("Sheet «" + name + "» không có dữ liệu.");
    } else if (mode === "c2x") {
      if (src.kind === "csv") rows = src.rows;
      else if (src.kind === "excel") {
        const name = opts.sheetName || src.names?.[0];
        rows = src.sheets[name] || [];
      } else if (src.text) rows = csvToRows(src.text);
      else throw new Error("Cần CSV hoặc nội dung CSV.");
      if (!rows.length) throw new Error("CSV không có dòng dữ liệu.");
    } else if (mode === "j2x") {
      if (src.kind === "json") rows = src.rows;
      else if (src.text) rows = parseJsonRows(src.text);
      else throw new Error("Cần JSON.");
    } else {
      throw new Error("Chế độ không hợp lệ.");
    }

    const base = safeBase(src.name);

    if (mode === "x2c") {
      const csv = rowsToCsv(rows);
      const body = opts.bom !== false ? csvWithBom(csv) : csv;
      return {
        kind: "csv",
        text: body,
        rows,
        sheetName: sheetLabel,
        fileName: base + "-" + safeBase(sheetLabel) + ".csv",
        contentType: "text/csv;charset=utf-8",
        blob: new Blob([body], { type: "text/csv;charset=utf-8" })
      };
    }

    if (mode === "x2j") {
      const text = opts.pretty === false ? JSON.stringify(rows) : JSON.stringify(rows, null, 2);
      return {
        kind: "json",
        text,
        rows,
        sheetName: sheetLabel,
        fileName: base + "-" + safeBase(sheetLabel) + ".json",
        contentType: "application/json",
        blob: new Blob([text], { type: "application/json" })
      };
    }

    if (mode === "c2x" || mode === "j2x") {
      const wb = buildWorkbookFromRows(rows, mode === "j2x" ? "JSON" : "CSV");
      const ab = workbookToArrayBuffer(wb);
      return {
        kind: "excel",
        text: "",
        rows,
        sheetName: mode === "j2x" ? "JSON" : "CSV",
        fileName: base + ".xlsx",
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        blob: new Blob([ab], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
      };
    }

    throw new Error("Không chuyển được.");
  }

  return {
    ensureXlsx,
    detectKind,
    readInputFile,
    parseJsonRows,
    csvToRows,
    convert,
    safeBase
  };
})();
