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

  async function loadImgly() {
    if (imglyMod) return imglyMod;
    const urls = [
      "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm",
      "https://esm.sh/@imgly/background-removal@1.5.5"
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

  async function removeBackgroundImgly(file, onProgress) {
    onProgress?.("Đang tải model xóa nền…");
    const mod = await loadImgly();
    const removeBg =
      mod.removeBackground ||
      mod.default?.removeBackground ||
      (typeof mod.default === "function" ? mod.default : null);
    if (!removeBg) throw new Error("API xóa nền không hợp lệ.");

    onProgress?.("Đang xóa nền…");
    const publicPaths = [
      "https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.5.5/dist/",
      "https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/"
    ];
    let lastErr;
    for (const publicPath of publicPaths) {
      try {
        const blob = await removeBg(file, {
          publicPath,
          debug: false,
          output: { format: "image/png", quality: 0.92 },
          progress: (_key, current, total) => {
            if (!total) return;
            const pct = Math.max(1, Math.min(99, Math.round((current / total) * 100)));
            onProgress?.(`Đang xóa nền… ${pct}%`);
          }
        });
        if (blob instanceof Blob && blob.size > 0) return blob;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Model không trả về ảnh PNG.");
  }

  async function loadMediaPipeSegmenter(onProgress) {
    if (mpSegmenter) return mpSegmenter;
    if (mpLoading) return mpLoading;

    mpLoading = (async () => {
      onProgress?.("Đang tải MediaPipe…");
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
        throw lastErr || new Error("Không tải được MediaPipe.");
      }

      const wasmPath = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
      const vision = await mod.FilesetResolver.forVisionTasks(wasmPath);
      onProgress?.("Đang khởi tạo model…");

      const modelUrl =
        "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

      const opts = {
        baseOptions: { modelAssetPath: modelUrl, delegate: "GPU" },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        outputConfidenceMasks: true
      };

      try {
        mpSegmenter = await mod.ImageSegmenter.createFromOptions(vision, opts);
      } catch (_) {
        opts.baseOptions.delegate = "CPU";
        mpSegmenter = await mod.ImageSegmenter.createFromOptions(vision, opts);
      }
      return mpSegmenter;
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

  /** Chọn mask "người" — ưu tiên vùng giữa ảnh có confidence cao. */
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
      // Selfie category: thường 0=bg, >0=người — cũng thử đảo
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

  /**
   * MediaPipe: vẽ ảnh gốc → mask alpha → destination-in.
   * Không segment trên canvas xuất (tránh WebGL làm mất RGB → bóng trắng).
   */
  async function removeBackgroundMediaPipe(file, onProgress) {
    onProgress?.("Đang chuẩn bị ảnh…");
    const img = await OT.loadImage(file);
    const maxEdge = 1280;
    const edge = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = edge > maxEdge ? maxEdge / edge : 1;
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    // Canvas riêng chỉ để inference
    const infer = document.createElement("canvas");
    infer.width = w;
    infer.height = h;
    infer.getContext("2d").drawImage(img, 0, 0, w, h);
    const bitmap = await createImageBitmap(infer);

    const segmenter = await loadMediaPipeSegmenter(onProgress);
    onProgress?.("Đang tách chủ thể…");

    const result = await new Promise((resolve, reject) => {
      try {
        segmenter.segment(bitmap, (res) => resolve(res));
      } catch (e) {
        reject(e);
      }
    });
    try {
      bitmap.close?.();
    } catch (_) {}

    const person = extractPersonMask(result);
    try {
      result.categoryMask?.close?.();
      result.confidenceMasks?.forEach((m) => m.close?.());
    } catch (_) {}

    if (!person) {
      throw new Error("Không tách được chủ thể. Thử ảnh chân dung rõ người.");
    }

    // Mask canvas: trắng + alpha = độ tin cậy người
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = w;
    maskCanvas.height = h;
    const mctx = maskCanvas.getContext("2d");
    const mid = mctx.createImageData(w, h);
    const md = mid.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const mx = Math.min(person.w - 1, Math.floor((x / w) * person.w));
        const my = Math.min(person.h - 1, Math.floor((y / h) * person.h));
        let t = person.data[my * person.w + mx];
        if (t > 1) t /= 255;
        if (person.invert) t = 1 - t;
        if (t < 0.2) t = 0;
        else if (t > 0.75) t = 1;
        else t = (t - 0.2) / 0.55;
        const a = Math.round(Math.max(0, Math.min(1, t)) * 255);
        const i = (y * w + x) * 4;
        md[i] = 255;
        md[i + 1] = 255;
        md[i + 2] = 255;
        md[i + 3] = a;
      }
    }
    mctx.putImageData(mid, 0, 0);

    // Canvas kết quả: ảnh gốc + destination-in (giữ màu người, bỏ nền)
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d", { alpha: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    return OT.canvasToBlob(out, "image/png");
  }

  /** Kiểm tra nhanh: bóng trắng gần như chỉ có pixel trắng/trong suốt. */
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
    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Ảnh quá lớn (tối đa 8MB).");
    }

    const t0 = performance.now();
    let blob = null;
    let engine = "mediapipe";

    // MediaPipe trước (ổn định, nhanh) — đã sửa destination-in
    try {
      blob = await removeBackgroundMediaPipe(file, onProgress);
      if (await looksLikeWhiteSilhouette(blob)) {
        throw new Error("Kết quả mask lỗi (silhouette).");
      }
    } catch (e) {
      console.warn("[remove-bg] MediaPipe failed:", e);
      onProgress?.("Thử model chính xác hơn…");
      engine = "imgly";
      blob = await removeBackgroundImgly(file, onProgress);
      if (await looksLikeWhiteSilhouette(blob)) {
        throw new Error("Xóa nền thất bại — thử ảnh khác hoặc Ctrl+F5.");
      }
    }

    const sec = ((performance.now() - t0) / 1000).toFixed(1);
    onProgress?.(`Xong trong ~${sec}s`);
    return {
      blob,
      fileName: OT.nameWithSuffix(file.name, "-no-bg", ".png"),
      contentType: "image/png",
      engine
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
