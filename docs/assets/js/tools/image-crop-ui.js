/**
 * Crop ảnh + preset MXH — client-side canvas crop.
 */
(function () {
  const MAX_BYTES = 20 * 1024 * 1024;
  const MIN_CROP = 16;
  const MAX_EDGE = 8000;
  const HANDLE = 9;
  const HIT = 14;

  const RATIOS = [
    { id: "free", label: "Tự do", ratio: null, box: { w: 18, h: 14 } },
    { id: "1:1", label: "1:1", ratio: 1, box: { w: 14, h: 14 } },
    { id: "4:5", label: "4:5", ratio: 4 / 5, box: { w: 11, h: 14 } },
    { id: "3:4", label: "3:4", ratio: 3 / 4, box: { w: 11, h: 15 } },
    { id: "9:16", label: "9:16", ratio: 9 / 16, box: { w: 9, h: 16 } },
    { id: "16:9", label: "16:9", ratio: 16 / 9, box: { w: 18, h: 10 } },
    { id: "4:3", label: "4:3", ratio: 4 / 3, box: { w: 16, h: 12 } },
    { id: "3:2", label: "3:2", ratio: 3 / 2, box: { w: 16, h: 11 } }
  ];

  const GROUPS = [
    { id: "all", label: "Tất cả" },
    { id: "ig", label: "Instagram" },
    { id: "tt", label: "TikTok" },
    { id: "yt", label: "YouTube" },
    { id: "fb", label: "Facebook" },
    { id: "shop", label: "Shopee" },
    { id: "id", label: "Ảnh thẻ" }
  ];

  const PRESETS = [
    { id: "ig-sq", group: "ig", name: "Instagram vuông", sub: "Feed", w: 1080, h: 1080 },
    { id: "ig-port", group: "ig", name: "Instagram dọc", sub: "4:5", w: 1080, h: 1350 },
    { id: "ig-land", group: "ig", name: "Instagram ngang", sub: "1.91:1", w: 1080, h: 566 },
    { id: "ig-story", group: "ig", name: "Story / Reels", sub: "9:16", w: 1080, h: 1920 },
    { id: "tt", group: "tt", name: "TikTok", sub: "9:16", w: 1080, h: 1920 },
    { id: "yt-thumb", group: "yt", name: "YouTube thumbnail", sub: "16:9", w: 1280, h: 720 },
    { id: "yt-short", group: "yt", name: "YouTube Shorts", sub: "9:16", w: 1080, h: 1920 },
    { id: "yt-banner", group: "yt", name: "YouTube banner", sub: "2560×1440", w: 2560, h: 1440 },
    { id: "fb-post", group: "fb", name: "Facebook bài viết", sub: "1.91:1", w: 1200, h: 630 },
    { id: "fb-cover", group: "fb", name: "Ảnh bìa Facebook", sub: "820×312", w: 820, h: 312 },
    { id: "fb-cover-hd", group: "fb", name: "Ảnh bìa FB HD", sub: "1640×624", w: 1640, h: 624 },
    { id: "fb-story", group: "fb", name: "Facebook Story", sub: "9:16", w: 1080, h: 1920 },
    { id: "fb-avatar", group: "fb", name: "Avatar Facebook", sub: "1:1", w: 720, h: 720 },
    { id: "li-cover", group: "fb", name: "Ảnh bìa LinkedIn", sub: "1584×396", w: 1584, h: 396 },
    { id: "shopee", group: "shop", name: "Shopee / Lazada", sub: "1:1", w: 800, h: 800 },
    { id: "shopee-hd", group: "shop", name: "Shopee HD", sub: "1:1", w: 1080, h: 1080 },
    { id: "zalo", group: "shop", name: "Zalo OA bìa", sub: "16:9", w: 1280, h: 720 },
    { id: "pin", group: "shop", name: "Pinterest", sub: "2:3", w: 1000, h: 1500 },
    { id: "id-34", group: "id", name: "Ảnh thẻ 3×4", sub: "3:4", w: 600, h: 800 },
    { id: "id-23", group: "id", name: "Ảnh thẻ 2×3", sub: "2:3", w: 400, h: 600 },
    { id: "id-46", group: "id", name: "Ảnh 4×6", sub: "2:3", w: 1200, h: 1800 },
    { id: "avatar", group: "id", name: "Avatar", sub: "512×512", w: 512, h: 512 }
  ];

  const els = {
    shell: document.getElementById("shell"),
    zone: document.getElementById("uploadZone"),
    input: document.getElementById("fileInput"),
    browseBtn: document.getElementById("browseBtn"),
    changeBtn: document.getElementById("changeBtn"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    ratioGrid: document.getElementById("ratioGrid"),
    groupTabs: document.getElementById("groupTabs"),
    presetGrid: document.getElementById("presetGrid"),
    status: document.getElementById("status"),
    outW: document.getElementById("outW"),
    outH: document.getElementById("outH"),
    nativeHint: document.getElementById("nativeHint"),
    presetHint: document.getElementById("presetHint"),
    outHint: document.getElementById("outHint"),
    quality: document.getElementById("quality"),
    qualityVal: document.getElementById("qualityVal"),
    qualityWrap: document.getElementById("qualityWrap"),
    stage: document.getElementById("stage"),
    canvas: document.getElementById("cropCanvas"),
    mini: document.getElementById("miniCanvas"),
    miniWrap: document.getElementById("miniWrap"),
    miniMeta: document.getElementById("miniMeta"),
    copyBtn: document.getElementById("copyBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    gridBtn: document.getElementById("gridBtn")
  };

  const ctx = els.canvas.getContext("2d");
  const mctx = els.mini.getContext("2d");

  let file = null;
  let bitmap = null;
  let crop = { x: 0, y: 0, w: 1, h: 1 };
  let ratio = 1;
  let ratioId = "1:1";
  let presetId = "ig-sq";
  let groupId = "all";
  let shape = "rect";
  let format = "jpg";
  let outMode = "native";
  let showGrid = true;
  let view = { scale: 1, ox: 0, oy: 0, dw: 0, dh: 0, cssW: 0, cssH: 0 };
  let drag = null;
  let busy = false;
  let raf = 0;
  let customOut = false;

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

  function presetById(id) {
    return PRESETS.find((p) => p.id === id) || null;
  }

  function ratioOfPreset(p) {
    return p.w / p.h;
  }

  function nearestRatioId(r) {
    if (!r) return "free";
    let best = "free";
    let dist = 0.06;
    RATIOS.forEach((item) => {
      if (!item.ratio) return;
      const d = Math.abs(item.ratio - r);
      if (d < dist) {
        dist = d;
        best = item.id;
      }
    });
    return best;
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.classList.toggle("is-ok", kind === "ok");
    els.status.classList.toggle("is-err", kind === "err");
  }

  function mimeFor(fmt) {
    if (fmt === "png") return "image/png";
    if (fmt === "webp") return "image/webp";
    return "image/jpeg";
  }

  function extFor(fmt) {
    return fmt === "jpeg" ? "jpg" : fmt;
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
        try {
          return await createImageBitmap(src);
        } catch (__) {}
      }
    }
    if (src instanceof HTMLCanvasElement) return src;
    if (src instanceof Blob) return OT.loadImage(src);
    return src;
  }

  function maxCrop(iw, ih, r) {
    if (!r) return { x: 0, y: 0, w: iw, h: ih };
    let w = iw;
    let h = w / r;
    if (h > ih) {
      h = ih;
      w = h * r;
    }
    return {
      x: (iw - w) / 2,
      y: (ih - h) / 2,
      w,
      h
    };
  }

  function clampCrop(c, r) {
    const { w: iw, h: ih } = imgSize();
    let x = c.x;
    let y = c.y;
    let w = Math.max(MIN_CROP, c.w);
    let h = Math.max(MIN_CROP, c.h);
    if (r) {
      if (w / h > r) w = h * r;
      else h = w / r;
      if (w > iw) {
        w = iw;
        h = w / r;
      }
      if (h > ih) {
        h = ih;
        w = h * r;
      }
      w = Math.max(MIN_CROP, Math.min(w, iw));
      h = w / r;
      if (h < MIN_CROP) {
        h = MIN_CROP;
        w = h * r;
      }
      if (h > ih) {
        h = ih;
        w = h * r;
      }
    } else {
      w = Math.min(w, iw);
      h = Math.min(h, ih);
    }
    x = Math.min(Math.max(0, x), Math.max(0, iw - w));
    y = Math.min(Math.max(0, y), Math.max(0, ih - h));
    return { x, y, w, h };
  }

  function sourceRect() {
    const { w: iw, h: ih } = imgSize();
    let sx = Math.round(crop.x);
    let sy = Math.round(crop.y);
    let sw = Math.round(crop.w);
    let sh = Math.round(crop.h);
    if (sx < 0) {
      sw += sx;
      sx = 0;
    }
    if (sy < 0) {
      sh += sy;
      sy = 0;
    }
    if (sx + sw > iw) sw = iw - sx;
    if (sy + sh > ih) sh = ih - sy;
    return {
      sx: Math.max(0, sx),
      sy: Math.max(0, sy),
      sw: Math.max(1, sw),
      sh: Math.max(1, sh)
    };
  }

  function nativeSize() {
    const s = sourceRect();
    return { w: s.sw, h: s.sh };
  }

  function requestedOutSize() {
    const n = nativeSize();
    let tw = parseInt(els.outW.value, 10);
    let th = parseInt(els.outH.value, 10);
    if (!tw && !th) return n;
    const r = n.w / n.h;
    if (tw && th) {
      if (Math.abs(tw / th - r) > 0.01) {
        if (tw / th > r) tw = Math.round(th * r);
        else th = Math.round(tw / r);
      }
    } else if (tw) {
      th = Math.round(tw / r);
    } else {
      tw = Math.round(th * r);
    }
    tw = Math.min(MAX_EDGE, Math.max(MIN_CROP, tw));
    th = Math.min(MAX_EDGE, Math.max(MIN_CROP, th));
    return { w: tw, h: th };
  }

  function targetSize() {
    const n = nativeSize();
    if (outMode === "native" && !customOut) return n;
    const want = requestedOutSize();
    /* Không phóng to: phóng pixel làm ảnh mờ / vỡ nét */
    if (!customOut && (want.w > n.w || want.h > n.h)) return n;
    return want;
  }

  function updateHints() {
    const n = nativeSize();
    els.nativeHint.textContent = n.w + " × " + n.h;
    const p = presetById(presetId);
    if (p) els.presetHint.textContent = p.w + " × " + p.h;
    else els.presetHint.textContent = "Chọn preset";
    const t = targetSize();
    const circle = shape === "circle" ? " · tròn" : "";
    els.miniMeta.textContent = t.w + " × " + t.h + " px" + circle;
    if (outMode === "native" && !customOut) {
      els.outHint.textContent = "Xuất đúng pixel vùng cắt trên ảnh gốc — không nén kích thước, không bị mờ.";
    } else if (!customOut && p && (p.w > n.w || p.h > n.h)) {
      els.outHint.textContent = "Vùng cắt nhỏ hơn preset — giữ " + n.w + " × " + n.h + " để ảnh không bị vỡ khi phóng.";
    } else if (outMode === "preset" && p && (t.w < n.w || t.h < n.h)) {
      els.outHint.textContent = "Thu nhỏ sắc nét từ " + n.w + " × " + n.h + " xuống " + p.w + " × " + p.h + ".";
    } else {
      els.outHint.textContent = "Xuất " + t.w + " × " + t.h + " — giữ tỉ lệ vùng cắt.";
    }
  }

  function fillOutInputs() {
    const editing = document.activeElement === els.outW || document.activeElement === els.outH;
    const n = nativeSize();
    const p = presetById(presetId);
    if (!customOut && !editing) {
      if (outMode === "preset" && p) {
        els.outW.value = p.w;
        els.outH.value = p.h;
      } else {
        els.outW.value = n.w;
        els.outH.value = n.h;
      }
    }
    updateHints();
  }

  function paintRatios() {
    els.ratioGrid.innerHTML = RATIOS.map((item) => {
      const on = item.id === ratioId ? " is-on" : "";
      return (
        '<button type="button" class="ic-ratio' + on + '" data-ratio="' + item.id + '">' +
        '<span class="ic-ratio-box" style="width:' + item.box.w + "px;height:" + item.box.h + 'px"></span>' +
        item.label +
        "</button>"
      );
    }).join("");
  }

  function paintGroups() {
    els.groupTabs.innerHTML = GROUPS.map((g) => {
      const on = g.id === groupId ? " is-on" : "";
      return '<button type="button" class="ic-group' + on + '" data-group="' + g.id + '">' + g.label + "</button>";
    }).join("");
  }

  function paintPresets() {
    const list = PRESETS.filter((p) => groupId === "all" || p.group === groupId);
    els.presetGrid.innerHTML = list.map((p) => {
      const on = p.id === presetId ? " is-on" : "";
      const r = p.w / p.h;
      let bw = 16;
      let bh = 16;
      if (r >= 1) bh = Math.max(6, Math.round(16 / r));
      else bw = Math.max(6, Math.round(16 * r));
      return (
        '<button type="button" class="ic-preset' + on + '" data-preset="' + p.id + '">' +
        '<span class="ic-preset-shape" style="width:' + bw + "px;height:" + bh + 'px"></span>' +
        "<div><strong>" + p.name + "</strong><em>" + p.sub + "</em></div>" +
        "<span>" + p.w + "×" + p.h + "</span>" +
        "</button>"
      );
    }).join("");
  }

  function setShape(next) {
    shape = next;
    document.querySelectorAll(".ic-shape").forEach((b) => b.classList.toggle("is-on", b.dataset.shape === next));
  }

  function applyRatio(id, keepPreset) {
    const item = RATIOS.find((r) => r.id === id) || RATIOS[0];
    ratioId = item.id;
    ratio = item.ratio;
    if (item.id !== "1:1" && shape === "circle") setShape("rect");
    if (shape === "circle") {
      ratioId = "1:1";
      ratio = 1;
    }
    if (!keepPreset) {
      presetId = null;
      outMode = "native";
      customOut = false;
      document.querySelectorAll(".ic-out").forEach((b) => b.classList.toggle("is-on", b.dataset.out === outMode));
    }
    const { w: iw, h: ih } = imgSize();
    if (iw && ih) {
      const cx = crop.x + crop.w / 2;
      const cy = crop.y + crop.h / 2;
      const next = maxCrop(iw, ih, ratio);
      next.x = cx - next.w / 2;
      next.y = cy - next.h / 2;
      crop = clampCrop(next, ratio);
    }
    customOut = false;
    paintRatios();
    paintPresets();
    fillOutInputs();
    requestDraw();
  }

  function applyPreset(id) {
    const p = presetById(id);
    if (!p) return;
    presetId = p.id;
    ratio = ratioOfPreset(p);
    ratioId = nearestRatioId(ratio);
    if (shape === "circle") {
      if (Math.abs(ratio - 1) > 0.02) setShape("rect");
      else {
        ratio = 1;
        ratioId = "1:1";
      }
    }
    customOut = false;
    outMode = "preset";
    document.querySelectorAll(".ic-out").forEach((b) => b.classList.toggle("is-on", b.dataset.out === outMode));
    const { w: iw, h: ih } = imgSize();
    if (iw && ih) {
      const cx = crop.x + crop.w / 2;
      const cy = crop.y + crop.h / 2;
      const next = maxCrop(iw, ih, ratio);
      next.x = cx - next.w / 2;
      next.y = cy - next.h / 2;
      crop = clampCrop(next, ratio);
    }
    paintRatios();
    paintPresets();
    fillOutInputs(true);
    requestDraw();
  }

  function layoutView() {
    const { w: iw, h: ih } = imgSize();
    if (!iw) return;
    const stage = els.stage;
    const pad = 28;
    const film = 56;
    const cssW = Math.max(120, stage.clientWidth);
    const cssH = Math.max(220, stage.clientHeight);
    const availW = Math.max(80, cssW - pad * 2);
    const availH = Math.max(80, cssH - pad * 2 - film);
    const scale = Math.min(availW / iw, availH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const ox = (cssW - dw) / 2;
    const oy = (cssH - dh - film * 0.35) / 2;
    view = { scale, ox, oy, dw, dh, cssW, cssH };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    els.canvas.width = Math.round(cssW * dpr);
    els.canvas.height = Math.round(cssH * dpr);
    els.canvas.style.width = cssW + "px";
    els.canvas.style.height = cssH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function imgToView(x, y) {
    return { x: view.ox + x * view.scale, y: view.oy + y * view.scale };
  }

  function viewToImg(px, py) {
    const { w: iw, h: ih } = imgSize();
    return {
      x: Math.max(0, Math.min(iw, (px - view.ox) / view.scale)),
      y: Math.max(0, Math.min(ih, (py - view.oy) / view.scale))
    };
  }

  function cropViewRect() {
    const a = imgToView(crop.x, crop.y);
    return {
      x: a.x,
      y: a.y,
      w: crop.w * view.scale,
      h: crop.h * view.scale
    };
  }

  function handles() {
    const r = cropViewRect();
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    return {
      nw: { x: r.x, y: r.y },
      n: { x: cx, y: r.y },
      ne: { x: r.x + r.w, y: r.y },
      e: { x: r.x + r.w, y: cy },
      se: { x: r.x + r.w, y: r.y + r.h },
      s: { x: cx, y: r.y + r.h },
      sw: { x: r.x, y: r.y + r.h },
      w: { x: r.x, y: cy }
    };
  }

  function hitHandle(px, py) {
    const hs = handles();
    const names = ["nw", "ne", "se", "sw", "n", "e", "s", "w"];
    for (const name of names) {
      const h = hs[name];
      if (Math.abs(px - h.x) <= HIT && Math.abs(py - h.y) <= HIT) return name;
    }
    const r = cropViewRect();
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return "move";
    return null;
  }

  function cursorFor(hit) {
    if (!hit) return "crosshair";
    if (hit === "move") return "move";
    if (hit === "n" || hit === "s") return "ns-resize";
    if (hit === "e" || hit === "w") return "ew-resize";
    if (hit === "nw" || hit === "se") return "nwse-resize";
    return "nesw-resize";
  }

  function drawMini() {
    if (!bitmap) return;
    const t = targetSize();
    const max = 160;
    const scale = Math.min(max / t.w, max / t.h, 1);
    const dw = Math.max(1, Math.round(t.w * scale));
    const dh = Math.max(1, Math.round(t.h * scale));
    els.mini.width = dw;
    els.mini.height = dh;
    mctx.clearRect(0, 0, dw, dh);
    if (shape === "circle") {
      els.miniWrap.classList.add("is-circle");
      mctx.save();
      mctx.beginPath();
      mctx.arc(dw / 2, dh / 2, Math.min(dw, dh) / 2, 0, Math.PI * 2);
      mctx.clip();
    } else {
      els.miniWrap.classList.remove("is-circle");
    }
    mctx.drawImage(bitmap, crop.x, crop.y, crop.w, crop.h, 0, 0, dw, dh);
    if (shape === "circle") mctx.restore();
  }

  function draw() {
    if (!bitmap) return;
    layoutView();
    const { cssW, cssH, ox, oy, dw, dh } = view;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(bitmap, ox, oy, dw, dh);

    const r = cropViewRect();
    ctx.save();
    ctx.fillStyle = "rgba(8, 6, 12, 0.58)";
    ctx.beginPath();
    ctx.rect(ox, oy, dw, dh);
    if (shape === "circle") {
      ctx.moveTo(r.x + r.w, r.y + r.h / 2);
      ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.rect(r.x, r.y, r.w, r.h);
    }
    ctx.fill("evenodd");
    ctx.restore();

    ctx.save();
    if (shape === "circle") {
      ctx.beginPath();
      ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    }
    ctx.restore();

    if (showGrid) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      for (let i = 1; i <= 2; i++) {
        const gx = r.x + (r.w * i) / 3;
        const gy = r.y + (r.h * i) / 3;
        ctx.beginPath();
        ctx.moveTo(gx, r.y);
        ctx.lineTo(gx, r.y + r.h);
        ctx.moveTo(r.x, gy);
        ctx.lineTo(r.x + r.w, gy);
        ctx.stroke();
      }
      ctx.restore();
    }

    const hs = handles();
    Object.keys(hs).forEach((name) => {
      const h = hs[name];
      const s = HANDLE;
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(h.x - s / 2, h.y - s / 2, s, s);
      ctx.fill();
      ctx.stroke();
    });

    drawMini();
    fillOutInputs();
  }

  function requestDraw() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      draw();
    });
  }

  function pointerPos(e) {
    const rect = els.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function resizeFrom(handle, imgPt, start) {
    const { w: iw, h: ih } = imgSize();
    let x1 = start.x;
    let y1 = start.y;
    let x2 = start.x + start.w;
    let y2 = start.y + start.h;
    const fromW = handle.indexOf("w") >= 0;
    const fromE = handle.indexOf("e") >= 0;
    const fromN = handle.indexOf("n") >= 0;
    const fromS = handle.indexOf("s") >= 0;
    const edgeH = (fromW || fromE) && !fromN && !fromS;
    const edgeV = (fromN || fromS) && !fromW && !fromE;

    if (fromW) x1 = imgPt.x;
    if (fromE) x2 = imgPt.x;
    if (fromN) y1 = imgPt.y;
    if (fromS) y2 = imgPt.y;

    if (x2 < x1) {
      const t = x1; x1 = x2; x2 = t;
    }
    if (y2 < y1) {
      const t = y1; y1 = y2; y2 = t;
    }

    let w = Math.max(MIN_CROP, x2 - x1);
    let h = Math.max(MIN_CROP, y2 - y1);
    const r = ratio;

    if (r) {
      if (edgeH) {
        w = Math.max(MIN_CROP, w);
        h = w / r;
        const cy = start.y + start.h / 2;
        y1 = cy - h / 2;
        y2 = y1 + h;
        if (fromW) x1 = x2 - w;
        else x2 = x1 + w;
      } else if (edgeV) {
        h = Math.max(MIN_CROP, h);
        w = h * r;
        const cx = start.x + start.w / 2;
        x1 = cx - w / 2;
        x2 = x1 + w;
        if (fromN) y1 = y2 - h;
        else y2 = y1 + h;
      } else {
        if (w / h > r) w = h * r;
        else h = w / r;
        if (handle === "nw" || handle === "sw") x1 = x2 - w;
        else x2 = x1 + w;
        if (handle === "nw" || handle === "ne") y1 = y2 - h;
        else y2 = y1 + h;
      }
    }

    let next = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    next = clampCrop(next, r);
    /* keep opposite corner when possible */
    if (r && (fromE || handle === "ne" || handle === "se")) {
      next.x = Math.min(start.x, iw - next.w);
    }
    if (r && (fromS || handle === "se" || handle === "sw")) {
      next.y = Math.min(start.y, ih - next.h);
    }
    if (r && (fromW || handle === "nw" || handle === "sw")) {
      next.x = Math.max(0, (start.x + start.w) - next.w);
    }
    if (r && (fromN || handle === "nw" || handle === "ne")) {
      next.y = Math.max(0, (start.y + start.h) - next.h);
    }
    return clampCrop(next, r);
  }

  function onPointerDown(e) {
    if (!bitmap) return;
    e.preventDefault();
    const p = pointerPos(e);
    const hit = hitHandle(p.x, p.y);
    if (!hit) return;
    els.canvas.setPointerCapture?.(e.pointerId);
    const img = viewToImg(p.x, p.y);
    drag = { hit, start: { ...crop }, img, origin: p };
    els.canvas.style.cursor = cursorFor(drag.hit);
  }

  function onPointerMove(e) {
    const p = pointerPos(e);
    if (!drag) {
      els.canvas.style.cursor = bitmap ? cursorFor(hitHandle(p.x, p.y)) : "default";
      return;
    }
    e.preventDefault();
    const img = viewToImg(p.x, p.y);
    if (drag.hit === "move") {
      const dx = img.x - drag.img.x;
      const dy = img.y - drag.img.y;
      crop = clampCrop({
        x: drag.start.x + dx,
        y: drag.start.y + dy,
        w: drag.start.w,
        h: drag.start.h
      }, ratio);
    } else {
      crop = resizeFrom(drag.hit, img, drag.start);
    }
    customOut = false;
    requestDraw();
  }

  function onPointerUp(e) {
    if (!drag) return;
    try { els.canvas.releasePointerCapture?.(e.pointerId); } catch (_) {}
    drag = null;
    setStatus(statusLine(), "ok");
  }

  function statusLine() {
    const n = nativeSize();
    const t = targetSize();
    let s = "Vùng cắt " + n.w + " × " + n.h;
    if (t.w !== n.w || t.h !== n.h) s += " → xuất " + t.w + " × " + t.h;
    return s;
  }

  function bakeCanvas(kind) {
    const { w, h } = imgSize();
    const c = document.createElement("canvas");
    const cctx = c.getContext("2d");
    if (kind === "cw" || kind === "ccw") {
      c.width = h;
      c.height = w;
      if (kind === "cw") {
        cctx.translate(h, 0);
        cctx.rotate(Math.PI / 2);
      } else {
        cctx.translate(0, w);
        cctx.rotate(-Math.PI / 2);
      }
    } else {
      c.width = w;
      c.height = h;
      if (kind === "flipH") {
        cctx.translate(w, 0);
        cctx.scale(-1, 1);
      } else {
        cctx.translate(0, h);
        cctx.scale(1, -1);
      }
    }
    cctx.imageSmoothingEnabled = false;
    cctx.drawImage(bitmap, 0, 0);
    return c;
  }

  function remapCrop(kind, oldW, oldH) {
    const c = crop;
    if (kind === "cw") {
      crop = { x: oldH - c.y - c.h, y: c.x, w: c.h, h: c.w };
    } else if (kind === "ccw") {
      crop = { x: c.y, y: oldW - c.x - c.w, w: c.h, h: c.w };
    } else if (kind === "flipH") {
      crop = { x: oldW - c.x - c.w, y: c.y, w: c.w, h: c.h };
    } else if (kind === "flipV") {
      crop = { x: c.x, y: oldH - c.y - c.h, w: c.w, h: c.h };
    }
    crop = clampCrop(crop, ratio);
  }

  async function transform(kind) {
    if (!bitmap || busy) return;
    const { w, h } = imgSize();
    const baked = bakeCanvas(kind);
    closeBitmap(bitmap);
    bitmap = await loadBitmap(baked);
    remapCrop(kind, w, h);
    customOut = false;
    requestDraw();
    setStatus(statusLine(), "ok");
  }

  function get2d(canvas, alpha) {
    let ctx = null;
    try {
      ctx = canvas.getContext("2d", { alpha: !!alpha, colorSpace: "srgb" });
    } catch (_) {}
    return ctx || canvas.getContext("2d");
  }

  function steppedScale(srcCanvas, dw, dh) {
    let cur = srcCanvas;
    let cw = cur.width;
    let ch = cur.height;
    while (cw / 2 >= dw && ch / 2 >= dh) {
      const nw = Math.max(dw, Math.round(cw / 2));
      const nh = Math.max(dh, Math.round(ch / 2));
      const next = document.createElement("canvas");
      next.width = nw;
      next.height = nh;
      const nctx = get2d(next, true);
      nctx.imageSmoothingEnabled = true;
      nctx.imageSmoothingQuality = "high";
      nctx.drawImage(cur, 0, 0, nw, nh);
      cur = next;
      cw = nw;
      ch = nh;
    }
    if (cw === dw && ch === dh) return cur;
    const out = document.createElement("canvas");
    out.width = dw;
    out.height = dh;
    const octx = get2d(out, true);
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";
    octx.drawImage(cur, 0, 0, dw, dh);
    return out;
  }

  async function drawCrisp(src, dw, dh) {
    const { sx, sy, sw, sh } = src;
    const same = dw === sw && dh === sh;

    if (!same && typeof createImageBitmap === "function") {
      try {
        const resized = await createImageBitmap(bitmap, sx, sy, sw, sh, {
          resizeWidth: dw,
          resizeHeight: dh,
          resizeQuality: "high"
        });
        const c = document.createElement("canvas");
        c.width = dw;
        c.height = dh;
        const cctx = get2d(c, format !== "jpg");
        cctx.imageSmoothingEnabled = false;
        cctx.drawImage(resized, 0, 0);
        if (resized.close) try { resized.close(); } catch (_) {}
        return c;
      } catch (_) {}
    }

    const cut = document.createElement("canvas");
    cut.width = sw;
    cut.height = sh;
    const cutCtx = get2d(cut, true);
    cutCtx.imageSmoothingEnabled = false;
    cutCtx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
    if (same) return cut;
    return steppedScale(cut, dw, dh);
  }

  async function renderExport() {
    const src = sourceRect();
    const t = targetSize();
    const drawn = await drawCrisp(src, t.w, t.h);
    const c = document.createElement("canvas");
    c.width = t.w;
    c.height = t.h;
    const cctx = get2d(c, format !== "jpg");
    if (format === "jpg") {
      cctx.fillStyle = "#fff";
      cctx.fillRect(0, 0, t.w, t.h);
    }
    if (shape === "circle") {
      cctx.save();
      cctx.beginPath();
      cctx.arc(t.w / 2, t.h / 2, Math.min(t.w, t.h) / 2, 0, Math.PI * 2);
      cctx.closePath();
      cctx.clip();
    }
    cctx.imageSmoothingEnabled = false;
    cctx.drawImage(drawn, 0, 0);
    if (shape === "circle") cctx.restore();
    const q = format === "png" ? undefined : Math.min(1, Math.max(0.7, (parseInt(els.quality.value, 10) || 96) / 100));
    return OT.canvasToBlob(c, mimeFor(format), q);
  }

  async function download() {
    if (!bitmap || busy) return;
    busy = true;
    els.downloadBtn.disabled = true;
    setStatus("Đang xuất ảnh…");
    try {
      const blob = await renderExport();
      const t = targetSize();
      const base = (file && file.name ? file.name.replace(/\.[^.]+$/, "") : "anh") + "-crop";
      const name = base + "." + extFor(format);
      await OT.downloadBlob(blob, name);
      setStatus("Đã tải " + name + " · " + t.w + " × " + t.h + " · " + fmtSize(blob.size), "ok");
    } catch (e) {
      setStatus(e.message || "Không tải được ảnh", "err");
    } finally {
      busy = false;
      els.downloadBtn.disabled = false;
    }
  }

  async function copy() {
    if (!bitmap) return;
    try {
      let blob = await renderExport();
      if (!(navigator.clipboard && window.ClipboardItem)) {
        setStatus("Trình duyệt không hỗ trợ copy ảnh — hãy tải về.", "err");
        return;
      }
      try {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } catch (_) {
        const prev = format;
        format = "png";
        blob = await renderExport();
        format = prev;
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      }
      setStatus("Đã sao chép ảnh vào clipboard.", "ok");
    } catch (_) {
      setStatus("Không sao chép được ảnh.", "err");
    }
  }

  function looksLikeImage(f) {
    if ((f.type || "").startsWith("image/")) return true;
    return /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name || "");
  }

  function defaultFormat(name) {
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (ext === "png") return "png";
    if (ext === "webp") return "webp";
    return "jpg";
  }

  async function loadFile(f) {
    if (!f || !looksLikeImage(f)) {
      setStatus("Chọn file ảnh hợp lệ (JPG, PNG, WebP…).", "err");
      return;
    }
    if (f.size > MAX_BYTES) {
      setStatus("Ảnh tối đa 20 MB.", "err");
      return;
    }
    closeBitmap(bitmap);
    bitmap = null;
    file = f;
    try {
      bitmap = await loadBitmap(f);
      const { w, h } = imgSize();
      if (!w || !h) throw new Error("Không đọc được kích thước ảnh.");
      els.fileName.textContent = f.name;
      els.fileMeta.textContent = w + " × " + h + " · " + fmtSize(f.size);
      els.shell.classList.add("has-file");
      els.zone.classList.add("has-file");
      format = defaultFormat(f.name);
      document.querySelectorAll(".ic-fmt").forEach((b) => b.classList.toggle("is-on", b.dataset.format === format));
      toggleQuality();
      if (!presetId) presetId = "ig-sq";
      if (shape === "circle") {
        ratio = 1;
        ratioId = "1:1";
      } else if (presetId) {
        const p = presetById(presetId);
        ratio = p ? ratioOfPreset(p) : 1;
        ratioId = nearestRatioId(ratio);
      }
      crop = maxCrop(w, h, ratio);
      customOut = false;
      paintRatios();
      paintPresets();
      fillOutInputs();
      requestAnimationFrame(() => {
        requestDraw();
        requestAnimationFrame(() => requestDraw());
      });
      setStatus("Kéo khung để cắt · " + statusLine(), "ok");
    } catch (e) {
      setStatus(e.message || "Không đọc được ảnh.", "err");
    }
  }

  function toggleQuality() {
    els.qualityWrap.hidden = format === "png";
  }

  paintRatios();
  paintGroups();
  paintPresets();
  toggleQuality();

  els.ratioGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ratio]");
    if (!btn) return;
    applyRatio(btn.dataset.ratio, false);
    setStatus(statusLine(), "ok");
  });

  els.groupTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-group]");
    if (!btn) return;
    groupId = btn.dataset.group;
    paintGroups();
    paintPresets();
  });

  els.presetGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-preset]");
    if (!btn) return;
    applyPreset(btn.dataset.preset);
    setStatus(statusLine(), "ok");
  });

  document.querySelectorAll(".ic-shape").forEach((btn) => {
    btn.addEventListener("click", () => {
      shape = btn.dataset.shape;
      document.querySelectorAll(".ic-shape").forEach((b) => b.classList.toggle("is-on", b === btn));
      if (shape === "circle") {
        ratio = 1;
        ratioId = "1:1";
        const p = presetById(presetId);
        if (!p || Math.abs(ratioOfPreset(p) - 1) > 0.02) presetId = "avatar";
        const { w, h } = imgSize();
        if (w) {
          const cx = crop.x + crop.w / 2;
          const cy = crop.y + crop.h / 2;
          const next = maxCrop(w, h, 1);
          next.x = cx - next.w / 2;
          next.y = cy - next.h / 2;
          crop = clampCrop(next, 1);
        }
        paintRatios();
        paintPresets();
        fillOutInputs();
      }
      requestDraw();
      setStatus(statusLine(), "ok");
    });
  });

  document.querySelectorAll(".ic-out").forEach((btn) => {
    btn.addEventListener("click", () => {
      outMode = btn.dataset.out;
      customOut = false;
      document.querySelectorAll(".ic-out").forEach((b) => b.classList.toggle("is-on", b === btn));
      fillOutInputs(true);
      setStatus(statusLine(), "ok");
    });
  });

  document.querySelectorAll(".ic-fmt").forEach((btn) => {
    btn.addEventListener("click", () => {
      format = btn.dataset.format;
      document.querySelectorAll(".ic-fmt").forEach((b) => b.classList.toggle("is-on", b === btn));
      toggleQuality();
    });
  });

  els.quality.addEventListener("input", () => {
    els.qualityVal.textContent = (els.quality.value || "92") + "%";
  });

  function onOutInput(which) {
    customOut = true;
    outMode = "preset";
    document.querySelectorAll(".ic-out").forEach((b) => b.classList.toggle("is-on", b.dataset.out === "preset"));
    const n = nativeSize();
    const r = n.w / n.h;
    if (which === "w") {
      const tw = parseInt(els.outW.value, 10);
      if (tw) els.outH.value = Math.round(tw / r);
    } else {
      const th = parseInt(els.outH.value, 10);
      if (th) els.outW.value = Math.round(th * r);
    }
    drawMini();
    const t = targetSize();
    els.miniMeta.textContent = t.w + " × " + t.h + " px";
  }

  els.outW.addEventListener("input", () => onOutInput("w"));
  els.outH.addEventListener("input", () => onOutInput("h"));

  els.downloadBtn.addEventListener("click", download);
  els.copyBtn.addEventListener("click", copy);
  document.getElementById("rotLBtn")?.addEventListener("click", () => transform("ccw"));
  document.getElementById("rotRBtn")?.addEventListener("click", () => transform("cw"));
  document.getElementById("flipHBtn")?.addEventListener("click", () => transform("flipH"));
  document.getElementById("flipVBtn")?.addEventListener("click", () => transform("flipV"));
  els.gridBtn.addEventListener("click", () => {
    showGrid = !showGrid;
    els.gridBtn.classList.toggle("is-on", showGrid);
    requestDraw();
  });
  document.getElementById("resetBtn")?.addEventListener("click", () => {
    const { w, h } = imgSize();
    crop = maxCrop(w, h, ratio);
    customOut = false;
    requestDraw();
    setStatus("Đã reset vùng cắt · " + statusLine(), "ok");
  });

  els.canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  els.stage.addEventListener("wheel", (e) => {
    if (!bitmap) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.96 : 1.04;
    const cx = crop.x + crop.w / 2;
    const cy = crop.y + crop.h / 2;
    crop = clampCrop({
      x: cx - (crop.w * factor) / 2,
      y: cy - (crop.h * factor) / 2,
      w: crop.w * factor,
      h: crop.h * factor
    }, ratio);
    customOut = false;
    requestDraw();
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    if (!bitmap) return;
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") { crop = clampCrop({ ...crop, x: crop.x - step }, ratio); e.preventDefault(); requestDraw(); }
    if (e.key === "ArrowRight") { crop = clampCrop({ ...crop, x: crop.x + step }, ratio); e.preventDefault(); requestDraw(); }
    if (e.key === "ArrowUp") { crop = clampCrop({ ...crop, y: crop.y - step }, ratio); e.preventDefault(); requestDraw(); }
    if (e.key === "ArrowDown") { crop = clampCrop({ ...crop, y: crop.y + step }, ratio); e.preventDefault(); requestDraw(); }
    if (e.key === "Enter") { e.preventDefault(); download(); }
  });

  window.addEventListener("paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const f = item.getAsFile();
    if (f) loadFile(f);
  });

  window.addEventListener("resize", () => requestDraw());
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => requestDraw()).observe(els.stage);
  }

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
})();
