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
    desktop: { maxEdge: 1920, maxMb: 14, models: ["isnet_fp16", "isnet_quint8"], refine: true },
    "desktop-low": { maxEdge: 1400, maxMb: 12, models: ["isnet_fp16", "isnet_quint8"], refine: true },
    mobile: { maxEdge: 1100, maxMb: 8, models: ["isnet_quint8"], refine: true },
    "mobile-low": { maxEdge: 840, maxMb: 6, models: ["isnet_quint8"], refine: true }
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
    const blob = await OT.canvasToBlob(canvas, "image/png");
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".png", { type: "image/png" });
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
    const models = (cfg.models && cfg.models.length ? cfg.models : ["isnet_quint8"]).slice();
    const hasWebGpu = typeof navigator !== "undefined" && !!navigator.gpu;
    const device = tier.startsWith("mobile") || !hasWebGpu ? "cpu" : "gpu";
    const attempts = device === "gpu" ? ["gpu", "cpu"] : ["cpu"];
    let lastErr;

    for (const model of models) {
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
    const r = Math.max(1, radius | 0);
    // Lặp radius lần với kernel 3×3 — O(w·h·r) thay vì O(w·h·r²)
    if (r > 2) {
      let cur = bin;
      for (let t = 0; t < r; t++) cur = morphDilate(cur, w, h, 1);
      return cur;
    }
    const out = new Uint8Array(w * h);
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
    const r = Math.max(1, radius | 0);
    if (r > 2) {
      let cur = bin;
      for (let t = 0; t < r; t++) cur = morphErode(cur, w, h, 1);
      return cur;
    }
    const out = new Uint8Array(w * h);
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

  /** Gộp mask phụ chỉ trong vùng gần mask chính — tránh lấp khe tay/đầu bằng blob MediaPipe. */
  async function unionCutoutBlobs(primary, ...extras) {
    const list = [primary, ...extras].filter(Boolean);
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

      const tmp = document.createElement("canvas");
      tmp.width = w;
      tmp.height = h;
      const tctx = tmp.getContext("2d", { willReadFrequently: true });

    // Mask chính
    tctx.clearRect(0, 0, w, h);
    tctx.drawImage(imgs[0], 0, 0, w, h);
    const primaryData = tctx.getImageData(0, 0, w, h).data;
    ad.set(primaryData);

    const n = w * h;
    const guide = new Uint8Array(n);
    for (let i = 0; i < n; i++) guide[i] = primaryData[i * 4 + 3] > 40 ? 1 : 0;
    // Cho phép vá lỗ nhỏ trong người, không lan ra khe lớn
    const support = morphDilate(guide, w, h, Math.max(2, Math.round(Math.min(w, h) / 220)));

    for (let mi = 1; mi < imgs.length; mi++) {
      tctx.clearRect(0, 0, w, h);
      tctx.drawImage(imgs[mi], 0, 0, w, h);
      const td = tctx.getImageData(0, 0, w, h).data;
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        if (!support[i]) continue;
        if (td[o + 3] > ad[o + 3]) {
          ad[o] = td[o];
          ad[o + 1] = td[o + 1];
          ad[o + 2] = td[o + 2];
          ad[o + 3] = td[o + 3];
        }
      }
    }
    ctx.putImageData(acc, 0, 0);
    return OT.canvasToBlob(out, "image/png");
  }

  /** Max-alpha: vá lỗ váy/áo trắng khi imgly thủng trên phông studio. */
  async function maxAlphaCutouts(...blobs) {
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
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext("2d", { willReadFrequently: true });

    for (const img of imgs) {
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

  function isLightStudioBackground(img) {
    const tw = Math.min(120, img.naturalWidth);
    const th = Math.min(120, img.naturalHeight);
    const c = document.createElement("canvas");
    c.width = tw;
    c.height = th;
    const cx = c.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, tw, th);
    const { data } = cx.getImageData(0, 0, tw, th);
    const bg = sampleCornerMedian(data, tw, th, Math.max(4, Math.floor(Math.min(tw, th) * 0.08)));
    if (!bg.ok) return false;
    // Trời xanh nhạt ≠ studio xám — vẫn cần đục khe tóc
    if (isSkyLikeBg(bg)) return false;
    const bgL = (bg.r + bg.g + bg.b) / 3;
    const chroma = Math.max(bg.r, bg.g, bg.b) - Math.min(bg.r, bg.g, bg.b);
    return bgL >= 185 && chroma <= 32;
  }

  function isSkyLikeBg(bg) {
    if (!bg || bg.ok === false) return false;
    // Xanh / xanh dương rõ, kể cả trời nhạt
    return bg.b >= bg.r + 8 && bg.b >= bg.g + 2 && bg.b >= 120;
  }

  /**
   * Đục cứng mọi pixel màu trời. Bảo vệ da / tóc tối / váy-hoa trắng.
   */
  function forcePunchSkyPixels(cutout, srcData, w, h) {
    const d = cutout.data;
    const bg = sampleCornerMedian(srcData, w, h, Math.max(4, Math.floor(Math.min(w, h) * 0.05)));
    if (!bg.ok || !isSkyLikeBg(bg)) return false;

    const thr = Math.min(48, Math.max(28, estimateBgThreshold(srcData, w, h, bg) + 8));
    const bgL = (bg.r + bg.g + bg.b) / 3;

    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      if (d[o + 3] < 4) continue;
      const r = srcData[o];
      const g = srcData[o + 1];
      const b = srcData[o + 2];
      if (isSubjectProtectPixel(r, g, b)) continue;
      if (!isSkyPixel(r, g, b, bg, thr, bgL)) continue;
      d[o] = d[o + 1] = d[o + 2] = 0;
      d[o + 3] = 0;
    }
    return true;
  }

  /** Da, tóc tối, váy/hoa trắng — không bao giờ đục theo màu trời. */
  function isSubjectProtectPixel(r, g, b) {
    if (isSkinTone(r, g, b)) return true;
    const lum = (r + g + b) / 3;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    // Váy / hoa / highlight sáng
    if (lum >= 170 && chroma <= 45 && b <= Math.max(r, g) + 18) return true;
    // Tóc / đồ tối
    if (lum <= 105 && !(b > r + 22 && b > g + 18)) return true;
    return false;
  }

  function isSkyPixel(r, g, b, bg, thr, bgL) {
    const dist = rgbDist(r, g, b, bg.r, bg.g, bg.b);
    if (dist <= thr) return true;
    const lum = (r + g + b) / 3;
    // Phải thiên xanh như trời — tránh ăn pixel váy hơi lạnh
    if (b > r + 14 && b > g + 8 && b >= 125 && Math.abs(lum - bgL) <= 50 && dist <= thr * 1.65) {
      return true;
    }
    return false;
  }

  /**
   * Pipeline riêng nền trời: mask AI (+ người) rồi chroma-key trời trên ảnh gốc.
   */
  async function recompositeSkyCutout(srcImg, maskBlob) {
    const maskImg = await loadBlobImage(maskBlob);
    const w = srcImg.naturalWidth;
    const h = srcImg.naturalHeight;
    if (w < 2 || h < 2) return maskBlob;

    const srcFull = document.createElement("canvas");
    srcFull.width = w;
    srcFull.height = h;
    const sfctx = srcFull.getContext("2d", { willReadFrequently: true });
    sfctx.drawImage(srcImg, 0, 0);
    const srcPixels = sfctx.getImageData(0, 0, w, h);
    const src = srcPixels.data;

    const maskC = document.createElement("canvas");
    maskC.width = w;
    maskC.height = h;
    const mctx = maskC.getContext("2d", { willReadFrequently: true });
    mctx.clearRect(0, 0, w, h);
    mctx.drawImage(maskImg, 0, 0, w, h);
    const mid = mctx.getImageData(0, 0, w, h);
    const md = mid.data;
    const n = w * h;

    const bg = sampleCornerMedian(src, w, h, Math.max(4, Math.floor(Math.min(w, h) * 0.05)));
    if (!bg.ok) return maskBlob;
    const thr = Math.min(48, Math.max(28, estimateBgThreshold(src, w, h, bg) + 8));
    const bgL = (bg.r + bg.g + bg.b) / 3;

    // Đóng lỗ nhỏ trong người (váy thủng) rồi cứng alpha — không dựa màu
    const bin = new Uint8Array(n);
    for (let i = 0; i < n; i++) bin[i] = md[i * 4 + 3] > 70 ? 1 : 0;
    const closed = morphClose(bin, w, h, Math.min(4, Math.max(2, Math.round(Math.min(w, h) / 220))));
    for (let i = 0; i < n; i++) {
      let a = md[i * 4 + 3];
      if (closed[i] && a < 100) a = 240;
      if (a >= 60) a = Math.min(255, Math.round(a + (255 - a) * 0.55));
      else if (a < 40) a = 0;
      md[i * 4] = md[i * 4 + 1] = md[i * 4 + 2] = 255;
      md[i * 4 + 3] = a;
    }

    // Chroma-key trời: pixel màu trời → alpha 0 (khe tóc / nền / halo)
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      if (md[o + 3] < 4) continue;
      const r = src[o];
      const g = src[o + 1];
      const b = src[o + 2];
      if (isSubjectProtectPixel(r, g, b)) continue;
      if (isSkyPixel(r, g, b, bg, thr, bgL)) {
        md[o + 3] = 0;
      }
    }
    mctx.putImageData(mid, 0, 0);

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d", { willReadFrequently: true, alpha: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(srcImg, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskC, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // Quét lần cuối trên kết quả (bắt sót sau scale)
    const full = ctx.getImageData(0, 0, w, h);
    forcePunchSkyPixels(full, src, w, h);
    // Gỡ halo xanh còn dính trên mép bán trong suốt
    decontaminateFg(full, w, h, src);
    forcePunchSkyPixels(full, src, w, h);
    ctx.putImageData(full, 0, 0);
    return OT.canvasToBlob(out, "image/png");
  }

  function estimateBgThreshold(srcRgb, w, h, bg) {
    let sumD = 0;
    let cnt = 0;
    const strip = Math.max(2, Math.floor(Math.min(w, h) * 0.025));
    for (let x = 0; x < w; x += 3) {
      for (const y of [0, h - 1]) {
        for (let t = 0; t < strip; t++) {
          const yy = y === 0 ? t : h - 1 - t;
          const i = (yy * w + x) * 4;
          sumD += rgbDist(srcRgb[i], srcRgb[i + 1], srcRgb[i + 2], bg.r, bg.g, bg.b);
          cnt++;
        }
      }
    }
    const meanBorder = cnt ? sumD / cnt : 10;
    // Ngưỡng chặt — tránh ăn da / váy sáng trên phông studio
    return Math.max(18, Math.min(36, meanBorder * 2.1 + 14));
  }

  /** Pixel giống phông — trời xanh nới hơn (khe tóc), studio trắng vẫn chặt. */
  function matchesBgColor(r, g, b, bg, thr) {
    const dist = rgbDist(r, g, b, bg.r, bg.g, bg.b);
    if (dist <= thr) return { hit: true, dist };
    const pL = (r + g + b) / 3;
    const bgL = (bg.r + bg.g + bg.b) / 3;
    const skyBg = bg.b > bg.r + 10 && bg.b > bg.g + 4;
    if (skyBg && b > r + 6 && b > g + 2) {
      if (Math.abs(pL - bgL) <= 48 && dist <= thr * 1.55) return { hit: true, dist };
      // Trời trong khe tóc hơi tối hơn mép ảnh
      if (b >= 140 && dist <= thr * 1.75) return { hit: true, dist };
    }
    return { hit: false, dist };
  }

  function isSkinTone(r, g, b) {
    if (r < 60 || g < 30 || b < 15) return false;
    if (r < g || r < b) return false;
    if (r - g < 10) return false;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    if (mx - mn < 15) return false;
    return r > 90 && g > 40 && b < r * 0.95;
  }

  /**
   * Đục khe tóc / hốc tay trên nền tương phản (trời xanh…).
   * Váy trắng không match trời xanh nên an toàn flood theo màu.
   */
  function punchBorderConnectedBg(srcRgb, alphaBytes, w, h) {
    const n = w * h;
    const bg = sampleCornerMedian(srcRgb, w, h, Math.max(4, Math.floor(Math.min(w, h) * 0.06)));
    if (!bg.ok) return alphaBytes;
    const sky = isSkyLikeBg(bg);
    let thr = estimateBgThreshold(srcRgb, w, h, bg);
    if (sky) thr = Math.min(52, thr + 12);
    const out = alphaBytes.slice();

    // 1) Flood từ mép chỉ qua pixel giống phông (trời) — bắt khe tóc nối ra ngoài
    const like = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      if (isSkinTone(srcRgb[o], srcRgb[o + 1], srcRgb[o + 2])) {
        like[i] = 0;
        continue;
      }
      const m = matchesBgColor(srcRgb[o], srcRgb[o + 1], srcRgb[o + 2], bg, thr);
      like[i] = m.hit || alphaBytes[i] < 28 ? 1 : 0;
    }
    const seen = new Uint8Array(n);
    const stack = new Int32Array(n);
    let sp = 0;
    function push(i) {
      if (i < 0 || i >= n || seen[i] || !like[i]) return;
      seen[i] = 1;
      stack[sp++] = i;
    }
    for (let x = 0; x < w; x++) {
      push(x);
      push((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      push(y * w);
      push(y * w + (w - 1));
    }
    while (sp) {
      const i = stack[--sp];
      const x = i % w;
      const y = (i - x) / w;
      if (x > 0) push(i - 1);
      if (x + 1 < w) push(i + 1);
      if (y > 0) push(i - w);
      if (y + 1 < h) push(i + w);
    }
    for (let i = 0; i < n; i++) {
      if (!seen[i]) continue;
      const o = i * 4;
      if (isSkinTone(srcRgb[o], srcRgb[o + 1], srcRgb[o + 2])) continue;
      const m = matchesBgColor(srcRgb[o], srcRgb[o + 1], srcRgb[o + 2], bg, thr);
      if (!m.hit) continue;
      // Flood trời: đục cả khi AI để alpha cao (đúng bug khe tóc)
      const t = Math.max(0, Math.min(1, m.dist / Math.max(1, thr)));
      out[i] = Math.min(out[i], Math.round(t * t * 12));
      if (out[i] < 18) out[i] = 0;
    }

    // 2) Khe tóc kín: giống trời + kề tóc tối — không chặn alpha cao
    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        const i = y * w + x;
        if (out[i] < 10) continue;
        const o = i * 4;
        const r = srcRgb[o];
        const g = srcRgb[o + 1];
        const b = srcRgb[o + 2];
        if (isSkinTone(r, g, b)) continue;
        if (!matchesBgColor(r, g, b, bg, thr).hit) continue;
        let dark = 0;
        let clear = 0;
        let skinN = 0;
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            if (!dx && !dy) continue;
            const j = (y + dy) * w + (x + dx);
            const jo = j * 4;
            if (out[j] < 24 || alphaBytes[j] < 24) {
              clear++;
              continue;
            }
            const rr = srcRgb[jo];
            const gg = srcRgb[jo + 1];
            const bb = srcRgb[jo + 2];
            if (isSkinTone(rr, gg, bb)) {
              skinN++;
              continue;
            }
            const lum = (rr + gg + bb) / 3;
            if (!matchesBgColor(rr, gg, bb, bg, thr).hit && lum < 120) dark++;
          }
        }
        if (skinN >= 4) continue;
        if (dark >= 4 || (dark >= 3 && clear >= 3) || (sky && dark >= 3)) {
          out[i] = 0;
        }
      }
    }

    return out;
  }

  /** Full-res: đục khe tóc / vệt trời còn sót. */
  function cleanBgResidueFull(cutout, srcData, w, h) {
    const d = cutout.data;
    const bg = sampleCornerMedian(srcData, w, h, Math.max(4, Math.floor(Math.min(w, h) * 0.05)));
    if (!bg.ok) return;
    const sky = isSkyLikeBg(bg);
    let thr = estimateBgThreshold(srcData, w, h, bg);
    if (sky) thr = Math.min(54, thr + 14);

    // Flood full-res từ mép qua màu trời
    const n = w * h;
    const like = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      if (isSkinTone(srcData[o], srcData[o + 1], srcData[o + 2])) {
        like[i] = 0;
        continue;
      }
      const m = matchesBgColor(srcData[o], srcData[o + 1], srcData[o + 2], bg, thr);
      like[i] = m.hit || d[o + 3] < 28 ? 1 : 0;
    }
    const seen = new Uint8Array(n);
    const stack = new Int32Array(n);
    let sp = 0;
    function push(i) {
      if (i < 0 || i >= n || seen[i] || !like[i]) return;
      seen[i] = 1;
      stack[sp++] = i;
    }
    for (let x = 0; x < w; x++) {
      push(x);
      push((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      push(y * w);
      push(y * w + (w - 1));
    }
    while (sp) {
      const i = stack[--sp];
      const x = i % w;
      const y = (i - x) / w;
      if (x > 0) push(i - 1);
      if (x + 1 < w) push(i + 1);
      if (y > 0) push(i - w);
      if (y + 1 < h) push(i + w);
    }
    for (let i = 0; i < n; i++) {
      if (!seen[i]) continue;
      const o = i * 4;
      if (d[o + 3] < 6) continue;
      if (isSkinTone(srcData[o], srcData[o + 1], srcData[o + 2])) continue;
      if (!matchesBgColor(srcData[o], srcData[o + 1], srcData[o + 2], bg, thr).hit) continue;
      d[o] = d[o + 1] = d[o + 2] = 0;
      d[o + 3] = 0;
    }

    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        const o = (y * w + x) * 4;
        if (d[o + 3] < 8) continue;
        const r = srcData[o];
        const g = srcData[o + 1];
        const b = srcData[o + 2];
        if (isSkinTone(r, g, b)) continue;
        if (!matchesBgColor(r, g, b, bg, thr).hit) continue;

        let dark = 0;
        let clear = 0;
        let skinN = 0;
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            if (!dx && !dy) continue;
            const j = ((y + dy) * w + (x + dx)) * 4;
            if (d[j + 3] < 24) {
              clear++;
              continue;
            }
            const rr = srcData[j];
            const gg = srcData[j + 1];
            const bb = srcData[j + 2];
            if (isSkinTone(rr, gg, bb)) {
              skinN++;
              continue;
            }
            const lum = (rr + gg + bb) / 3;
            if (!matchesBgColor(rr, gg, bb, bg, thr).hit && lum < 120) dark++;
          }
        }
        if (skinN >= 4) continue;
        if (dark >= 4 || (dark >= 3 && clear >= 2) || (sky && dark >= 3)) {
          d[o] = d[o + 1] = d[o + 2] = 0;
          d[o + 3] = 0;
        }
      }
    }
  }

  /** Gỡ halo xanh trên mép — dùng màu phông gốc. */
  function decontaminateFg(imageData, w, h, srcData) {
    const d = imageData.data;
    const sample = srcData || d;
    const bgEst = sampleCornerMedian(sample, w, h, Math.max(3, Math.floor(Math.min(w, h) * 0.05)));
    const gr0 = bgEst.ok ? bgEst.r : 140;
    const gg0 = bgEst.ok ? bgEst.g : 180;
    const gb0 = bgEst.ok ? bgEst.b : 220;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const o = (y * w + x) * 4;
        const a = d[o + 3];
        if (a < 12 || a > 245) continue;
        if (isSkinTone(sample[o], sample[o + 1], sample[o + 2])) continue;

        // Mép dính màu trời: hạ alpha nếu RGB nguồn còn giống phông
        if (srcData && bgEst.ok) {
          const m = matchesBgColor(srcData[o], srcData[o + 1], srcData[o + 2], bgEst, 40);
          if (m.hit && a < 230) {
            const t = Math.max(0, Math.min(1, m.dist / 40));
            d[o + 3] = Math.min(a, Math.round(t * t * 50));
            if (d[o + 3] < 14) {
              d[o] = d[o + 1] = d[o + 2] = 0;
              d[o + 3] = 0;
              continue;
            }
          }
        }

        if (a > 200) continue;
        const af = a / 255;
        d[o] = Math.max(0, Math.min(255, Math.round((d[o] - gr0 * (1 - af)) / af)));
        d[o + 1] = Math.max(0, Math.min(255, Math.round((d[o + 1] - gg0 * (1 - af)) / af)));
        d[o + 2] = Math.max(0, Math.min(255, Math.round((d[o + 2] - gb0 * (1 - af)) / af)));
      }
    }
  }

  /**
   * Áp alpha mask lên ảnh gốc full-res.
   * Phông studio sáng + đồ trắng: KHÔNG color-punch (sẽ ăn váy/hoa).
   * Chỉ làm sạch khe tóc khi phông tương phản (trời xanh, nền tối…).
   */
  async function recompositeOnOriginal(srcImg, maskBlob) {
    const maskImg = await loadBlobImage(maskBlob);
    const w = srcImg.naturalWidth;
    const h = srcImg.naturalHeight;
    if (w < 2 || h < 2) return maskBlob;

    // Probe nền nhanh
    const probe = document.createElement("canvas");
    const pw = Math.min(160, w);
    const ph = Math.max(1, Math.round(h * (pw / w)));
    probe.width = pw;
    probe.height = ph;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    pctx.drawImage(srcImg, 0, 0, pw, ph);
    const pdata = pctx.getImageData(0, 0, pw, ph).data;
    const bgProbe = sampleCornerMedian(pdata, pw, ph, Math.max(4, Math.floor(Math.min(pw, ph) * 0.08)));
    if (isSkyLikeBg(bgProbe)) {
      return recompositeSkyCutout(srcImg, maskBlob);
    }

    const morphEdge = 1400;
    const edge = Math.max(w, h);
    const scale = edge > morphEdge ? morphEdge / edge : 1;
    const mw = Math.max(1, Math.round(w * scale));
    const mh = Math.max(1, Math.round(h * scale));

    const smallSrc = document.createElement("canvas");
    smallSrc.width = mw;
    smallSrc.height = mh;
    const ssctx = smallSrc.getContext("2d", { willReadFrequently: true });
    ssctx.drawImage(srcImg, 0, 0, mw, mh);
    const srcSmall = ssctx.getImageData(0, 0, mw, mh);

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
    const alpha = new Uint8Array(n);
    const bgGuess = sampleCornerMedian(srcSmall.data, mw, mh, Math.max(4, Math.floor(Math.min(mw, mh) * 0.06)));
    const bgL = bgGuess.ok ? (bgGuess.r + bgGuess.g + bgGuess.b) / 3 : 128;
    const bgChroma = bgGuess.ok
      ? Math.max(bgGuess.r, bgGuess.g, bgGuess.b) - Math.min(bgGuess.r, bgGuess.g, bgGuess.b)
      : 0;
    const skyBg = isSkyLikeBg(bgGuess);
    // Studio xám/trắng — không gồm trời xanh
    const lightStudioBg = bgGuess.ok && !skyBg && bgL >= 185 && bgChroma <= 28;

    for (let i = 0; i < n; i++) {
      const a = md[i * 4 + 3];
      alpha[i] = a;
      bin[i] = a > 64 ? 1 : 0;
    }

    // Studio sáng: đóng lỗ lớn hơn + cứng hóa alpha (váy bị AI làm mờ/thủng)
    const closeR = lightStudioBg ? Math.max(2, Math.round(Math.min(mw, mh) / 180)) : 1;
    const tinyClose = morphClose(bin, mw, mh, closeR);
    for (let i = 0; i < n; i++) {
      if (tinyClose[i] && alpha[i] < 90) alpha[i] = Math.max(alpha[i], 230);
      else if (!tinyClose[i] && alpha[i] < 36) alpha[i] = 0;
    }
    if (lightStudioBg) {
      for (let i = 0; i < n; i++) {
        const a = alpha[i];
        if (a >= 70) alpha[i] = Math.min(255, Math.round(a + (255 - a) * 0.72));
        else if (a < 45) alpha[i] = 0;
      }
    }

    // Trời xanh: đục khe trên mask trước khi ghép
    const punched = lightStudioBg ? alpha : punchBorderConnectedBg(srcSmall.data, alpha, mw, mh);

    for (let i = 0; i < n; i++) {
      md[i * 4] = md[i * 4 + 1] = md[i * 4 + 2] = 255;
      md[i * 4 + 3] = punched[i];
    }
    sctx.putImageData(mid, 0, 0);

    // Trời xanh: gần như không blur — blur sẽ lấp lại khe vừa đục
    const blurPx = lightStudioBg
      ? Math.max(0.25, Math.min(0.55, Math.min(mw, mh) / 900))
      : skyBg
        ? 0.2
        : Math.max(0.35, Math.min(0.85, Math.min(mw, mh) / 700));
    const softSmall = skyBg ? small : softenMaskCanvas(small, blurPx);

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
    const ctx = out.getContext("2d", { willReadFrequently: true, alpha: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(srcImg, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    const full = ctx.getImageData(0, 0, w, h);
    const srcFull = document.createElement("canvas");
    srcFull.width = w;
    srcFull.height = h;
    const sfctx = srcFull.getContext("2d", { willReadFrequently: true });
    sfctx.drawImage(srcImg, 0, 0);
    const srcPixels = sfctx.getImageData(0, 0, w, h);

    if (skyBg) {
      // Đục cứng mọi pixel màu trời còn lại (khe tóc)
      forcePunchSkyPixels(full, srcPixels.data, w, h);
      cleanBgResidueFull(full, srcPixels.data, w, h);
      forcePunchSkyPixels(full, srcPixels.data, w, h);
      decontaminateFg(full, w, h, srcPixels.data);
    } else if (!lightStudioBg) {
      cleanBgResidueFull(full, srcPixels.data, w, h);
      decontaminateFg(full, w, h, srcPixels.data);
    }
    ctx.putImageData(full, 0, 0);
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
    const likely = corner.ok && bgFrac >= 0.32 && unique <= 72;
    const confidence =
      Math.min(1, (bgFrac - 0.22) * 2.2 + (unique <= 40 ? 0.3 : unique <= 56 ? 0.12 : 0));
    return { likely, confidence, bg, bgFrac, unique };
  }

  async function removeBackgroundGraphic(img, info, onProgress) {
    onProgress?.("Nhận diện logo / chữ — xóa phông theo màu…");
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
    const t0 = 16;
    const t1 = 48;

    for (let i = 0; i < d.length; i += 4) {
      const dist = rgbDist(d[i], d[i + 1], d[i + 2], bg.r, bg.g, bg.b);
      let a;
      if (dist <= t0) a = 0;
      else if (dist >= t1) a = 255;
      else a = Math.round(((dist - t0) / (t1 - t0)) * 255);
      d[i + 3] = Math.min(d[i + 3], a);
      // Gỡ màu phông dính trên mép logo
      if (a > 8 && a < 250) {
        const af = a / 255;
        d[i] = Math.max(0, Math.min(255, Math.round((d[i] - bg.r * (1 - af)) / af)));
        d[i + 1] = Math.max(0, Math.min(255, Math.round((d[i + 1] - bg.g * (1 - af)) / af)));
        d[i + 2] = Math.max(0, Math.min(255, Math.round((d[i + 2] - bg.b * (1 - af)) / af)));
      }
    }

    ctx.putImageData(image, 0, 0);
    return OT.canvasToBlob(canvas, "image/png");
  }

  function detectScene(img) {
    const graphic = analyzeGraphicBg(img);
    if (graphic.likely && graphic.confidence >= 0.5) {
      return { mode: "logo", bg: graphic.bg, graphic };
    }

    const tw = Math.min(160, img.naturalWidth);
    const th = Math.min(160, img.naturalHeight);
    const c = document.createElement("canvas");
    c.width = tw;
    c.height = th;
    const cx = c.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, tw, th);
    const { data } = cx.getImageData(0, 0, tw, th);
    const bg = sampleCornerMedian(data, tw, th, Math.max(4, Math.floor(Math.min(tw, th) * 0.08)));
    if (!bg.ok) return { mode: "photo", bg };

    const bgL = (bg.r + bg.g + bg.b) / 3;
    const chroma = Math.max(bg.r, bg.g, bg.b) - Math.min(bg.r, bg.g, bg.b);
    const sky = isSkyLikeBg(bg);

    let near = 0;
    let n = 0;
    const strip = Math.max(3, Math.floor(Math.min(tw, th) * 0.06));
    const thr = sky ? 42 : 28;
    for (let x = 0; x < tw; x++) {
      for (let t = 0; t < strip; t++) {
        for (const y of [t, th - 1 - t]) {
          const i = (y * tw + x) * 4;
          n++;
          if (rgbDist(data[i], data[i + 1], data[i + 2], bg.r, bg.g, bg.b) <= thr) near++;
        }
      }
    }
    const solidFrac = n ? near / n : 0;

    if (sky || (solidFrac >= 0.52 && chroma >= 18 && bgL >= 90)) {
      return { mode: "solid", bg, sky: !!sky, solidFrac };
    }
    if (bgL >= 185 && chroma <= 32) {
      return { mode: "studio", bg, solidFrac };
    }
    return { mode: "photo", bg, solidFrac };
  }

  function isSubjectProtectPixel(r, g, b) {
    if (typeof isSkinTone === "function" && isSkinTone(r, g, b)) return true;
    const lum = (r + g + b) / 3;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (lum >= 165 && chroma <= 48 && b <= Math.max(r, g) + 20) return true;
    if (lum <= 110 && !(b > r + 24 && b > g + 20)) return true;
    return false;
  }

  function isSolidBgPixel(r, g, b, bg, thr, sky) {
    if (isSubjectProtectPixel(r, g, b)) return false;
    const dist = rgbDist(r, g, b, bg.r, bg.g, bg.b);
    if (dist <= thr) return true;
    if (sky) {
      const lum = (r + g + b) / 3;
      const bgL = (bg.r + bg.g + bg.b) / 3;
      if (b > r + 12 && b > g + 6 && b >= 120 && Math.abs(lum - bgL) <= 48 && dist <= thr * 1.7) {
        return true;
      }
    }
    return false;
  }

  async function finalizeCutout(srcImg, maskBlob, scene) {
    const maskImg = await loadBlobImage(maskBlob);
    const w = srcImg.naturalWidth;
    const h = srcImg.naturalHeight;
    if (w < 2 || h < 2) return maskBlob;

    const srcC = document.createElement("canvas");
    srcC.width = w;
    srcC.height = h;
    const sctx = srcC.getContext("2d", { willReadFrequently: true });
    sctx.drawImage(srcImg, 0, 0);
    const src = sctx.getImageData(0, 0, w, h).data;

    const maskC = document.createElement("canvas");
    maskC.width = w;
    maskC.height = h;
    const mctx = maskC.getContext("2d", { willReadFrequently: true });
    mctx.clearRect(0, 0, w, h);
    mctx.drawImage(maskImg, 0, 0, w, h);
    const mid = mctx.getImageData(0, 0, w, h);
    const md = mid.data;
    const n = w * h;
    const mode = scene.mode;

    const bin = new Uint8Array(n);
    for (let i = 0; i < n; i++) bin[i] = md[i * 4 + 3] > 64 ? 1 : 0;

    if (mode === "studio" || mode === "solid") {
      const closeR = mode === "studio" ? Math.min(5, Math.max(2, Math.round(Math.min(w, h) / 180))) : 2;
      const closed = morphClose(bin, w, h, closeR);
      for (let i = 0; i < n; i++) {
        let a = md[i * 4 + 3];
        if (closed[i] && a < 110) a = 245;
        if (mode === "studio" && a >= 55) a = Math.min(255, Math.round(a + (255 - a) * 0.7));
        else if (mode === "solid" && a >= 50) a = Math.min(255, Math.round(a + (255 - a) * 0.45));
        else if (a < 35) a = 0;
        md[i * 4] = md[i * 4 + 1] = md[i * 4 + 2] = 255;
        md[i * 4 + 3] = a;
      }
    } else {
      for (let i = 0; i < n; i++) {
        md[i * 4] = md[i * 4 + 1] = md[i * 4 + 2] = 255;
        if (md[i * 4 + 3] < 30) md[i * 4 + 3] = 0;
      }
    }

    if (mode === "solid" && scene.bg && scene.bg.ok) {
      const bg = scene.bg;
      const thr = scene.sky ? 44 : 32;
      const sky = !!scene.sky;

      const like = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        like[i] =
          isSolidBgPixel(src[o], src[o + 1], src[o + 2], bg, thr, sky) || md[o + 3] < 28 ? 1 : 0;
      }
      const seen = new Uint8Array(n);
      const stack = new Int32Array(n);
      let sp = 0;
      const push = (i) => {
        if (i < 0 || i >= n || seen[i] || !like[i]) return;
        seen[i] = 1;
        stack[sp++] = i;
      };
      for (let x = 0; x < w; x++) {
        push(x);
        push((h - 1) * w + x);
      }
      for (let y = 0; y < h; y++) {
        push(y * w);
        push(y * w + w - 1);
      }
      while (sp) {
        const i = stack[--sp];
        const x = i % w;
        const y = (i - x) / w;
        if (x > 0) push(i - 1);
        if (x + 1 < w) push(i + 1);
        if (y > 0) push(i - w);
        if (y + 1 < h) push(i + w);
      }

      for (let i = 0; i < n; i++) {
        const o = i * 4;
        if (md[o + 3] < 4) continue;
        const r = src[o];
        const g = src[o + 1];
        const b = src[o + 2];
        if (isSubjectProtectPixel(r, g, b)) continue;
        if (seen[i] || isSolidBgPixel(r, g, b, bg, thr, sky)) md[o + 3] = 0;
      }

      for (let y = 2; y < h - 2; y++) {
        for (let x = 2; x < w - 2; x++) {
          const i = y * w + x;
          const o = i * 4;
          if (md[o + 3] < 8) continue;
          const r = src[o];
          const g = src[o + 1];
          const b = src[o + 2];
          if (isSubjectProtectPixel(r, g, b)) continue;
          if (!isSolidBgPixel(r, g, b, bg, thr, sky)) continue;
          let dark = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (!dx && !dy) continue;
              const j = ((y + dy) * w + (x + dx)) * 4;
              if (md[j + 3] < 20) continue;
              const lum = (src[j] + src[j + 1] + src[j + 2]) / 3;
              if (lum < 115 && !isSolidBgPixel(src[j], src[j + 1], src[j + 2], bg, thr, sky)) dark++;
            }
          }
          if (dark >= 3) md[o + 3] = 0;
        }
      }
    }

    mctx.putImageData(mid, 0, 0);

    let maskDraw = maskC;
    if (mode !== "solid") {
      maskDraw = softenMaskCanvas(maskC, mode === "studio" ? 0.45 : 0.7);
    }

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d", { willReadFrequently: true, alpha: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(srcImg, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskDraw, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    const full = ctx.getImageData(0, 0, w, h);

    if (mode === "solid" && scene.bg && scene.bg.ok) {
      const bg = scene.bg;
      const thr = scene.sky ? 44 : 32;
      const sky = !!scene.sky;
      for (let i = 0; i < n; i++) {
        const o = i * 4;
        if (full.data[o + 3] < 4) continue;
        if (isSubjectProtectPixel(src[o], src[o + 1], src[o + 2])) continue;
        if (isSolidBgPixel(src[o], src[o + 1], src[o + 2], bg, thr, sky)) {
          full.data[o] = full.data[o + 1] = full.data[o + 2] = 0;
          full.data[o + 3] = 0;
        }
      }
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const o = (y * w + x) * 4;
          const a = full.data[o + 3];
          if (a < 12 || a > 230) continue;
          if (isSubjectProtectPixel(src[o], src[o + 1], src[o + 2])) continue;
          const dist = rgbDist(src[o], src[o + 1], src[o + 2], bg.r, bg.g, bg.b);
          if (dist < thr * 1.15) {
            full.data[o + 3] = Math.min(a, Math.round((dist / thr) * 40));
            if (full.data[o + 3] < 12) {
              full.data[o] = full.data[o + 1] = full.data[o + 2] = 0;
              full.data[o + 3] = 0;
            }
          }
        }
      }
    }

    ctx.putImageData(full, 0, 0);
    return OT.canvasToBlob(out, "image/png");
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
    const scene = detectScene(workImg);
    const t0 = performance.now();
    let blob = null;
    let engine = scene.mode;

    if (scene.mode === "logo") {
      onProgress?.("Nhận diện logo / chữ — xóa phông theo màu…");
      blob = await removeBackgroundGraphic(workImg, scene.graphic || analyzeGraphicBg(workImg), onProgress);
      engine = "logo";
    } else {
      onProgressHint = null;
      onProgress?.("Đang tách nền bằng AI…");

      let imglyBlob = null;
      let personBlob = null;

      try {
        const prepared = await prepareFileForBgRemoval(file, tier);
        imglyBlob = await removeBackgroundImgly(prepared, onProgress, tier);
        if (await looksLikeWhiteSilhouette(imglyBlob)) imglyBlob = null;
      } catch (e) {
        console.warn("[remove-bg] imgly:", e);
      }

      const needPerson = scene.mode === "studio" || scene.mode === "solid" || !imglyBlob;
      if (needPerson && !tier.startsWith("mobile-low")) {
        try {
          onProgress?.("Đang giữ chi tiết chủ thể…");
          personBlob = await removeBackgroundMediaPipe(file, onProgress, tier, "person");
          if (await looksLikeWhiteSilhouette(personBlob)) personBlob = null;
        } catch (e) {
          console.warn("[remove-bg] person:", e);
        }
      }

      if (!imglyBlob && !personBlob && !tier.startsWith("mobile")) {
        try {
          onProgress?.("Bổ sung chủ thể…");
          personBlob = await removeBackgroundMediaPipe(file, onProgress, tier, "selfie");
          if (await looksLikeWhiteSilhouette(personBlob)) personBlob = null;
        } catch (e) {
          console.warn("[remove-bg] selfie:", e);
        }
      }

      if (!imglyBlob && !personBlob) {
        throw new Error("Không tách được nền. Thử ảnh rõ chủ thể hơn hoặc logo nền trơn.");
      }

      onProgress?.("Gộp & làm sạch mask…");
      if (imglyBlob && personBlob && (scene.mode === "studio" || scene.mode === "solid")) {
        blob = await maxAlphaCutouts(imglyBlob, personBlob);
      } else if (imglyBlob && personBlob) {
        blob = await unionCutoutBlobs(imglyBlob, personBlob);
      } else {
        blob = imglyBlob || personBlob;
      }

      blob = await finalizeCutout(workImg, blob, scene);
      engine = scene.mode;
    }

    onProgressHint = null;
    const sec = ((performance.now() - t0) / 1000).toFixed(1);
    onProgress?.(`Xong trong ~${sec}s`);
    return {
      blob,
      fileName: OT.nameWithSuffix(file.name, "-no-bg", ".png"),
      contentType: "image/png",
      engine,
      tier,
      scene: scene.mode
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
