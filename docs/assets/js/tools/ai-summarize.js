/**
 * Tóm tắt AI — gọi Cloudflare Worker Groq /summarize.
 */
window.OTSummarize = (function () {
  "use strict";

  const LS_PROXY = "ot_summarize_proxy";
  const DEFAULT_CLOUD = "https://onetool-whisper.buiquangvinh2210.workers.dev";
  const MAX_CHARS = 20000;

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
    const cloud = String(cfg.summarizeCloud || cfg.whisperCloud || DEFAULT_CLOUD).trim();
    if (cloud && !/YOUR_|XXXX|CHANGEME/i.test(cloud)) return resolveProxy(cloud);
    return resolveProxy(DEFAULT_CLOUD);
  }

  function countStats(text) {
    const t = String(text || "");
    const chars = t.length;
    const words = t.trim() ? t.trim().split(/\s+/).length : 0;
    const lines = t ? t.split(/\n/).length : 0;
    return { chars, words, lines };
  }

  function formatCount(n) {
    return Number(n || 0).toLocaleString("vi-VN");
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function parseRetryAfter(data, msg) {
    const n = Number(data?.retryAfter);
    if (Number.isFinite(n) && n > 0) return Math.min(45, Math.ceil(n));
    const m = String(msg || "").match(/try again in\s*([\d.]+)\s*s/i);
    if (m) return Math.min(45, Math.max(1, Math.ceil(Number(m[1]))));
    const m2 = String(msg || "").match(/chờ khoảng\s*(\d+)\s*giây/i);
    if (m2) return Math.min(45, Math.max(1, Number(m2[1])));
    return 10;
  }

  function isRateLimitPayload(res, data, msg) {
    if (res?.status === 429 || data?.code === "rate_limit") return true;
    const t = String(msg || data?.error || "").toLowerCase();
    return t.includes("rate limit") || t.includes("hết hạn mức") || t.includes("tokens per minute");
  }

  function friendlyError(msg, retrySec) {
    const raw = String(msg || "");
    if (/rate limit|tokens per minute|hết hạn mức/i.test(raw)) {
      return (
        "Hết hạn mức AI miễn phí tạm thời. Chờ khoảng " +
        (retrySec || 10) +
        " giây rồi thử lại (hoặc rút ngắn văn bản)."
      );
    }
    return raw || "Tóm tắt thất bại.";
  }

  async function callOnce(endpoint, payload, signal) {
    let res;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal
      });
    } catch (e) {
      if (e.name === "AbortError") throw e;
      throw new Error("Không gọi được Worker AI. Kiểm tra mạng hoặc URL proxy.");
    }

    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      throw new Error(raw.slice(0, 180) || "Phản hồi không hợp lệ từ máy chủ AI.");
    }
    return { res, data };
  }

  async function summarize(opts) {
    const text = String(opts?.text || "").trim();
    if (!text) throw new Error("Dán hoặc mở văn bản cần tóm tắt.");
    if (text.length < 40) throw new Error("Nội dung quá ngắn — cần ít nhất ~40 ký tự.");
    if (text.length > MAX_CHARS) {
      throw new Error(
        "Nội dung quá dài (tối đa " +
          formatCount(MAX_CHARS) +
          " ký tự). Hãy cắt bớt rồi thử lại."
      );
    }

    const proxy = getProxy();
    if (!proxy) {
      throw new Error(
        "Chưa cấu hình dịch vụ AI. Deploy Worker onetool-whisper (có GROQ_API_KEY) và kiểm tra ot-config.js."
      );
    }

    const endpoint = proxy.replace(/\/$/, "") + "/summarize";
    const payload = {
      text,
      length: opts.length || "medium",
      format: opts.format || "bullets",
      language: opts.language || "vi",
      focus: opts.focus || "general"
    };

    let lastMsg = "Tóm tắt thất bại.";
    for (let attempt = 0; attempt < 2; attempt++) {
      const { res, data } = await callOnce(endpoint, payload, opts.signal);

      if (res.ok && data?.summary) {
        return {
          summary: String(data.summary),
          meta: data.meta || {},
          input: countStats(text),
          output: countStats(data.summary)
        };
      }

      lastMsg = String(data?.error || lastMsg);
      if (isRateLimitPayload(res, data, lastMsg) && attempt === 0) {
        const wait = parseRetryAfter(data, lastMsg);
        if (typeof opts.onWait === "function") opts.onWait(wait);
        await sleep(wait * 1000);
        continue;
      }

      throw new Error(friendlyError(lastMsg, parseRetryAfter(data, lastMsg)));
    }

    throw new Error(friendlyError(lastMsg));
  }

  return {
    MAX_CHARS,
    getProxy,
    countStats,
    formatCount,
    summarize
  };
})();
