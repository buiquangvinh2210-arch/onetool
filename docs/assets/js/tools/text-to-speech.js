/**
 * Text → giọng nói — Cloudflare Worker POST /tts.
 */
window.OTTextToSpeech = (function () {
  "use strict";

  const DEFAULT_CLOUD = "https://onetool-whisper.buiquangvinh2210.workers.dev";
  const MAX_CHARS = 8000;

  const VOICES = [
    { id: "Kore", name: "Kora", gender: "female", hint: "Nữ ấm" },
    { id: "Aoede", name: "An", gender: "female", hint: "Nữ dịu" },
    { id: "Leda", name: "Lan", gender: "female", hint: "Nữ sáng" },
    { id: "Zephyr", name: "Hà", gender: "female", hint: "Nữ tươi" },
    { id: "Charon", name: "Minh", gender: "male", hint: "Nam trầm" },
    { id: "Puck", name: "Phúc", gender: "male", hint: "Nam rõ" },
    { id: "Fenrir", name: "Khang", gender: "male", hint: "Nam mạnh" },
    { id: "Orus", name: "Long", gender: "male", hint: "Nam ấm" }
  ];

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
      const saved = (localStorage.getItem("ot_tts_proxy") || "").trim();
      if (saved) {
        if (!isLocalHost() && (saved.includes("127.0.0.1") || saved.includes("localhost"))) {
          localStorage.removeItem("ot_tts_proxy");
        } else return resolveProxy(saved);
      }
    } catch (_) {}
    const cfg = window.OT_CONFIG || {};
    const cloud = String(cfg.ttsCloud || cfg.summarizeCloud || cfg.whisperCloud || "").trim();
    if (cloud && !/YOUR_|XXXX|CHANGEME/i.test(cloud)) return resolveProxy(cloud);
    return resolveProxy(DEFAULT_CLOUD);
  }

  function ttsEndpoint() {
    return getProxy().replace(/\/tts$/i, "") + "/tts";
  }

  async function probeHealth() {
    const proxy = getProxy();
    if (!proxy) return { ok: false, ready: false };
    try {
      const res = await fetch(proxy + "/", { method: "GET" });
      const data = await res.json();
      const ready = !!(data && Array.isArray(data.features) && data.features.includes("tts"));
      return { ok: !!data?.ok, ready, version: data?.version, features: data?.features || [] };
    } catch (_) {
      return { ok: false, ready: false };
    }
  }

  function friendlyError(status, data) {
    const err = String(data?.error || "");
    if (status === 429 || data?.code === "rate_limit") {
      return "Hết hạn mức tạm thời. Chờ vài giây rồi thử lại, hoặc nghe thử trên máy.";
    }
    if (err) return err;
    return "Không tạo được giọng đọc.";
  }

  async function synthesize(text, opts) {
    const t = String(text || "").trim();
    if (!t) throw new Error("Nhập văn bản cần đọc.");
    if (t.length > MAX_CHARS) throw new Error("Tối đa " + MAX_CHARS.toLocaleString("vi-VN") + " ký tự.");
    const proxy = getProxy();
    if (!proxy) throw new Error("Chưa cấu hình dịch vụ đọc thành tiếng.");
    const res = await fetch(ttsEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: t,
        voice: opts.voice || "Kore",
        style: opts.style || "natural"
      })
    });
    const raw = await res.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      throw new Error(res.status === 404 ? "Dịch vụ đọc chưa bật trên server. Deploy Worker (POST /tts)." : "Phản hồi không hợp lệ.");
    }
    if (!res.ok || !data?.audio) {
      const health = await probeHealth();
      if (health && Number(health.version) > 0 && Number(health.version) < 21) {
        throw new Error("Dịch vụ đọc chưa cập nhật. Deploy lại Worker rồi thử tạo file.");
      }
      throw new Error(friendlyError(res.status, data));
    }
    const mime = data.mime || "audio/wav";
    const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: mime });
    return { blob, mime, meta: data.meta || {} };
  }

  const VOICE_TONE = {
    Kore: { pitch: 1.02, rateAdj: 1 },
    Aoede: { pitch: 1.18, rateAdj: 0.94 },
    Leda: { pitch: 1.3, rateAdj: 1.08 },
    Zephyr: { pitch: 1.14, rateAdj: 1.12 },
    Charon: { pitch: 0.82, rateAdj: 0.9 },
    Puck: { pitch: 0.94, rateAdj: 1.08 },
    Fenrir: { pitch: 0.72, rateAdj: 1 },
    Orus: { pitch: 0.86, rateAdj: 0.94 }
  };

  function pickBrowserVoice(gender) {
    const list = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    const vi = list.filter((v) => /vi/i.test(v.lang) || /vietnam/i.test(v.name));
    const pool = vi.length ? vi : list;
    if (!pool.length) return null;
    const wantFemale = gender !== "male";
    const named = pool.find((v) => {
      const n = (v.name || "").toLowerCase();
      if (wantFemale) return /female|nữ|hoaimy|hoài my|linh|zira|samantha|\ban\b/.test(n);
      return /male|namminh|nam minh|david|mark|google uk english male/.test(n);
    });
    if (named) return named;
    if (wantFemale) {
      return pool.find((v) => /female|nữ|hoai|an/i.test(v.name)) || pool[0];
    }
    return pool.find((v) => /male|nam/i.test(v.name)) || pool[0];
  }

  function previewBrowser(text, opts) {
    if (!window.speechSynthesis) throw new Error("Trình duyệt không hỗ trợ nghe thử.");
    const t = String(text || "").trim();
    if (!t) throw new Error("Nhập văn bản cần đọc.");
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "vi-VN";
    const tone = VOICE_TONE[opts.voice] || VOICE_TONE.Kore;
    u.rate = Math.max(0.7, Math.min(1.35, (Number(opts.rate) || 1) * tone.rateAdj));
    u.pitch = tone.pitch;
    const voice = pickBrowserVoice(opts.gender);
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
    return u;
  }

  function stopBrowser() {
    try {
      speechSynthesis.cancel();
    } catch (_) {}
  }

  return { VOICES, MAX_CHARS, synthesize, previewBrowser, stopBrowser, probeHealth, getProxy };
})();
