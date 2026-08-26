(function () {
  "use strict";

  let imageFile = null;
  let thumbUrl = null;
  let lang = "vie+eng";
  /** @type {string[][]} */
  let matrix = [];
  let rawText = "";
  let baseName = "ocr-table";

  const els = {
    drop: document.getElementById("dropZone"),
    input: document.getElementById("fileInput"),
    browse: document.getElementById("browseBtn"),
    thumbWrap: document.getElementById("thumbWrap"),
    thumbImg: document.getElementById("thumbImg"),
    fileCard: document.getElementById("fileCard"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    clearBtn: document.getElementById("clearBtn"),
    runBtn: document.getElementById("runBtn"),
    progressWrap: document.getElementById("progressWrap"),
    progressBar: document.getElementById("progressBar"),
    progressMsg: document.getElementById("progressMsg"),
    status: document.getElementById("status"),
    emptyHint: document.getElementById("emptyHint"),
    tableScroll: document.getElementById("tableScroll"),
    table: document.getElementById("resultTable"),
    toolbar: document.getElementById("tableToolbar"),
    tableMeta: document.getElementById("tableMeta"),
    rawDetails: document.getElementById("rawDetails"),
    rawText: document.getElementById("rawText"),
    copyTsvBtn: document.getElementById("copyTsvBtn"),
    csvBtn: document.getElementById("csvBtn"),
    xlsxBtn: document.getElementById("xlsxBtn")
  };

  function isImageFile(f) {
    if (!f) return false;
    const t = String(f.type || "").toLowerCase();
    const n = String(f.name || "").toLowerCase();
    return t.startsWith("image/") || /\.(jpe?g|png|webp|bmp)$/i.test(n);
  }

  function revokeThumb() {
    if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    thumbUrl = null;
  }

  function setStatus(msg, kind) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.className = "ox-status" + (kind ? " is-" + kind : "");
  }

  function setProgress(pct, message) {
    if (els.progressWrap) els.progressWrap.hidden = false;
    if (els.progressBar) els.progressBar.style.width = Math.max(0, Math.min(100, pct)) + "%";
    if (els.progressMsg) els.progressMsg.textContent = message || "";
  }

  function hideProgress() {
    if (els.progressWrap) els.progressWrap.hidden = true;
  }

  function setExportEnabled(on) {
    if (els.copyTsvBtn) els.copyTsvBtn.disabled = !on;
    if (els.csvBtn) els.csvBtn.disabled = !on;
    if (els.xlsxBtn) els.xlsxBtn.disabled = !on;
  }

  function clearTable() {
    matrix = [];
    rawText = "";
    if (els.table) els.table.innerHTML = "";
    if (els.emptyHint) els.emptyHint.hidden = false;
    if (els.tableScroll) els.tableScroll.hidden = true;
    if (els.toolbar) els.toolbar.hidden = true;
    if (els.rawDetails) els.rawDetails.hidden = true;
    if (els.rawText) els.rawText.textContent = "";
    setExportEnabled(false);
  }

  function showImage(f) {
    imageFile = f;
    revokeThumb();
    thumbUrl = URL.createObjectURL(f);
    baseName = String(f.name || "ocr-table").replace(/\.[^.]+$/, "") || "ocr-table";

    els.drop?.classList.add("has-image");
    if (els.thumbWrap) els.thumbWrap.hidden = false;
    if (els.thumbImg) els.thumbImg.src = thumbUrl;
    if (els.fileCard) els.fileCard.hidden = false;
    if (els.fileName) els.fileName.textContent = f.name || "clipboard.png";
    if (els.fileMeta) {
      const dimHint = f.type ? f.type.replace("image/", "").toUpperCase() : "IMG";
      els.fileMeta.textContent = OT.formatBytes(f.size) + " · " + dimHint;
    }
    if (els.runBtn) els.runBtn.disabled = false;
    clearTable();
    setStatus("Ảnh sẵn sàng — chọn ngôn ngữ rồi bấm Chạy OCR.");
  }

  function clearImage() {
    imageFile = null;
    revokeThumb();
    els.drop?.classList.remove("has-image");
    if (els.thumbWrap) els.thumbWrap.hidden = true;
    if (els.thumbImg) els.thumbImg.removeAttribute("src");
    if (els.fileCard) els.fileCard.hidden = true;
    if (els.runBtn) els.runBtn.disabled = true;
    if (els.input) els.input.value = "";
    clearTable();
    hideProgress();
    setStatus("Upload hoặc dán ảnh để bắt đầu");
  }

  function colLetter(i) {
    let n = i;
    let s = "";
    do {
      s = String.fromCharCode(65 + (n % 26)) + s;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return s;
  }

  function readMatrixFromDom() {
    if (!els.table) return matrix;
    const rows = [];
    els.table.querySelectorAll("tbody tr").forEach((tr) => {
      const cells = [];
      tr.querySelectorAll("td [contenteditable]").forEach((el) => {
        cells.push((el.textContent || "").trim());
      });
      if (cells.length) rows.push(cells);
    });
    if (rows.length) matrix = rows;
    return matrix;
  }

  function renderTable(data) {
    matrix = (data || []).map((row) => row.map((c) => String(c ?? "")));
    if (!matrix.length) {
      clearTable();
      setStatus("Không nhận ra bảng.", "err");
      return;
    }

    const cols = Math.max(...matrix.map((r) => r.length), 1);
    matrix = matrix.map((r) => {
      const row = r.slice();
      while (row.length < cols) row.push("");
      return row;
    });

    const thead =
      "<thead><tr><th></th>" +
      Array.from({ length: cols }, (_, i) => "<th>" + colLetter(i) + "</th>").join("") +
      "</tr></thead>";

    const tbody =
      "<tbody>" +
      matrix
        .map(
          (row, ri) =>
            "<tr><td class=\"ox-row-num\">" +
            (ri + 1) +
            "</td>" +
            row
              .map(
                (cell) =>
                  "<td><div contenteditable=\"true\" spellcheck=\"false\">" +
                  escapeHtml(cell) +
                  "</div></td>"
              )
              .join("") +
            "</tr>"
        )
        .join("") +
      "</tbody>";

    if (els.table) els.table.innerHTML = thead + tbody;
    if (els.emptyHint) els.emptyHint.hidden = true;
    if (els.tableScroll) els.tableScroll.hidden = false;
    if (els.toolbar) els.toolbar.hidden = false;
    if (els.tableMeta) {
      els.tableMeta.textContent = matrix.length + " hàng · " + cols + " cột";
    }
    setExportEnabled(true);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toTsv(data) {
    return data.map((row) => row.map((c) => String(c ?? "").replace(/\t/g, " ")).join("\t")).join("\n");
  }

  function setLang(next) {
    lang = next || "vie+eng";
    document.querySelectorAll("#langGrid .ox-lang").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.lang === lang);
    });
  }

  function ingestFile(f) {
    if (!isImageFile(f)) {
      showToast?.("Chọn ảnh JPG / PNG / WebP / BMP.", "error");
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      showToast?.("Ảnh tối đa 12MB.", "error");
      return;
    }
    showImage(f);
  }

  els.browse?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    els.input?.click();
  });

  els.drop?.addEventListener("click", (e) => {
    if (e.target.closest("button, a, input")) return;
    els.input?.click();
  });

  els.drop?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      els.input?.click();
    }
  });

  els.input?.addEventListener("change", () => {
    const f = els.input.files?.[0];
    if (f) ingestFile(f);
  });

  ["dragenter", "dragover"].forEach((ev) => {
    els.drop?.addEventListener(ev, (e) => {
      e.preventDefault();
      els.drop.classList.add("is-drag");
    });
  });
  ["dragleave", "drop"].forEach((ev) => {
    els.drop?.addEventListener(ev, (e) => {
      e.preventDefault();
      els.drop.classList.remove("is-drag");
    });
  });
  els.drop?.addEventListener("drop", (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (f) ingestFile(f);
  });

  document.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) return;
        const f = new File([blob], "clipboard-" + Date.now() + ".png", {
          type: blob.type || "image/png"
        });
        ingestFile(f);
        showToast?.("Đã dán ảnh từ clipboard.", "success");
        return;
      }
    }
  });

  els.clearBtn?.addEventListener("click", clearImage);

  document.getElementById("langGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ox-lang");
    if (!btn) return;
    setLang(btn.dataset.lang);
  });

  els.runBtn?.addEventListener("click", async () => {
    const btn = els.runBtn;
    try {
      if (!imageFile) throw new Error("Chọn ảnh trước.");
      if (!window.OTOcrTable?.recognizeTable) throw new Error("Engine OCR chưa sẵn sàng — Ctrl+F5.");
      OT.setBusy(btn, true, "Đang OCR…");
      clearTable();
      setProgress(3, "Đang tải OCR…");
      setStatus("Đang nhận dạng bảng…");

      const result = await OTOcrTable.recognizeTable(imageFile, {
        lang,
        onProgress: (p) => setProgress(p.pct ?? 0, p.message || "")
      });

      rawText = result.rawText || "";
      renderTable(result.matrix || []);

      if (els.rawDetails) els.rawDetails.hidden = !rawText;
      if (els.rawText) els.rawText.textContent = rawText;

      const rows = matrix.length;
      const cols = matrix[0]?.length || 0;
      setStatus(
        "Xong — " +
          rows +
          " hàng × " +
          cols +
          " cột" +
          (result.wordCount ? " · " + result.wordCount + " từ" : ""),
        "ok"
      );
      setProgress(100, "Xong");
      showToast?.("OCR xong — có thể chỉnh ô rồi tải Excel.", "success");
    } catch (err) {
      setStatus(err.message || String(err), "err");
      showToast?.(err.message || "OCR thất bại.", "error");
      hideProgress();
    } finally {
      OT.setBusy(btn, false);
      setTimeout(hideProgress, 800);
    }
  });

  document.getElementById("addRowBtn")?.addEventListener("click", () => {
    readMatrixFromDom();
    const cols = matrix[0]?.length || 1;
    matrix.push(Array.from({ length: cols }, () => ""));
    renderTable(matrix);
  });

  document.getElementById("delRowBtn")?.addEventListener("click", () => {
    readMatrixFromDom();
    if (matrix.length <= 1) {
      showToast?.("Cần ít nhất 1 hàng.", "error");
      return;
    }
    matrix.pop();
    renderTable(matrix);
  });

  document.getElementById("addColBtn")?.addEventListener("click", () => {
    readMatrixFromDom();
    if (!matrix.length) matrix = [[""]];
    else matrix.forEach((r) => r.push(""));
    renderTable(matrix);
  });

  document.getElementById("delColBtn")?.addEventListener("click", () => {
    readMatrixFromDom();
    const cols = matrix[0]?.length || 0;
    if (cols <= 1) {
      showToast?.("Cần ít nhất 1 cột.", "error");
      return;
    }
    matrix.forEach((r) => r.pop());
    renderTable(matrix);
  });

  els.copyTsvBtn?.addEventListener("click", async () => {
    const data = readMatrixFromDom();
    if (!data.length) return;
    try {
      await OT.copyText(toTsv(data));
      showToast?.("Đã copy TSV!", "success");
    } catch (e) {
      showToast?.(e.message || "Không sao chép được.", "error");
    }
  });

  els.csvBtn?.addEventListener("click", () => {
    const data = readMatrixFromDom();
    if (!data.length) return;
    const csv = OTOcrTable.toCsv(data);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const name = baseName + ".csv";
    OT.setLastResult?.({ blob, fileName: name, contentType: "text/csv;charset=utf-8" });
    OT.downloadBlob(blob, name);
  });

  els.xlsxBtn?.addEventListener("click", async () => {
    const data = readMatrixFromDom();
    if (!data.length) return;
    try {
      OT.setBusy(els.xlsxBtn, true, "Đang xuất…");
      const blob = await OTOcrTable.toWorkbook(data, "OCR");
      const name = baseName + ".xlsx";
      OT.setLastResult?.({
        blob,
        fileName: name,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      OT.downloadBlob(blob, name);
      showToast?.("Đã tải Excel!", "success");
    } catch (e) {
      showToast?.(e.message || "Không xuất Excel được.", "error");
    } finally {
      OT.setBusy(els.xlsxBtn, false);
    }
  });

  setLang("vie+eng");
})();
