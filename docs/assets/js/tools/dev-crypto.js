(function () {
  "use strict";

  const ALGO_MAP = { SHA256: "SHA-256", SHA1: "SHA-1", SHA384: "SHA-384", SHA512: "SHA-512" };

  function bytesToHex(bytes) {
    return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function hasSubtle() {
    return typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.digest === "function";
  }

  function randomUUIDv4() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
      throw new Error("Trình duyệt không hỗ trợ tạo UUID ngẫu nhiên an toàn.");
    }
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = bytesToHex(b.buffer);
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20, 32);
  }

  let fallbackPromise = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Không tải được thư viện hash (cần mạng hoặc HTTPS)."));
      document.head.appendChild(s);
    });
  }

  function ensureHashFallback() {
    if (fallbackPromise) return fallbackPromise;
    fallbackPromise = (async () => {
      await loadScript("https://cdn.jsdelivr.net/npm/js-sha256@0.11.0/src/sha256.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/js-sha512@0.9.0/build/sha512.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/js-sha1@0.7.0/build/sha1.min.js");
    })();
    return fallbackPromise;
  }

  async function digestBytes(algo, bytes) {
    const name = ALGO_MAP[algo] || algo;
    if (hasSubtle()) {
      const buf = await crypto.subtle.digest(name, bytes);
      return bytesToHex(buf);
    }
    await ensureHashFallback();
    const input = new Uint8Array(bytes);
    switch (algo) {
      case "SHA256":
        if (typeof sha256 !== "function") throw new Error("SHA-256 fallback chưa sẵn sàng.");
        return sha256(input);
      case "SHA384":
        if (typeof sha384 !== "function") throw new Error("SHA-384 fallback chưa sẵn sàng.");
        return sha384(input);
      case "SHA512":
        if (typeof sha512 !== "function") throw new Error("SHA-512 fallback chưa sẵn sàng.");
        return sha512(input);
      case "SHA1":
        if (typeof sha1 !== "function") throw new Error("SHA-1 fallback chưa sẵn sàng.");
        return sha1(input);
      default:
        throw new Error("Thuật toán không hỗ trợ: " + algo);
    }
  }

  async function digestText(algo, text) {
    const data = new TextEncoder().encode(String(text ?? ""));
    return digestBytes(algo, data);
  }

  window.OTDevCrypto = {
    randomUUIDv4,
    digestBytes,
    digestText,
    hasSubtle
  };
})();
