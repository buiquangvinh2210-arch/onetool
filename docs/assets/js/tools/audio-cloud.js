/**
 * Audio/Video → Text (Groq Whisper large-v3).
 * Ưu tiên: đủ câu, đúng thứ tự, lọc ảo giác YouTube — không cắt nội dung thật.
 */
window.OTAudioCloud = (function () {
  "use strict";

  const LS_PROXY = "ot_groq_proxy";
  const MODEL = "whisper-large-v3";
  /**
   * Groq free: ~20 RPM, ~7200 audio-sec/giờ.
   * Đoạn ~2 phút → ít request hơn (tránh 429), vẫn đủ overlap để không mất câu.
   * WAV 16k mono 120s ≈ 3.8MB (< 25MB limit).
   */
  const CHUNK_SEC = 120;
  const OVERLAP_SEC = 6;
  const CHUNK_TRIGGER_SEC = 100;
  const CHUNK_GAP_MS = 3200;
  const TARGET_SR = 16000;
  const MAX_INPUT_BYTES = 512 * 1024 * 1024;
  const DIRECT_UPLOAD_MAX = 18 * 1024 * 1024;

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
    if (isLocalHost()) return "http://127.0.0.1:8787";
    try {
      const saved = (localStorage.getItem(LS_PROXY) || "").trim();
      if (saved.includes("127.0.0.1") || saved.includes("localhost")) {
        localStorage.removeItem(LS_PROXY);
      }
    } catch (_) {}
    const cfg = window.OT_CONFIG || {};
    const cloud = String(cfg.whisperCloud || "").trim();
    if (cloud && !/YOUR_|XXXX|CHANGEME/i.test(cloud)) return resolveProxy(cloud);
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

  function stripDiacritics(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  function normKey(s) {
    return stripDiacritics(s)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Chỉ cụm ảo giác YouTube rõ ràng — không đụng nội dung thật. */
  function stripHallucinations(text) {
    if (!text) return "";
    let t = String(text);
    for (let i = 0; i < 6; i++) {
      const before = t;
      t = t.replace(
        /(?:h[aă]y\s+)?subscribe\s+cho\s+k[eê]nh[\s\S]{0,120}?h[aấ]p\s+d[aẫ]n\.?/gi,
        " "
      );
      t = t.replace(/subscribe\s+cho\s+kenh[\s\S]{0,120}?hap\s+dan\.?/gi, " ");
      t = t.replace(/ghi[eề]n\s*m[iì]\s*g[oõ]/gi, " ");
      t = t.replace(/ghien\s*mi\s*go/gi, " ");
      t = t.replace(/please\s+subscribe[\s\S]{0,70}/gi, " ");
      t = t.replace(/thanks\s+for\s+watching[\s\S]{0,50}/gi, " ");
      t = t.replace(/\s{2,}/g, " ").trim();
      if (t === before) break;
    }
    return t;
  }

  function isJunkOnly(text) {
    const raw = String(text || "").trim();
    if (!raw) return true;
    const cleaned = stripHallucinations(raw).replace(/\s+/g, " ").trim();
    if (!cleaned) return true;
    const n = normKey(raw);
    // Đoạn ngắn gần như chỉ còn lời kêu subscribe / mì gõ
    if (n.length < 130 && (n.includes("subscribe") || n.includes("mi go") || n.includes("ghien mi"))) {
      return true;
    }
    return false;
  }

  /** Chuẩn hóa nhẹ — giữ đủ câu, không cắt lặp nội dung hợp lệ. */
  function polishText(text) {
    if (!text) return "";
    let t = stripHallucinations(String(text).replace(/\r/g, ""));
    // Gộp chữ rời "V i ệ t" → "Việt" (lỗi token Whisper)
    t = t.replace(/(?:^|[^\S\n])(?:[A-Za-zÀ-ỹà-ỹ]\s+){3,}[A-Za-zÀ-ỹà-ỹ](?=(?:[^\S\n]|$|[.,!?;:]))/gu, (m) => {
      const lead = /^\s/.test(m) ? m[0] : "";
      return lead + m.trim().replace(/\s+/g, "");
    });
    t = t.replace(/[ \t]{2,}/g, " ");
    t = t.replace(/ *\n+/g, "\n");
    // Chỉ bỏ câu trùng LIỀN KỀ (giống hệt), không bỏ câu lặp xa trong bài
    t = t.replace(/([^.!?\n]{12,}[.!?…]?)\s+\1/gi, "$1");
    return stripHallucinations(t).trim();
  }

  function cleanSeg(text) {
    return polishText(text || "");
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
    let n = 0;
    return segments
      .map((seg) => {
        const text = cleanSeg(seg.text || "");
        if (!text || isJunkOnly(seg.text)) return "";
        n += 1;
        const start = seg.start ?? 0;
        const end = Math.max(start + 0.2, seg.end ?? start + 1);
        return `${n}\n${fmt(start)} --> ${fmt(end)}\n${text}\n`;
      })
      .filter(Boolean)
      .join("\n");
  }

  /** Text đầy đủ từ segments theo thời gian — nguồn chính xác hơn data.text. */
  function textFromSegments(segments) {
    if (!segments?.length) return "";
    const parts = [];
    let prev = "";
    for (const seg of segments) {
      const t = cleanSeg(seg.text || "");
      if (!t || isJunkOnly(seg.text)) continue;
      const n = normKey(t);
      if (n && n === prev) continue;
      prev = n;
      parts.push(t);
    }
    return polishText(parts.join(" "));
  }

  function mixMono(audioBuffer, start, len) {
    const n = audioBuffer.numberOfChannels;
    const out = new Float32Array(len);
    for (let c = 0; c < n; c++) {
      const ch = audioBuffer.getChannelData(c);
      for (let i = 0; i < len; i++) out[i] += (ch[start + i] || 0) / n;
    }
    return out;
  }

  function resampleTo(samples, fromRate, toRate) {
    if (fromRate === toRate) return samples;
    const ratio = fromRate / toRate;
    const outLen = Math.max(1, Math.floor(samples.length / ratio));
    const out = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const x = i * ratio;
      const i0 = Math.floor(x);
      const i1 = Math.min(samples.length - 1, i0 + 1);
      const f = x - i0;
      out[i] = samples[i0] * (1 - f) + samples[i1] * f;
    }
    return out;
  }

  /** WAV mono 16-bit 16kHz — format Whisper xử lý ổn định nhất. */
  function writeWav16k(audioBuffer, startSec, endSec) {
    const fromRate = audioBuffer.sampleRate;
    const start = Math.max(0, Math.floor(startSec * fromRate));
    const end = Math.min(audioBuffer.length, Math.floor(endSec * fromRate));
    const len = Math.max(0, end - start);
    let mono =
      audioBuffer.numberOfChannels > 1
        ? mixMono(audioBuffer, start, len)
        : audioBuffer.getChannelData(0).subarray(start, end);
    // copy subarray (có thể là view)
    mono = Float32Array.from(mono);
    const samples = resampleTo(mono, fromRate, TARGET_SR);
    const sampleRate = TARGET_SR;
    const dataSize = samples.length * 2;
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
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    w(36, "data");
    view.setUint32(40, dataSize, true);
    let o = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i] || 0));
      view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
    return new Blob([buffer], { type: "audio/wav" });
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

  function isVideoFile(file) {
    const type = (file.type || "").toLowerCase();
    const name = file.name || "";
    return (
      type.startsWith("video/") ||
      type === "video/quicktime" ||
      /\.(mp4|webm|mkv|mov|m4v|avi)$/i.test(name)
    );
  }

  async function extractAudioFromVideo(file, onProgress) {
    onProgress?.("Đang tách âm thanh từ video…", 10);
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.src = url;
    el.muted = true;
    el.playsInline = true;
    el.preload = "auto";

    try {
      await new Promise((resolve, reject) => {
        el.onloadedmetadata = () => resolve();
        el.onerror = () => reject(new Error("Không mở được file video (.mov/.mp4)."));
      });

      if (!el.captureStream && !el.mozCaptureStream) {
        throw new Error("Trình duyệt không tách được audio từ video. Hãy xuất MP3 rồi thử lại.");
      }

      const duration = el.duration || 0;
      if (!duration || !isFinite(duration)) throw new Error("Không đọc được độ dài video.");

      const stream = (el.captureStream || el.mozCaptureStream).call(el);
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks.length) throw new Error("Video không có track âm thanh.");

      const audioStream = new MediaStream(audioTracks);
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(audioStream, { mimeType: mime });
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      const stopped = new Promise((resolve) => {
        recorder.onstop = resolve;
      });
      recorder.start(250);
      el.currentTime = 0;
      await el.play();

      await new Promise((resolve) => {
        const timer = setInterval(() => {
          const pct = Math.min(28, 10 + (el.currentTime / duration) * 18);
          onProgress?.(
            `Đang tách audio từ video… ${Math.min(99, Math.round((el.currentTime / duration) * 100))}%`,
            pct
          );
        }, 400);
        el.onended = () => {
          clearInterval(timer);
          resolve();
        };
        setTimeout(() => {
          try {
            el.pause();
          } catch (_) {}
          clearInterval(timer);
          resolve();
        }, Math.ceil(duration * 1000) + 2000);
      });

      if (recorder.state !== "inactive") recorder.stop();
      await stopped;

      const blob = new Blob(chunks, { type: mime });
      if (!blob.size) throw new Error("Không tách được audio từ video.");
      onProgress?.("Đang đọc audio đã tách…", 30);
      return await decodeFile(new File([blob], "extract.webm", { type: mime }));
    } finally {
      URL.revokeObjectURL(url);
      try {
        el.removeAttribute("src");
        el.load();
      } catch (_) {}
    }
  }

  async function decodeMedia(file, onProgress) {
    try {
      return await decodeFile(file);
    } catch (_) {
      if (isVideoFile(file)) return extractAudioFromVideo(file, onProgress);
      throw new Error("Không đọc được audio. Thử MP3/WAV hoặc MP4/MOV có tiếng.");
    }
  }

  function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      const t = setTimeout(resolve, ms);
      const onAbort = () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  function isRateLimitMsg(msg, status) {
    if (status === 429) return true;
    return /rate limit|too many requests|quota|over capacity|ASH|audio seconds/i.test(
      String(msg || "")
    );
  }

  /** Groq: "Please try again in 7.52s" / "try again in 1m30s" */
  function parseRetryAfterSec(msg) {
    const s = String(msg || "");
    const mSec = s.match(/try again in\s*([\d.]+)\s*s/i);
    if (mSec) return Math.ceil(Number(mSec[1]) + 0.4);
    const mMin = s.match(/try again in\s*([\d.]+)\s*m(?:in(?:ute)?s?)?/i);
    if (mMin) return Math.ceil(Number(mMin[1]) * 60) + 1;
    const mCombo = s.match(/try again in\s*(\d+)\s*m(?:in)?\s*([\d.]+)\s*s/i);
    if (mCombo) return Number(mCombo[1]) * 60 + Math.ceil(Number(mCombo[2])) + 1;
    return null;
  }

  function friendlyRateLimitError(rawMsg) {
    if (/audio seconds|ASH|per hour/i.test(rawMsg || "")) {
      return "Đã hết hạn mức nhận dạng trong giờ này (video dài). Đợi khoảng 30–60 phút rồi thử lại, hoặc cắt video ngắn hơn.";
    }
    return "Máy chủ đang giới hạn tốc độ (rate limit). Đợi 1–2 phút rồi nhấn Nhận dạng lại — video dài sẽ tự chờ giữa các đoạn.";
  }

  async function postGroq(proxy, blob, fileName, { language, signal }) {
    const fd = new FormData();
    fd.append("file", blob, fileName || "audio.wav");
    fd.append("model", MODEL);
    fd.append("response_format", "verbose_json");
    fd.append("temperature", "0");
    // Không gửi prompt — tránh bias / ảo giác; language đủ để khóa tiếng Việt
    if (language && language !== "auto") fd.append("language", language);

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
      const err = new Error(typeof msg === "string" ? msg : "Lỗi nhận dạng.");
      err.status = res.status;
      err.rateLimited = isRateLimitMsg(err.message, res.status);
      throw err;
    }
    return data;
  }

  async function postGroqRetry(proxy, blob, fileName, opts) {
    const { language, signal, onProgress, progressPct } = opts;
    let lastErr;
    for (let attempt = 0; attempt < 12; attempt++) {
      try {
        return await postGroq(proxy, blob, fileName, { language, signal });
      } catch (e) {
        lastErr = e;
        if (!e.rateLimited && !isRateLimitMsg(e.message, e.status)) throw e;
        if (attempt >= 11) break;
        const parsed = parseRetryAfterSec(e.message);
        const waitSec = Math.min(90, Math.max(4, parsed || Math.round(6 * Math.pow(1.45, attempt))));
        onProgress?.(
          `Đang chờ rate limit… thử lại sau ${waitSec}s (${attempt + 1}/12)`,
          progressPct ?? 40
        );
        await sleep(waitSec * 1000, signal);
      }
    }
    throw new Error(friendlyRateLimitError(lastErr?.message || ""));
  }

  /** Gộp segment theo thời gian, bỏ trùng overlap giữa các chunk. */
  function mergeSegments(all, chunkSegs, offset, minStart) {
    for (const s of chunkSegs || []) {
      const start = (s.start || 0) + offset;
      const end = (s.end || 0) + offset;
      const text = s.text || "";
      if (isJunkOnly(text)) continue;
      const cleaned = cleanSeg(text);
      if (!cleaned) continue;
      // Bỏ segment nằm trong vùng overlap đã có
      if (start < minStart - 0.15) continue;
      all.push({ start, end, text: cleaned });
    }
    all.sort((a, b) => a.start - b.start || a.end - b.end);
    // Gộp segment trùng thời gian gần như nhau
    const out = [];
    for (const seg of all) {
      const last = out[out.length - 1];
      if (last && Math.abs(last.start - seg.start) < 0.35 && normKey(last.text) === normKey(seg.text)) {
        last.end = Math.max(last.end, seg.end);
        continue;
      }
      out.push(seg);
    }
    return out;
  }

  async function transcribe(file, { language = "vietnamese", onProgress } = {}) {
    if (!file) throw new Error("Chọn file audio hoặc video.");
    if (file.size > MAX_INPUT_BYTES) {
      throw new Error("File quá lớn (tối đa ~512MB). Hãy nén video trước rồi thử lại.");
    }

    const proxy = getProxy();
    if (!proxy) throw new Error("Chưa cấu hình dịch vụ nhận dạng (admin).");

    const lang = mapLang(language);
    const ctrl = new AbortController();
    // Video dài + chờ rate limit có thể > 10 phút
    const timer = setTimeout(() => ctrl.abort(), 2_700_000);

    try {
      onProgress?.("Đang đọc audio…", 8);
      let audioBuf = null;
      try {
        audioBuf = await decodeMedia(file, onProgress);
      } catch (_) {
        audioBuf = null;
      }

      const duration = audioBuf?.duration || 0;
      if (duration > 7200) {
        throw new Error(
          "Video dài hơn ~2 giờ — vượt hạn mức nhận dạng/giờ. Hãy cắt thành phần ngắn hơn rồi chạy lần lượt."
        );
      }
      const useChunks =
        !!audioBuf &&
        (isVideoFile(file) || file.size > DIRECT_UPLOAD_MAX || duration > CHUNK_TRIGGER_SEC);

      if (!audioBuf && (isVideoFile(file) || file.size > DIRECT_UPLOAD_MAX)) {
        throw new Error(
          "Không tách được tiếng từ video. Thử Chrome mới nhất, hoặc dùng Nén video → tách MP3."
        );
      }

      let segments = [];

      if (!useChunks) {
        onProgress?.("Đang nhận dạng…", 25);
        // Luôn gửi WAV 16k nếu đã decode được — ổn định hơn file gốc
        let upload;
        let uploadName;
        if (audioBuf) {
          upload = writeWav16k(audioBuf, 0, duration || audioBuf.duration);
          uploadName = "audio.wav";
        } else {
          upload = file;
          uploadName = file.name || "audio.mp3";
        }
        const data = await postGroqRetry(proxy, upload, uploadName, {
          language: lang,
          signal: ctrl.signal,
          onProgress,
          progressPct: 40
        });
        segments = mergeSegments([], data.segments || [], 0, 0);
        if (!segments.length && data.text) {
          const t = cleanSeg(data.text);
          if (t && !isJunkOnly(data.text)) {
            segments = [{ start: 0, end: duration || 1, text: t }];
          }
        }
      } else {
        const step = CHUNK_SEC - OVERLAP_SEC;
        const total = Math.max(1, Math.ceil(duration / step));
        let idx = 0;
        for (let start = 0; start < duration; start += step) {
          const end = Math.min(duration, start + CHUNK_SEC);
          idx += 1;
          const pct = 30 + Math.round((idx / total) * 65);
          onProgress?.(`Đang nhận dạng đoạn ${idx}/${total}…`, pct);
          if (idx > 1) await sleep(CHUNK_GAP_MS, ctrl.signal);
          const wav = writeWav16k(audioBuf, start, end);
          const data = await postGroqRetry(proxy, wav, `chunk-${idx}.wav`, {
            language: lang,
            signal: ctrl.signal,
            onProgress,
            progressPct: pct
          });
          // Chỉ nhận segment sau vùng overlap (trừ chunk đầu)
          const minStart = start === 0 ? 0 : start + OVERLAP_SEC * 0.55;
          segments = mergeSegments(segments, data.segments || [], start, minStart);

          // Fallback nếu chunk không trả segments nhưng có text
          if (!(data.segments || []).length && data.text) {
            const t = cleanSeg(data.text);
            if (t && !isJunkOnly(data.text)) {
              segments = mergeSegments(
                segments,
                [{ start: 0, end: end - start, text: t }],
                start,
                minStart
              );
            }
          }
          if (end >= duration - 0.05) break;
        }
      }

      segments.sort((a, b) => a.start - b.start);
      let text = textFromSegments(segments);
      // Nếu segments mỏng nhưng API có text tổng — bổ sung (không ghi đè nếu đã đủ)
      if (text.length < 40 && segments.length <= 1) {
        /* keep */
      }
      text = polishText(text);
      if (!text) throw new Error("Không nhận được lời thoại. Thử file rõ tiếng hơn hoặc MP3.");

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
      if (e.name === "AbortError") throw new Error("Hết thời gian chờ. Thử file ngắn hơn hoặc nén trước.");
      if (/Failed to fetch|NetworkError|Load failed/i.test(e.message || "")) {
        if (isLocalHost()) throw new Error("Không gọi được proxy local. Chạy docs/serve-audio.bat.");
        throw new Error("Không gọi được /api/whisper.ashx trên IIS.");
      }
      if (e.rateLimited || isRateLimitMsg(e.message, e.status)) {
        throw new Error(friendlyRateLimitError(e.message));
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  return { transcribe, getProxy, setProxy, isLocalHost, polishText };
})();
