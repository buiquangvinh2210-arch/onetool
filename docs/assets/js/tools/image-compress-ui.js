(function () {
  "use strict";

  const LEVELS = {
    light: { quality: 0.88, maxEdge: 0, label: "Nhẹ" },
    balanced: { quality: 0.72, maxEdge: 2560, label: "Cân bằng" },
    strong: { quality: 0.55, maxEdge: 1920, label: "Mạnh" },
    tiny: { quality: 0.4, maxEdge: 1280, label: "Siêu nhỏ" },
    custom: { quality: 0.7, maxEdge: 0, label: "Tùy chỉnh" }
  };

  let file = null;
  let sourceUrl = null;
  let resultUrl = null;
  let lastBlob = null;
  let lastMeta = null;
  let level = "balanced";
  let format = "auto";
  let busy = false;
  let debounceTimer = null;

  const els = {
    shell: document.getElementById("shell"),
    zone: document.getElementById("uploadZone"),
    input: document.getElementById("fileInput"),
    sourceImg: document.getElementById("sourceImg"),
    preview: document.getElementById("preview"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    origDim: document.getElementById("origDim"),
    outDim: document.getElementById("outDim"),
    status: document.getElementById("status"),
    quality: document.getElementById("quality"),
    qualityVal: document.getElementById("qualityVal"),
    qualityWrap: document.getElementById("qualityWrap"),
    maxEdge: document.getElementById("maxEdge"),
    customWrap: document.getElementById("customWrap"),
    sizeBefore: document.getElementById("sizeBefore"),
    sizeAfter: document.getElementById("sizeAfter"),
    ring: document.getElementById("saveRing"),
    ringPct: document.getElementById("savePct"),
    runBtn: document.getElementById("runBtn"),
    copyBtn: document.getElementById("copyResultBtn"),
    downloadBtn: document.getElementById("downloadResultBtn")
  };

  function waitMarkup() {
    return '<div class="ic-wait" id="resultEmpty">Bấm Nén ảnh để xem</div>';
  }

  function revokeSource() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = null;
  }

  function revokeResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = null;
  }

  function setLevel(id) {
    level = LEVELS[id] ? id : "balanced";
    document.querySelectorAll(".ic-level").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.level === level);
    });
    const cfg = LEVELS[level];
    const isCustom = level === "custom";
    if (els.customWrap) els.customWrap.hidden = !isCustom;
    if (!isCustom && els.quality) {
      els.quality.value = Math.round(cfg.quality * 100);
      if (els.qualityVal) els.qualityVal.textContent = els.quality.value + "%";
    }
    if (!isCustom && els.maxEdge) {
      els.maxEdge.value = cfg.maxEdge || "";
    }
  }

  function setFormat(id) {
    format = id || "auto";
    document.querySelectorAll(".ic-fmt").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.format === format);
    });
  }

  function clearResult() {
    lastBlob = null;
    lastMeta = null;
    revokeResult();
    els.shell?.classList.remove("has-result");
    if (els.outDim) els.outDim.textContent = "-";
    if (els.preview) {
      els.preview.querySelectorAll("img").forEach((img) => img.remove());
      if (!els.preview.querySelector(".ic-wait")) els.preview.innerHTML = waitMarkup();
    }
    if (els.copyBtn) els.copyBtn.disabled = true;
    if (els.downloadBtn) els.downloadBtn.disabled = true;
  }

  function applyResult(r) {
    lastBlob = r.blob;
    lastMeta = r;
    revokeResult();
    resultUrl = URL.createObjectURL(r.blob);

    const empty = els.preview?.querySelector(".ic-wait");
    if (empty) empty.remove();
    let img = els.preview?.querySelector("img");
    if (!img && els.preview) {
      img = document.createElement("img");
      img.alt = "Ảnh đã nén";
      els.preview.appendChild(img);
    }
    if (img) img.src = resultUrl;

    const pct = Math.round((r.ratio || 0) * 100);
    const grew = r.after >= r.before;
    if (els.ring) els.ring.style.setProperty("--pct", (grew ? 0 : pct) + "%");
    if (els.ringPct) els.ringPct.textContent = grew ? "0%" : pct + "%";
    if (els.sizeBefore) els.sizeBefore.textContent = OT.formatBytes(r.before);
    if (els.sizeAfter) els.sizeAfter.textContent = OT.formatBytes(r.after);
    if (els.outDim) {
      els.outDim.textContent =
        r.width + " × " + r.height + " · " + OT.formatBytes(r.after) + " · " + (r.format || "").toUpperCase();
    }

    els.shell?.classList.add("has-result");
    if (els.copyBtn) els.copyBtn.disabled = false;
    if (els.downloadBtn) els.downloadBtn.disabled = false;

    if (typeof OT.setLastResult === "function") {
      OT.setLastResult({
        blob: r.blob,
        fileName: r.fileName,
        contentType: r.contentType
      });
    }

    if (grew) {
      els.status.textContent =
        "Ảnh gốc đã khá nhẹ — xuất " +
        OT.formatBytes(r.after) +
        " (định dạng " +
        (r.format || "").toUpperCase() +
        "). Thử mức Mạnh hoặc WebP.";
    } else {
      els.status.textContent =
        "Giảm " +
        OT.formatBytes(r.saved) +
        " (−" +
        pct +
        "%) · " +
        OT.formatBytes(r.before) +
        " → " +
        OT.formatBytes(r.after);
    }
  }

  function currentOpts() {
    const cfg = LEVELS[level] || LEVELS.balanced;
    let quality = cfg.quality;
    let maxEdge = cfg.maxEdge || 0;
    if (level === "custom") {
      quality = (parseInt(els.quality?.value, 10) || 70) / 100;
      maxEdge = parseInt(els.maxEdge?.value, 10) || 0;
    }
    return { quality, maxEdge, format };
  }

  async function runCompress({ silent } = {}) {
    if (!file || busy) return;
    const btn = els.runBtn;
    busy = true;
    try {
      if (!silent) OT.setBusy(btn, true, "Đang nén…");
      if (!silent) els.status.textContent = "Đang nén trên trình duyệt…";
      const opts = currentOpts();
      const r = await OTImage.compress(file, opts);
      applyResult(r);
      if (!silent) showToast?.("Đã nén ảnh!", "success");
    } catch (e) {
      els.status.textContent = e.message || String(e);
      console.error(e);
      if (!silent) showToast?.(e.message || "Không nén được ảnh.", "error");
    } finally {
      busy = false;
      if (!silent) OT.setBusy(btn, false);
    }
  }

  function schedulePreview() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (file) runCompress({ silent: true });
    }, 280);
  }

  async function showSource(f) {
    revokeSource();
    clearResult();
    file = f;
    sourceUrl = URL.createObjectURL(f);
    els.sourceImg.src = sourceUrl;
    els.fileName.textContent = f.name;
    els.shell.classList.add("has-file");
    els.zone?.classList.add("has-file");

    const img = await OT.loadImage(f);
    els.fileMeta.textContent =
      OT.formatBytes(f.size) + " · " + img.naturalWidth + " × " + img.naturalHeight;
    els.origDim.textContent =
      img.naturalWidth + " × " + img.naturalHeight + " · " + OT.formatBytes(f.size);
    els.status.textContent = "Chọn mức nén rồi bấm Nén ảnh — hoặc để tự chạy ngay.";
    await runCompress({ silent: true });
  }

  OT.bindUploadZone({
    onFiles: (files) => {
      const f = files?.[0];
      if (!f) return;
      if (!f.type.startsWith("image/")) {
        showToast?.("Chọn file ảnh.", "error");
        return;
      }
      if (f.size > 20 * 1024 * 1024) {
        showToast?.("Ảnh tối đa 20MB.", "error");
        return;
      }
      showSource(f);
    }
  });

  document.getElementById("changeBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    els.input?.click();
  });

  document.getElementById("levelGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ic-level");
    if (!btn) return;
    setLevel(btn.dataset.level);
    clearResult();
    schedulePreview();
  });

  document.getElementById("formatGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ic-fmt");
    if (!btn) return;
    setFormat(btn.dataset.format);
    clearResult();
    schedulePreview();
  });

  els.quality?.addEventListener("input", () => {
    if (els.qualityVal) els.qualityVal.textContent = els.quality.value + "%";
    if (level !== "custom") setLevel("custom");
    schedulePreview();
  });

  els.maxEdge?.addEventListener("change", () => {
    if (level !== "custom") setLevel("custom");
    schedulePreview();
  });

  els.runBtn?.addEventListener("click", () => runCompress());

  setLevel("balanced");
  setFormat("auto");
})();
