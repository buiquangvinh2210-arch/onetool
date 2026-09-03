window.OTImage = (function () {
  "use strict";

  const MIME = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/png",
    bmp: "image/bmp",
    tiff: "image/png",
    tif: "image/png",
    tga: "image/png"
  };

  function extOf(name) {
    return (name.split(".").pop() || "").toLowerCase();
  }

  async function drawToCanvas(file, { maxW, maxH, width, height, keepAspect = true, fitMode = "contain" } = {}) {
    const img = await OT.loadImage(file);
    let w = width || img.naturalWidth;
    let h = height || img.naturalHeight;

    if (maxW || maxH) {
      const rw = maxW ? maxW / img.naturalWidth : 1;
      const rh = maxH ? maxH / img.naturalHeight : 1;
      const r = Math.min(rw, rh, 1);
      w = Math.round(img.naturalWidth * r);
      h = Math.round(img.naturalHeight * r);
    } else if (width && height) {
      if (!keepAspect || fitMode === "stretch") {
        w = width;
        h = height;
      } else if (fitMode === "cover") {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
        return { canvas, width, height, srcW: img.naturalWidth, srcH: img.naturalHeight };
      } else if (fitMode === "pad") {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const r = Math.min(width / img.naturalWidth, height / img.naturalHeight);
        const dw = Math.round(img.naturalWidth * r);
        const dh = Math.round(img.naturalHeight * r);
        ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
        return { canvas, width, height, srcW: img.naturalWidth, srcH: img.naturalHeight };
      } else {
        const r = Math.min(width / img.naturalWidth, height / img.naturalHeight);
        w = Math.round(img.naturalWidth * r);
        h = Math.round(img.naturalHeight * r);
      }
    } else if (width && !height && keepAspect) {
      h = Math.round(img.naturalHeight * (width / img.naturalWidth));
    } else if (height && !width && keepAspect) {
      w = Math.round(img.naturalWidth * (height / img.naturalHeight));
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { canvas, width: canvas.width, height: canvas.height, srcW: img.naturalWidth, srcH: img.naturalHeight };
  }

  async function convert(file, format, quality = 0.92) {
    const key = format.toLowerCase().replace("jpeg", "jpg");
    // Canvas chỉ encode ổn: jpeg / png / webp — các format khác xuất PNG thật
    const want = MIME[key] || "image/png";
    const encodable = ["image/jpeg", "image/png", "image/webp"];
    let type = encodable.includes(want) ? want : "image/png";

    const { canvas } = await drawToCanvas(file);
    let blob;
    try {
      blob = await OT.canvasToBlob(
        canvas,
        type,
        type === "image/jpeg" || type === "image/webp" ? quality : undefined
      );
    } catch (_) {
      type = "image/png";
      blob = await OT.canvasToBlob(canvas, "image/png");
    }

    const extMap = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
    const ext = extMap[type] || ".png";
    return { blob, fileName: OT.nameWithSuffix(file.name, "-converted", ext), contentType: type };
  }

  async function resize(file, opts, format) {
    const { canvas, width, height } = await drawToCanvas(file, opts);
    const key = (format || extOf(file.name) || "png").toLowerCase().replace("jpeg", "jpg");
    const type = MIME[key] || "image/png";
    const q = opts?.quality != null ? opts.quality : 0.92;
    const blob = await OT.canvasToBlob(canvas, type, type === "image/png" ? undefined : q);
    const ext = key === "jpg" ? ".jpg" : `.${key === "jpeg" ? "jpg" : key}`;
    return {
      blob,
      fileName: OT.nameWithSuffix(file.name, `-${width}x${height}`, ext.startsWith(".") ? ext : "." + ext),
      contentType: type,
      width,
      height
    };
  }

  let webpOk = null;
  async function supportsWebp() {
    if (webpOk != null) return webpOk;
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const b = await OT.canvasToBlob(c, "image/webp", 0.8);
      webpOk = !!(b && b.type === "image/webp" && b.size > 0);
    } catch (_) {
      webpOk = false;
    }
    return webpOk;
  }

  async function resolveCompressType(format, fileName) {
    let key = (format || "auto").toLowerCase().replace("jpeg", "jpg");
    if (key === "auto") {
      const src = extOf(fileName);
      if (src === "png" || src === "gif" || src === "bmp" || src === "tif" || src === "tiff") {
        key = (await supportsWebp()) ? "webp" : "jpg";
      } else if (src === "webp") {
        key = (await supportsWebp()) ? "webp" : "jpg";
      } else {
        key = "jpg";
      }
    }
    if (key === "webp" && !(await supportsWebp())) key = "jpg";
    if (key === "png") return { type: "image/png", ext: ".png", key: "png" };
    if (key === "webp") return { type: "image/webp", ext: ".webp", key: "webp" };
    return { type: "image/jpeg", ext: ".jpg", key: "jpg" };
  }

  async function encodeCanvas(canvas, type, quality) {
    if (type === "image/png") return OT.canvasToBlob(canvas, type);
    return OT.canvasToBlob(canvas, type, quality);
  }

  async function compress(file, qualityOrOpts = 0.7, formatArg) {
    const opts =
      typeof qualityOrOpts === "object" && qualityOrOpts !== null
        ? qualityOrOpts
        : { quality: qualityOrOpts, format: formatArg };

    let quality = opts.quality != null ? Number(opts.quality) : 0.72;
    if (quality > 1) quality = quality / 100;
    quality = Math.min(0.98, Math.max(0.2, quality));

    const maxEdge = opts.maxEdge > 0 ? Math.round(opts.maxEdge) : 0;
    const drawOpts = maxEdge ? { maxW: maxEdge, maxH: maxEdge } : {};
    const { canvas, width, height } = await drawToCanvas(file, drawOpts);
    const { type, ext, key } = await resolveCompressType(opts.format, file.name);

    let blob;
    let usedQ = type === "image/png" ? null : quality;

    if (opts.targetBytes > 0 && type !== "image/png") {
      let lo = 0.28;
      let hi = Math.min(0.95, Math.max(quality, 0.5));
      blob = await encodeCanvas(canvas, type, hi);
      usedQ = hi;
      if (blob.size > opts.targetBytes) {
        for (let i = 0; i < 7; i++) {
          const mid = (lo + hi) / 2;
          const trial = await encodeCanvas(canvas, type, mid);
          if (trial.size > opts.targetBytes) {
            hi = mid;
          } else {
            lo = mid;
            blob = trial;
            usedQ = mid;
          }
        }
        if (!blob || blob.size > opts.targetBytes) {
          blob = await encodeCanvas(canvas, type, lo);
          usedQ = lo;
        }
      }
    } else {
      blob = await encodeCanvas(canvas, type, quality);
    }

    // Nếu nén xong lại lớn hơn gốc (PNG lossless / JPG đã tối ưu) — giữ bản nhỏ hơn
    if (blob.size >= file.size && !maxEdge && key !== "png") {
      const fallbackQ = Math.max(0.35, (usedQ || quality) * 0.82);
      const retry = await encodeCanvas(canvas, type, fallbackQ);
      if (retry.size < blob.size) {
        blob = retry;
        usedQ = fallbackQ;
      }
    }

    const saved = Math.max(0, file.size - blob.size);
    const ratio = file.size > 0 ? saved / file.size : 0;

    return {
      blob,
      fileName: OT.nameWithSuffix(file.name, "-compressed", ext),
      contentType: type,
      format: key,
      quality: usedQ,
      width,
      height,
      before: file.size,
      after: blob.size,
      saved,
      ratio
    };
  }

  let mpSegmenter = null;
  let mpDeepLab = null;
  let mpLoading = null;
  let mpDeepLoading = null;
  let mpRuntime = null;
  let imglyMod = null;

  function deviceTier() {
    const ua = navigator.userAgent || "";
    const mobile =
      /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
      (navigator.maxTouchPoints > 0 && window.matchMedia("(max-width: 900px)").matches);
    const mem = typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : null;
    if (mobile) return mem && mem <= 3 ? "mobile-low" : "mobile";
    if (mem && mem <= 4) return "desktop-low";
    return "desktop";
  }

  const BG_TIER = {
    desktop: { maxEdge: 1600, maxMb: 12, models: ["isnet_fp16"], refine: true },
    "desktop-low": { maxEdge: 1200, maxMb: 10, models: ["isnet_quint8"], refine: true },
    mobile: { maxEdge: 900, maxMb: 8, models: ["isnet_quint8"], refine: false },
    "mobile-low": { maxEdge: 720, maxMb: 6, models: ["isnet_quint8"], refine: false }
  };

  function bgConfig(tier) {
    return BG_TIER[tier] || BG_TIER.mobile;
  }

  /** Thu nhỏ ảnh trước khi chạy AI — tránh crash tab trên mobile. */
  async function prepareFileForBgRemoval(file, tier) {
    const cfg = bgConfig(tier);
    const img = await OT.loadImage(file);
    const edge = Math.max(img.naturalWidth, img.naturalHeight);
    if (edge <= cfg.maxEdge) return file;
    onProgressHint?.(`Thu nhỏ ảnh xuống ~${cfg.maxEdge}px để xử lý ổn định…`);
    const { canvas } = await drawToCanvas(file, { maxW: cfg.maxEdge, maxH: cfg.maxEdge });
    const blob = await OT.canvasToBlob(canvas, "image/jpeg", 0.9);
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  }

  let onProgressHint = null;

  async function loadImgly() {
    if (imglyMod) return imglyMod;
    const urls = [
      "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.8/+esm",
      "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm",
      "https://esm.sh/@imgly/background-removal@1.5.8"
    ];
    let lastErr;
    for (const u of urls) {
      try {
        imglyMod = await import(/* @vite-ignore */ u);
        return imglyMod;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Không tải được model xóa nền.");
  }

  async function resolveImglyPublicPath() {
    const candidates = [
      "https://staticimgly.com/@imgly/background-removal-data/1.5.8/dist/",
      "https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/"
    ];
    for (const publicPath of candidates) {
      try {
        const res = await fetch(publicPath + "resources.json", { method: "GET" });
        if (res.ok) return publicPath;
      } catch (_) {}
    }
    return candidates[0];
  }

  function withTimeout(promise, ms, label) {
    let t;
    const timeout = new Promise((_, reject) => {
      t = setTimeout(() => reject(new Error(label || "Hết thời gian chờ model.")), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
  }

  async function removeBackgroundImgly(file, onProgress, tier = "desktop") {
    const cfg = bgConfig(tier);
    onProgress?.("Đang tải model AI (lần đầu ~15–40s, lần sau nhanh hơn)…");
    const mod = await loadImgly();
    const removeBg =
      mod.removeBackground ||
      mod.default?.removeBackground ||
      (typeof mod.default === "function" ? mod.default : null);
    if (!removeBg) throw new Error("API xóa nền không hợp lệ.");

    const publicPath = await resolveImglyPublicPath();
    const model = (cfg.models && cfg.models[0]) || "isnet_quint8";
    const hasWebGpu = typeof navigator !== "undefined" && !!navigator.gpu;
    const device = tier.startsWith("mobile") || !hasWebGpu ? "cpu" : "gpu";
    const attempts = device === "gpu" ? ["gpu", "cpu"] : ["cpu"];
    let lastErr;

    for (const dev of attempts) {
      try {
        onProgress?.(dev === "gpu" ? "Đang xóa nền (GPU)…" : "Đang xóa nền…");
        const blob = await withTimeout(
          removeBg(file, {
            publicPath,
            debug: false,
            device: dev,
            model,
            output: { format: "image/png", quality: 1, type: "foreground" },
            progress: (_key, current, total) => {
              if (!total) return;
              const pct = Math.max(1, Math.min(99, Math.round((current / total) * 100)));
              onProgress?.(`Đang xóa nền… ${pct}%`);
            }
          }),
          tier.startsWith("mobile") ? 120000 : 150000,
          "Model quá lâu — thử lại hoặc dùng ảnh nhỏ hơn."
        );
        if (blob instanceof Blob && blob.size > 0) return blob;
      } catch (e) {
        lastErr = e;
        onProgress?.(dev === "gpu" ? "GPU lỗi — chuyển CPU…" : null);
      }
    }
    throw lastErr || new Error("Model không trả về ảnh PNG.");
  }

  /** Làm mượt cạnh alpha bằng Canvas blur (ổn định hơn tự viết kernel). */
  function softenMaskCanvas(maskCanvas, blurPx) {
    const w = maskCanvas.width;
    const h = maskCanvas.height;
    const soft = document.createElement("canvas");
    soft.width = w;
    soft.height = h;
    const sctx = soft.getContext("2d");
    sctx.filter = `blur(${Math.max(0.6, blurPx)}px)`;
    sctx.drawImage(maskCanvas, 0, 0);
    sctx.filter = "none";
    return soft;
  }

  /**
   * Hậu xử lý PNG: đóng lỗ mask (nối manh mún) + làm mềm mép.
   */
  async function refineCutoutBlob(blob, opts = {}) {
    const closeR = opts.closeRadius != null ? opts.closeRadius : 4;
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w < 2 || h < 2) return blob;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: true });
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0);

      const image = ctx.getImageData(0, 0, w, h);
      const d = image.data;
      const n = w * h;
      const bin = new Uint8Array(n);
      for (let i = 0; i < n; i++) bin[i] = d[i * 4 + 3] > 72 ? 1 : 0;

      if (closeR > 0) {
        const closed = morphClose(bin, w, h, closeR);
        const r = Math.max(1, closeR);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const o = i * 4;
            if (closed[i] && d[o + 3] < 72) {
              let br = 0;
              let bg = 0;
              let bb = 0;
              let bn = 0;
              const y0 = Math.max(0, y - r);
              const y1 = Math.min(h - 1, y + r);
              const x0 = Math.max(0, x - r);
              const x1 = Math.min(w - 1, x + r);
              for (let yy = y0; yy <= y1; yy++) {
                for (let xx = x0; xx <= x1; xx++) {
                  const j = (yy * w + xx) * 4;
                  if (d[j + 3] > 120) {
                    br += d[j];
                    bg += d[j + 1];
                    bb += d[j + 2];
                    bn++;
                  }
                }
              }
              if (bn) {
                d[o] = Math.round(br / bn);
                d[o + 1] = Math.round(bg / bn);
                d[o + 2] = Math.round(bb / bn);
                d[o + 3] = 230;
              }
            } else if (!closed[i] && d[o + 3] < 90) {
              d[o + 3] = 0;
            }
          }
        }
      }

      const alphaCanvas = document.createElement("canvas");
      alphaCanvas.width = w;
      alphaCanvas.height = h;
      const actx = alphaCanvas.getContext("2d");
      const aImg = actx.createImageData(w, h);
      for (let i = 0; i < n; i++) {
        const p = i * 4;
        aImg.data[p] = aImg.data[p + 1] = aImg.data[p + 2] = 255;
        aImg.data[p + 3] = d[p + 3];
      }
      actx.putImageData(aImg, 0, 0);
      const blurPx = Math.max(0.7, Math.min(2.2, Math.min(w, h) / 480));
      const softMask = softenMaskCanvas(alphaCanvas, blurPx);
      const softData = softMask.getContext("2d").getImageData(0, 0, w, h).data;

      for (let i = 0; i < n; i++) {
        d[i * 4 + 3] = Math.round(smoothstep(6, 240, softData[i * 4 + 3]) * 255);
      }

      ctx.putImageData(image, 0, 0);
      return OT.canvasToBlob(canvas, "image/png");
    } catch (_) {
      return blob;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function morphClose(bin, w, h, radius) {
    return morphErode(morphDilate(bin, w, h, radius), w, h, radius);
  }

  function morphDilate(bin, w, h, radius) {
    const out = new Uint8Array(w * h);
    const r = Math.max(1, radius | 0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let on = 0;
        const y0 = Math.max(0, y - r);
        const y1 = Math.min(h - 1, y + r);
        const x0 = Math.max(0, x - r);
        const x1 = Math.min(w - 1, x + r);
        outer: for (let yy = y0; yy <= y1; yy++) {
          for (let xx = x0; xx <= x1; xx++) {
            if (bin[yy * w + xx]) {
              on = 1;
              break outer;
            }
          }
        }
        out[y * w + x] = on;
      }
    }
    return out;
  }

  function morphErode(bin, w, h, radius) {
    const out = new Uint8Array(w * h);
    const r = Math.max(1, radius | 0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let on = 1;
        const y0 = Math.max(0, y - r);
        const y1 = Math.min(h - 1, y + r);
        const x0 = Math.max(0, x - r);
        const x1 = Math.min(w - 1, x + r);
        outer: for (let yy = y0; yy <= y1; yy++) {
          for (let xx = x0; xx <= x1; xx++) {
            if (!bin[yy * w + xx]) {
              on = 0;
              break outer;
            }
          }
        }
        out[y * w + x] = on;
      }
    }
    return out;
  }

  function loadBlobImage(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Không đọc mask"));
      };
      img.src = url;
    });
  }

  /** Gộp nhiều mask — giữ alpha lớn nhất từng pixel. */
  async function unionCutoutBlobs(...blobs) {
    const list = blobs.filter(Boolean);
    if (!list.length) return null;
    if (list.length === 1) return list[0];
    const imgs = await Promise.all(list.map(loadBlobImage));
    const w = Math.max(...imgs.map((i) => i.naturalWidth));
    const h = Math.max(...imgs.map((i) => i.naturalHeight));
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d", { willReadFrequently: true });
    const acc = ctx.createImageData(w, h);
    const ad = acc.data;

    for (const img of imgs) {
      const tmp = document.createElement("canvas");
      tmp.width = w;
      tmp.height = h;
      const tctx = tmp.getContext("2d", { willReadFrequently: true });
      tctx.clearRect(0, 0, w, h);
      tctx.drawImage(img, 0, 0, w, h);
      const td = tctx.getImageData(0, 0, w, h).data;
      for (let i = 0; i < ad.length; i += 4) {
        if (td[i + 3] > ad[i + 3]) {
          ad[i] = td[i];
          ad[i + 1] = td[i + 1];
          ad[i + 2] = td[i + 2];
          ad[i + 3] = td[i + 3];
        }
      }
    }
    ctx.putImageData(acc, 0, 0);
    return OT.canvasToBlob(out, "image/png");
  }

  /**
   * Áp alpha mask lên ảnh gốc full-res — nét hơn kết quả AI đã bị thu nhỏ.
   */
  async function recompositeOnOriginal(srcImg, maskBlob) {
    const maskImg = await loadBlobImage(maskBlob);
    const w = srcImg.naturalWidth;
    const h = srcImg.naturalHeight;
    if (w < 2 || h < 2) return maskBlob;

    // Morph trên bản thu nhỏ rồi phóng lại — nhanh hơn trên ảnh lớn
    const morphEdge = 1100;
    const edge = Math.max(w, h);
    const scale = edge > morphEdge ? morphEdge / edge : 1;
    const mw = Math.max(1, Math.round(w * scale));
    const mh = Math.max(1, Math.round(h * scale));

    const small = document.createElement("canvas");
    small.width = mw;
    small.height = mh;
    const sctx = small.getContext("2d", { willReadFrequently: true });
    sctx.clearRect(0, 0, mw, mh);
    sctx.drawImage(maskImg, 0, 0, mw, mh);
    const mid = sctx.getImageData(0, 0, mw, mh);
    const md = mid.data;
    const n = mw * mh;
    const bin = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const a = md[i * 4 + 3];
      bin[i] = a > 64 ? 1 : 0;
      md[i * 4] = md[i * 4 + 1] = md[i * 4 + 2] = 255;
    }
    const closeR = Math.min(7, Math.max(2, Math.round(Math.min(mw, mh) / 160)));
    const closed = morphClose(bin, mw, mh, closeR);
    for (let i = 0; i < n; i++) {
      if (closed[i]) md[i * 4 + 3] = Math.max(md[i * 4 + 3], 235);
      else if (md[i * 4 + 3] < 100) md[i * 4 + 3] = 0;
    }
    sctx.putImageData(mid, 0, 0);

    const blurPx = Math.max(0.7, Math.min(2.2, Math.min(mw, mh) / 420));
    const softSmall = softenMaskCanvas(small, blurPx);

    const mask = document.createElement("canvas");
    mask.width = w;
    mask.height = h;
    const mctx = mask.getContext("2d");
    mctx.imageSmoothingEnabled = true;
    mctx.imageSmoothingQuality = "high";
    mctx.clearRect(0, 0, w, h);
    mctx.drawImage(softSmall, 0, 0, w, h);

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d", { alpha: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(srcImg, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    return OT.canvasToBlob(out, "image/png");
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  async function loadMpRuntime(onProgress) {
    if (mpRuntime) return mpRuntime;
    onProgress?.("Đang tải engine xóa nền…");
    const urls = [
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/+esm",
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm"
    ];
    let mod;
    let lastErr;
    for (const u of urls) {
      try {
        mod = await import(/* @vite-ignore */ u);
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!mod?.FilesetResolver || !mod?.ImageSegmenter) {
      throw lastErr || new Error("Không tải được model xóa nền.");
    }
    const wasmPath = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
    const vision = await mod.FilesetResolver.forVisionTasks(wasmPath);
    mpRuntime = { mod, vision };
    return mpRuntime;
  }

  async function createSegmenter(modelUrl, onProgress, preferCpu, extra) {
    const { mod, vision } = await loadMpRuntime(onProgress);
    onProgress?.("Đang khởi tạo model…");
    const delegates = preferCpu ? ["CPU", "GPU"] : ["GPU", "CPU"];
    let lastErr;
    for (const delegate of delegates) {
      try {
        return await mod.ImageSegmenter.createFromOptions(vision, {
          baseOptions: { modelAssetPath: modelUrl, delegate },
          runningMode: "IMAGE",
          outputCategoryMask: true,
          outputConfidenceMasks: extra?.confidence !== false,
          ...extra?.opts
        });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Không khởi tạo được model.");
  }

  async function loadMediaPipeSegmenter(onProgress, preferCpu = false) {
    if (mpSegmenter) return mpSegmenter;
    if (mpLoading) return mpLoading;
    mpLoading = createSegmenter(
      "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
      onProgress,
      preferCpu
    )
      .then((s) => {
        mpSegmenter = s;
        return s;
      })
      .catch((e) => {
        mpLoading = null;
        throw e;
      });
    return mpLoading;
  }

  async function loadDeepLabSegmenter(onProgress, preferCpu = false) {
    if (mpDeepLab) return mpDeepLab;
    if (mpDeepLoading) return mpDeepLoading;
    mpDeepLoading = createSegmenter(
      "https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite",
      onProgress,
      preferCpu,
      { confidence: false }
    )
      .then((s) => {
        mpDeepLab = s;
        return s;
      })
      .catch((e) => {
        mpDeepLoading = null;
        throw e;
      });
    return mpDeepLoading;
  }

  function readMaskFloat(mask) {
    if (!mask) return null;
    if (mask.getAsFloat32Array) {
      try {
        return mask.getAsFloat32Array();
      } catch (_) {}
    }
    if (mask.getAsUint8Array) {
      const u8 = mask.getAsUint8Array();
      const out = new Float32Array(u8.length);
      for (let i = 0; i < u8.length; i++) out[i] = u8[i] / 255;
      return out;
    }
    return null;
  }

  function centerMean(data, mw, mh, invert) {
    let sum = 0;
    let n = 0;
    const x0 = Math.floor(mw * 0.35);
    const x1 = Math.floor(mw * 0.65);
    const y0 = Math.floor(mh * 0.25);
    const y1 = Math.floor(mh * 0.75);
    for (let y = y0; y < y1; y += 3) {
      for (let x = x0; x < x1; x += 3) {
        let t = data[y * mw + x];
        if (t > 1) t /= 255;
        if (invert) t = 1 - t;
        sum += t;
        n++;
      }
    }
    return n ? sum / n : 0;
  }

  function extractPersonMask(result) {
    const candidates = [];

    (result.confidenceMasks || []).forEach((m, idx) => {
      const data = readMaskFloat(m);
      if (!data) return;
      const mean = centerMean(data, m.width, m.height, false);
      const meanInv = centerMean(data, m.width, m.height, true);
      candidates.push({
        data,
        w: m.width,
        h: m.height,
        score: mean,
        invert: false,
        label: "conf-" + idx
      });
      candidates.push({
        data,
        w: m.width,
        h: m.height,
        score: meanInv,
        invert: true,
        label: "conf-" + idx + "-inv"
      });
    });

    if (result.categoryMask) {
      const m = result.categoryMask;
      const u8 = m.getAsUint8Array();
      const data = new Float32Array(u8.length);
      for (let i = 0; i < u8.length; i++) data[i] = u8[i] > 0 ? 1 : 0;
      const mean = centerMean(data, m.width, m.height, false);
      const meanInv = centerMean(data, m.width, m.height, true);
      candidates.push({ data, w: m.width, h: m.height, score: mean, invert: false, label: "cat" });
      candidates.push({ data, w: m.width, h: m.height, score: meanInv, invert: true, label: "cat-inv" });
    }

    if (!candidates.length) return null;
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (best.score < 0.12) return null;
    return best;
  }

  function extractDeepLabPersonMask(result) {
    const m = result.categoryMask;
    if (!m) return null;
    const u8 = m.getAsUint8Array();
    const data = new Float32Array(u8.length);
    let person = 0;
    for (let i = 0; i < u8.length; i++) {
      const on = u8[i] === 15;
      data[i] = on ? 1 : 0;
      if (on) person++;
    }
    const coverage = person / Math.max(1, u8.length);
    if (coverage < 0.008) return null;
    return { data, w: m.width, h: m.height, invert: false, coverage };
  }

  function maskToCanvas(person) {
    const srcMask = document.createElement("canvas");
    srcMask.width = person.w;
    srcMask.height = person.h;
    const sctx = srcMask.getContext("2d");
    const sid = sctx.createImageData(person.w, person.h);
    const sd = sid.data;
    for (let i = 0; i < person.data.length; i++) {
      let t = person.data[i];
      if (t > 1) t /= 255;
      if (person.invert) t = 1 - t;
      const p = i * 4;
      sd[p] = sd[p + 1] = sd[p + 2] = 255;
      sd[p + 3] = Math.round(Math.max(0, Math.min(1, t)) * 255);
    }
    sctx.putImageData(sid, 0, 0);
    return srcMask;
  }

  async function segmentToPng(img, person, outW, outH) {
    const srcMask = maskToCanvas(person);
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = outW;
    maskCanvas.height = outH;
    const mctx = maskCanvas.getContext("2d");
    mctx.imageSmoothingEnabled = true;
    mctx.imageSmoothingQuality = "high";
    mctx.drawImage(srcMask, 0, 0, outW, outH);
    const blurPx = Math.max(1.2, Math.min(outW, outH) / 280);
    const softMask = softenMaskCanvas(maskCanvas, blurPx);

    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext("2d", { alpha: true });
    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(img, 0, 0, outW, outH);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(softMask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    return OT.canvasToBlob(out, "image/png");
  }

  async function runSegmenter(segmenter, inferCanvas) {
    let input = inferCanvas;
    try {
      if (typeof createImageBitmap === "function") input = await createImageBitmap(inferCanvas);
    } catch (_) {
      input = inferCanvas;
    }
    const result = await new Promise((resolve, reject) => {
      try {
        segmenter.segment(input, (res) => resolve(res));
      } catch (e) {
        reject(e);
      }
    });
    try {
      input.close?.();
    } catch (_) {}
    return result;
  }

  async function removeBackgroundMediaPipe(file, onProgress, tier = "desktop", kind = "selfie") {
    onProgress?.("Đang chuẩn bị ảnh…");
    const img = await OT.loadImage(file);
    const maxEdge = kind === "person"
      ? (tier.startsWith("mobile") ? 512 : 720)
      : (tier.startsWith("mobile") ? bgConfig(tier).maxEdge : 1280);
    const edge = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = edge > maxEdge ? maxEdge / edge : 1;
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const infer = document.createElement("canvas");
    infer.width = w;
    infer.height = h;
    infer.getContext("2d").drawImage(img, 0, 0, w, h);

    const preferCpu = tier.startsWith("mobile");
    let person = null;

    if (kind === "person") {
      onProgress?.("Đang tìm người trong ảnh…");
      const deeplab = await loadDeepLabSegmenter(onProgress, preferCpu);
      const result = await runSegmenter(deeplab, infer);
      person = extractDeepLabPersonMask(result);
      try {
        result.categoryMask?.close?.();
        result.confidenceMasks?.forEach((m) => m.close?.());
      } catch (_) {}
      if (!person) throw new Error("Không thấy người rõ trong ảnh.");
    } else {
      const segmenter = await loadMediaPipeSegmenter(onProgress, preferCpu);
      onProgress?.("Đang tách chủ thể…");
      const result = await runSegmenter(segmenter, infer);
      person = extractPersonMask(result);
      try {
        result.categoryMask?.close?.();
        result.confidenceMasks?.forEach((m) => m.close?.());
      } catch (_) {}
      if (!person) throw new Error("Không tách được chủ thể.");
    }

    onProgress?.("Đang xuất PNG…");
    return segmentToPng(img, person, w, h);
  }

  async function looksLikeWhiteSilhouette(blob) {
    try {
      const url = URL.createObjectURL(blob);
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      URL.revokeObjectURL(url);
      const c = document.createElement("canvas");
      const tw = Math.min(64, img.naturalWidth);
      const th = Math.min(64, img.naturalHeight);
      c.width = tw;
      c.height = th;
      const cx = c.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0, tw, th);
      const d = cx.getImageData(0, 0, tw, th).data;
      let opaque = 0;
      let nearWhite = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 40) continue;
        opaque++;
        if (d[i] > 230 && d[i + 1] > 230 && d[i + 2] > 230) nearWhite++;
      }
      return opaque > 20 && nearWhite / opaque > 0.85;
    } catch (_) {
      return false;
    }
  }

  function medianByte(arr) {
    const a = arr.slice().sort((x, y) => x - y);
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
  }

  function rgbDist(r, g, b, br, bg, bb) {
    const dr = r - br;
    const dg = g - bg;
    const db = b - bb;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function sampleCornerMedian(data, w, h, size) {
    const patches = [
      [0, 0],
      [w - size, 0],
      [0, h - size],
      [w - size, h - size]
    ];
    const rs = [];
    const gs = [];
    const bs = [];
    patches.forEach(([sx, sy]) => {
      for (let y = sy; y < sy + size; y++) {
        for (let x = sx; x < sx + size; x++) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < 8) continue;
          rs.push(data[i]);
          gs.push(data[i + 1]);
          bs.push(data[i + 2]);
        }
      }
    });
    if (rs.length < 8) return { r: 255, g: 255, b: 255, ok: false };
    return {
      r: medianByte(rs),
      g: medianByte(gs),
      b: medianByte(bs),
      ok: true
    };
  }

  function analyzeGraphicBg(img) {
    const tw = Math.min(160, img.naturalWidth);
    const th = Math.min(160, img.naturalHeight);
    const c = document.createElement("canvas");
    c.width = tw;
    c.height = th;
    const cx = c.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, tw, th);
    const { data } = cx.getImageData(0, 0, tw, th);
    const corner = sampleCornerMedian(data, tw, th, Math.max(4, Math.floor(Math.min(tw, th) * 0.08)));
    const bg = corner;
    let near = 0;
    let n = 0;
    const seen = new Set();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 8) continue;
      n++;
      const d = rgbDist(data[i], data[i + 1], data[i + 2], bg.r, bg.g, bg.b);
      if (d < 38) near++;
      const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
      seen.add(key);
    }
    const bgFrac = n ? near / n : 0;
    const unique = seen.size;
    // Chỉ coi là logo khi nền trơn rõ (tránh nhầm ảnh tối / ảnh phức tạp)
    const likely = corner.ok && bgFrac >= 0.38 && unique <= 64;
    const confidence =
      Math.min(1, (bgFrac - 0.28) * 2.2 + (unique <= 40 ? 0.3 : unique <= 56 ? 0.12 : 0));
    return { likely, confidence, bg, bgFrac, unique };
  }

  async function removeBackgroundGraphic(img, info, onProgress) {
    onProgress?.("Xóa nền logo / chữ (theo màu phông)…");
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: true });
    ctx.drawImage(img, 0, 0);
    const image = ctx.getImageData(0, 0, w, h);
    const d = image.data;
    const bg = info.bg;
    const t0 = 18;
    const t1 = 52;

    for (let i = 0; i < d.length; i += 4) {
      const dist = rgbDist(d[i], d[i + 1], d[i + 2], bg.r, bg.g, bg.b);
      let a;
      if (dist <= t0) a = 0;
      else if (dist >= t1) a = 255;
      else a = Math.round(((dist - t0) / (t1 - t0)) * 255);
      d[i + 3] = Math.min(d[i + 3], a);
    }

    ctx.putImageData(image, 0, 0);
    return OT.canvasToBlob(canvas, "image/png");
  }

  async function removeBackground(file, { onProgress } = {}) {
    if (location.protocol === "file:") {
      throw new Error("Xóa nền cần chạy qua HTTP (IIS / Live Server).");
    }

    const tier = deviceTier();
    const cfg = bgConfig(tier);
    onProgressHint = (msg) => onProgress?.(msg);

    if (file.size > cfg.maxMb * 1024 * 1024) {
      throw new Error(
        tier.startsWith("mobile")
          ? `Ảnh quá lớn trên điện thoại (tối đa ${cfg.maxMb}MB). Thử ảnh nhỏ hơn hoặc resize trước.`
          : `Ảnh quá lớn (tối đa ${cfg.maxMb}MB).`
      );
    }

    const workImg = await OT.loadImage(file);
    const graphic = analyzeGraphicBg(workImg);
    // Logo / chữ nền trơn → chroma; còn lại → AI (một nút, tự nhận)
    const wantLogo = graphic.likely && graphic.confidence >= 0.55;

    const t0 = performance.now();
    let blob = null;
    let engine = "chroma";

    if (wantLogo) {
      onProgress?.("Nhận diện logo / chữ — xóa phông theo màu…");
      blob = await removeBackgroundGraphic(workImg, graphic, onProgress);
      engine = "chroma";
    } else {
      onProgressHint = null;
      onProgress?.("Đang tách nền bằng AI…");

      const masks = [];

      try {
        const prepared = await prepareFileForBgRemoval(file, tier);
        let imglyBlob = await removeBackgroundImgly(prepared, onProgress, tier);
        if (await looksLikeWhiteSilhouette(imglyBlob)) imglyBlob = null;
        if (imglyBlob) masks.push(imglyBlob);
      } catch (e) {
        console.warn("[remove-bg] imgly:", e);
      }

      if (!tier.startsWith("mobile-low")) {
        try {
          onProgress?.("Bổ sung vùng người…");
          let personBlob = await removeBackgroundMediaPipe(file, onProgress, tier, "person");
          if (await looksLikeWhiteSilhouette(personBlob)) personBlob = null;
          if (personBlob) masks.push(personBlob);
        } catch (e) {
          console.warn("[remove-bg] person mask:", e);
        }
      }

      // Nếu mask còn mỏng, thử thêm selfie segmenter
      if (masks.length < 2 && !tier.startsWith("mobile")) {
        try {
          onProgress?.("Bổ sung chủ thể…");
          let selfieBlob = await removeBackgroundMediaPipe(file, onProgress, tier, "selfie");
          if (await looksLikeWhiteSilhouette(selfieBlob)) selfieBlob = null;
          if (selfieBlob) masks.push(selfieBlob);
        } catch (e) {
          console.warn("[remove-bg] selfie:", e);
        }
      }

      if (!masks.length) {
        throw new Error("Không tách được nền. Thử ảnh rõ chủ thể hơn hoặc logo nền trơn.");
      }

      onProgress?.(masks.length > 1 ? "Gộp mask…" : "Ghép lên ảnh gốc…");
      blob = await unionCutoutBlobs(...masks);
      engine = masks.length > 1 ? "multi" : "ai";

      onProgress?.("Làm sạch cạnh…");
      blob = await recompositeOnOriginal(workImg, blob);
    }

    onProgressHint = null;

    const sec = ((performance.now() - t0) / 1000).toFixed(1);
    onProgress?.(`Xong trong ~${sec}s`);
    return {
      blob,
      fileName: OT.nameWithSuffix(file.name, "-no-bg", ".png"),
      contentType: "image/png",
      engine,
      tier
    };
  }

  async function batch(files, mode, opts = {}) {
    const results = [];
    for (const file of files) {
      let r;
      if (mode === "convert") r = await convert(file, opts.format || "png", opts.quality);
      else if (mode === "resize") r = await resize(file, opts, opts.format);
      else r = await compress(file, opts.quality ?? 0.7, opts.format);
      results.push(r);
    }
    return results;
  }

  return { convert, resize, compress, removeBackground, batch, drawToCanvas, MIME };
})();
