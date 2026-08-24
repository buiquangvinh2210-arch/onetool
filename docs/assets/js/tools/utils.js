window.OTUtils = (function () {
  "use strict";

  function qrScriptUrl() {
    const base = (window.OT_BASE || ".").replace(/\/$/, "");
    const rel = "assets/js/vendor/qrcode.min.js";
    return base === "." || base === "" ? rel : `${base}/${rel}`;
  }

  async function loadQr() {
    if (window.QRCode) return window.QRCode;
    const urls = [
      qrScriptUrl(),
      "https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"
    ];
    let lastErr;
    for (const src of urls) {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = src;
          s.onload = () => (window.QRCode ? resolve() : reject(new Error("QRCode global missing")));
          s.onerror = () => reject(new Error("script error"));
          document.head.appendChild(s);
        });
        return window.QRCode;
      } catch (e) {
        lastErr = e;
      }
    }
    throw new Error("Không tải được thư viện QR.");
  }

  async function makeQrPng(text, size = 512) {
    const QRCode = await loadQr();
    const dataUrl = await QRCode.toDataURL(String(text), {
      width: Math.max(128, Math.min(1024, size)),
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#1a1428", light: "#ffffff" }
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function makeQrDataUrl(text, size = 512) {
    const QRCode = await loadQr();
    return QRCode.toDataURL(String(text), {
      width: Math.max(128, Math.min(1024, size)),
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#1a1428", light: "#ffffff" }
    });
  }

  function parseJson(input) {
    const raw = String(input || "").trim();
    if (!raw) throw new Error("JSON đang trống.");
    try {
      return JSON.parse(raw);
    } catch (e) {
      const msg = e.message || "";
      if (/position/i.test(msg)) {
        throw new Error("JSON không hợp lệ — " + msg.replace(/^JSON\.parse: /i, ""));
      }
      throw new Error("JSON không hợp lệ — kiểm tra dấu ngoặc, dấu phẩy và dấu ngoặc kép.");
    }
  }

  function formatJson(input, minify) {
    const obj = parseJson(input);
    return minify ? JSON.stringify(obj) : JSON.stringify(obj, null, 2);
  }

  function normalizeBase64Input(input) {
    let s = String(input || "").trim();
    const dataMatch = s.match(/^data:([^;]*);base64,(.*)$/is);
    if (dataMatch) s = dataMatch[2];
    return s.replace(/\s/g, "");
  }

  function bytesToBase64(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  function base64ToBytes(b64) {
    const clean = normalizeBase64Input(b64);
    if (!clean) throw new Error("Base64 đang trống.");
    let binary;
    try {
      binary = atob(clean);
    } catch {
      throw new Error("Base64 không hợp lệ — kiểm tra ký tự và padding (=).");
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function encodeBase64(text, { urlSafe = false } = {}) {
    const bytes = new TextEncoder().encode(String(text ?? ""));
    let out = bytesToBase64(bytes);
    if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return out;
  }

  function decodeBase64(input, { urlSafe = false } = {}) {
    let b64 = normalizeBase64Input(input);
    if (urlSafe) {
      b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
    }
    const bytes = base64ToBytes(b64);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }

  function isValidBase64(input) {
    try {
      base64ToBytes(input);
      return true;
    } catch {
      return false;
    }
  }

  async function fileToBase64(file, { urlSafe = false, dataUrl = false } = {}) {
    if (!file) throw new Error("Chọn file trước.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    let b64 = bytesToBase64(bytes);
    if (urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (dataUrl) {
      const mime = file.type || "application/octet-stream";
      return `data:${mime};base64,${b64}`;
    }
    return b64;
  }

  function base64ToBlob(input, mimeType) {
    const raw = String(input || "").trim();
    let mime = mimeType || "application/octet-stream";
    let b64 = raw;
    const dataMatch = raw.match(/^data:([^;]*);base64,(.*)$/is);
    if (dataMatch) {
      mime = dataMatch[1] || mime;
      b64 = dataMatch[2];
    }
    return new Blob([base64ToBytes(b64)], { type: mime });
  }

  function guessBase64Mime(input) {
    const raw = String(input || "").trim();
    const dataMatch = raw.match(/^data:([^;]+);base64,/i);
    if (dataMatch) return dataMatch[1];
    return null;
  }

  function isImageMime(mime) {
    return mime && /^image\//i.test(mime);
  }

  return {
    makeQrPng, makeQrDataUrl, formatJson, parseJson,
    encodeBase64, decodeBase64, normalizeBase64Input,
    isValidBase64, fileToBase64, base64ToBlob, guessBase64Mime, isImageMime
  };
})();
