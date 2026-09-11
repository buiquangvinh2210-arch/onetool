(function () {
  "use strict";

  let file = null;
  let mode = "text";
  let position = "center";
  let imageFile = null;
  let imageUrl = null;
  let lastBlob = null;
  let pdfDoc = null;
  let pageIndex = 0;
  let pageCss = { width: 0, height: 0 };
  let pagePdf = { width: 0, height: 0 };
  let renderTask = null;
  let drag = null;
  let resultUrls = [];

  /** Vị trí + kích thước theo tỉ lệ trang (cân mọi khổ trang). */
  let place = { cx: 0.5, cy: 0.5, wNorm: 0.42, hNorm: 0.08 };

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
    stage: document.getElementById("stage"),
    pageCanvas: document.getElementById("pageCanvas"),
    overlays: document.getElementById("overlays"),
    wmBox: document.getElementById("wmBox"),
    wmBody: document.getElementById("wmBody"),
    pageLabel: document.getElementById("pageLabel"),
    editorPane: document.getElementById("editorPane"),
    resultPane: document.getElementById("resultPane"),
    resultGrid: document.getElementById("resultGrid"),
    posHint: document.getElementById("posHint")
  };

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function revokeResults() {
    resultUrls.forEach((u) => URL.revokeObjectURL(u));
    resultUrls = [];
    if (els.resultGrid) els.resultGrid.innerHTML = "";
  }

  function clearResult() {
    lastBlob = null;
    revokeResults();
    if (els.downloadBtn) els.downloadBtn.disabled = true;
    if (els.statsBar) els.statsBar.hidden = true;
    if (els.resultPane) els.resultPane.hidden = true;
    if (els.editorPane) els.editorPane.hidden = false;
  }

  function setMode(next) {
    mode = next === "image" ? "image" : "text";
    document.querySelectorAll("#modeGrid .pw-mode").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.mode === mode);
    });
    if (els.textOpts) els.textOpts.hidden = mode !== "text";
    if (els.imageOpts) els.imageOpts.hidden = mode !== "image";
    syncWmChrome();
    layoutWm();
  }

  function setPosition(pos, fromPreset) {
    position = pos || "center";
    document.querySelectorAll("#posGrid .pw-pos-btn").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.pos === position);
    });
    if (els.posHint) {
      els.posHint.textContent =
        position === "tile"
          ? "Chế độ Lặp: watermark phủ lưới trên mọi trang."
          : "Kéo trên một trang — mọi trang giữ cùng tỉ lệ vị trí & cỡ chữ.";
    }
    if (els.wmBox) els.wmBox.hidden = position === "tile" || !pdfDoc;
    if (fromPreset && position !== "tile" && position !== "custom" && pagePdf.width) {
      applyPresetToPlace(position);
    }
    layoutWm();
  }

  function applyPresetToPlace(pos) {
    const padX = 40 / pagePdf.width;
    const padY = 40 / pagePdf.height;
    const box = boxPdfForPage();
    const halfW = box.w / pagePdf.width / 2;
    const halfH = box.h / pagePdf.height / 2;
    if (pos === "tl") {
      place.cx = clamp(padX + halfW, 0.05, 0.95);
      place.cy = clamp(1 - padY - halfH, 0.05, 0.95);
    } else if (pos === "tr") {
      place.cx = clamp(1 - padX - halfW, 0.05, 0.95);
      place.cy = clamp(1 - padY - halfH, 0.05, 0.95);
    } else if (pos === "bl") {
      place.cx = clamp(padX + halfW, 0.05, 0.95);
      place.cy = clamp(padY + halfH, 0.05, 0.95);
    } else if (pos === "br") {
      place.cx = clamp(1 - padX - halfW, 0.05, 0.95);
      place.cy = clamp(padY + halfH, 0.05, 0.95);
    } else {
      place.cx = 0.5;
      place.cy = 0.5;
    }
  }

  function pdfScale() {
    return pagePdf.width > 0 ? pageCss.width / pagePdf.width : 1;
  }

  /** Đo bề rộng chữ gần Helvetica-Bold (cùng font engine PDF dùng). */
  function measureTextPdfWidth(text, fontSize) {
    const canvas = measureTextPdfWidth._c || (measureTextPdfWidth._c = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = "bold " + fontSize + "px Helvetica, Arial, sans-serif";
    return Math.max(8, ctx.measureText(text).width);
  }

  function estimateAspect() {
    if (mode === "image" && els.wmBody?.querySelector("img")) {
      const img = els.wmBody.querySelector("img");
      if (img.naturalWidth && img.naturalHeight) return img.naturalHeight / img.naturalWidth;
    }
    return place.hNorm / Math.max(0.01, place.wNorm);
  }

  /** Kích thước watermark trên trang hiện tại (điểm PDF), theo tỉ lệ wNorm/hNorm. */
  function boxPdfForPage() {
    const w = clamp(place.wNorm, 0.04, 1.2) * pagePdf.width;
    let h;
    if (mode === "text") {
      const text = (els.wmText?.value || "CONFIDENTIAL").trim() || "X";
      const at100 = measureTextPdfWidth(text, 100) || 100;
      const fs = clamp((w / at100) * 100, 8, 400);
      h = fs;
      return { w: measureTextPdfWidth(text, fs), h: fs, fontSize: fs };
    }
    h = place.hNorm > 0 ? place.hNorm * pagePdf.height : w * estimateAspect();
    return { w, h, fontSize: h };
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

  /** Ghi nhận cỡ từ ô Cỡ chữ / Tỉ lệ ảnh → tỉ lệ theo trang hiện tại. */
  function syncSizeFromControls() {
    if (!pagePdf.width) return;
    if (mode === "image") {
      place.wNorm = clamp((Number(els.wmImageScale?.value) || 35) / 100, 0.05, 1);
      place.hNorm = (place.wNorm * pagePdf.width * estimateAspect()) / pagePdf.height;
    } else {
      const fs = clamp(Number(els.wmFontSize?.value) || 48, 8, 400);
      const text = (els.wmText?.value || "CONFIDENTIAL").trim() || "X";
      const tw = measureTextPdfWidth(text, fs);
      place.wNorm = clamp(tw / pagePdf.width, 0.04, 1.2);
      place.hNorm = clamp(fs / pagePdf.height, 0.02, 1);
    }
  }

  /** Sau khi kéo resize: cập nhật ô điều khiển theo trang hiện tại. */
  function syncControlsFromSize() {
    if (!pagePdf.width) return;
    const box = boxPdfForPage();
    if (mode === "image" && els.wmImageScale) {
      els.wmImageScale.value = String(Math.round(clamp(place.wNorm, 0.05, 1) * 100));
    } else if (els.wmFontSize) {
      els.wmFontSize.value = String(Math.round(clamp(box.fontSize, 10, 200)));
    }
    syncSliders();
  }

  function syncWmChrome() {
    if (!els.wmBody || !els.wmBox) return;
    const opacity = (Number(els.wmOpacity?.value) || 28) / 100;
    const angle = Number(els.wmAngle?.value) || 0;
    els.wmBox.style.setProperty("--wm-angle", angle + "deg");
    els.wmBox.style.opacity = String(opacity);

    if (mode === "image" && imageUrl) {
      els.wmBody.innerHTML = "";
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = "Watermark";
      img.draggable = false;
      els.wmBody.appendChild(img);
      els.wmBody.style.fontSize = "";
      els.wmBox.classList.add("is-image");
      els.wmBox.classList.remove("is-text");
    } else {
      const text = (els.wmText?.value || "CONFIDENTIAL").trim() || "CONFIDENTIAL";
      const box = pagePdf.width ? boxPdfForPage() : { fontSize: Number(els.wmFontSize?.value) || 48 };
      els.wmBody.textContent = text;
      els.wmBody.style.color = els.wmColor?.value || "#7c3aed";
      els.wmBody.style.fontSize = box.fontSize * pdfScale() + "px";
      els.wmBox.classList.add("is-text");
      els.wmBox.classList.remove("is-image");
    }
  }

  function layoutWm() {
    if (!els.wmBox || !pageCss.width || position === "tile") return;
    const s = pdfScale();
    const box = boxPdfForPage();
    const w = box.w * s;
    const h = box.h * s;
    if (mode === "text") {
      els.wmBody.style.fontSize = h + "px";
      // Hiển thị cỡ chữ hiệu dụng trên trang này (tỉ lệ giữ nguyên)
      if (els.wmFontSize && document.activeElement !== els.wmFontSize) {
        els.wmFontSize.value = String(Math.round(clamp(box.fontSize, 8, 400)));
      }
    }
    const left = place.cx * pageCss.width - w / 2;
    const top = (1 - place.cy) * pageCss.height - h / 2;
    els.wmBox.style.width = w + "px";
    els.wmBox.style.height = h + "px";
    els.wmBox.style.left = left + "px";
    els.wmBox.style.top = top + "px";
    els.wmBox.hidden = false;
  }

  function markCustomFromDrag() {
    if (position === "tile") return;
    position = "custom";
    document.querySelectorAll("#posGrid .pw-pos-btn").forEach((btn) => {
      btn.classList.remove("is-on");
    });
    if (els.posHint) {
      els.posHint.textContent = "Đã khóa tỉ lệ — mọi trang chữ cùng độ lớn tương đối.";
    }
  }

  function commitWmFromCss() {
    if (!els.wmBox || !pageCss.width || !pagePdf.width) return;
    const left = parseFloat(els.wmBox.style.left) || 0;
    const top = parseFloat(els.wmBox.style.top) || 0;
    const w = parseFloat(els.wmBox.style.width) || 40;
    const h = parseFloat(els.wmBox.style.height) || 24;
    const s = pdfScale();
    const absW = Math.max(8, w / s);
    const absH = Math.max(8, h / s);
    place.cx = clamp((left + w / 2) / pageCss.width, 0, 1);
    place.cy = clamp(1 - (top + h / 2) / pageCss.height, 0, 1);
    place.wNorm = clamp(absW / pagePdf.width, 0.04, 1.2);
    place.hNorm = clamp(absH / pagePdf.height, 0.02, 1);
    if (mode === "text") {
      const fs = clamp(absH, 8, 400);
      const text = (els.wmText?.value || "CONFIDENTIAL").trim() || "X";
      place.wNorm = clamp(measureTextPdfWidth(text, fs) / pagePdf.width, 0.04, 1.2);
      place.hNorm = clamp(fs / pagePdf.height, 0.02, 1);
      if (els.wmFontSize) els.wmFontSize.value = String(Math.round(fs));
      syncSliders();
    } else {
      syncControlsFromSize();
    }
  }

  async function renderPage() {
    if (!pdfDoc || !els.pageCanvas) return;
    if (renderTask) {
      try {
        renderTask.cancel();
      } catch (_) {}
      renderTask = null;
    }

    const page = await pdfDoc.getPage(pageIndex + 1);
    const base = page.getViewport({ scale: 1 });
    pagePdf = { width: base.width, height: base.height };

    const wrap = els.stage?.parentElement;
    const maxW = Math.max(240, (wrap?.clientWidth || 480) - 24);
    const maxH = Math.min(520, Math.max(280, window.innerHeight * 0.55));
    const scale = Math.min(maxW / base.width, maxH / base.height, 2.2);
    const viewport = page.getViewport({ scale });
    pageCss = { width: viewport.width, height: viewport.height };

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const canvas = els.pageCanvas;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";
    if (els.overlays) {
      els.overlays.style.width = Math.floor(viewport.width) + "px";
      els.overlays.style.height = Math.floor(viewport.height) + "px";
    }
    if (els.stage) {
      els.stage.style.width = Math.floor(viewport.width) + "px";
      els.stage.style.height = Math.floor(viewport.height) + "px";
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    renderTask = page.render({ canvasContext: ctx, viewport });
    await renderTask.promise;
    renderTask = null;

    if (els.pageLabel) {
      els.pageLabel.textContent = "Trang " + (pageIndex + 1) + " / " + pdfDoc.numPages;
    }
    if (els.previewEmpty) els.previewEmpty.hidden = true;
    if (els.stage) els.stage.hidden = false;

    syncWmChrome();
    // Giữ wNorm/hNorm/cx/cy — cùng tỉ lệ trên mọi khổ trang
    if (position !== "custom" && position !== "tile") applyPresetToPlace(position);
    layoutWm();
  }

  async function openPdf(f) {
    clearResult();
    file = f;
    pageIndex = 0;
    place = { cx: 0.5, cy: 0.5, wNorm: 0.42, hNorm: 0.08 };
    position = "center";
    setPosition("center", false);
    els.shell?.classList.add("has-file");
    if (els.fileName) els.fileName.textContent = f.name;
    if (els.fileMeta) els.fileMeta.textContent = OT.formatBytes(f.size);
    if (els.status) els.status.textContent = "Kéo watermark trên trang, rồi bấm Đóng dấu PDF.";
    if (els.previewEmpty) {
      els.previewEmpty.hidden = false;
      els.previewEmpty.textContent = "Đang tải trang PDF…";
    }
    if (els.stage) els.stage.hidden = true;
    pdfDoc = await OTPdf.openPdfDoc(f);
    syncSizeFromControls();
    await renderPage();
  }

  function resetPdf() {
    file = null;
    pdfDoc = null;
    pageIndex = 0;
    clearResult();
    els.shell?.classList.remove("has-file");
    if (els.status) els.status.textContent = "Chọn PDF để bắt đầu";
    if (els.stage) els.stage.hidden = true;
    if (els.wmBox) els.wmBox.hidden = true;
    if (els.previewEmpty) {
      els.previewEmpty.hidden = false;
      els.previewEmpty.textContent = "Chọn PDF để xem trước và kéo watermark";
    }
  }

  function optsFromForm() {
    const isTile = position === "tile";
    return {
      mode,
      text: els.wmText?.value || "CONFIDENTIAL",
      opacity: (Number(els.wmOpacity?.value) || 28) / 100,
      angle: Number(els.wmAngle?.value) || 0,
      fontSize: Number(els.wmFontSize?.value) || 48,
      position: isTile ? "tile" : "custom",
      pages: (els.pageSpec?.value || "all").trim() || "all",
      color: els.wmColor?.value || "#7c3aed",
      imageFile: imageFile || undefined,
      imageScale: (Number(els.wmImageScale?.value) || 35) / 100,
      custom: isTile
        ? null
        : {
            cx: place.cx,
            cy: place.cy,
            wNorm: place.wNorm,
            hNorm: place.hNorm
          }
    };
  }

  async function showAllResultPages(blob) {
    revokeResults();
    if (!blob || !OTPdf?.openPdfDoc || !els.resultGrid) return;
    if (els.status) els.status.textContent = "Đang tạo xem trước mọi trang…";
    const doc = await OTPdf.openPdfDoc(new File([blob], "out.pdf", { type: "application/pdf" }));
    const n = doc.numPages;
    const maxPreview = Math.min(n, 40);
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= maxPreview; i++) {
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(280 / base.width, 360 / base.height, 1.4);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
      const png = await OT.canvasToBlob(canvas, "image/png");
      const url = URL.createObjectURL(png);
      resultUrls.push(url);
      const card = document.createElement("figure");
      card.className = "pw-result-card";
      card.innerHTML =
        '<img alt="Trang ' +
        i +
        '" /><figcaption>Trang ' +
        i +
        "</figcaption>";
      card.querySelector("img").src = url;
      frag.appendChild(card);
      if (els.status && i % 2 === 0) {
        els.status.textContent = "Đang tạo xem trước " + i + "/" + maxPreview + "…";
      }
    }
    if (n > maxPreview) {
      const more = document.createElement("p");
      more.className = "pw-hint";
      more.textContent = "Đã xem trước " + maxPreview + "/" + n + " trang — tải PDF để xem đủ.";
      frag.appendChild(more);
    }
    els.resultGrid.appendChild(frag);
    if (els.editorPane) els.editorPane.hidden = true;
    if (els.resultPane) els.resultPane.hidden = false;
    els.resultPane?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
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
      openPdf(f).catch((err) => {
        showToast?.(err.message || "Không mở được PDF.", "error");
        resetPdf();
      });
    }
  });

  document.getElementById("changeBtn")?.addEventListener("click", () => {
    resetPdf();
    els.input?.click();
  });

  document.getElementById("modeGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".pw-mode");
    if (!btn) return;
    clearResult();
    setMode(btn.dataset.mode);
  });

  document.getElementById("posGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".pw-pos-btn");
    if (!btn) return;
    clearResult();
    setPosition(btn.dataset.pos, true);
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
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageFile = f;
    imageUrl = URL.createObjectURL(f);
    if (els.wmImageName) els.wmImageName.textContent = f.name + " · " + OT.formatBytes(f.size);
    clearResult();
    syncWmChrome();
    syncSizeFromControls();
    layoutWm();
  });

  ["wmOpacity", "wmAngle", "wmImageScale", "wmColor", "wmFontSize", "wmText"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => {
      clearResult();
      syncSliders();
      if (id === "wmImageScale" || id === "wmFontSize" || id === "wmText") {
        if (position !== "custom") syncSizeFromControls();
        else if (id !== "wmText") syncSizeFromControls();
      }
      syncWmChrome();
      layoutWm();
    });
  });

  document.getElementById("prevPageBtn")?.addEventListener("click", async () => {
    if (!pdfDoc || pageIndex <= 0) return;
    pageIndex -= 1;
    await renderPage();
  });
  document.getElementById("nextPageBtn")?.addEventListener("click", async () => {
    if (!pdfDoc || pageIndex >= pdfDoc.numPages - 1) return;
    pageIndex += 1;
    await renderPage();
  });

  document.getElementById("backEditBtn")?.addEventListener("click", () => {
    if (els.resultPane) els.resultPane.hidden = true;
    if (els.editorPane) els.editorPane.hidden = false;
    if (els.status) els.status.textContent = "Chỉnh lại vị trí rồi bấm Đóng dấu PDF.";
  });

  els.overlays?.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(".pw-handle");
    const box = e.target.closest("#wmBox");
    if (!box || position === "tile") return;
    e.preventDefault();
    const left = parseFloat(box.style.left) || 0;
    const top = parseFloat(box.style.top) || 0;
    const w = parseFloat(box.style.width) || 40;
    const h = parseFloat(box.style.height) || 24;
    drag = {
      handle: handle?.dataset.handle || null,
      startX: e.clientX,
      startY: e.clientY,
      left,
      top,
      w,
      h,
      ratio: w / Math.max(1, h)
    };
    box.classList.add("is-dragging");
    box.setPointerCapture?.(e.pointerId);
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag || !els.wmBox) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    let left = drag.left;
    let top = drag.top;
    let w = drag.w;
    let h = drag.h;
    if (!drag.handle) {
      left = drag.left + dx;
      top = drag.top + dy;
    } else {
      const hnd = drag.handle;
      if (hnd.includes("e")) w = Math.max(48, drag.w + dx);
      if (hnd.includes("s")) h = Math.max(28, drag.h + dy);
      if (hnd.includes("w")) {
        w = Math.max(48, drag.w - dx);
        left = drag.left + (drag.w - w);
      }
      if (hnd.includes("n")) {
        h = Math.max(28, drag.h - dy);
        top = drag.top + (drag.h - h);
      }
      h = w / drag.ratio;
      if (hnd.includes("n")) top = drag.top + drag.h - h;
      if (hnd.includes("w")) left = drag.left + drag.w - w;
    }
    left = clamp(left, -w * 0.35, pageCss.width - w * 0.65);
    top = clamp(top, -h * 0.35, pageCss.height - h * 0.65);
    els.wmBox.style.left = left + "px";
    els.wmBox.style.top = top + "px";
    els.wmBox.style.width = w + "px";
    els.wmBox.style.height = h + "px";
  });

  window.addEventListener("pointerup", (e) => {
    if (!drag || !els.wmBox) return;
    els.wmBox.classList.remove("is-dragging");
    try {
      els.wmBox.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
    markCustomFromDrag();
    commitWmFromCss();
    clearResult();
    drag = null;
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
      if (position !== "tile") commitWmFromCss();

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

      await showAllResultPages(result.blob);

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

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    if (!pdfDoc) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderPage(), 160);
  });

  setMode("text");
  setPosition("center", false);
  syncSliders();
})();
