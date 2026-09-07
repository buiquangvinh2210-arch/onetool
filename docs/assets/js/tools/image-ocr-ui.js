/**
 * OCR ảnh → text UI.
 */
(function () {
  const MAX_BYTES = 20 * 1024 * 1024;

  const els = {
    shell: document.getElementById("shell"),
    zone: document.getElementById("uploadZone"),
    input: document.getElementById("fileInput"),
    changeBtn: document.getElementById("changeBtn"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    regionHint: document.getElementById("regionHint"),
    runBtn: document.getElementById("runBtn"),
    progressWrap: document.getElementById("progressWrap"),
    progressBar: document.getElementById("progressBar"),
    progressMsg: document.getElementById("progressMsg"),
    status: document.getElementById("status"),
    imgDim: document.getElementById("imgDim"),
    canvas: document.getElementById("viewCanvas"),
    outText: document.getElementById("outText"),
    resultMeta: document.getElementById("resultMeta"),
    copyBtn: document.getElementById("copyBtn"),
    downloadBtn: document.getElementById("downloadBtn")
  };

  const ctx = els.canvas.getContext("2d");

  let file = null;
  let bitmap = null;
  let words = [];
  let lang = "vie+eng";
  let scope = "full";
  let region = null;
  let drag = null;
  let busy = false;
  let view = { scale: 1 };
  let ocrReady = true;

  function fmtSize(n) {
    if (typeof OT !== "undefined" && OT.formatBytes) return OT.formatBytes(n);
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function imgSize() {
    if (!bitmap) return { w: 0, h: 0 };
    return { w: bitmap.width || bitmap.naturalWidth, h: bitmap.height || bitmap.naturalHeight };
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.classList.toggle("is-ok", kind === "ok");
    els.status.classList.toggle("is-err", kind === "err");
  }

  function setProgress(pct, message) {
    els.progressWrap.hidden = false;
    els.progressBar.style.width = Math.max(0, Math.min(100, pct)) + "%";
    els.progressMsg.textContent = message || "";
  }

  function hideProgress() {
    els.progressWrap.hidden = true;
  }

  function setExport(on) {
    els.copyBtn.disabled = !on;
    els.downloadBtn.disabled = !on;
  }

  function closeBitmap(b) {
    if (b && typeof b.close === "function") {
      try { b.close(); } catch (_) {}
    }
  }

  async function loadBitmap(src) {
    if (typeof createImageBitmap === "function") {
      try {
        if (src instanceof Blob) {
          return await createImageBitmap(src, { imageOrientation: "from-image" });
        }
        return await createImageBitmap(src);
      } catch (_) {
        try { return await createImageBitmap(src); } catch (__) {}
      }
    }
    if (src instanceof HTMLCanvasElement) return src;
    if (src instanceof Blob) return OT.loadImage(src);
    return src;
  }

  function looksLikeImage(f) {
    if ((f.type || "").startsWith("image/")) return true;
    return /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name || "");
  }

  function clampRegion(r, iw, ih) {
    if (!r) return null;
    let x = Math.min(r.x, r.x + r.w);
    let y = Math.min(r.y, r.y + r.h);
    let w = Math.abs(r.w);
    let h = Math.abs(r.h);
    x = Math.max(0, x);
    y = Math.max(0, y);
    w = Math.min(iw - x, w);
    h = Math.min(ih - y, h);
    if (w < 8 || h < 8) return null;
    return { x, y, w, h };
  }

  function drawView() {
    if (!bitmap) return;
    const { w: iw, h: ih } = imgSize();
    const wrap = els.canvas.parentElement;
    const maxW = wrap.clientWidth || 480;
    const maxH = Math.min(460, window.innerHeight * 0.52);
    const scale = Math.min(maxW / iw, maxH / ih, 1);
    const dw = Math.max(1, Math.round(iw * scale));
    const dh = Math.max(1, Math.round(ih * scale));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    els.canvas.width = Math.round(dw * dpr);
    els.canvas.height = Math.round(dh * dpr);
    els.canvas.style.width = dw + "px";
    els.canvas.style.height = dh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    view = { scale, dw, dh };
    ctx.clearRect(0, 0, dw, dh);
    ctx.drawImage(bitmap, 0, 0, dw, dh);

    const r = scope === "region" ? clampRegion(region, iw, ih) : null;
    if (r) {
      ctx.fillStyle = "rgba(22, 18, 28, 0.38)";
      ctx.fillRect(0, 0, dw, dh);
      ctx.clearRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale);
      ctx.drawImage(bitmap, r.x, r.y, r.w, r.h, r.x * scale, r.y * scale, r.w * scale, r.h * scale);
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x * scale + 1, r.y * scale + 1, r.w * scale - 2, r.h * scale - 2);
    }

    words.forEach((w) => {
      const x = w.x0 * scale;
      const y = w.y0 * scale;
      const bw = (w.x1 - w.x0) * scale;
      const bh = (w.y1 - w.y0) * scale;
      ctx.strokeStyle = w.conf >= 70 ? "rgba(16, 185, 129, 0.85)" : "rgba(245, 158, 11, 0.9)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, bw, bh);
    });
  }

  function canvasPoint(e) {
    const rect = els.canvas.getBoundingClientRect();
    const { w: iw, h: ih } = imgSize();
    const x = ((e.clientX - rect.left) / rect.width) * iw;
    const y = ((e.clientY - rect.top) / rect.height) * ih;
    return {
      x: Math.max(0, Math.min(iw, x)),
      y: Math.max(0, Math.min(ih, y))
    };
  }

  function bakeRotate(dir) {
    const { w, h } = imgSize();
    const c = document.createElement("canvas");
    c.width = h;
    c.height = w;
    const cctx = c.getContext("2d");
    cctx.imageSmoothingEnabled = false;
    if (dir === "cw") {
      cctx.translate(h, 0);
      cctx.rotate(Math.PI / 2);
    } else {
      cctx.translate(0, w);
      cctx.rotate(-Math.PI / 2);
    }
    cctx.drawImage(bitmap, 0, 0);
    return c;
  }

  async function transform(dir) {
    if (!bitmap || busy) return;
    const baked = bakeRotate(dir);
    closeBitmap(bitmap);
    bitmap = await loadBitmap(baked);
    region = null;
    words = [];
    const { w, h } = imgSize();
    els.imgDim.textContent = w + " × " + h;
    els.fileMeta.textContent = w + " × " + h + (file ? " · " + fmtSize(file.size) : "");
    drawView();
    setStatus("Đã xoay ảnh — bấm Nhận dạng chữ.", "");
  }

  function countStats(text) {
    const t = String(text || "").trim();
    if (!t) return "Chưa có chữ";
    const chars = t.replace(/\s/g, "").length;
    const wordsN = t.split(/\s+/).filter(Boolean).length;
    const lines = t.split(/\n/).filter((l) => l.trim()).length;
    return wordsN + " từ · " + chars + " ký tự · " + lines + " dòng";
  }

  async function runOcr() {
    if (!bitmap || busy) return;
    const { w, h } = imgSize();
    let rect = null;
    if (scope === "region") {
      rect = clampRegion(region, w, h);
      if (!rect) {
        setStatus("Kéo chọn vùng trên ảnh trước.", "err");
        return;
      }
    }
    if (!window.OTImageOcr || typeof OTImageOcr.recognize !== "function") {
      setStatus("Thiếu script OCR. Ctrl+F5 để tải lại trang.", "err");
      return;
    }
    busy = true;
    els.runBtn.disabled = true;
    setExport(false);
    words = [];
    setStatus("Đang OCR…");
    setProgress(2, "Bắt đầu…");
    try {
      const res = await OTImageOcr.recognize(bitmap, {
        lang,
        rectangle: rect,
        onProgress: (info) => setProgress(info.pct, info.message)
      });
      words = res.words || [];
      els.outText.value = res.text;
      setExport(true);
      els.resultMeta.textContent = countStats(res.text);
      setStatus("Đã nhận dạng " + (res.text.split(/\s+/).filter(Boolean).length) + " từ", "ok");
      drawView();
    } catch (e) {
      setStatus(e.message || "OCR thất bại.", "err");
      els.resultMeta.textContent = "—";
    } finally {
      busy = false;
      els.runBtn.disabled = false;
      hideProgress();
    }
  }

  async function loadFile(f) {
    if (!f || !looksLikeImage(f)) {
      setStatus("Chọn file ảnh hợp lệ.", "err");
      return;
    }
    if (f.size > MAX_BYTES) {
      setStatus("Ảnh tối đa 20 MB.", "err");
      return;
    }
    closeBitmap(bitmap);
    bitmap = null;
    words = [];
    region = null;
    file = f;
    els.outText.value = "";
    setExport(false);
    els.resultMeta.textContent = "—";
    try {
      bitmap = await loadBitmap(f);
      const { w, h } = imgSize();
      if (!w || !h) throw new Error("Không đọc được ảnh.");
      els.fileName.textContent = f.name;
      els.fileMeta.textContent = w + " × " + h + " · " + fmtSize(f.size);
      els.imgDim.textContent = w + " × " + h;
      els.shell.classList.add("has-file");
      els.zone.classList.add("has-file");
      requestAnimationFrame(() => {
        drawView();
        requestAnimationFrame(drawView);
      });
      setStatus(
        ocrReady
          ? "Bấm Nhận dạng chữ — AI đọc tiếng Việt và tiếng Anh."
          : "AI OCR chưa bật trên server. Deploy lại Worker rồi Ctrl+F5.",
        ocrReady ? "" : "err"
      );
    } catch (e) {
      setStatus(e.message || "Không đọc được ảnh.", "err");
    }
  }

  document.querySelectorAll(".io-lang").forEach((btn) => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      document.querySelectorAll(".io-lang").forEach((b) => b.classList.toggle("is-on", b === btn));
    });
  });

  document.querySelectorAll(".io-scope").forEach((btn) => {
    btn.addEventListener("click", () => {
      scope = btn.dataset.scope;
      document.querySelectorAll(".io-scope").forEach((b) => b.classList.toggle("is-on", b === btn));
      els.regionHint.hidden = scope !== "region";
      els.canvas.style.cursor = scope === "region" ? "crosshair" : "default";
      if (scope !== "region") region = null;
      drawView();
    });
  });

  els.canvas.addEventListener("pointerdown", (e) => {
    if (scope !== "region" || !bitmap) return;
    e.preventDefault();
    els.canvas.setPointerCapture?.(e.pointerId);
    const p = canvasPoint(e);
    drag = { x: p.x, y: p.y };
    region = { x: p.x, y: p.y, w: 1, h: 1 };
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = canvasPoint(e);
    region = { x: drag.x, y: drag.y, w: p.x - drag.x, h: p.y - drag.y };
    drawView();
  });

  window.addEventListener("pointerup", () => {
    if (!drag) return;
    drag = null;
    const { w, h } = imgSize();
    region = clampRegion(region, w, h);
    drawView();
  });

  els.runBtn.addEventListener("click", runOcr);
  document.getElementById("rotLBtn")?.addEventListener("click", () => transform("ccw"));
  document.getElementById("rotRBtn")?.addEventListener("click", () => transform("cw"));

  els.copyBtn.addEventListener("click", async () => {
    const t = els.outText.value;
    if (!t.trim()) return;
    try {
      if (OT.copyText) await OT.copyText(t);
      else await navigator.clipboard.writeText(t);
      setStatus("Đã sao chép văn bản.", "ok");
    } catch (_) {
      setStatus("Không sao chép được.", "err");
    }
  });

  els.downloadBtn.addEventListener("click", () => {
    const t = els.outText.value;
    if (!t.trim()) return;
    const base = (file && file.name ? file.name.replace(/\.[^.]+$/, "") : "ocr") + "-ocr";
    if (OT.downloadText) OT.downloadText(t, base + ".txt", "text/plain;charset=utf-8");
    else {
      const blob = new Blob([t], { type: "text/plain;charset=utf-8" });
      OT.downloadBlob(blob, base + ".txt");
    }
    setStatus("Đã tải " + base + ".txt", "ok");
  });

  els.outText.addEventListener("input", () => {
    els.resultMeta.textContent = countStats(els.outText.value);
    setExport(!!els.outText.value.trim());
  });

  window.addEventListener("paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const f = item.getAsFile();
    if (f) loadFile(f);
  });

  window.addEventListener("resize", () => drawView());

  OT.bindUploadZone({
    onFiles: (files) => {
      const f = files?.[0];
      if (f) loadFile(f);
    }
  });

  els.changeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    els.input?.click();
  });

  if (typeof OTImageOcr !== "undefined" && OTImageOcr.probeHealth) {
    OTImageOcr.probeHealth().then((h) => {
      ocrReady = !!(h && h.ready);
      if (ocrReady) return;
      setStatus("AI OCR chưa bật trên server. Deploy lại Worker (dán groq-whisper-proxy.js) — health phải có \"ocr\".", "err");
    });
  }
})();
