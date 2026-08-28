/**
 * Image blur — full / region Gaussian blur via Canvas filter (client-side).
 */
(function () {
  const MAX_BYTES = 20 * 1024 * 1024;
  const PREVIEW_EDGE = 1400;

  const PRESETS = {
    soft: 6,
    medium: 14,
    strong: 28,
    heavy: 48
  };

  let file = null;
  let sourceUrl = null;
  let bitmap = null;
  let lastBlob = null;
  let lastUrl = null;
  let mode = "full";
  let format = "png";
  let region = null; // image-space {x,y,w,h}
  let drag = null;
  let timer = null;
  let busy = false;

  const els = {
    shell: document.getElementById("shell"),
    zone: document.getElementById("uploadZone"),
    input: document.getElementById("fileInput"),
    browseBtn: document.getElementById("browseBtn"),
    changeBtn: document.getElementById("changeBtn"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    blurRange: document.getElementById("blurRange"),
    blurVal: document.getElementById("blurVal"),
    softEdge: document.getElementById("softEdge"),
    regionHint: document.getElementById("regionHint"),
    status: document.getElementById("status"),
    origDim: document.getElementById("origDim"),
    outDim: document.getElementById("outDim"),
    selectCanvas: document.getElementById("selectCanvas"),
    preview: document.getElementById("preview"),
    resultEmpty: document.getElementById("resultEmpty"),
    runBtn: document.getElementById("runBtn"),
    copyBtn: document.getElementById("copyResultBtn"),
    downloadBtn: document.getElementById("downloadResultBtn"),
    clearRegionBtn: document.getElementById("clearRegionBtn")
  };

  const sctx = els.selectCanvas.getContext("2d");

  function fmtSize(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.classList.toggle("is-ok", kind === "ok");
    els.status.classList.toggle("is-err", kind === "err");
  }

  function revokeSource() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = null;
  }

  function revokeLast() {
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = null;
    lastBlob = null;
  }

  function getRadius() {
    return Math.max(0.5, Number(els.blurRange.value) || 1);
  }

  function mimeFor(fmt) {
    if (fmt === "jpg") return "image/jpeg";
    if (fmt === "webp") return "image/webp";
    return "image/png";
  }

  function extFor(fmt) {
    return fmt === "jpg" ? "jpg" : fmt;
  }

  function defaultFormat(name) {
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (ext === "jpg" || ext === "jpeg") return "jpg";
    if (ext === "webp") return "webp";
    return "png";
  }

  function canvasToBlob(canvas, fmt, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Không xuất được ảnh"))),
        mimeFor(fmt),
        quality
      );
    });
  }

  function normalizeRegion(r, w, h) {
    if (!r) return null;
    let x = Math.min(r.x, r.x + r.w);
    let y = Math.min(r.y, r.y + r.h);
    let rw = Math.abs(r.w);
    let rh = Math.abs(r.h);
    x = Math.max(0, Math.min(w - 1, x));
    y = Math.max(0, Math.min(h - 1, y));
    rw = Math.max(1, Math.min(w - x, rw));
    rh = Math.max(1, Math.min(h - y, rh));
    if (rw < 4 || rh < 4) return null;
    return { x: Math.round(x), y: Math.round(y), w: Math.round(rw), h: Math.round(rh) };
  }

  function applyBlurToCanvas(source, radius, reg, soft) {
    const w = source.width;
    const h = source.height;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    const scaledRadius = Math.max(0.5, radius);

    if (!reg || mode === "full") {
      ctx.filter = "blur(" + scaledRadius + "px)";
      ctx.drawImage(source, 0, 0);
      ctx.filter = "none";
      return out;
    }

    ctx.drawImage(source, 0, 0);

    const blurLayer = document.createElement("canvas");
    blurLayer.width = w;
    blurLayer.height = h;
    const bctx = blurLayer.getContext("2d");
    bctx.filter = "blur(" + scaledRadius + "px)";
    bctx.drawImage(source, 0, 0);
    bctx.filter = "none";

    if (soft) {
      const feather = Math.max(8, Math.round(Math.min(reg.w, reg.h) * 0.12));
      const softBlur = document.createElement("canvas");
      softBlur.width = w;
      softBlur.height = h;
      const sctx2 = softBlur.getContext("2d");
      sctx2.drawImage(blurLayer, 0, 0);
      sctx2.globalCompositeOperation = "destination-in";
      const keep = document.createElement("canvas");
      keep.width = w;
      keep.height = h;
      const kctx = keep.getContext("2d");
      kctx.filter = "blur(" + feather + "px)";
      kctx.fillStyle = "#fff";
      kctx.fillRect(reg.x, reg.y, reg.w, reg.h);
      kctx.filter = "none";
      sctx2.drawImage(keep, 0, 0);
      ctx.drawImage(softBlur, 0, 0);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.rect(reg.x, reg.y, reg.w, reg.h);
      ctx.clip();
      ctx.drawImage(blurLayer, 0, 0);
      ctx.restore();
    }
    return out;
  }

  function fitDraw(source, maxEdge) {
    const sw = source.width;
    const sh = source.height;
    const scale = Math.min(1, maxEdge / Math.max(sw, sh));
    if (scale >= 0.999) return { canvas: null, scale: 1, source: source };
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(sw * scale));
    c.height = Math.max(1, Math.round(sh * scale));
    c.getContext("2d").drawImage(source, 0, 0, c.width, c.height);
    return { canvas: c, scale: scale, source: c };
  }

  async function renderBlur(forExport) {
    if (!bitmap) return null;
    const radius = getRadius();
    const soft = els.softEdge.checked && mode === "region";
    let source = bitmap;
    let scale = 1;
    let reg = region;

    if (!forExport) {
      const fitted = fitDraw(bitmap, PREVIEW_EDGE);
      source = fitted.source;
      scale = fitted.scale;
      if (reg) {
        reg = {
          x: Math.round(reg.x * scale),
          y: Math.round(reg.y * scale),
          w: Math.round(reg.w * scale),
          h: Math.round(reg.h * scale)
        };
      }
    }

    // Blur radius in canvas pixels — keep feel similar when previewing smaller
    const r = forExport ? radius : Math.max(0.5, radius * scale);
    const out = applyBlurToCanvas(source, r, mode === "region" ? reg : null, soft);
    const quality = format === "png" ? undefined : 0.92;
    return canvasToBlob(out, format, quality);
  }

  function showPreviewBlob(blob) {
    revokeLast();
    lastBlob = blob;
    lastUrl = URL.createObjectURL(blob);
    els.preview.querySelectorAll("img").forEach((img) => img.remove());
    if (els.resultEmpty) els.resultEmpty.hidden = true;
    const img = document.createElement("img");
    img.alt = "Ảnh đã làm mờ";
    img.src = lastUrl;
    els.preview.appendChild(img);
    els.copyBtn.disabled = false;
    els.downloadBtn.disabled = false;
    els.outDim.textContent = fmtSize(blob.size);
  }

  async function run(forExport) {
    if (!bitmap || busy) return;
    if (mode === "region" && !normalizeRegion(region, bitmap.width, bitmap.height)) {
      setStatus("Kéo chọn vùng trên ảnh gốc trước khi làm mờ vùng.", "err");
      return;
    }
    busy = true;
    els.runBtn.disabled = true;
    setStatus(forExport ? "Đang xuất ảnh…" : "Đang làm mờ…");
    try {
      await new Promise((r) => requestAnimationFrame(r));
      const blob = await renderBlur(!!forExport);
      if (!blob) throw new Error("Không tạo được kết quả");
      showPreviewBlob(blob);
      const label = mode === "full" ? "toàn ảnh" : "vùng chọn";
      setStatus("Đã làm mờ " + label + " · " + getRadius() + "px · " + fmtSize(blob.size), "ok");
    } catch (e) {
      setStatus(e.message || "Lỗi xử lý ảnh", "err");
    } finally {
      busy = false;
      els.runBtn.disabled = false;
    }
  }

  function schedulePreview() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!bitmap) return;
      if (mode === "region" && !normalizeRegion(region, bitmap.width, bitmap.height)) {
        clearResultPreview();
        setStatus("Kéo chọn vùng trên ảnh gốc để làm mờ.", "");
        return;
      }
      run(false);
    }, 180);
  }

  function clearResultPreview() {
    revokeLast();
    els.preview.querySelectorAll("img").forEach((img) => img.remove());
    if (els.resultEmpty) {
      els.resultEmpty.hidden = false;
      els.resultEmpty.textContent = mode === "region" ? "Chọn vùng rồi bấm Làm mờ" : "Bấm Làm mờ để xem";
    }
    els.outDim.textContent = "-";
    els.copyBtn.disabled = true;
    els.downloadBtn.disabled = true;
  }

  function drawSelectOverlay() {
    if (!bitmap) return;
    const canvas = els.selectCanvas;
    const maxW = canvas.parentElement.clientWidth || 480;
    const maxH = Math.min(420, window.innerHeight * 0.55);
    const scale = Math.min(maxW / bitmap.width, maxH / bitmap.height, 1);
    const dw = Math.max(1, Math.round(bitmap.width * scale));
    const dh = Math.max(1, Math.round(bitmap.height * scale));
    canvas.width = dw;
    canvas.height = dh;
    canvas.style.width = dw + "px";
    canvas.style.height = dh + "px";
    canvas._imgScale = scale;

    sctx.clearRect(0, 0, dw, dh);
    sctx.drawImage(bitmap, 0, 0, dw, dh);

    if (mode !== "region") return;

    const r = normalizeRegion(region, bitmap.width, bitmap.height);
    if (!r) return;
    const sx = r.x * scale;
    const sy = r.y * scale;
    const sw = r.w * scale;
    const sh = r.h * scale;

    sctx.fillStyle = "rgba(22, 18, 28, 0.35)";
    sctx.fillRect(0, 0, dw, dh);
    sctx.clearRect(sx, sy, sw, sh);
    sctx.drawImage(bitmap, r.x, r.y, r.w, r.h, sx, sy, sw, sh);
    sctx.strokeStyle = "#7c3aed";
    sctx.lineWidth = 2;
    sctx.setLineDash([6, 4]);
    sctx.strokeRect(sx + 1, sy + 1, sw - 2, sh - 2);
    sctx.setLineDash([]);
  }

  function canvasToImagePoint(e) {
    const rect = els.selectCanvas.getBoundingClientRect();
    const scale = els.selectCanvas._imgScale || 1;
    const x = ((e.clientX - rect.left) / rect.width) * els.selectCanvas.width / scale;
    const y = ((e.clientY - rect.top) / rect.height) * els.selectCanvas.height / scale;
    return {
      x: Math.max(0, Math.min(bitmap.width, x)),
      y: Math.max(0, Math.min(bitmap.height, y))
    };
  }

  async function loadFile(f) {
    if (!f || !f.type.startsWith("image/")) {
      setStatus("Chọn file ảnh hợp lệ (JPG, PNG, WebP…).", "err");
      return;
    }
    if (f.size > MAX_BYTES) {
      setStatus("Ảnh tối đa 20 MB.", "err");
      return;
    }

    if (bitmap && bitmap.close) try { bitmap.close(); } catch (_) {}
    bitmap = null;
    revokeSource();
    clearResultPreview();
    region = null;

    file = f;
    sourceUrl = URL.createObjectURL(f);
    try {
      if (window.createImageBitmap) {
        bitmap = await createImageBitmap(f);
      } else {
        bitmap = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Không đọc được ảnh"));
          img.src = sourceUrl;
        });
      }
    } catch (e) {
      setStatus("Không đọc được ảnh này.", "err");
      return;
    }

    els.shell.classList.add("has-file");
    els.fileName.textContent = f.name;
    els.fileMeta.textContent = fmtSize(f.size);
    els.origDim.textContent = bitmap.width + " × " + bitmap.height;
    format = defaultFormat(f.name);
    document.querySelectorAll(".ib-fmt").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.format === format);
    });
    updateModeUI();
    drawSelectOverlay();
    setStatus(mode === "full" ? "Chỉnh độ mờ rồi bấm Làm mờ (hoặc kéo thanh trượt)." : "Kéo chọn vùng trên ảnh gốc.", "");
    if (mode === "full") schedulePreview();
  }

  function updateModeUI() {
    document.querySelectorAll(".ib-mode").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.mode === mode);
    });
    const isRegion = mode === "region";
    els.regionHint.hidden = !isRegion;
    els.clearRegionBtn.hidden = !isRegion;
    els.softEdge.closest("label").hidden = !isRegion;
    els.selectCanvas.style.cursor = isRegion ? "crosshair" : "default";
    drawSelectOverlay();
  }

  function resetToDrop() {
    file = null;
    if (bitmap && bitmap.close) try { bitmap.close(); } catch (_) {}
    bitmap = null;
    region = null;
    revokeSource();
    clearResultPreview();
    els.shell.classList.remove("has-file");
    els.input.value = "";
    setStatus("Upload ảnh để bắt đầu làm mờ", "");
  }

  // ——— Events ———
  els.browseBtn.addEventListener("click", () => els.input.click());
  els.changeBtn.addEventListener("click", () => els.input.click());
  els.input.addEventListener("change", () => {
    const f = els.input.files && els.input.files[0];
    if (f) loadFile(f);
  });

  ["dragenter", "dragover"].forEach((ev) => {
    els.zone.addEventListener(ev, (e) => {
      e.preventDefault();
      els.zone.classList.add("is-drag");
    });
  });
  ["dragleave", "drop"].forEach((ev) => {
    els.zone.addEventListener(ev, (e) => {
      e.preventDefault();
      els.zone.classList.remove("is-drag");
    });
  });
  els.zone.addEventListener("drop", (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) loadFile(f);
  });
  els.zone.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    els.input.click();
  });

  document.querySelectorAll(".ib-mode").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      updateModeUI();
      clearResultPreview();
      if (mode === "full") schedulePreview();
      else setStatus("Kéo chọn vùng trên ảnh gốc để làm mờ.", "");
    });
  });

  document.querySelectorAll(".ib-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.preset;
      const val = PRESETS[key];
      if (val == null) return;
      els.blurRange.value = String(val);
      els.blurVal.textContent = val + " px";
      document.querySelectorAll(".ib-preset").forEach((b) => b.classList.toggle("is-on", b === btn));
      schedulePreview();
    });
  });

  els.blurRange.addEventListener("input", () => {
    els.blurVal.textContent = els.blurRange.value + " px";
    document.querySelectorAll(".ib-preset").forEach((b) => b.classList.remove("is-on"));
    const v = Number(els.blurRange.value);
    Object.keys(PRESETS).forEach((k) => {
      if (PRESETS[k] === v) {
        document.querySelector('.ib-preset[data-preset="' + k + '"]')?.classList.add("is-on");
      }
    });
    schedulePreview();
  });

  els.softEdge.addEventListener("change", schedulePreview);

  document.querySelectorAll(".ib-fmt").forEach((btn) => {
    btn.addEventListener("click", () => {
      format = btn.dataset.format;
      document.querySelectorAll(".ib-fmt").forEach((b) => b.classList.toggle("is-on", b === btn));
      schedulePreview();
    });
  });

  els.clearRegionBtn.addEventListener("click", () => {
    region = null;
    drawSelectOverlay();
    clearResultPreview();
    setStatus("Đã xóa vùng — kéo chọn lại trên ảnh gốc.", "");
  });

  els.runBtn.addEventListener("click", () => run(true));

  els.downloadBtn.addEventListener("click", async () => {
    if (!bitmap) return;
    setStatus("Đang xuất bản độ phân giải gốc…");
    try {
      const blob = await renderBlur(true);
      showPreviewBlob(blob);
      const base = (file && file.name ? file.name.replace(/\.[^.]+$/, "") : "anh") + "-blur";
      const a = document.createElement("a");
      a.href = lastUrl;
      a.download = base + "." + extFor(format);
      a.click();
      setStatus("Đã tải " + a.download + " · " + fmtSize(blob.size), "ok");
    } catch (e) {
      setStatus(e.message || "Không tải được", "err");
    }
  });

  els.copyBtn.addEventListener("click", async () => {
    if (!lastBlob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ [lastBlob.type]: lastBlob })
        ]);
        setStatus("Đã sao chép ảnh vào clipboard.", "ok");
      } else {
        setStatus("Trình duyệt không hỗ trợ copy ảnh — hãy tải về.", "err");
      }
    } catch (e) {
      setStatus("Không sao chép được ảnh.", "err");
    }
  });

  function onPointerDown(e) {
    if (mode !== "region" || !bitmap) return;
    e.preventDefault();
    const p = canvasToImagePoint(e);
    drag = { x0: p.x, y0: p.y };
    region = { x: p.x, y: p.y, w: 0, h: 0 };
    els.selectCanvas.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag || mode !== "region") return;
    const p = canvasToImagePoint(e);
    region = {
      x: drag.x0,
      y: drag.y0,
      w: p.x - drag.x0,
      h: p.y - drag.y0
    };
    drawSelectOverlay();
  }

  function onPointerUp(e) {
    if (!drag) return;
    drag = null;
    region = normalizeRegion(region, bitmap.width, bitmap.height);
    drawSelectOverlay();
    if (region) schedulePreview();
    else setStatus("Vùng quá nhỏ — kéo chọn lại.", "err");
  }

  els.selectCanvas.addEventListener("pointerdown", onPointerDown);
  els.selectCanvas.addEventListener("pointermove", onPointerMove);
  els.selectCanvas.addEventListener("pointerup", onPointerUp);
  els.selectCanvas.addEventListener("pointercancel", onPointerUp);

  window.addEventListener("resize", () => {
    if (bitmap) drawSelectOverlay();
  });

  // Init preset highlight
  document.querySelector('.ib-preset[data-preset="medium"]')?.classList.add("is-on");
  els.blurVal.textContent = els.blurRange.value + " px";
  updateModeUI();
})();
