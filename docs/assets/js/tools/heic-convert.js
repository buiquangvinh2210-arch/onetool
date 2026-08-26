/**
 * HEIC/HEIF → JPG/PNG/WebP (heic2any trên trình duyệt).
 */
window.OTHeic = (function () {
  "use strict";

  const HEIC2ANY_CDN = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
  let ready = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.heic2any) {
        resolve(window.heic2any);
        return;
      }
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.heic2any));
        existing.addEventListener("error", () => reject(new Error("Không tải được heic2any.")));
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => (window.heic2any ? resolve(window.heic2any) : reject(new Error("heic2any không sẵn sàng.")));
      s.onerror = () => reject(new Error("Không tải được thư viện HEIC. Kiểm tra mạng."));
      document.head.appendChild(s);
    });
  }

  function ensureLib() {
    if (window.heic2any) return Promise.resolve(window.heic2any);
    if (!ready) ready = loadScript(HEIC2ANY_CDN);
    return ready;
  }

  function isHeic(file) {
    const name = String(file?.name || "").toLowerCase();
    const type = String(file?.type || "").toLowerCase();
    return (
      name.endsWith(".heic") ||
      name.endsWith(".heif") ||
      type.includes("heic") ||
      type.includes("heif")
    );
  }

  function mimeOf(format) {
    if (format === "png") return "image/png";
    if (format === "webp") return "image/webp";
    return "image/jpeg";
  }

  function extOf(format) {
    if (format === "png") return "png";
    if (format === "webp") return "webp";
    return "jpg";
  }

  async function blobToFormat(blob, format, quality) {
    if (format === "jpg" || format === "jpeg") {
      if (blob.type === "image/jpeg") return blob;
    }
    if (format === "png" && blob.type === "image/png") return blob;

    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    if (format === "jpg" || format === "jpeg" || format === "webp") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(bmp, 0, 0);
    bmp.close?.();
    const q = Math.min(1, Math.max(0.5, Number(quality) || 0.92));
    const mime = mimeOf(format);
    const out = await OT.canvasToBlob(canvas, mime, format === "png" ? undefined : q);
    return out;
  }

  /**
   * @param {File} file
   * @param {{ format?: string, quality?: number, onProgress?: Function }} opts
   */
  async function convert(file, opts = {}) {
    if (!file) throw new Error("Chọn file HEIC/HEIF.");
    if (!isHeic(file) && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)) {
      // Allow non-HEIC as passthrough convert for convenience
    }

    const format = (opts.format || "jpg").toLowerCase() === "jpeg" ? "jpg" : (opts.format || "jpg").toLowerCase();
    const quality = opts.quality ?? 0.92;
    opts.onProgress?.({ stage: "load", pct: 5 });

    let sourceBlob = file;
    if (isHeic(file)) {
      const heic2any = await ensureLib();
      opts.onProgress?.({ stage: "decode", pct: 25 });
      const result = await heic2any({
        blob: file,
        toType: format === "png" ? "image/png" : "image/jpeg",
        quality: format === "png" ? 1 : quality
      });
      sourceBlob = Array.isArray(result) ? result[0] : result;
      if (!sourceBlob) throw new Error("Không giải mã được HEIC. File có thể hỏng hoặc bị bảo vệ.");
    }

    opts.onProgress?.({ stage: "encode", pct: 70 });
    const blob = await blobToFormat(sourceBlob, format, quality);
    const bmp = await createImageBitmap(blob);
    const width = bmp.width;
    const height = bmp.height;
    bmp.close?.();

    opts.onProgress?.({ stage: "done", pct: 100 });
    return {
      blob,
      width,
      height,
      format,
      ext: extOf(format),
      mime: mimeOf(format),
      beforeBytes: file.size,
      afterBytes: blob.size
    };
  }

  /**
   * Batch convert — returns array of results (failures throw per-file in results.errors).
   */
  async function convertMany(files, opts = {}) {
    const list = Array.from(files || []);
    if (!list.length) throw new Error("Chọn ít nhất một file.");
    if (list.length > 30) throw new Error("Tối đa 30 ảnh mỗi lần.");
    const out = [];
    const errors = [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      opts.onProgress?.({ index: i + 1, total: list.length, name: f.name, pct: Math.round(((i) / list.length) * 100) });
      try {
        const r = await convert(f, { ...opts, onProgress: undefined });
        out.push({ file: f, ...r });
      } catch (e) {
        errors.push({ file: f, message: e.message || String(e) });
      }
    }
    if (!out.length) throw new Error(errors[0]?.message || "Không convert được file nào.");
    return { items: out, errors };
  }

  return { ensureLib, isHeic, convert, convertMany, mimeOf, extOf };
})();
