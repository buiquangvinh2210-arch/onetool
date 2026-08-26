(function () {
  "use strict";

  const MAX_BYTES = 25 * 1024 * 1024;
  const MAX_FILES = 30;
  const JSZIP_CDN = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
  const ACCEPT_RE = /\.(heic|heif|jpe?g|png|webp)$/i;

  let files = [];
  let results = []; // { file, blob, width, height, format, ext, mime, beforeBytes, afterBytes } | { file, error }
  let format = "jpg";
  let activeIndex = 0;
  let previewUrl = null;
  let busy = false;
  let jszipReady = null;

  const els = {
    shell: document.getElementById("shell"),
    zone: document.getElementById("uploadZone"),
    input: document.getElementById("fileInput"),
    fileSummary: document.getElementById("fileSummary"),
    fileMeta: document.getElementById("fileMeta"),
    status: document.getElementById("status"),
    quality: document.getElementById("quality"),
    qualityVal: document.getElementById("qualityVal"),
    qualityWrap: document.getElementById("qualityWrap"),
    runBtn: document.getElementById("runBtn"),
    clearBtn: document.getElementById("clearBtn"),
    downloadOneBtn: document.getElementById("downloadOneBtn"),
    downloadZipBtn: document.getElementById("downloadZipBtn"),
    preview: document.getElementById("preview"),
    previewMeta: document.getElementById("previewMeta"),
    fileList: document.getElementById("fileList"),
    listMeta: document.getElementById("listMeta"),
    progressBar: document.getElementById("progressBar"),
    progressFill: document.getElementById("progressFill")
  };

  function waitMarkup() {
    return '<div class="hc-wait">Convert để xem ảnh đầu tiên</div>';
  }

  function setStatus(msg, kind) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.classList.remove("status-ok", "status-err");
    if (kind === "ok") els.status.classList.add("status-ok");
    if (kind === "err") els.status.classList.add("status-err");
  }

  function setProgress(pct) {
    if (!els.progressBar || !els.progressFill) return;
    const n = Math.max(0, Math.min(100, pct || 0));
    els.progressFill.style.width = n + "%";
    const on = n > 0 && n < 100;
    els.progressBar.classList.toggle("is-on", on || (n > 0 && busy));
    els.progressBar.setAttribute("aria-hidden", on ? "false" : "true");
    if (n >= 100) {
      setTimeout(() => {
        if (!busy) {
          els.progressFill.style.width = "0%";
          els.progressBar.classList.remove("is-on");
          els.progressBar.setAttribute("aria-hidden", "true");
        }
      }, 400);
    }
  }

  function revokePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  function updateQualityUi() {
    const isPng = format === "png";
    els.qualityWrap?.classList.toggle("is-disabled", isPng);
    if (els.quality) els.quality.disabled = isPng;
  }

  function setFormat(id) {
    format = id === "png" || id === "webp" ? id : "jpg";
    document.querySelectorAll(".hc-fmt").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.format === format);
    });
    updateQualityUi();
  }

  function totalBytes() {
    return files.reduce((s, f) => s + (f.size || 0), 0);
  }

  function syncHeader() {
    const n = files.length;
    if (els.fileSummary) {
      els.fileSummary.textContent = n === 1 ? files[0].name : n + " ảnh đã chọn";
    }
    if (els.fileMeta) {
      els.fileMeta.textContent = n
        ? OT.formatBytes(totalBytes()) + " · tối đa " + MAX_FILES + " file"
        : "-";
    }
    if (els.listMeta) els.listMeta.textContent = n + " file";
  }

  function clearResults() {
    results = [];
    revokePreview();
    els.shell?.classList.remove("has-result");
    if (els.preview) els.preview.innerHTML = waitMarkup();
    if (els.previewMeta) els.previewMeta.textContent = "-";
    if (els.downloadOneBtn) els.downloadOneBtn.disabled = true;
    if (els.downloadZipBtn) els.downloadZipBtn.disabled = true;
  }

  function successItems() {
    return results.filter((r) => r && r.blob);
  }

  function outName(item) {
    const base = (item.file?.name || "image").replace(/\.[^.]+$/, "");
    return base + "." + (item.ext || format);
  }

  function showPreview(item) {
    revokePreview();
    if (!item?.blob || !els.preview) {
      if (els.preview) els.preview.innerHTML = waitMarkup();
      if (els.previewMeta) els.previewMeta.textContent = "-";
      return;
    }
    previewUrl = URL.createObjectURL(item.blob);
    els.preview.innerHTML = "";
    const img = document.createElement("img");
    img.alt = "Ảnh đã convert";
    img.src = previewUrl;
    els.preview.appendChild(img);
    if (els.previewMeta) {
      els.previewMeta.textContent =
        (item.width || "?") +
        " × " +
        (item.height || "?") +
        " · " +
        OT.formatBytes(item.afterBytes) +
        " · " +
        String(item.format || format).toUpperCase();
    }
  }

  function renderList() {
    if (!els.fileList) return;
    if (!files.length) {
      els.fileList.innerHTML = "";
      return;
    }

    els.fileList.innerHTML = files
      .map((f, i) => {
        const r = results[i];
        let badgeClass = "is-wait";
        let badge = "Chờ";
        let sizeLine = OT.formatBytes(f.size);
        if (r?.error) {
          badgeClass = "is-err";
          badge = "Lỗi";
          sizeLine = r.error;
        } else if (r?.blob) {
          badgeClass = "is-ok";
          badge = String(r.format || format).toUpperCase();
          sizeLine =
            OT.formatBytes(r.beforeBytes) + " → " + OT.formatBytes(r.afterBytes);
        }
        const active = i === activeIndex ? " is-active" : "";
        const err = r?.error ? " is-err" : "";
        return (
          '<button type="button" class="hc-row' +
          active +
          err +
          '" data-i="' +
          i +
          '" role="listitem">' +
          "<div>" +
          '<span class="hc-row-name">' +
          escapeHtml(f.name) +
          "</span>" +
          '<span class="hc-row-size">' +
          escapeHtml(sizeLine) +
          "</span>" +
          "</div>" +
          '<span class="hc-row-badge ' +
          badgeClass +
          '">' +
          badge +
          "</span>" +
          "</button>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function selectIndex(i) {
    if (i < 0 || i >= files.length) return;
    activeIndex = i;
    renderList();
    const r = results[i];
    if (r?.blob) {
      showPreview(r);
      if (els.downloadOneBtn) els.downloadOneBtn.disabled = false;
    } else {
      revokePreview();
      if (els.preview) els.preview.innerHTML = waitMarkup();
      if (els.previewMeta) {
        els.previewMeta.textContent = r?.error || "Chưa convert";
      }
      if (els.downloadOneBtn) els.downloadOneBtn.disabled = true;
    }
  }

  function addFiles(incoming) {
    const list = Array.from(incoming || []);
    if (!list.length) return;

    const next = [...files];
    const seen = new Set(next.map((f) => f.name + "|" + f.size + "|" + f.lastModified));
    let skipped = 0;

    for (const f of list) {
      if (next.length >= MAX_FILES) {
        skipped++;
        continue;
      }
      if (!ACCEPT_RE.test(f.name) && !OTHeic.isHeic(f)) {
        skipped++;
        continue;
      }
      if (f.size > MAX_BYTES) {
        skipped++;
        showToast?.("Bỏ qua " + f.name + " — quá 25MB.", "error");
        continue;
      }
      const key = f.name + "|" + f.size + "|" + f.lastModified;
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(f);
    }

    if (!next.length) {
      showToast?.("Không có file hợp lệ (.heic/.heif/.jpg/.png).", "error");
      return;
    }

    files = next;
    clearResults();
    activeIndex = 0;
    els.shell?.classList.add("has-file");
    els.zone?.classList.add("has-file");
    syncHeader();
    renderList();
    setStatus(
      files.length +
        " ảnh sẵn sàng — chọn định dạng rồi bấm Convert tất cả." +
        (skipped ? " (" + skipped + " file bỏ qua)" : ""),
      "ok"
    );
  }

  function resetAll() {
    files = [];
    clearResults();
    els.shell?.classList.remove("has-file");
    els.zone?.classList.remove("has-file");
    if (els.input) els.input.value = "";
    syncHeader();
    renderList();
    setStatus("Chọn ảnh rồi bấm Convert tất cả");
    setProgress(0);
  }

  function qualityValue() {
    return (parseInt(els.quality?.value, 10) || 92) / 100;
  }

  async function runConvert() {
    if (!files.length || busy) return;
    if (!window.OTHeic) {
      setStatus("Engine HEIC chưa sẵn sàng.", "err");
      return;
    }

    busy = true;
    clearResults();
    results = new Array(files.length);
    renderList();
    OT.setBusy(els.runBtn, true, "Đang convert…");
    setStatus("Đang convert trên trình duyệt…");
    setProgress(2);

    const opts = { format, quality: qualityValue() };
    let ok = 0;
    let fail = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const basePct = Math.round((i / files.length) * 100);
        setProgress(Math.max(2, basePct));
        setStatus("Đang xử lý " + (i + 1) + "/" + files.length + ": " + f.name);

        try {
          const r = await OTHeic.convert(f, opts);
          results[i] = { file: f, ...r };
          ok++;
        } catch (e) {
          results[i] = { file: f, error: e.message || String(e) };
          fail++;
        }
        renderList();
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const firstOk = results.findIndex((r) => r?.blob);
      if (firstOk >= 0) {
        activeIndex = firstOk;
        showPreview(results[firstOk]);
        els.shell?.classList.add("has-result");
        if (els.downloadOneBtn) els.downloadOneBtn.disabled = false;
        if (els.downloadZipBtn) els.downloadZipBtn.disabled = successItems().length < 1;
        renderList();
      }

      if (!ok) {
        setStatus(results[0]?.error || "Không convert được file nào.", "err");
        showToast?.(results[0]?.error || "Convert thất bại.", "error");
      } else {
        const msg =
          "Xong " +
          ok +
          " ảnh" +
          (fail ? ", " + fail + " lỗi" : "") +
          " · " +
          String(format).toUpperCase();
        setStatus(msg, "ok");
        showToast?.(msg, "success");
        if (typeof OT.setLastResult === "function" && results[firstOk]?.blob) {
          OT.setLastResult({
            blob: results[firstOk].blob,
            fileName: outName(results[firstOk]),
            contentType: results[firstOk].mime
          });
        }
      }
    } catch (e) {
      setStatus(e.message || String(e), "err");
      showToast?.(e.message || "Convert thất bại.", "error");
    } finally {
      busy = false;
      OT.setBusy(els.runBtn, false);
      setProgress(100);
    }
  }

  function loadJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    if (jszipReady) return jszipReady;
    jszipReady = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = JSZIP_CDN;
      s.async = true;
      s.onload = () =>
        window.JSZip ? resolve(window.JSZip) : reject(new Error("JSZip không sẵn sàng."));
      s.onerror = () => reject(new Error("Không tải được JSZip. Kiểm tra mạng."));
      document.head.appendChild(s);
    });
    return jszipReady;
  }

  async function downloadOne() {
    const item = results[activeIndex];
    if (!item?.blob) {
      const first = successItems()[0];
      if (!first) return;
      await OT.downloadBlob(first.blob, outName(first));
      return;
    }
    await OT.downloadBlob(item.blob, outName(item));
  }

  async function downloadZip() {
    const items = successItems();
    if (!items.length) return;

    if (items.length === 1) {
      await OT.downloadBlob(items[0].blob, outName(items[0]));
      return;
    }

    try {
      OT.setBusy(els.downloadZipBtn, true, "Đóng gói…");
      setStatus("Đang tạo ZIP…");
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      const used = new Set();
      for (const item of items) {
        let name = outName(item);
        let n = 1;
        while (used.has(name.toLowerCase())) {
          const base = (item.file?.name || "image").replace(/\.[^.]+$/, "");
          name = base + "-" + n + "." + (item.ext || format);
          n++;
        }
        used.add(name.toLowerCase());
        zip.file(name, item.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" }, (meta) => {
        setProgress(Math.round(meta.percent || 0));
      });
      await OT.downloadBlob(blob, "heic-convert.zip");
      setStatus("Đã tải ZIP · " + items.length + " ảnh", "ok");
      showToast?.("Đã tải ZIP (" + items.length + " ảnh).", "success");
    } catch (e) {
      setStatus(e.message || String(e), "err");
      showToast?.(e.message || "Không tạo được ZIP.", "error");
    } finally {
      OT.setBusy(els.downloadZipBtn, false);
      setProgress(0);
    }
  }

  function openPicker() {
    els.input?.click();
  }

  els.zone?.addEventListener("click", (e) => {
    if (e.target.closest("#browseBtn") || e.target.closest("#changeBtn") || e.target.closest("button")) return;
    openPicker();
  });
  document.getElementById("browseBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openPicker();
  });
  document.getElementById("changeBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openPicker();
  });

  els.zone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    els.zone.classList.add("dragover");
  });
  els.zone?.addEventListener("dragleave", () => els.zone.classList.remove("dragover"));
  els.zone?.addEventListener("drop", (e) => {
    e.preventDefault();
    els.zone.classList.remove("dragover");
    const dropped = [...(e.dataTransfer?.files || [])];
    if (dropped.length) addFiles(dropped);
  });
  els.input?.addEventListener("change", () => {
    const picked = [...(els.input.files || [])];
    els.input.value = "";
    if (picked.length) addFiles(picked);
  });

  document.getElementById("formatGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".hc-fmt");
    if (!btn) return;
    setFormat(btn.dataset.format);
    clearResults();
    renderList();
    setStatus("Định dạng " + format.toUpperCase() + " — bấm Convert tất cả.");
  });

  els.quality?.addEventListener("input", () => {
    if (els.qualityVal) els.qualityVal.textContent = els.quality.value + "%";
  });

  els.runBtn?.addEventListener("click", () => runConvert());
  els.clearBtn?.addEventListener("click", () => resetAll());
  els.downloadOneBtn?.addEventListener("click", () => downloadOne());
  els.downloadZipBtn?.addEventListener("click", () => downloadZip());

  els.fileList?.addEventListener("click", (e) => {
    const row = e.target.closest(".hc-row");
    if (!row) return;
    selectIndex(parseInt(row.dataset.i, 10));
  });

  setFormat("jpg");
  updateQualityUi();
  if (els.qualityVal) els.qualityVal.textContent = (els.quality?.value || "92") + "%";
})();
