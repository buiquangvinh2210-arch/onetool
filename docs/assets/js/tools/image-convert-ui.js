(function () {
  "use strict";

  const FORMATS = [
    { key: "jpg", aliases: ["jpg", "jpeg"], label: "JPG" },
    { key: "png", aliases: ["png"], label: "PNG" },
    { key: "webp", aliases: ["webp"], label: "WebP" }
  ];

  let selectedFile = null;
  let sourceKey = null;
  let targetFormat = null;
  let lastBlob = null;
  let lastName = null;
  let objectUrls = [];

  const els = {
    fileInput: document.getElementById("fileInput"),
    uploadZone: document.getElementById("uploadZone"),
    uploadPlaceholder: document.getElementById("uploadPlaceholder"),
    fileInfo: document.getElementById("fileInfo"),
    convertOptions: document.getElementById("convertOptions"),
    convertBtn: document.getElementById("convertBtn"),
    resultEmpty: document.getElementById("resultEmpty"),
    resultBox: document.getElementById("resultBox"),
    resultImg: document.getElementById("resultImg"),
    resultName: document.getElementById("resultName"),
    resultSize: document.getElementById("resultSize"),
    resultFormat: document.getElementById("resultFormat"),
    downloadBtn: document.getElementById("downloadBtn"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    fileExt: document.getElementById("fileExt"),
    thumbWrap: document.getElementById("thumbWrap"),
    thumbImg: document.getElementById("thumbImg"),
    status: document.getElementById("status")
  };

  const formatButtons = () => [...document.querySelectorAll(".format-card")];

  document.getElementById("browseBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    els.fileInput?.click();
  });
  document.getElementById("changeFileBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    resetAll();
    els.fileInput?.click();
  });
  els.convertBtn?.addEventListener("click", runConvert);
  els.downloadBtn?.addEventListener("click", () => {
    if (!lastBlob) return;
    OT.downloadBlob(lastBlob, lastName || "converted.png");
  });
  els.fileInput?.addEventListener("change", (e) => handleFile(e.target.files?.[0]));

  els.uploadZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    els.uploadZone.classList.add("dragover");
  });
  els.uploadZone?.addEventListener("dragleave", () => els.uploadZone.classList.remove("dragover"));
  els.uploadZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    els.uploadZone.classList.remove("dragover");
    if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0]);
  });
  els.uploadZone?.addEventListener("click", (e) => {
    if (e.target.closest("#browseBtn") || e.target.closest("#changeFileBtn") || e.target.closest("#fileInfo")) return;
    if (!selectedFile) els.fileInput?.click();
  });

  formatButtons().forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled || btn.classList.contains("is-disabled")) return;
      targetFormat = btn.dataset.format;
      formatButtons().forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      updateConvertBtn();
    });
  });

  function normalizeKey(ext) {
    const bare = (ext || "").replace(/^\./, "").toLowerCase();
    const found = FORMATS.find((f) => f.key === bare || f.aliases.includes(bare));
    return found ? found.key : bare;
  }

  function revokeUrls() {
    objectUrls.forEach((u) => URL.revokeObjectURL(u));
    objectUrls = [];
  }

  function resetAll() {
    selectedFile = null;
    sourceKey = null;
    targetFormat = null;
    lastBlob = null;
    lastName = null;
    revokeUrls();
    if (els.fileInput) els.fileInput.value = "";
    els.uploadZone?.classList.remove("has-file");
    els.uploadPlaceholder?.classList.remove("hidden");
    els.fileInfo?.classList.add("hidden");
    els.convertOptions?.classList.add("hidden");
    els.resultEmpty?.classList.remove("hidden");
    els.resultBox?.classList.add("hidden");
    els.convertBtn && (els.convertBtn.disabled = true);
    formatButtons().forEach((b) => {
      b.classList.remove("is-active", "is-disabled");
      b.disabled = false;
      b.setAttribute("aria-pressed", "false");
    });
  }

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|bmp|tiff?|tga)$/i.test(file.name)) {
      showToast?.("Định dạng chưa hỗ trợ.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast?.("Ảnh vượt quá 10MB.", "error");
      return;
    }

    revokeUrls();
    selectedFile = file;
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    sourceKey = normalizeKey(ext);

    els.uploadZone?.classList.add("has-file");
    els.uploadPlaceholder?.classList.add("hidden");
    els.fileInfo?.classList.remove("hidden");
    els.convertOptions?.classList.remove("hidden");

    if (els.fileName) els.fileName.textContent = file.name;
    if (els.fileExt) els.fileExt.textContent = (sourceKey || "IMG").toUpperCase().slice(0, 4);
    if (els.fileMeta) els.fileMeta.textContent = OT.formatBytes(file.size);

    const url = URL.createObjectURL(file);
    objectUrls.push(url);
    if (els.thumbImg) {
      els.thumbImg.src = url;
      els.thumbWrap?.removeAttribute("hidden");
    }

    // Disable same format as source
    formatButtons().forEach((btn) => {
      const same = btn.dataset.format === sourceKey || (sourceKey === "jpeg" && btn.dataset.format === "jpg");
      btn.classList.toggle("is-disabled", same);
      btn.disabled = same;
      if (same) {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
      }
    });

    // Auto-pick first available
    const first = formatButtons().find((b) => !b.disabled);
    if (first) {
      targetFormat = first.dataset.format;
      first.classList.add("is-active");
      first.setAttribute("aria-pressed", "true");
    } else {
      targetFormat = null;
    }
    updateConvertBtn();

    els.resultEmpty?.classList.remove("hidden");
    els.resultBox?.classList.add("hidden");
    showToast?.("Đã chọn ảnh — chọn định dạng rồi chuyển đổi.", "success");
  }

  function updateConvertBtn() {
    if (els.convertBtn) els.convertBtn.disabled = !(selectedFile && targetFormat);
  }

  async function runConvert() {
    if (!selectedFile || !targetFormat) return;
    const btn = els.convertBtn;
    try {
      OT.setBusy(btn, true, "Đang chuyển…");
      if (els.status) els.status.textContent = "Đang xử lý trên trình duyệt…";

      const r = await OTImage.convert(selectedFile, targetFormat, 0.92);
      lastBlob = r.blob;
      lastName = r.fileName;

      const url = URL.createObjectURL(r.blob);
      objectUrls.push(url);
      if (els.resultImg) els.resultImg.src = url;
      if (els.resultName) els.resultName.textContent = r.fileName;
      if (els.resultSize) els.resultSize.textContent = OT.formatBytes(r.blob.size);
      if (els.resultFormat) els.resultFormat.textContent = targetFormat.toUpperCase();

      els.resultEmpty?.classList.add("hidden");
      els.resultBox?.classList.remove("hidden");
      if (els.status) els.status.textContent = "✨ Đã chuyển đổi — sẵn sàng tải về.";
      showToast?.("Convert thành công!", "success");
    } catch (e) {
      if (els.status) els.status.textContent = e.message || "Lỗi convert.";
      showToast?.(e.message || "Lỗi convert.", "error");
    } finally {
      OT.setBusy(btn, false);
    }
  }
})();
