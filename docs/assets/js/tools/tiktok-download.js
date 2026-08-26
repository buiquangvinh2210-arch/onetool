/**
 * TikTok Download — resolve link qua Cloudflare Worker, tải HD / không watermark.
 */
window.OTTikTok = (function () {
  "use strict";

  const LS_PROXY = "ot_tiktok_proxy";
  /** Fallback khi ot-config.js chưa load / cache cũ (local + prod) */
  const DEFAULT_CLOUD = "https://onetool-tiktok.buiquangvinh2210.workers.dev";

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
      const saved = (localStorage.getItem(LS_PROXY) || "").trim();
      if (saved) {
        if (!isLocalHost() && (saved.includes("127.0.0.1") || saved.includes("localhost"))) {
          localStorage.removeItem(LS_PROXY);
        } else {
          return resolveProxy(saved);
        }
      }
    } catch (_) {}
    const cfg = window.OT_CONFIG || {};
    const cloud = String(cfg.tiktokCloud || DEFAULT_CLOUD).trim();
    if (cloud && !/YOUR_|XXXX|CHANGEME/i.test(cloud)) return resolveProxy(cloud);
    return resolveProxy(cfg.tiktokProxy || DEFAULT_CLOUD);
  }

  function setProxy(v) {
    const t = String(v || "").trim().replace(/\/$/, "");
    if (t) localStorage.setItem(LS_PROXY, t);
    else localStorage.removeItem(LS_PROXY);
  }

  function normalizeInputUrl(raw) {
    let s = String(raw || "").trim();
    if (!s) return "";
    // Cho phép dán cả đoạn text chứa link
    const m = s.match(/https?:\/\/[^\s<>"']+/i);
    if (m) s = m[0].replace(/[),.;]+$/, "");
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;
    return s;
  }

  function isTikTokUrl(u) {
    try {
      const h = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
      return (
        h === "tiktok.com" ||
        h.endsWith(".tiktok.com") ||
        h === "vt.tiktok.com" ||
        h === "vm.tiktok.com" ||
        h === "m.tiktok.com"
      );
    } catch (_) {
      return false;
    }
  }

  function formatBytes(n) {
    const x = Number(n) || 0;
    if (x < 1024) return x + " B";
    if (x < 1024 * 1024) return (x / 1024).toFixed(1) + " KB";
    return (x / (1024 * 1024)).toFixed(2) + " MB";
  }

  function formatDuration(sec) {
    const s = Math.max(0, Math.round(Number(sec) || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function formatCount(n) {
    const x = Number(n) || 0;
    if (x >= 1e6) return (x / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (x >= 1e3) return (x / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(x);
  }

  function safeFileBase(title, id) {
    const base = String(title || "tiktok")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
    const suffix = String(id || "").slice(-8) || "video";
    return (base || "tiktok") + "-" + suffix;
  }

  async function resolve(rawUrl, { signal, onProgress } = {}) {
    const url = normalizeInputUrl(rawUrl);
    if (!url) throw new Error("Dán link video TikTok vào ô bên trái.");
    if (!isTikTokUrl(url)) {
      throw new Error("Link không phải TikTok. Dùng tiktok.com, vt.tiktok.com hoặc vm.tiktok.com.");
    }

    const proxy = getProxy();
    if (!proxy) {
      throw new Error(
        "Chưa cấu hình dịch vụ tải TikTok (admin). Deploy Worker onetool-tiktok và điền tiktokCloud trong ot-config.js."
      );
    }

    const endpoint = proxy.replace(/\/$/, "") + "/resolve";
    let lastErr;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal
        });
        const raw = await res.text();
        let data;
        try {
          data = JSON.parse(raw);
        } catch (_) {
          throw new Error(raw.slice(0, 180) || "Phản hồi không hợp lệ từ máy chủ.");
        }
        if (!res.ok || data?.error) {
          const errMsg = String(data?.error || "Không lấy được video.");
          if (/Free Api Limit|10000 request/i.test(errMsg)) {
            throw new Error(
              "Worker onetool-tiktok đang chạy bản cũ (v1) hoặc hết quota ngày. Cloudflare → Worker onetool-tiktok → dán workers/tiktok-proxy.js → Deploy. Kiểm tra URL Worker phải trả \"version\":5 (không phải onetool-whisper)."
            );
          }
          if (/quá tải|1 lần\/giây|limit|request\/second|hạn mức|1 day|10000/i.test(errMsg) && attempt < 3) {
            onProgress?.("Đang đổi nguồn / chờ giới hạn…", 20 + attempt * 10);
            await new Promise((r) => setTimeout(r, 1500 + attempt * 500));
            continue;
          }
          throw new Error(errMsg);
        }
        if (!data?.data) throw new Error("Không có dữ liệu video.");
        return data.data;
      } catch (e) {
        lastErr = e;
        if (e.name === "AbortError") throw e;
        if (/Failed to fetch|NetworkError|Load failed/i.test(e.message || "")) {
          throw new Error(
            "Không gọi được Worker TikTok. Kiểm tra mạng hoặc URL: " + getProxy()
          );
        }
        if (/quá tải|1 lần\/giây|limit|request\/second|hạn mức|1 day|10000/i.test(e.message || "") && attempt < 3) {
          onProgress?.("Đang thử lại…", 20 + attempt * 10);
          await new Promise((r) => setTimeout(r, 1500 + attempt * 500));
          continue;
        }
        throw e;
      }
    }
    throw lastErr || new Error("Không lấy được video.");
  }

  function fileProxyUrl(mediaUrl, fileName) {
    const proxy = getProxy();
    if (!proxy || !mediaUrl) return mediaUrl;
    const u = new URL(proxy.replace(/\/$/, "") + "/file");
    u.searchParams.set("src", mediaUrl);
    u.searchParams.set("name", fileName);
    return u.toString();
  }

  async function downloadViaProxy(mediaUrl, fileName, onProgress) {
    const href = fileProxyUrl(mediaUrl, fileName);
    if (!href) throw new Error("Không tạo được link tải.");

    const inApp = window.OT?.isInAppBrowser?.() === true;

    // In-app (Facebook/Zalo/IG…): không fetch→blob — WebView chặn a.download
    if (inApp && window.OT?.downloadUrl) {
      onProgress?.("Đang mở file tải…", 80);
      await OT.downloadUrl(href, fileName, { forceNavigate: true });
      onProgress?.("Nếu chưa tải: ⋮ → Mở bằng trình duyệt", 100);
      return 0;
    }

    onProgress?.("Đang tải file…", 70);
    if (window.OT?.downloadUrl) {
      try {
        await OT.downloadUrl(href, fileName);
        onProgress?.("Hoàn tất!", 100);
        return 0;
      } catch (e) {
        // Fallback: tải CORS trực tiếp rồi blob
        onProgress?.("Thử nguồn khác…", 78);
        const res = await fetch(mediaUrl, { mode: "cors" }).catch(() => null);
        if (!res || !res.ok) throw e;
        const blob = await res.blob();
        if (!blob.size) throw e;
        await OT.downloadBlob(blob, fileName);
        onProgress?.("Hoàn tất!", 100);
        return blob.size;
      }
    }

    let res = await fetch(href);
    if (!res.ok && res.status === 403) {
      onProgress?.("Thử tải trực tiếp…", 78);
      try {
        res = await fetch(mediaUrl, { mode: "cors" });
      } catch (_) {}
    }
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      let msg = "Tải file thất bại.";
      try {
        msg = JSON.parse(t)?.error || msg;
      } catch (_) {}
      throw new Error(msg);
    }
    const blob = await res.blob();
    if (!blob.size) throw new Error("File rỗng.");
    onProgress?.("Hoàn tất!", 100);
    if (window.OT?.downloadBlob) await OT.downloadBlob(blob, fileName);
    else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
    return blob.size;
  }

  return {
    getProxy,
    setProxy,
    isLocalHost,
    normalizeInputUrl,
    isTikTokUrl,
    resolve,
    fileProxyUrl,
    downloadViaProxy,
    formatBytes,
    formatDuration,
    formatCount,
    safeFileBase
  };
})();
