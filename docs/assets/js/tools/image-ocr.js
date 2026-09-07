/**
 * OCR ảnh → văn bản — AI vision (Gemini/Groq) qua Cloudflare Worker.
 */
window.OTImageOcr = (function () {
  "use strict";

  const DEFAULT_CLOUD = "https://onetool-whisper.buiquangvinh2210.workers.dev";
  const MAX_EDGE = 2560;
  const MAX_BYTES = 2.8 * 1024 * 1024;

  function isLocalHost() {
    const h = location.hostname;
    return h === "127.0.0.1" || h === "localhost";
  }

  function resolveProxy(raw) {
    const t = String(raw || "").trim().replace(/\/$/, "");
    if (!t) return "";
    if (t.startsWith("/")) return location.origin + t;
    return t;
  }

  function getProxy() {
    try {
      const saved = (localStorage.getItem("ot_ocr_proxy") || "").trim();
      if (saved) {
        if (!isLocalHost() && (saved.includes("127.0.0.1") || saved.includes("localhost"))) {
          localStorage.removeItem("ot_ocr_proxy");
        } else return resolveProxy(saved);
      }
    } catch (_) {}
    const cfg = window.OT_CONFIG || {};
    const cloud = String(cfg.ocrCloud || cfg.summarizeCloud || cfg.whisperCloud || "").trim();
    if (cloud && !/YOUR_|XXXX|CHANGEME/i.test(cloud)) return resolveProxy(cloud);
    return resolveProxy(DEFAULT_CLOUD);
  }

  function sizeOf(img) {
    return {
      w: img.naturalWidth || img.width || 0,
      h: img.naturalHeight || img.height || 0
    };
  }

  function ocrEndpoint() {
    return getProxy().replace(/\/ocr$/i, "") + "/ocr";
  }

  function langToApi(lang) {
    if (lang === "eng" || lang === "en") return "en";
    if (lang === "vie" || lang === "vi") return "vi";
    return "mix";
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      const args = type === "image/jpeg" ? [type, quality] : [type];
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Không nén được ảnh."))),
        ...args
      );
    });
  }

  async function blobToBase64(blob) {
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  async function encodeImage(img, rectangle) {
    const { w: iw, h: ih } = sizeOf(img);
    let sx = 0;
    let sy = 0;
    let sw = iw;
    let sh = ih;
    if (rectangle && rectangle.w > 8 && rectangle.h > 8) {
      sx = Math.max(0, Math.floor(rectangle.x));
      sy = Math.max(0, Math.floor(rectangle.y));
      sw = Math.min(iw - sx, Math.ceil(rectangle.w));
      sh = Math.min(ih - sy, Math.ceil(rectangle.h));
    }
    const longest = Math.max(sw, sh) || 1;
    const scale = Math.min(1, MAX_EDGE / longest);
    const cw = Math.max(1, Math.round(sw * scale));
    const ch = Math.max(1, Math.round(sh * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.imageSmoothingEnabled = scale < 1;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);

    let blob = await canvasToBlob(canvas, "image/png");
    let mime = "image/png";
    if (blob.size > MAX_BYTES) {
      mime = "image/jpeg";
      let q = 0.95;
      blob = await canvasToBlob(canvas, mime, q);
      while (blob.size > MAX_BYTES && q > 0.72) {
        q -= 0.07;
        blob = await canvasToBlob(canvas, mime, q);
      }
    }
    if (blob.size > MAX_BYTES) throw new Error("Ảnh vẫn quá lớn sau khi nén. Hãy crop vùng chữ rồi thử lại.");
    return { base64: await blobToBase64(blob), mime, bytes: blob.size };
  }

  function friendlyCloudError(status, data, fallback) {
    const err = String(data?.error || "");
    if (status === 429 || data?.code === "rate_limit") {
      return "Hết hạn mức tạm thời. Chờ vài giây rồi thử lại.";
    }
    if (/openrouter|gemini|groq|slug instead|unavailable for free|không đọc được chữ|invalid argument/i.test(err)) {
      return "Không đọc được chữ trong ảnh. Thử ảnh rõ hơn, xoay đúng chiều, hoặc crop vùng chữ rồi nhận dạng lại.";
    }
    if (err) return err;
    return fallback || "Không đọc được chữ trong ảnh.";
  }

  async function probeHealth() {
    const proxy = getProxy();
    if (!proxy) return { ok: false, ready: false };
    try {
      const res = await fetch(proxy + "/", { method: "GET" });
      const data = await res.json();
      const ready = !!(data && Array.isArray(data.features) && data.features.includes("ocr"));
      return { ok: !!data?.ok, ready, version: data?.version, features: data?.features || [] };
    } catch (_) {
      return { ok: false, ready: false };
    }
  }

  async function ocrCloud(encoded, language, onProgress) {
    const proxy = getProxy();
    if (!proxy) throw new Error("Chưa cấu hình dịch vụ AI OCR.");
    onProgress?.({ pct: 35, message: "AI đang đọc chữ…" });
    let res;
    try {
      res = await fetch(ocrEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: encoded.base64,
          mime: encoded.mime,
          language
        })
      });
    } catch (_) {
      throw new Error("Không kết nối được dịch vụ AI. Kiểm tra mạng rồi thử lại.");
    }
    const raw = await res.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      throw new Error(friendlyCloudError(res.status, null, "Phản hồi AI không hợp lệ."));
    }
    if (res.status === 429 || data?.code === "rate_limit") {
      const err = new Error(friendlyCloudError(res.status, data));
      err.code = "rate_limit";
      throw err;
    }
    if (!res.ok || !data?.text) {
      throw new Error(friendlyCloudError(res.status, data));
    }
    return {
      text: String(data.text).normalize("NFC").trim(),
      provider: data?.meta?.provider || "ai",
      model: data?.meta?.model || ""
    };
  }

  async function recognize(image, opts = {}) {
    if (!image) throw new Error("Chọn ảnh có chữ để OCR.");
    opts.onProgress?.({ pct: 8, message: "Đang chuẩn bị ảnh…" });
    const encoded = await encodeImage(image, opts.rectangle);
    opts.onProgress?.({ pct: 22, message: "Đang gửi ảnh tới AI…" });
    const cloud = await ocrCloud(encoded, langToApi(opts.lang), opts.onProgress);
    opts.onProgress?.({ pct: 100, message: "Xong" });
    return { text: cloud.text, words: [], confidence: null, provider: cloud.provider, model: cloud.model };
  }

  return { recognize, getProxy, probeHealth };
})();
