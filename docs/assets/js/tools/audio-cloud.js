window.OTAudioCloud = (function () {
  "use strict";

  const LS_PROXY = "ot_groq_proxy";
  /** large-v3 ổn định tiếng Việt hơn turbo (turbo hay “vỡ chữ” giữa bài). */
  const MODEL = "whisper-large-v3";
  const CHUNK_SEC = 90;
  const OVERLAP_SEC = 2;
  const CHUNK_TRIGGER_SEC = 100;

  const PROMPT_VI =
    "Đây là bản tin tiếng Việt, có dấu đầy đủ, câu văn liền mạch. Tên địa danh và đơn vị: Việt Nam, Malaysia, Indonesia, USD, tấn, đồng/kg.";

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
    if (isLocalHost()) {
      return "http://127.0.0.1:8787";
    }
    try {
      const saved = (localStorage.getItem(LS_PROXY) || "").trim();
      if (saved.includes("127.0.0.1") || saved.includes("localhost")) {
        localStorage.removeItem(LS_PROXY);
      }
    } catch (_) {}

    const cfg = window.OT_CONFIG || {};
    const cloud = String(cfg.whisperCloud || "").trim();
    if (cloud && !/YOUR_|XXXX|CHANGEME/i.test(cloud)) {
      return resolveProxy(cloud);
    }
    return resolveProxy(cfg.whisperProxy || "/api/whisper.ashx");
  }

  function setProxy(v) {
    if (!isLocalHost()) return;
    const t = String(v || "").trim().replace(/\/$/, "");
    if (t) localStorage.setItem(LS_PROXY, t);
    else localStorage.removeItem(LS_PROXY);
  }

  function mapLang(language) {
    if (!language || language === "auto") return "auto";
    if (language === "vietnamese" || language === "vi") return "vi";
    if (language === "english" || language === "en") return "en";
    return language;
  }

  function langPrompt(lang) {
    if (lang === "vi") return PROMPT_VI;
    if (lang === "en") {
      return "This is clear English speech with proper punctuation and complete sentences.";
    }
    return "";
  }

  /** Gộp đoạn kiểu "a b c d" / quá nhiều token 1 ký tự (Whisper đôi khi lỗi giữa bài). */
  function polishText(text) {
    if (!text) return "";
    let t = String(text).replace(/\r/g, "");
    // 4+ chữ cái đơn cách nhau bằng space → gộp
    t = t.replace(/(?:^|[^\S\n])(?:[A-Za-zÀ-ỹà-ỹ]\s+){3,}[A-Za-zÀ-ỹà-ỹ](?=(?:[^\S\n]|$|[.,!?;:]))/gu, (m) => {
      const lead = /^\s/.test(m) ? m[0] : "";
      return lead + m.trim().replace(/\s+/g, "");
    });
    t = t.replace(/[ \t]{2,}/g, " ");
    t = t.replace(/ *\n[ \t]+/g, "\n");
    return t.trim();
  }

  function segmentsToSrt(segments) {
    if (!segments?.length) return "";
    const pad = (n, w = 2) => String(n).padStart(w, "0");
    const fmt = (sec) => {
      const ms = Math.max(0, Math.round((sec || 0) * 1000));
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const frac = ms % 1000;
      return `${pad(h)}:${pad(m)}:${pad(s)},${String(frac).padStart(3, "0")}`;
    };
    return segments
      .map((seg, i) => {
        const start = seg.start ?? 0;
        const end = seg.end ?? start + 1;
        const text = polishText(seg.text || "");
        return `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${text}\n`;
      })
      .join("\n");
  }

  function writeWav(audioBuffer, startSec, endSec) {
    const sampleRate = audioBuffer.sampleRate;
    const channels = 1;
    const start = Math.max(0, Math.floor(startSec * sampleRate));
    const end = Math.min(audioBuffer.length, Math.floor(endSec * sampleRate));
    const len = Math.max(0, end - start);
    const src =
      audioBuffer.numberOfChannels > 1
        ? mixMono(audioBuffer, start, len)
        : audioBuffer.getChannelData(0).subarray(start, end);

    const bytesPerSample = 2;
    const blockAlign = channels * bytesPerSample;
    const dataSize = len * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const w = (off, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
    };
    w(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    w(8, "WAVE");
    w(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    w(36, "data");
    view.setUint32(40, dataSize, true);
    let o = 44;
    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, src[i] || 0));
      view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
    return new Blob([buffer], { type: "audio/wav" });
  }

  function mixMono(audioBuffer, start, len) {
    const n = audioBuffer.numberOfChannels;
    const out = new Float32Array(len);
    for (let c = 0; c < n; c++) {
      const ch = audioBuffer.getChannelData(c);
      for (let i = 0; i < len; i++) out[i] += ch[start + i] / n;
    }
    return out;
  }

  async function decodeFile(file) {
    const ab = await file.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      return await ctx.decodeAudioData(ab.slice(0));
    } finally {
      try {
        await ctx.close();
      } catch (_) {}
    }
  }

  async function postGroq(proxy, blob, fileName, { language, prompt, signal }) {
    const fd = new FormData();
    fd.append("file", blob, fileName || "audio.wav");
    fd.append("model", MODEL);
    fd.append("response_format", "verbose_json");
    fd.append("temperature", "0");
    if (language && language !== "auto") fd.append("language", language);
    if (prompt) fd.append("prompt", prompt.slice(0, 800));

    const res = await fetch(proxy, { method: "POST", body: fd, signal });
    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      if (res.status === 404 || res.status === 405) {
        throw new Error(
          "API nhận dạng chưa sẵn sàng trên host này. Deploy Cloudflare Worker (workers/README.md) và điền whisperCloud trong ot-config.js."
        );
      }
      throw new Error(raw.slice(0, 200) || "Phản hồi không hợp lệ.");
    }
    if (!res.ok) {
      const msg = data?.error?.message || data?.error || raw.slice(0, 240);
      throw new Error(typeof msg === "string" ? msg : "Lỗi nhận dạng.");
    }
    return data;
  }

  function mergeChunkText(prev, next, overlapSec) {
    const a = (prev || "").trim();
    const b = (next || "").trim();
    if (!a) return b;
    if (!b) return a;
    // Tránh lặp câu overlap: nếu đầu chunk sau trùng đuôi chunk trước
    const tail = a.slice(-80);
    for (let n = Math.min(60, b.length); n >= 12; n--) {
      const head = b.slice(0, n);
      if (tail.includes(head) || a.endsWith(head)) {
        return (a + " " + b.slice(n)).replace(/\s+/g, " ").trim();
      }
    }
    return (a + " " + b).replace(/\s+/g, " ").trim();
  }

  /** Groq qua proxy — key trên server; user không dán. */
  async function transcribe(file, { language = "vietnamese", onProgress } = {}) {
    if (!file) throw new Error("Chọn file audio hoặc video.");
    if (file.size > 25 * 1024 * 1024) {
      throw new Error("File quá lớn (tối đa ~25MB).");
    }

    const proxy = getProxy();
    if (!proxy) throw new Error("Chưa cấu hình dịch vụ nhận dạng (admin).");

    const lang = mapLang(language);
    const basePrompt = langPrompt(lang);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 180_000);

    try {
      onProgress?.("Đang đọc audio…", 8);
      let audioBuf = null;
      try {
        audioBuf = await decodeFile(file);
      } catch (_) {
        audioBuf = null;
      }

      const duration = audioBuf?.duration || 0;
      const useChunks = audioBuf && duration > CHUNK_TRIGGER_SEC;
      let text = "";
      let segments = [];

      if (!useChunks) {
        onProgress?.("Đang gửi lên Groq Whisper…", 20);
        const data = await postGroq(proxy, file, file.name || "audio.mp3", {
          language: lang,
          prompt: basePrompt,
          signal: ctrl.signal
        });
        text = data.text || "";
        segments = data.segments || [];
      } else {
        const step = CHUNK_SEC - OVERLAP_SEC;
        const total = Math.ceil(duration / step);
        let prompt = basePrompt;
        let idx = 0;
        for (let start = 0; start < duration; start += step) {
          const end = Math.min(duration, start + CHUNK_SEC);
          idx += 1;
          const pct = 15 + Math.round((idx / total) * 70);
          onProgress?.(`Đang nhận dạng đoạn ${idx}/${total}…`, pct);
          const wav = writeWav(audioBuf, start, end);
          const data = await postGroq(proxy, wav, `chunk-${idx}.wav`, {
            language: lang,
            prompt,
            signal: ctrl.signal
          });
          const part = (data.text || "").trim();
          text = mergeChunkText(text, part, OVERLAP_SEC);
          const offset = start;
          for (const s of data.segments || []) {
            segments.push({
              ...s,
              start: (s.start || 0) + offset,
              end: (s.end || 0) + offset,
              text: s.text
            });
          }
          // Prompt = đuôi đoạn trước để model không lệch ngôn ngữ giữa bài
          prompt = ((basePrompt ? basePrompt + " " : "") + text.slice(-350)).slice(0, 800);
          if (end >= duration - 0.05) break;
        }
      }

      text = polishText(text);
      const srt = segmentsToSrt(segments);
      onProgress?.("Hoàn tất!", 100);

      return {
        text,
        srt,
        chunks: segments.map((s) => ({
          text: s.text,
          timestamp: [s.start, s.end]
        })),
        trimmed: false,
        provider: "groq",
        fileNameTxt: OT.nameWithSuffix(file.name, "-transcript", ".txt"),
        fileNameSrt: OT.nameWithSuffix(file.name, "-transcript", ".srt")
      };
    } catch (e) {
      if (e.name === "AbortError") throw new Error("Hết thời gian chờ. Thử file ngắn hơn.");
      if (/Failed to fetch|NetworkError|Load failed/i.test(e.message || "")) {
        if (isLocalHost()) {
          throw new Error("Không gọi được proxy local. Chạy docs/serve-audio.bat.");
        }
        throw new Error("Không gọi được /api/whisper.ashx trên IIS.");
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  return { transcribe, getProxy, setProxy, isLocalHost };
})();
