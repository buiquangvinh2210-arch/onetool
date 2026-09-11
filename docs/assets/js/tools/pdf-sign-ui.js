/**
 * Ký PDF — 3 bước: tạo chữ ký → đặt lên trang → tải.
 */
(function () {
  "use strict";

  const INK_WIDTH = 2.4;
  const KIND_LABEL = {
    draw: "Chữ ký tay",
    type: "Chữ ký gõ",
    image: "Ảnh chữ ký",
    date: "Ngày ký",
    lib: "Đã lưu"
  };

  let file = null;
  let pdfDoc = null;
  let pageIndex = 0;
  let viewport = null;
  let renderTask = null;
  let stamps = [];
  let selectedId = null;
  let mode = "draw";
  let imagePack = null;
  let inkColor = "#1e3a8a";
  let padCtx = null;
  let padDrawing = false;
  let padDirty = false;
  let padLast = null;
  let padUndo = [];
  let drag = null;
  let signing = false;

  const els = {
    shell: document.getElementById("shell"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    status: document.getElementById("status"),
    pad: document.getElementById("padCanvas"),
    drawOpts: document.getElementById("drawOpts"),
    typeOpts: document.getElementById("typeOpts"),
    imageOpts: document.getElementById("imageOpts"),
    dateOpts: document.getElementById("dateOpts"),
    signName: document.getElementById("signName"),
    signFont: document.getElementById("signFont"),
    typePreview: document.getElementById("typePreview"),
    signColor: document.getElementById("signColor"),
    signDate: document.getElementById("signDate"),
    dateFmt: document.getElementById("dateFmt"),
    datePreview: document.getElementById("datePreview"),
    signImageInput: document.getElementById("signImageInput"),
    signImageName: document.getElementById("signImageName"),
    imagePreview: document.getElementById("imagePreview"),
    imagePreviewImg: document.getElementById("imagePreviewImg"),
    pageCanvas: document.getElementById("pageCanvas"),
    overlays: document.getElementById("overlays"),
    stage: document.getElementById("stage"),
    stageWrap: document.getElementById("stageWrap"),
    pageLabel: document.getElementById("pageLabel"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    libBlock: document.getElementById("libBlock"),
    libGrid: document.getElementById("libGrid"),
    selOpts: document.getElementById("selOpts"),
    downloadBtn: document.getElementById("downloadBtn"),
    thumbs: document.getElementById("thumbs")
  };

  function uid() {
    return "s" + Math.random().toString(36).slice(2, 9);
  }

  function setStatus(msg, kind) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.classList.toggle("is-ok", kind === "ok");
    els.status.classList.toggle("is-err", kind === "err");
  }

  function selected() {
    return stamps.find((s) => s.id === selectedId) || null;
  }

  function todayInputValue() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function updateTypePreview() {
    if (!els.typePreview) return;
    const name = (els.signName?.value || "").trim() || "Nguyễn Văn An";
    els.typePreview.textContent = name;
    els.typePreview.style.fontFamily = els.signFont?.value || "Pacifico, cursive";
    els.typePreview.style.color = els.signColor?.value || "#1e3a8a";
  }

  function updateDatePreview() {
    if (!els.datePreview || !window.OTPdfSign) return;
    try {
      const raw = els.signDate?.value || todayInputValue();
      els.datePreview.textContent = OTPdfSign.formatDateVi(raw, els.dateFmt?.value || "dmy");
    } catch (_) {
      els.datePreview.textContent = "—";
    }
  }

  function setMode(next) {
    mode = next || "draw";
    document.querySelectorAll("#modeGrid .ps-tab").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.mode === mode);
    });
    const map = {
      draw: els.drawOpts,
      type: els.typeOpts,
      image: els.imageOpts,
      date: els.dateOpts
    };
    Object.keys(map).forEach((k) => {
      if (map[k]) map[k].hidden = k !== mode;
    });
    if (mode === "draw") setupPad();
    if (mode === "type") updateTypePreview();
    if (mode === "date") updateDatePreview();
  }

  function setupPad() {
    const canvas = els.pad;
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const cssW = Math.max(220, wrap?.clientWidth || 280);
    const cssH = 128;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    padCtx = canvas.getContext("2d");
    padCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    padCtx.lineCap = "round";
    padCtx.lineJoin = "round";
    padCtx.clearRect(0, 0, cssW, cssH);
    padDirty = false;
    padUndo = [];
    wrap?.classList.remove("is-inked");
  }

  function snapshotPad() {
    if (!els.pad || !padCtx) return;
    try {
      padUndo.push(padCtx.getImageData(0, 0, els.pad.width, els.pad.height));
      if (padUndo.length > 24) padUndo.shift();
    } catch (_) {}
  }

  function padPoint(e) {
    const r = els.pad.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }

  function drawPadTo(pt) {
    if (!padCtx || !padLast) return;
    padCtx.strokeStyle = inkColor;
    padCtx.lineWidth = INK_WIDTH;
    padCtx.lineCap = "round";
    padCtx.lineJoin = "round";
    // Nối thẳng tới điểm mới (curve cũ chỉ vẽ nửa đoạn → nét đứt khi ký nhanh)
    padCtx.beginPath();
    padCtx.moveTo(padLast.x, padLast.y);
    padCtx.lineTo(pt.x, pt.y);
    padCtx.stroke();
    padLast = pt;
    padDirty = true;
    els.pad?.parentElement?.classList.add("is-inked");
  }

  async function packFromPad() {
    if (!padDirty || !els.pad) throw new Error("Hãy vẽ chữ ký trong khung trước.");
    const trimmed = OTPdfSign.trimCanvas(els.pad, 8);
    if (trimmed.width < 12 || trimmed.height < 8) {
      throw new Error("Chữ ký quá nhỏ — ký đậm hơn một chút.");
    }
    return {
      dataUrl: await OTPdfSign.canvasPngDataUrl(trimmed),
      width: trimmed.width,
      height: trimmed.height,
      kind: "draw",
      label: KIND_LABEL.draw
    };
  }

  async function packFromMode() {
    const color = els.signColor?.value || "#1e3a8a";
    if (mode === "draw") return packFromPad();
    if (mode === "type") {
      const text = (els.signName?.value || "").trim();
      if (!text) throw new Error("Nhập họ và tên để tạo chữ ký.");
      const png = await OTPdfSign.renderTextPng({
        text,
        fontFamily: els.signFont?.value || "Pacifico, cursive",
        color,
        fontSize: 96,
        fontWeight: "700"
      });
      return { ...png, kind: "type", label: text };
    }
    if (mode === "image") {
      if (!imagePack) throw new Error("Chọn ảnh chữ ký trước.");
      return { ...imagePack, kind: "image", label: KIND_LABEL.image };
    }
    if (mode === "date") {
      const raw = els.signDate?.value || todayInputValue();
      const text = OTPdfSign.formatDateVi(raw, els.dateFmt?.value || "dmy");
      const png = await OTPdfSign.renderDatePng({ text, color: "#111827" });
      return { ...png, kind: "date", label: text };
    }
    throw new Error("Chọn cách tạo chữ ký.");
  }

  function defaultCssBox(pack) {
    const ratio = (pack.height || 1) / (pack.width || 1);
    const frac = pack.kind === "date" ? 0.24 : 0.32;
    const w = Math.max(48, viewport.width * frac);
    const h = Math.max(18, w * ratio);
    const m = viewport.width * 0.06;
    return {
      left: Math.max(8, viewport.width - m - w),
      top: Math.max(8, viewport.height - m - h),
      w,
      h
    };
  }

  function refreshChrome() {
    els.stage?.classList.toggle("has-stamps", stamps.some((s) => s.pageIndex === pageIndex));
    if (els.selOpts) els.selOpts.hidden = !selected();
    if (els.downloadBtn) {
      els.downloadBtn.disabled = signing;
    }
  }

  function addStamp(pack, pageIdx, cssBox) {
    if (stamps.length >= OTPdfSign.MAX_STAMPS) {
      throw new Error("Tối đa " + OTPdfSign.MAX_STAMPS + " chữ ký trên một file.");
    }
    const box = cssBox || defaultCssBox(pack);
    const pdf = OTPdfSign.cssBoxToPdf(box.left, box.top, box.w, box.h, viewport);
    const stamp = {
      id: uid(),
      pageIndex: pageIdx == null ? pageIndex : pageIdx,
      dataUrl: pack.dataUrl,
      kind: pack.kind,
      label: pack.label || KIND_LABEL[pack.kind] || "Chữ ký",
      rotate: 0,
      opacity: 1,
      ...pdf
    };
    stamps.push(stamp);
    selectedId = stamp.id;
    refreshChrome();
    renderOverlays();
    return stamp;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function renderOverlays() {
    if (!els.overlays || !viewport) return;
    els.overlays.innerHTML = "";
    stamps
      .filter((s) => s.pageIndex === pageIndex)
      .forEach((s) => {
        const css = OTPdfSign.pdfBoxToCss(s, viewport);
        const el = document.createElement("div");
        el.className = "ps-stamp" + (s.id === selectedId ? " is-on" : "");
        el.dataset.id = s.id;
        el.style.left = css.left + "px";
        el.style.top = css.top + "px";
        el.style.width = css.w + "px";
        el.style.height = css.h + "px";
        const img = document.createElement("img");
        img.src = s.dataUrl;
        img.alt = s.label;
        el.appendChild(img);
        if (s.id === selectedId) {
          ["nw", "ne", "sw", "se"].forEach((h) => {
            const hd = document.createElement("div");
            hd.className = "ps-handle ps-handle-" + h;
            hd.dataset.handle = h;
            el.appendChild(hd);
          });
        }
        els.overlays.appendChild(el);
      });
    els.stage?.classList.toggle("has-stamps", stamps.some((s) => s.pageIndex === pageIndex));
  }

  async function renderPage() {
    if (!pdfDoc || !els.pageCanvas) return;
    if (renderTask) {
      try {
        await renderTask.cancel();
      } catch (_) {}
      renderTask = null;
    }
    const page = await pdfDoc.getPage(pageIndex + 1);
    const wrap = els.stageWrap;
    const pad = 28;
    const availW = Math.max(240, (wrap?.clientWidth || 640) - pad);
    const availH = Math.max(280, (wrap?.clientHeight || 480) - pad);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(availW / base.width, availH / base.height, 2.15);
    viewport = page.getViewport({ scale });
    const canvas = els.pageCanvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;
    renderTask = page.render({ canvasContext: ctx, viewport, transform });
    try {
      await renderTask.promise;
    } catch (err) {
      if (err?.name !== "RenderingCancelledException") throw err;
    }
    renderTask = null;
    if (els.pageLabel) els.pageLabel.textContent = pageIndex + 1 + " / " + pdfDoc.numPages;
    if (els.prevBtn) els.prevBtn.disabled = pageIndex <= 0;
    if (els.nextBtn) els.nextBtn.disabled = pageIndex >= pdfDoc.numPages - 1;
    renderOverlays();
    markThumb();
    refreshChrome();
  }

  function markThumb() {
    els.thumbs?.querySelectorAll(".ps-thumb").forEach((btn, i) => {
      btn.classList.toggle("is-on", i === pageIndex);
    });
  }

  async function buildThumbs() {
    if (!pdfDoc || !els.thumbs) return;
    const n = pdfDoc.numPages;
    if (n <= 1) {
      els.thumbs.hidden = true;
      els.thumbs.innerHTML = "";
      return;
    }
    els.thumbs.hidden = false;
    els.thumbs.innerHTML = "";
    const max = Math.min(n, 24);
    for (let i = 0; i < max; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ps-thumb" + (i === pageIndex ? " is-on" : "");
      btn.dataset.page = String(i);
      btn.title = "Trang " + (i + 1);
      els.thumbs.appendChild(btn);
      try {
        const page = await pdfDoc.getPage(i + 1);
        const vp = page.getViewport({ scale: 0.18 });
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.floor(vp.width));
        c.height = Math.max(1, Math.floor(vp.height));
        await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
        btn.appendChild(c);
      } catch (_) {
        btn.textContent = String(i + 1);
      }
    }
  }

  async function openPdf(f) {
    if (f.size > OTPdfSign.MAX_BYTES) throw new Error("PDF tối đa 40MB.");
    if (pdfDoc) {
      try {
        await pdfDoc.destroy();
      } catch (_) {}
    }
    pdfDoc = await OTPdf.openPdfDoc(f);
    file = f;
    pageIndex = 0;
    stamps = [];
    selectedId = null;
    els.shell?.classList.add("has-file");
    if (els.fileName) els.fileName.textContent = f.name;
    if (els.fileMeta) els.fileMeta.textContent = OT.formatBytes(f.size) + " · " + pdfDoc.numPages + " trang";
    setStatus("Tạo chữ ký bên trái, rồi bấm Đặt chữ ký lên PDF.", "ok");
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await renderPage();
    buildThumbs();
    refreshChrome();
    setupPad();
  }

  function resetPdf() {
    file = null;
    stamps = [];
    selectedId = null;
    viewport = null;
    if (pdfDoc) {
      pdfDoc.destroy?.();
      pdfDoc = null;
    }
    els.shell?.classList.remove("has-file");
    setStatus("Chọn PDF để bắt đầu");
    refreshChrome();
  }

  function overlayCss(el) {
    return {
      left: parseFloat(el.style.left) || 0,
      top: parseFloat(el.style.top) || 0,
      w: parseFloat(el.style.width) || 40,
      h: parseFloat(el.style.height) || 20
    };
  }

  function commitOverlay(el) {
    const s = stamps.find((x) => x.id === el.dataset.id);
    if (!s || !viewport) return;
    const css = overlayCss(el);
    Object.assign(s, OTPdfSign.cssBoxToPdf(css.left, css.top, css.w, css.h, viewport));
  }

  function renderLib() {
    const items = OTPdfSign.readLib();
    if (els.libBlock) els.libBlock.hidden = items.length === 0;
    if (!els.libGrid) return;
    els.libGrid.innerHTML = items
      .map(
        (it) =>
          `<button type="button" class="ps-lib-item" data-id="${it.id}" title="${escapeHtml(it.label || "Chữ ký")}">
            <img src="${it.dataUrl}" alt="" />
            <span class="ps-lib-x" data-del="${it.id}" aria-label="Xóa">×</span>
          </button>`
      )
      .join("");
  }

  function rememberPack(pack) {
    if (!pack || pack.kind === "date") return;
    const items = OTPdfSign.readLib().filter((it) => it.dataUrl !== pack.dataUrl);
    items.unshift({ id: uid(), dataUrl: pack.dataUrl, label: pack.label, kind: pack.kind });
    OTPdfSign.writeLib(items);
    renderLib();
  }

  async function stampToDraw(stamp) {
    const page = await pdfDoc.getPage(stamp.pageIndex + 1);
    const vp = page.getViewport({ scale: 1 });
    const css = OTPdfSign.pdfBoxToCss(stamp, vp);
    const rot = Number(stamp.rotate) || 0;
    if (!rot) {
      return {
        pageIndex: stamp.pageIndex,
        dataUrl: stamp.dataUrl,
        x: stamp.x,
        y: stamp.y,
        width: stamp.width,
        height: stamp.height,
        rotate: 0,
        opacity: stamp.opacity
      };
    }
    const aabb = OTPdfSign.rotatedAabb(css.left, css.top, css.w, css.h, rot);
    const baked = await OTPdfSign.bakeRotatedPng(stamp.dataUrl, css.w, css.h, rot);
    const pdf = OTPdfSign.cssBoxToPdf(aabb.x, aabb.y, aabb.w, aabb.h, vp);
    return {
      pageIndex: stamp.pageIndex,
      dataUrl: baked.dataUrl,
      x: pdf.x,
      y: pdf.y,
      width: pdf.width,
      height: pdf.height,
      rotate: 0,
      opacity: stamp.opacity
    };
  }

  async function signAndDownload() {
    if (signing) return;
    if (!file) {
      setStatus("Chọn PDF trước.", "err");
      return;
    }
    if (!stamps.length) {
      setStatus("Hãy đặt chữ ký lên trang trước (bấm Đặt chữ ký lên PDF).", "err");
      showToast?.("Đặt chữ ký lên trang trước khi tải.", "error");
      return;
    }
    const btn = els.downloadBtn;
    signing = true;
    try {
      OT.setBusy(btn, true, "Đang ký…");
      setStatus("Đang gắn chữ ký vào PDF…");
      const draws = [];
      for (const s of stamps) draws.push(await stampToDraw(s));
      const result = await OTPdfSign.apply(file, draws);
      const outName = OT.nameWithSuffix(file.name, "-signed", ".pdf");
      OT.setLastResult?.({
        blob: result.blob,
        fileName: outName,
        contentType: "application/pdf"
      });
      setStatus("Đã ký " + result.signed + " chữ ký · " + OT.formatBytes(result.blob.size), "ok");
      showToast?.("Đã tải PDF đã ký.", "success");
      await OT.downloadBlob(result.blob, outName);
    } catch (err) {
      setStatus(err.message || String(err), "err");
      showToast?.(err.message || "Không ký được PDF.", "error");
    } finally {
      signing = false;
      OT.setBusy(btn, false);
      refreshChrome();
    }
  }

  OT.bindUploadZone({
    onFiles: async (files) => {
      const f = files?.[0];
      if (!f) return;
      const ok = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
      if (!ok) {
        showToast?.("Chọn file PDF.", "error");
        return;
      }
      try {
        setStatus("Đang mở PDF…");
        await openPdf(f);
      } catch (err) {
        setStatus(err.message || String(err), "err");
        showToast?.(err.message || "Không mở được PDF.", "error");
      }
    }
  });

  document.getElementById("changeBtn")?.addEventListener("click", () => {
    resetPdf();
    document.getElementById("fileInput")?.click();
  });

  document.getElementById("modeGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ps-tab");
    if (!btn) return;
    setMode(btn.dataset.mode);
  });

  document.getElementById("inkSwatches")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ps-swatch");
    if (!btn) return;
    inkColor = btn.dataset.color || "#1e3a8a";
    document.querySelectorAll("#inkSwatches .ps-swatch").forEach((b) => {
      b.classList.toggle("is-on", b === btn);
    });
  });

  els.pad?.addEventListener("pointerdown", (e) => {
    if (mode !== "draw") return;
    e.preventDefault();
    snapshotPad();
    padDrawing = true;
    padLast = padPoint(e);
    els.pad.setPointerCapture?.(e.pointerId);
    if (padCtx) {
      padCtx.fillStyle = inkColor;
      padCtx.beginPath();
      padCtx.arc(padLast.x, padLast.y, INK_WIDTH / 2, 0, Math.PI * 2);
      padCtx.fill();
      padDirty = true;
      els.pad.parentElement?.classList.add("is-inked");
    }
  });
  els.pad?.addEventListener("pointermove", (e) => {
    if (!padDrawing) return;
    e.preventDefault();
    const coalesced = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
    const events = coalesced.length ? coalesced : [e];
    for (const ev of events) drawPadTo(padPoint(ev));
  });
  function endPad(e) {
    if (!padDrawing) return;
    padDrawing = false;
    padLast = null;
    try {
      els.pad.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
  }
  els.pad?.addEventListener("pointerup", endPad);
  els.pad?.addEventListener("pointercancel", endPad);

  document.getElementById("clearPadBtn")?.addEventListener("click", () => setupPad());
  document.getElementById("undoPadBtn")?.addEventListener("click", () => {
    if (!padUndo.length || !padCtx) return;
    padCtx.putImageData(padUndo.pop(), 0, 0);
  });

  ["signName", "signFont", "signColor"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", updateTypePreview);
  });
  els.dateFmt?.addEventListener("change", updateDatePreview);
  els.signDate?.addEventListener("input", updateDatePreview);

  document.getElementById("signImageBtn")?.addEventListener("click", () => {
    els.signImageInput?.click();
  });
  els.signImageInput?.addEventListener("change", async () => {
    const f = els.signImageInput.files?.[0];
    if (!f) return;
    try {
      imagePack = await OTPdfSign.processUploadFile(f);
      if (els.signImageName) els.signImageName.textContent = f.name;
      if (els.imagePreview) els.imagePreview.hidden = false;
      if (els.imagePreviewImg) els.imagePreviewImg.src = imagePack.dataUrl;
    } catch (err) {
      showToast?.(err.message || "Không đọc được ảnh.", "error");
    }
  });

  document.getElementById("placeBtn")?.addEventListener("click", async () => {
    try {
      if (!file || !viewport) throw new Error("Chọn PDF trước.");
      const pack = await packFromMode();
      addStamp(pack, pageIndex);
      rememberPack(pack);
      setStatus("Kéo chữ ký đúng chỗ, rồi bấm Tải PDF đã ký.", "ok");
    } catch (err) {
      setStatus(err.message || String(err), "err");
      showToast?.(err.message || "Không đặt được chữ ký.", "error");
    }
  });

  els.libGrid?.addEventListener("click", async (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      e.preventDefault();
      e.stopPropagation();
      OTPdfSign.writeLib(OTPdfSign.readLib().filter((it) => it.id !== del.getAttribute("data-del")));
      renderLib();
      return;
    }
    const btn = e.target.closest(".ps-lib-item");
    if (!btn || !file || !viewport) return;
    const item = OTPdfSign.readLib().find((it) => it.id === btn.dataset.id);
    if (!item) return;
    try {
      const img = await OTPdfSign.loadImage(item.dataUrl);
      addStamp(
        {
          dataUrl: item.dataUrl,
          kind: item.kind || "lib",
          label: item.label || KIND_LABEL.lib,
          width: img.naturalWidth || 240,
          height: img.naturalHeight || 90
        },
        pageIndex
      );
      setStatus("Đã đặt chữ ký đã lưu. Kéo để chỉnh, rồi tải PDF.", "ok");
    } catch (err) {
      showToast?.(err.message, "error");
    }
  });

  els.overlays?.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(".ps-handle");
    const el = e.target.closest(".ps-stamp");
    if (!el) return;
    e.preventDefault();
    selectedId = el.dataset.id;
    refreshChrome();
    renderOverlays();
    const node = els.overlays.querySelector('.ps-stamp[data-id="' + selectedId + '"]');
    if (!node) return;
    const css = overlayCss(node);
    drag = {
      el: node,
      handle: handle?.dataset.handle || null,
      startX: e.clientX,
      startY: e.clientY,
      left: css.left,
      top: css.top,
      w: css.w,
      h: css.h,
      ratio: css.w / css.h
    };
    node.classList.add("is-dragging");
    node.setPointerCapture?.(e.pointerId);
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
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
      if (hnd.includes("e")) w = Math.max(36, drag.w + dx);
      if (hnd.includes("s")) h = Math.max(16, drag.h + dy);
      if (hnd.includes("w")) {
        w = Math.max(36, drag.w - dx);
        left = drag.left + dx;
      }
      if (hnd.includes("n")) {
        h = Math.max(16, drag.h - dy);
        top = drag.top + dy;
      }
      h = w / drag.ratio;
      if (hnd.includes("n")) top = drag.top + drag.h - h;
      if (hnd.includes("w")) left = drag.left + drag.w - w;
    }
    if (viewport) {
      left = Math.min(Math.max(-w * 0.4, left), viewport.width - w * 0.6);
      top = Math.min(Math.max(-h * 0.4, top), viewport.height - h * 0.6);
    }
    drag.el.style.left = left + "px";
    drag.el.style.top = top + "px";
    drag.el.style.width = w + "px";
    drag.el.style.height = h + "px";
  });

  window.addEventListener("pointerup", (e) => {
    if (!drag) return;
    drag.el.classList.remove("is-dragging");
    try {
      drag.el.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
    commitOverlay(drag.el);
    drag = null;
  });

  document.getElementById("copyAllBtn")?.addEventListener("click", () => {
    const s = selected();
    if (!s || !pdfDoc) return;
    for (let i = 0; i < pdfDoc.numPages; i++) {
      if (i === s.pageIndex) continue;
      if (stamps.length >= OTPdfSign.MAX_STAMPS) break;
      stamps.push({ ...s, id: uid(), pageIndex: i });
    }
    refreshChrome();
    setStatus("Đã thêm chữ ký vào mọi trang.", "ok");
  });

  document.getElementById("delBtn")?.addEventListener("click", () => {
    const s = selected();
    if (!s) return;
    stamps = stamps.filter((x) => x.id !== s.id);
    selectedId = stamps[stamps.length - 1]?.id || null;
    refreshChrome();
    renderOverlays();
  });

  document.addEventListener("keydown", (e) => {
    if (!selectedId) return;
    const tag = (e.target && e.target.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      document.getElementById("delBtn")?.click();
    }
    if (e.key === "Escape") {
      selectedId = null;
      refreshChrome();
      renderOverlays();
    }
  });

  els.prevBtn?.addEventListener("click", () => {
    if (pageIndex <= 0) return;
    pageIndex -= 1;
    renderPage();
  });
  els.nextBtn?.addEventListener("click", () => {
    if (!pdfDoc || pageIndex >= pdfDoc.numPages - 1) return;
    pageIndex += 1;
    renderPage();
  });
  els.thumbs?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ps-thumb");
    if (!btn) return;
    pageIndex = Number(btn.dataset.page) || 0;
    renderPage();
  });

  window.addEventListener(
    "resize",
    () => {
      if (!pdfDoc) return;
      clearTimeout(window.__otPsResize);
      window.__otPsResize = setTimeout(() => {
        renderPage();
        if (mode === "draw") setupPad();
      }, 160);
    },
    { passive: true }
  );

  els.downloadBtn?.addEventListener("click", () => {
    signAndDownload();
  });

  if (els.signDate && !els.signDate.value) els.signDate.value = todayInputValue();
  setMode("draw");
  updateTypePreview();
  updateDatePreview();
  renderLib();
})();
