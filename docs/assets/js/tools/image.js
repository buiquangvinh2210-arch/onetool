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

  async function compress(file, quality = 0.7, format) {
    const key = (format || (extOf(file.name) === "png" ? "png" : "jpg")).toLowerCase();
    const type = key === "png" ? "image/png" : key === "webp" ? "image/webp" : "image/jpeg";
    const { canvas } = await drawToCanvas(file);
    const blob = await OT.canvasToBlob(canvas, type, type === "image/png" ? undefined : quality);
    const ext = type === "image/png" ? ".png" : type === "image/webp" ? ".webp" : ".jpg";
    return {
      blob,
      fileName: OT.nameWithSuffix(file.name, "-compressed", ext),
      contentType: type,
      before: file.size,
      after: blob.size
    };
  }

  let mpSegmenter = null;
  let mpLoading = null;
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
    desktop: { maxEdge: 1600, maxMb: 12, models: ["isnet_fp16", "isnet_quint8"], refine: true },
    "desktop-low": { maxEdge: 1280, maxMb: 10, models: ["isnet_quint8", "isnet_fp16"], refine: true },
    mobile: { maxEdge: 896, maxMb: 8, models: ["isnet_quint8"], refine: true },
    "mobile-low": { maxEdge: 720, maxMb: 6, models: ["isnet_quint8"], refine: true }
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
    onProgress?.("Đang tải model xóa nền (lần đầu có thể mất ~30s)…");
    const mod = await loadImgly();
    const removeBg =
      mod.removeBackground ||
      mod.default?.removeBackground ||
      (typeof mod.default === "function" ? mod.default : null);
    if (!removeBg) throw new Error("API xóa nền không hợp lệ.");

    const publicPath = await resolveImglyPublicPath();
    const models = cfg.models.filter((m) => m === "isnet" || m === "isnet_fp16" || m === "isnet_quint8");
    const hasWebGpu = typeof navigator !== "undefined" && !!navigator.gpu;
    const devices = tier.startsWith("mobile") || !hasWebGpu ? ["cpu"] : ["gpu", "cpu"];
    let lastErr;

    for (const model of models) {
      for (const device of devices) {
        try {
          onProgress?.(device === "cpu" ? "Đang xóa nền…" : "Đang xóa nền (GPU)…");
          const blob = await withTimeout(
            removeBg(file, {
              publicPath,
              debug: false,
              device,
              model,
              output: { format: "image/png", quality: 1, type: "foreground" },
              progress: (_key, current, total) => {
                if (!total) return;
                const pct = Math.max(1, Math.min(99, Math.round((current / total) * 100)));
                onProgress?.(`Đang xóa nền… ${pct}%`);
              }
            }),
            90000,
            "Model quá lâu — thử cách khác."
          );
          if (blob instanceof Blob && blob.size > 0) return blob;
        } catch (e) {
          lastErr = e;
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
   * Hậu xử lý PNG: mượt cạnh, cắt nền mờ sót, giảm halo màu nền trên mép.
   */
  async function refineCutoutBlob(blob) {
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

      // Tách alpha → blur → gán lại
      const image = ctx.getImageData(0, 0, w, h);
      const d = image.data;
      const n = w * h;

      const alphaCanvas = document.createElement("canvas");
      alphaCanvas.width = w;
      alphaCanvas.height = h;
      const actx = alphaCanvas.getContext("2d");
      const aImg = actx.createImageData(w, h);
      for (let i = 0; i < n; i++) {
        const a = d[i * 4 + 3];
        const p = i * 4;
        aImg.data[p] = aImg.data[p + 1] = aImg.data[p + 2] = 255;
        aImg.data[p + 3] = a;
      }
      actx.putImageData(aImg, 0, 0);
      const blurPx = Math.max(0.8, Math.min(2.5, Math.min(w, h) / 450));
      const softMask = softenMaskCanvas(alphaCanvas, blurPx);
      const softData = softMask.getContext("2d").getImageData(0, 0, w, h).data;

      for (let i = 0; i < n; i++) {
        let a = softData[i * 4 + 3];
        // Cắt nền sót / nham nhở; giữ soft-edge tóc
        a = Math.round(smoothstep(18, 210, a) * 255);
        const o = i * 4;
        const prevA = d[o + 3] / 255;
        d[o + 3] = a;

        // Giảm halo: kéo RGB về phía đã “đậm” hơn khi alpha thấp
        if (a > 10 && a < 245 && prevA > 0.05) {
          const t = a / 255;
          const inv = 1 / Math.max(prevA, 0.25);
          d[o] = Math.min(255, Math.round(d[o] * inv * t));
          d[o + 1] = Math.min(255, Math.round(d[o + 1] * inv * t));
          d[o + 2] = Math.min(255, Math.round(d[o + 2] * inv * t));
        }
      }

      // Loại đốm nền cô lập
      const snap = new Uint8ClampedArray(n);
      for (let i = 0; i < n; i++) snap[i] = d[i * 4 + 3];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (snap[i] < 50) continue;
          let near = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              if (snap[(y + dy) * w + (x + dx)] > 90) near++;
            }
          }
          if (near <= 1) d[i * 4 + 3] = 0;
        }
      }

      ctx.putImageData(image, 0, 0);
      return OT.canvasToBlob(canvas, "image/png");
    } catch (_) {
      return blob;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  async function loadMediaPipeSegmenter(onProgress, preferCpu = false) {
    if (mpSegmenter) return mpSegmenter;
    if (mpLoading) return mpLoading;

    mpLoading = (async () => {
      onProgress?.("Đang tải model xóa nền…");
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
      onProgress?.("Đang khởi tạo…");

      const modelUrl =
        "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

      const delegates = preferCpu ? ["CPU", "GPU"] : ["GPU", "CPU"];
      lastErr = null;
      for (const delegate of delegates) {
        try {
          mpSegmenter = await mod.ImageSegmenter.createFromOptions(vision, {
            baseOptions: { modelAssetPath: modelUrl, delegate },
            runningMode: "IMAGE",
            outputCategoryMask: true,
            outputConfidenceMasks: true
          });
          return mpSegmenter;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error("Không khởi tạo được model.");
    })().catch((e) => {
      mpLoading = null;
      throw e;
    });

    return mpLoading;
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
    if (best.score < 0.15) return null;
    return best;
  }

  function sampleMaskBilinear(data, mw, mh, u, v, invert) {
    const x = u * (mw - 1);
    const y = v * (mh - 1);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(mw - 1, x0 + 1);
    const y1 = Math.min(mh - 1, y0 + 1);
    const fx = x - x0;
    const fy = y - y0;
    const read = (ix, iy) => {
      let t = data[iy * mw + ix];
      if (t > 1) t /= 255;
      if (invert) t = 1 - t;
      return t;
    };
    const a = read(x0, y0);
    const b = read(x1, y0);
    const c = read(x0, y1);
    const d = read(x1, y1);
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
  }

  async function removeBackgroundMediaPipe(file, onProgress, tier = "desktop") {
    onProgress?.("Đang chuẩn bị ảnh…");
    const img = await OT.loadImage(file);
    const maxEdge = tier.startsWith("mobile") ? bgConfig(tier).maxEdge : 1600;
    const edge = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = edge > maxEdge ? maxEdge / edge : 1;
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const infer = document.createElement("canvas");
    infer.width = w;
    infer.height = h;
    infer.getContext("2d").drawImage(img, 0, 0, w, h);
    let input = infer;
    try {
      if (typeof createImageBitmap === "function") input = await createImageBitmap(infer);
    } catch (_) {
      input = infer;
    }

    const segmenter = await loadMediaPipeSegmenter(onProgress, tier.startsWith("mobile"));
    onProgress?.("Đang tách chủ thể…");

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

    const person = extractPersonMask(result);
    try {
      result.categoryMask?.close?.();
      result.confidenceMasks?.forEach((m) => m.close?.());
    } catch (_) {}

    if (!person) {
      throw new Error("Không tách được chủ thể. Thử ảnh chân dung rõ người.");
    }

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

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = w;
    maskCanvas.height = h;
    const mctx = maskCanvas.getContext("2d");
    mctx.imageSmoothingEnabled = true;
    mctx.imageSmoothingQuality = "high";
    mctx.drawImage(srcMask, 0, 0, w, h);
    const blurPx = Math.max(1.8, Math.min(w, h) / 220);
    const softMask = softenMaskCanvas(maskCanvas, blurPx);

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d", { alpha: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(softMask, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    return OT.canvasToBlob(out, "image/png");
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

    const workFile = await prepareFileForBgRemoval(file, tier);
    onProgressHint = null;

    const t0 = performance.now();
    let blob = null;
    let engine = "mediapipe";

    async function tryMediaPipe() {
      const out = await removeBackgroundMediaPipe(workFile, onProgress, tier);
      if (await looksLikeWhiteSilhouette(out)) throw new Error("mask lỗi");
      return out;
    }

    async function tryImgly() {
      const out = await removeBackgroundImgly(workFile, onProgress, tier);
      if (await looksLikeWhiteSilhouette(out)) throw new Error("mask lỗi");
      return out;
    }

    try {
      blob = await tryImgly();
      engine = "imgly";
    } catch (e) {
      console.warn("[remove-bg] imgly failed:", e);
      onProgress?.("Chuyển sang model dự phòng…");
      blob = await tryMediaPipe();
      engine = "mediapipe";
    }

    if (cfg.refine) {
      onProgress?.("Đang làm mượt cạnh…");
      blob = await refineCutoutBlob(blob);
    }

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
