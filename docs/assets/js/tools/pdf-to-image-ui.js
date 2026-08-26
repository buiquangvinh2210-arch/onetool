(function () {
  "use strict";

  let file = null;
  let format = "png";
  let dpi = 200;
  /** @type {{ pageNum: number, blob: Blob, fileName: string, url: string }[]} */
  let pages = [];
  let zipBlob = null;

  const els = {
    shell: document.getElementById("shell"),
    zone: document.getElementById("uploadZone"),
    placeholder: document.getElementById("uploadPlaceholder"),
    thumbs: document.getElementById("thumbs"),
    empty: document.getElementById("emptyHint"),
    status: document.getElementById("status"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    pageSpec: document.getElementById("pageSpec"),
    runBtn: document.getElementById("runBtn"),
    downloadBtn: document.getElementById("downloadResultBtn"),
    copyBtn: document.getElementById("copyResultBtn"),
    input: document.getElementById("fileInput")
  };

  function clearPages() {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    pages = [];
    zipBlob = null;
    if (els.thumbs) {
      els.thumbs.innerHTML = "";
      els.thumbs.hidden = true;
    }
    if (els.empty) els.empty.hidden = true;
    if (els.downloadBtn) els.downloadBtn.disabled = true;
    if (els.copyBtn) els.copyBtn.disabled = true;
  }

  function renderThumbs() {
    if (!els.thumbs) return;
    if (!pages.length) {
      els.thumbs.hidden = true;
      if (els.empty) els.empty.hidden = false;
      return;
    }
    els.thumbs.hidden = false;
    if (els.empty) els.empty.hidden = true;
    els.thumbs.innerHTML = pages
      .map(
        (p) => `
      <figure class="ip-thumb">
        <img src="${p.url}" alt="Trang ${p.pageNum}" loading="lazy" />
        <figcaption>
          <span>Trang ${p.pageNum}</span>
          <button type="button" data-dl="${p.pageNum}">Tải</button>
        </figcaption>
      </figure>`
      )
      .join("");
  }

  async function showPdf(f) {
    clearPages();
    file = f;
    els.shell?.classList.add("has-file");
    if (els.zone) els.zone.style.display = "none";
    if (els.fileName) els.fileName.textContent = f.name;
    if (els.fileMeta) els.fileMeta.textContent = OT.formatBytes(f.size);
    els.runBtn.disabled = false;
    els.status.textContent = "Chọn định dạng / trang rồi bấm Xuất ảnh.";
    if (els.empty) {
      els.empty.hidden = false;
      els.empty.textContent = "Chưa có kết quả — bấm Xuất ảnh.";
    }
  }

  function resetPdf() {
    file = null;
    clearPages();
    els.shell?.classList.remove("has-file");
    if (els.zone) els.zone.style.display = "";
    els.runBtn.disabled = true;
    els.status.textContent = "Chọn PDF để bắt đầu";
  }

  OT.bindUploadZone({
    onFiles: (files) => {
      const f = files?.[0];
      if (!f) return;
      const ok =
        f.type === "application/pdf" || /\.pdf$/i.test(f.name);
      if (!ok) {
        showToast?.("Chọn file PDF.", "error");
        return;
      }
      if (f.size > 40 * 1024 * 1024) {
        showToast?.("PDF tối đa 40MB.", "error");
        return;
      }
      showPdf(f);
    }
  });

  document.getElementById("changeBtn")?.addEventListener("click", () => {
    resetPdf();
    els.input?.click();
  });

  document.getElementById("formatGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ip-fmt");
    if (!btn) return;
    format = btn.dataset.format || "png";
    document.querySelectorAll("#formatGrid .ip-fmt").forEach((b) => {
      b.classList.toggle("is-on", b === btn);
    });
  });

  document.getElementById("dpiGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ip-opt");
    if (!btn) return;
    dpi = parseInt(btn.dataset.dpi, 10) || 200;
    document.querySelectorAll("#dpiGrid .ip-opt").forEach((b) => {
      b.classList.toggle("is-on", b === btn);
    });
  });

  els.thumbs?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-dl]");
    if (!btn) return;
    const num = parseInt(btn.dataset.dl, 10);
    const page = pages.find((p) => p.pageNum === num);
    if (page) OT.downloadBlob(page.blob, page.fileName);
  });

  els.runBtn?.addEventListener("click", async () => {
    const btn = els.runBtn;
    try {
      if (!file) throw new Error("Chọn PDF trước.");
      if (!OTPdf.pagesToImages) throw new Error("Đang dùng pdf.js cũ — Ctrl+F5.");
      OT.setBusy(btn, true, "Đang xuất…");
      clearPages();
      els.status.textContent = "Đang render trang…";
      const r = await OTPdf.pagesToImages(file, {
        format,
        quality: 0.97,
        dpi,
        maxPages: 80,
        pageSpec: els.pageSpec?.value || "",
        zip: true,
        onProgress: ({ page, total, pageNum }) => {
          els.status.textContent = "Xuất trang " + page + "/" + total + " (PDF trang " + pageNum + ")…";
        }
      });

      pages = r.pages.map((p) => ({
        ...p,
        url: URL.createObjectURL(p.blob)
      }));
      zipBlob = r.zipBlob;

      if (pages.length === 1) {
        OT.setLastResult({
          blob: pages[0].blob,
          fileName: OT.nameWithSuffix(file.name, "-trang-" + pages[0].pageNum, "." + r.format),
          contentType: pages[0].blob.type
        });
        if (els.downloadBtn) {
          els.downloadBtn.disabled = false;
          els.downloadBtn.textContent = "Tải ảnh";
        }
        if (els.copyBtn) els.copyBtn.disabled = false;
      } else {
        const zName = OT.nameWithSuffix(file.name, "-" + r.format, ".zip");
        OT.setLastResult({
          blob: zipBlob,
          fileName: zName,
          contentType: "application/zip"
        });
        if (els.downloadBtn) {
          els.downloadBtn.disabled = false;
          els.downloadBtn.textContent = "Tải ZIP";
        }
        if (els.copyBtn) els.copyBtn.disabled = true;
      }

      renderThumbs();
      els.status.textContent =
        "Xong — " +
        r.pageCount +
        "/" +
        r.totalPages +
        " trang · " +
        r.format.toUpperCase() +
        " · " +
        (r.dpi || dpi) +
        " DPI" +
        (zipBlob ? " · " + OT.formatBytes(zipBlob.size) : " · " + OT.formatBytes(pages[0].blob.size));
      showToast?.("Đã xuất ảnh!", "success");
    } catch (err) {
      els.status.textContent = err.message || String(err);
      showToast?.(err.message || "Không xuất được ảnh.", "error");
      console.error(err);
      if (els.empty) {
        els.empty.hidden = false;
        els.empty.textContent = err.message || "Lỗi xuất ảnh.";
      }
    } finally {
      OT.setBusy(btn, false);
    }
  });
})();
