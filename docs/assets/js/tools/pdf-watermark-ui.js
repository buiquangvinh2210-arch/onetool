(function () {
  "use strict";

  let file = null;
  let mode = "text";
  let position = "center";
  let imageFile = null;
  let lastBlob = null;
  let previewUrl = null;

  const els = {
    shell: document.getElementById("shell"),
    zone: document.getElementById("uploadZone"),
    input: document.getElementById("fileInput"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    status: document.getElementById("status"),
    textOpts: document.getElementById("textOpts"),
    imageOpts: document.getElementById("imageOpts"),
    wmText: document.getElementById("wmText"),
    wmColor: document.getElementById("wmColor"),
    wmColorHex: document.getElementById("wmColorHex"),
    wmFontSize: document.getElementById("wmFontSize"),
    wmOpacity: document.getElementById("wmOpacity"),
    wmOpacityVal: document.getElementById("wmOpacityVal"),
    wmAngle: document.getElementById("wmAngle"),
    wmAngleVal: document.getElementById("wmAngleVal"),
    wmImageScale: document.getElementById("wmImageScale"),
    wmImageScaleVal: document.getElementById("wmImageScaleVal"),
    wmImageInput: document.getElementById("wmImageInput"),
    wmImageName: document.getElementById("wmImageName"),
    pageSpec: document.getElementById("pageSpec"),
    runBtn: document.getElementById("runBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    statsBar: document.getElementById("statsBar"),
    statPages: document.getElementById("statPages"),
    statStamped: document.getElementById("statStamped"),
    statSize: document.getElementById("statSize"),
    previewEmpty: document.getElementById("previewEmpty"),
    previewImg: document.getElementById("previewImg")
  };

  function revokePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  function clearResult() {
    lastBlob = null;
    revokePreview();
    if (els.downloadBtn) els.downloadBtn.disabled = true;
    if (els.statsBar) els.statsBar.hidden = true;
    if (els.previewEmpty) els.previewEmpty.hidden = false;
    if (els.previewImg) {
      els.previewImg.hidden = true;
      els.previewImg.removeAttribute("src");
    }
  }

  function setMode(next) {
    mode = next === "image" ? "image" : "text";
    document.querySelectorAll("#modeGrid .pw-mode").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.mode === mode);
    });
    if (els.textOpts) els.textOpts.hidden = mode !== "text";
    if (els.imageOpts) els.imageOpts.hidden = mode !== "image";
  }

  function setPosition(pos) {
    position = pos || "center";
    document.querySelectorAll("#posGrid .pw-pos-btn").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.pos === position);
    });
  }

  function syncSliders() {
    if (els.wmOpacityVal && els.wmOpacity) {
      els.wmOpacityVal.textContent = els.wmOpacity.value + "%";
    }
    if (els.wmAngleVal && els.wmAngle) {
      const a = Number(els.wmAngle.value);
      els.wmAngleVal.textContent = (a > 0 ? "+" : "") + a + "°";
    }
    if (els.wmImageScaleVal && els.wmImageScale) {
      els.wmImageScaleVal.textContent = els.wmImageScale.value + "%";
    }
    if (els.wmColorHex && els.wmColor) {
      els.wmColorHex.textContent = els.wmColor.value;
    }
  }

  function showPdf(f) {
    clearResult();
    file = f;
    els.shell?.classList.add("has-file");
    if (els.fileName) els.fileName.textContent = f.name;
    if (els.fileMeta) els.fileMeta.textContent = OT.formatBytes(f.size);
    if (els.status) els.status.textContent = "Chỉnh tùy chọn rồi bấm Đóng dấu PDF.";
  }

  function resetPdf() {
    file = null;
    clearResult();
    els.shell?.classList.remove("has-file");
    if (els.status) els.status.textContent = "Chọn PDF để bắt đầu";
  }

  function optsFromForm() {
    return {
      mode,
      text: els.wmText?.value || "CONFIDENTIAL",
      opacity: (Number(els.wmOpacity?.value) || 28) / 100,
      angle: Number(els.wmAngle?.value) || 0,
      fontSize: Number(els.wmFontSize?.value) || 48,
      position,
      pages: (els.pageSpec?.value || "all").trim() || "all",
      color: els.wmColor?.value || "#7c3aed",
      imageFile: imageFile || undefined,
      imageScale: (Number(els.wmImageScale?.value) || 35) / 100
    };
  }

  async function showPreviewFromBlob(blob) {
    revokePreview();
    if (!blob || !OTPdf?.firstPagePng) {
      if (els.previewEmpty) {
        els.previewEmpty.hidden = false;
        els.previewEmpty.textContent = "Đã đóng dấu — tải PDF để xem đầy đủ.";
      }
      return;
    }
    try {
      if (els.status) els.status.textContent = "Đang tạo xem trước trang 1…";
      const png = await OTPdf.firstPagePng(
        new File([blob], "preview.pdf", { type: "application/pdf" })
      );
      previewUrl = URL.createObjectURL(png);
      if (els.previewEmpty) els.previewEmpty.hidden = true;
      if (els.previewImg) {
        els.previewImg.hidden = false;
        els.previewImg.src = previewUrl;
      }
    } catch (_) {
      if (els.previewEmpty) {
        els.previewEmpty.hidden = false;
        els.previewEmpty.textContent = "Không tạo được xem trước — vẫn tải PDF được.";
      }
    }
  }

  OT.bindUploadZone({
    onFiles: (files) => {
      const f = files?.[0];
      if (!f) return;
      const ok = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
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

  document.getElementById("modeGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".pw-mode");
    if (!btn) return;
    setMode(btn.dataset.mode);
  });

  document.getElementById("posGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".pw-pos-btn");
    if (!btn) return;
    setPosition(btn.dataset.pos);
  });

  document.getElementById("wmImageBtn")?.addEventListener("click", () => {
    els.wmImageInput?.click();
  });

  els.wmImageInput?.addEventListener("change", () => {
    const f = els.wmImageInput.files?.[0];
    if (!f) return;
    if (!/^image\//i.test(f.type) && !/\.(png|jpe?g|webp)$/i.test(f.name)) {
      showToast?.("Chọn ảnh PNG/JPG/WebP.", "error");
      return;
    }
    imageFile = f;
    if (els.wmImageName) els.wmImageName.textContent = f.name + " · " + OT.formatBytes(f.size);
  });

  ["wmOpacity", "wmAngle", "wmImageScale", "wmColor"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", syncSliders);
  });

  els.runBtn?.addEventListener("click", async () => {
    const btn = els.runBtn;
    try {
      if (!file) throw new Error("Chọn PDF trước.");
      if (mode === "image" && !imageFile) throw new Error("Chọn ảnh watermark.");
      if (!window.OTPdfWatermark?.apply) throw new Error("Engine watermark chưa sẵn sàng — Ctrl+F5.");
      OT.setBusy(btn, true, "Đang đóng dấu…");
      clearResult();
      if (els.status) els.status.textContent = "Đang gắn watermark…";

      const opts = optsFromForm();
      const result = await OTPdfWatermark.apply(file, opts);
      lastBlob = result.blob;

      const outName = OT.nameWithSuffix(file.name, "-watermark", ".pdf");
      OT.setLastResult?.({
        blob: result.blob,
        fileName: outName,
        contentType: "application/pdf"
      });

      if (els.downloadBtn) els.downloadBtn.disabled = false;
      if (els.statsBar) els.statsBar.hidden = false;
      if (els.statPages) els.statPages.textContent = String(result.pageCount);
      if (els.statStamped) els.statStamped.textContent = String(result.stamped);
      if (els.statSize) els.statSize.textContent = OT.formatBytes(result.blob.size);

      await showPreviewFromBlob(result.blob);

      if (els.status) {
        els.status.textContent =
          "Xong — đóng dấu " +
          result.stamped +
          "/" +
          result.pageCount +
          " trang · " +
          OT.formatBytes(result.blob.size);
      }
      showToast?.("Đã đóng dấu PDF!", "success");
    } catch (err) {
      if (els.status) els.status.textContent = err.message || String(err);
      showToast?.(err.message || "Không đóng dấu được.", "error");
    } finally {
      OT.setBusy(btn, false);
    }
  });

  els.downloadBtn?.addEventListener("click", () => {
    if (!lastBlob || !file) return;
    OT.downloadBlob(lastBlob, OT.nameWithSuffix(file.name, "-watermark", ".pdf"));
  });

  setMode("text");
  setPosition("center");
  syncSliders();
})();
