/**
 * Word/Excel → PDF trên trình duyệt.
 * DOCX/XLSX → HTML xem trước + PDF chữ thật (pdf-lib + font tiếng Việt).
 * Không dùng html2canvas (hay ra trang trắng).
 */
window.OTOfficeToPdf = (function () {
  "use strict";

  const MAX_BYTES = 40 * 1024 * 1024;
  const MAX_EXCEL_ROWS = 2500;
  const MAX_PDF_PAGES = 200;

  const PAGE = {
    a4: { w: 595.28, h: 841.89 },
    letter: { w: 612, h: 792 }
  };

  const FONT_URL =
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bevietnampro/BeVietnamPro-Regular.ttf";
  const FONT_BOLD_URL =
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bevietnampro/BeVietnamPro-Bold.ttf";

  let fontCache = null;
  let fontBoldCache = null;
  let pdfLibPromise = null;
  let fontkitPromise = null;

  function extOf(name) {
    const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : "";
  }

  function detectKind(file) {
    const ext = extOf(file.name);
    const mime = (file.type || "").toLowerCase();
    if (ext === "docx" || mime.includes("wordprocessingml")) return "docx";
    if (ext === "doc") return "doc-legacy";
    if (ext === "xlsx" || ext === "xls" || mime.includes("spreadsheetml") || mime.includes("excel")) return "xlsx";
    if (ext === "csv" || mime === "text/csv") return "csv";
    return "";
  }

  async function loadScriptOnce(src, key) {
    if (window[key]) return window[key];
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Không tải được thư viện convert."));
      document.head.appendChild(s);
    });
    return window[key];
  }

  async function loadMammoth() {
    if (window.mammoth) return window.mammoth;
    await loadScriptOnce(
      "https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js",
      "mammoth"
    );
    return window.mammoth;
  }

  async function loadXlsx() {
    if (window.XLSX) return window.XLSX;
    await loadScriptOnce(
      "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
      "XLSX"
    );
    return window.XLSX;
  }

  async function loadPdfLib() {
    if (window.PDFLib) return window.PDFLib;
    if (window.OTPdf?.loadPdfLib) return window.OTPdf.loadPdfLib();
    if (!pdfLibPromise) {
      pdfLibPromise = loadScriptOnce(
        "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js",
        "PDFLib"
      );
    }
    await pdfLibPromise;
    return window.PDFLib;
  }

  /** pdf-lib cần fontkit để embed TTF (tiếng Việt). */
  async function loadFontkit() {
    if (window.fontkit) return window.fontkit;
    if (!fontkitPromise) {
      fontkitPromise = loadScriptOnce(
        "https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js",
        "fontkit"
      );
    }
    await fontkitPromise;
    if (!window.fontkit) throw new Error("Không tải được fontkit.");
    return window.fontkit;
  }

  async function fetchFont(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Không tải được font tiếng Việt.");
    return new Uint8Array(await res.arrayBuffer());
  }

  async function loadFonts() {
    if (!fontCache) fontCache = fetchFont(FONT_URL);
    if (!fontBoldCache) fontBoldCache = fetchFont(FONT_BOLD_URL).catch(() => fontCache);
    const [regular, bold] = await Promise.all([fontCache, fontBoldCache]);
    return { regular, bold: bold || regular };
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wrapHtml(bodyHtml, { title, kind } = {}) {
    const safeTitle = String(title || "Tài liệu").replace(/[<>&]/g, "");
    return `
      <article class="otp-doc" data-kind="${kind || ""}">
        <header class="otp-doc-head"><h1>${safeTitle}</h1></header>
        <div class="otp-doc-body">${bodyHtml}</div>
      </article>
    `;
  }

  async function docxToHtml(file, onProgress) {
    onProgress?.("Đang đọc Word…", 18);
    const mammoth = await loadMammoth();
    const ab = await file.arrayBuffer();
    onProgress?.("Đang dựng nội dung…", 40);
    const result = await mammoth.convertToHtml(
      { arrayBuffer: ab },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Title'] => h1.title:fresh",
          "r[style-name='Strong'] => strong",
          "p[style-name='Quote'] => blockquote:fresh"
        ]
      }
    );
    const html = (result.value || "").trim();
    if (!html) throw new Error("File Word trống hoặc không đọc được nội dung.");
    const warnings = (result.messages || []).filter((m) => m.type === "warning").length;
    return {
      html: wrapHtml(html, { title: file.name.replace(/\.docx$/i, ""), kind: "docx" }),
      meta: { kind: "docx", warnings, sheets: 1 }
    };
  }

  function sheetToTableHtml(sheet, XLSX, sheetName) {
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
    if (!rows.length) {
      return `<section class="otp-sheet"><h2>${escapeHtml(sheetName)}</h2><p class="otp-empty">Sheet trống</p></section>`;
    }
    const limited = rows.slice(0, MAX_EXCEL_ROWS);
    const colCount = Math.min(
      20,
      limited.reduce((m, r) => Math.max(m, (r || []).length), 0)
    );
    let body = "";
    limited.forEach((row, ri) => {
      const cells = [];
      for (let c = 0; c < colCount; c++) {
        const v = row && row[c] != null ? row[c] : "";
        const tag = ri === 0 ? "th" : "td";
        cells.push(`<${tag}>${escapeHtml(v)}</${tag}>`);
      }
      body += `<tr>${cells.join("")}</tr>`;
    });
    const note =
      rows.length > MAX_EXCEL_ROWS
        ? `<p class="otp-note">Hiển thị ${MAX_EXCEL_ROWS}/${rows.length} dòng đầu.</p>`
        : "";
    return `
      <section class="otp-sheet">
        <h2>${escapeHtml(sheetName)}</h2>
        ${note}
        <div class="otp-table-wrap"><table><tbody>${body}</tbody></table></div>
      </section>
    `;
  }

  async function excelToHtml(file, onProgress) {
    onProgress?.("Đang đọc Excel…", 18);
    const XLSX = await loadXlsx();
    const ab = await file.arrayBuffer();
    onProgress?.("Đang dựng bảng…", 42);
    const wb = XLSX.read(ab, { type: "array", cellDates: true });
    if (!wb.SheetNames || !wb.SheetNames.length) {
      throw new Error("File Excel không có sheet nào.");
    }
    // Giới hạn số sheet để PDF không quá dài
    const names = wb.SheetNames.slice(0, 15);
    const parts = names.map((name) => sheetToTableHtml(wb.Sheets[name], XLSX, name));
    return {
      html: wrapHtml(parts.join(""), {
        title: file.name.replace(/\.(xlsx|xls|csv)$/i, ""),
        kind: "xlsx"
      }),
      meta: { kind: "xlsx", sheets: names.length, warnings: 0 }
    };
  }

  function normalizeSpace(s) {
    return String(s || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();
  }

  function parseTable(tableEl) {
    const rows = [];
    tableEl.querySelectorAll("tr").forEach((tr) => {
      const cells = [];
      tr.querySelectorAll("th,td").forEach((td) => {
        cells.push(normalizeSpace(td.textContent));
      });
      if (cells.some((c) => c)) rows.push(cells);
    });
    return rows;
  }

  /** HTML → khối nội dung để vẽ PDF */
  function htmlToBlocks(html) {
    const root = document.createElement("div");
    root.innerHTML = html;
    const blocks = [];

    function pushText(type, text, size) {
      const t = normalizeSpace(text);
      if (!t) return;
      blocks.push({ type, text: t, size });
    }

    function walk(node) {
      if (!node) return;
      if (node.nodeType === 3) {
        const t = normalizeSpace(node.textContent);
        if (t) blocks.push({ type: "p", text: t, size: 11 });
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();

      if (tag === "style" || tag === "script") return;

      if (tag === "h1") return pushText("h1", node.textContent, 18);
      if (tag === "h2") return pushText("h2", node.textContent, 14);
      if (tag === "h3") return pushText("h3", node.textContent, 12.5);
      if (tag === "p" || tag === "blockquote") return pushText("p", node.textContent, 11);
      if (tag === "li") return pushText("li", "• " + node.textContent, 11);
      if (tag === "br") {
        blocks.push({ type: "spacer", size: 6 });
        return;
      }
      if (tag === "table") {
        const rows = parseTable(node);
        if (rows.length) blocks.push({ type: "table", rows });
        return;
      }
      if (tag === "tr" || tag === "td" || tag === "th" || tag === "thead" || tag === "tbody") return;

      Array.from(node.childNodes).forEach(walk);
    }

    Array.from(root.childNodes).forEach(walk);

    // Gộp spacer liên tiếp
    return blocks.filter((b, i, arr) => !(b.type === "spacer" && arr[i - 1]?.type === "spacer"));
  }

  function wrapLine(text, font, fontSize, maxWidth) {
    const raw = String(text || "");
    if (!raw) return [""];
    // Tách theo khoảng trắng; nếu 1 từ quá dài thì cắt theo ký tự
    const words = raw.split(/\s+/);
    const lines = [];
    let cur = "";

    const push = () => {
      if (cur) lines.push(cur);
      cur = "";
    };

    for (const word of words) {
      const trial = cur ? cur + " " + word : word;
      if (font.widthOfTextAtSize(trial, fontSize) <= maxWidth) {
        cur = trial;
        continue;
      }
      if (cur) push();
      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        cur = word;
      } else {
        let chunk = "";
        for (const ch of word) {
          const t2 = chunk + ch;
          if (font.widthOfTextAtSize(t2, fontSize) > maxWidth && chunk) {
            lines.push(chunk);
            chunk = ch;
          } else chunk = t2;
        }
        cur = chunk;
      }
    }
    push();
    return lines.length ? lines : [""];
  }

  function pageSizePts(pageSize, orientation) {
    const base = PAGE[pageSize] || PAGE.a4;
    if (orientation === "landscape") return { w: base.h, h: base.w };
    return { w: base.w, h: base.h };
  }

  async function blocksToPdfBlob(blocks, { pageSize = "a4", orientation = "portrait", onProgress } = {}) {
    if (!blocks.length) throw new Error("Không có nội dung để ghi vào PDF.");

    onProgress?.("Đang tải font tiếng Việt…", 55);
    const PDFLib = await loadPdfLib();
    const fontkit = await loadFontkit();
    const { PDFDocument, rgb } = PDFLib;
    const fonts = await loadFonts();

    onProgress?.("Đang ghi PDF…", 70);
    const doc = await PDFDocument.create();
    // pdf-lib 1.17: registerFontkit nằm trên instance (không phải static)
    doc.registerFontkit(fontkit);
    const font = await doc.embedFont(fonts.regular, { subset: true });
    const fontBold = await doc.embedFont(fonts.bold, { subset: true });

    const { w: pageW, h: pageH } = pageSizePts(pageSize, orientation);
    const margin = 48;
    const maxW = pageW - margin * 2;
    const ink = rgb(0.08, 0.08, 0.1);
    let pageCount = 0;
    let page = null;
    let y = 0;

    const newPage = () => {
      if (pageCount >= MAX_PDF_PAGES) return false;
      page = doc.addPage([pageW, pageH]);
      pageCount += 1;
      y = pageH - margin;
      return true;
    };

    if (!newPage()) throw new Error("Không tạo được trang PDF.");

    const ensureSpace = (need) => {
      if (y - need >= margin) return true;
      return newPage();
    };

    for (let bi = 0; bi < blocks.length; bi++) {
      if (pageCount >= MAX_PDF_PAGES) break;
      const block = blocks[bi];

      if (block.type === "spacer") {
        y -= block.size || 6;
        continue;
      }

      if (block.type === "table") {
        const rows = block.rows || [];
        if (!rows.length) continue;
        const cols = Math.max(...rows.map((r) => r.length), 1);
        const colW = maxW / cols;
        const fontSize = cols > 8 ? 7.5 : cols > 5 ? 8.5 : 9.5;
        const pad = 4;

        for (let ri = 0; ri < rows.length; ri++) {
          const row = rows[ri];
          // Ước lượng chiều cao hàng
          let rowH = fontSize + pad * 2;
          const cellLines = [];
          for (let c = 0; c < cols; c++) {
            const cell = String(row[c] ?? "");
            const lines = wrapLine(cell, font, fontSize, Math.max(20, colW - pad * 2));
            cellLines.push(lines);
            rowH = Math.max(rowH, lines.length * (fontSize + 2) + pad * 2);
          }
          if (!ensureSpace(rowH + 2)) break;

          const isHeader = ri === 0;
          if (isHeader) {
            page.drawRectangle({
              x: margin,
              y: y - rowH,
              width: maxW,
              height: rowH,
              color: rgb(0.94, 0.95, 0.97)
            });
          }

          for (let c = 0; c < cols; c++) {
            const x = margin + c * colW;
            page.drawRectangle({
              x,
              y: y - rowH,
              width: colW,
              height: rowH,
              borderColor: rgb(0.75, 0.78, 0.82),
              borderWidth: 0.6
            });
            let ty = y - pad - fontSize;
            const useFont = isHeader ? fontBold : font;
            for (const line of cellLines[c]) {
              page.drawText(line, {
                x: x + pad,
                y: ty,
                size: fontSize,
                font: useFont,
                color: ink,
                maxWidth: colW - pad * 2
              });
              ty -= fontSize + 2;
            }
          }
          y -= rowH;
        }
        y -= 10;
        continue;
      }

      const size = block.size || 11;
      const useBold = block.type === "h1" || block.type === "h2" || block.type === "h3";
      const useFont = useBold ? fontBold : font;
      const gapBefore = block.type === "h1" ? 14 : block.type === "h2" ? 10 : block.type === "h3" ? 8 : 4;
      const gapAfter = block.type.startsWith("h") ? 6 : 8;
      const lineGap = size * 1.35;

      y -= gapBefore;
      const lines = wrapLine(block.text, useFont, size, maxW);

      for (const line of lines) {
        if (!ensureSpace(lineGap)) break;
        page.drawText(line, {
          x: margin,
          y: y - size,
          size,
          font: useFont,
          color: ink
        });
        y -= lineGap;
      }
      y -= gapAfter * 0.35;

      if (bi % 20 === 0) {
        onProgress?.(
          "Đang ghi PDF…",
          70 + Math.min(25, Math.round((bi / blocks.length) * 25))
        );
      }
    }

    if (pageCount >= MAX_PDF_PAGES) {
      // ghi chú cuối
      if (ensureSpace(24)) {
        page.drawText(`… (đã giới hạn ${MAX_PDF_PAGES} trang)`, {
          x: margin,
          y: y - 11,
          size: 10,
          font,
          color: rgb(0.4, 0.4, 0.45)
        });
      }
    }

    const bytes = await doc.save();
    onProgress?.("Hoàn tất", 100);
    return {
      blob: new Blob([bytes], { type: "application/pdf" }),
      pageCount
    };
  }

  function previewTextFromHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || "")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, 5000);
  }

  async function convert(file, options = {}) {
    if (!file) throw new Error("Chọn file Word hoặc Excel trước.");
    if (file.size > MAX_BYTES) throw new Error("File hơi lớn — hãy dùng bản dưới 40 MB.");

    const kind = detectKind(file);
    if (kind === "doc-legacy") {
      throw new Error("File .doc cũ chưa hỗ trợ. Hãy mở Word → Lưu thành .docx rồi thử lại.");
    }
    if (!kind) throw new Error("Chỉ nhận .docx, .xlsx, .xls hoặc .csv.");

    const onProgress = options.onProgress;
    onProgress?.("Chuẩn bị…", 8);

    // Prefetch font + pdf-lib song song
    const warm = Promise.all([loadPdfLib(), loadFontkit(), loadFonts()]).catch(() => null);

    let built;
    if (kind === "docx") built = await docxToHtml(file, onProgress);
    else built = await excelToHtml(file, onProgress);

    await warm;

    const orientation =
      options.orientation || (built.meta.kind === "xlsx" ? "landscape" : "portrait");
    const pageSize = options.pageSize || "a4";

    const blocks = htmlToBlocks(built.html);
    if (!blocks.length) throw new Error("Không đọc được chữ trong file.");

    const { blob, pageCount } = await blocksToPdfBlob(blocks, {
      pageSize,
      orientation,
      onProgress
    });

    if (!blob || blob.size < 500) {
      throw new Error("PDF tạo ra lỗi. Thử Ctrl+F5 rồi convert lại.");
    }

    return {
      blob,
      fileName: OT.nameWithSuffix(file.name, "", ".pdf"),
      previewHtml: built.html,
      previewText: previewTextFromHtml(built.html),
      meta: {
        kind: built.meta.kind,
        sheets: built.meta.sheets || 1,
        warnings: built.meta.warnings || 0,
        pageSize,
        orientation,
        size: blob.size,
        pageCount
      }
    };
  }

  function warmup() {
    loadPdfLib().catch(() => {});
    loadFontkit().catch(() => {});
    loadFonts().catch(() => {});
    loadMammoth().catch(() => {});
    loadXlsx().catch(() => {});
  }

  return { convert, warmup, detectKind, MAX_BYTES };
})();
