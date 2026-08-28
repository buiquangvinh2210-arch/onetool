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

  async function loadJsBarcode() {
    if (typeof window.JsBarcode === "function") return window.JsBarcode;
    const urls = [
      "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js",
      "https://unpkg.com/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"
    ];
    let lastErr;
    for (const src of urls) {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = () =>
            typeof window.JsBarcode === "function"
              ? resolve()
              : reject(new Error("JsBarcode missing"));
          s.onerror = () => reject(new Error("script error"));
          document.head.appendChild(s);
        });
        return window.JsBarcode;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Không tải được thư viện mã vạch.");
  }

  /**
   * @param {string} value
   * @param {{ format?: string, width?: number, height?: number, displayValue?: boolean, lineColor?: string, background?: string, fontSize?: number, margin?: number }} opts
   */
  async function makeBarcodePng(value, opts) {
    const JsBarcode = await loadJsBarcode();
    const text = String(value || "").trim();
    if (!text) throw new Error("Nhập nội dung mã vạch.");

    const format = opts?.format || "CODE128";
    const barWidth = Math.max(1, Math.min(6, Number(opts?.width) || 2));
    const height = Math.max(40, Math.min(240, Number(opts?.height) || 100));
    const displayValue = opts?.displayValue !== false;
    const lineColor = opts?.lineColor || "#1a1428";
    const background = opts?.background || "#ffffff";
    const fontSize = Math.max(10, Math.min(28, Number(opts?.fontSize) || 16));
    const margin = Math.max(4, Math.min(40, Number(opts?.margin) || 12));

    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, text, {
        format,
        width: barWidth,
        height,
        displayValue,
        lineColor,
        background,
        fontSize,
        margin,
        textMargin: 6,
        fontOptions: "bold",
        font: "monospace",
        valid: function (valid) {
          if (!valid) throw new Error("INVALID");
        }
      });
    } catch (e) {
      const msg = String(e?.message || e || "");
      if (/INVALID|Invalid/i.test(msg)) {
        throw new Error(
          "Nội dung không hợp lệ với chuẩn " +
            format +
            ". Kiểm tra độ dài / ký tự (vd. EAN-13 cần 12–13 số)."
        );
      }
      throw new Error(msg || "Không tạo được mã vạch.");
    }

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Không xuất được PNG."))),
        "image/png"
      );
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
    makeQrPng, makeQrDataUrl, makeBarcodePng, loadJsBarcode, formatJson, parseJson,
    encodeBase64, decodeBase64, normalizeBase64Input,
    isValidBase64, fileToBase64, base64ToBlob, guessBase64Mime, isImageMime
  };
})();
