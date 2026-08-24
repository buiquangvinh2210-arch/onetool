window.OTAudio = (function () {
  "use strict";

  let worker = null;
  let readyPromise = null;

  function assertHttpOrigin() {
    if (location.protocol === "file:") {
      throw new Error(
        "Trình duyệt chặn AI khi mở file://. Chạy: trong thư mục docs gõ  npx --yes serve -p 5500  rồi mở http://localhost:5500"
      );
    }
  }

  function formatSrtTime(seconds) {
    const ms = Math.max(0, Math.round((seconds || 0) * 1000));
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const frac = ms % 1000;
    const pad = (n, w = 2) => String(n).padStart(w, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)},${pad(frac, 3)}`;
  }

  function chunksToSrt(chunks) {
    if (!chunks?.length) return "";
    return chunks.map((c, i) => {
      const start = Array.isArray(c.timestamp) ? c.timestamp[0] : 0;
      const end = Array.isArray(c.timestamp) ? (c.timestamp[1] ?? start + 2) : start + 2;
      return `${i + 1}\n${formatSrtTime(start || 0)} --> ${formatSrtTime(end || 0)}\n${(c.text || "").trim()}\n`;
    }).join("\n");
  }

  function workerUrl() {
    const base = (window.OT_BASE || ".").replace(/\/$/, "");
    return `${base}/assets/js/tools/audio-worker.js`;
  }

  function ensureWorker(onProgress) {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise((resolve, reject) => {
      try {
        worker = new Worker(workerUrl(), { type: "module" });
      } catch (e) {
        readyPromise = null;
        reject(new Error("Trình duyệt không mở được Web Worker. Thử Chrome/Edge mới hơn."));
        return;
      }

      const onMsg = (ev) => {
        const msg = ev.data || {};
        if (msg.type === "progress") {
          onProgress?.(msg.msg, msg.pct);
          return;
        }
        if (msg.type === "ready") {
          resolve(worker);
          return;
        }
        if (msg.type === "error") {
          readyPromise = null;
          worker?.terminate();
          worker = null;
          reject(new Error(msg.message || "Worker lỗi."));
        }
      };

      worker.onmessage = onMsg;
      worker.onerror = (e) => {
        readyPromise = null;
        worker = null;
        reject(new Error(e.message || "Không tải được audio-worker.js (kiểm tra đường dẫn / HTTP)."));
      };

      onProgress?.("Khởi tạo worker Whisper…", 6);
      worker.postMessage({ type: "init" });
    });
    return readyPromise;
  }

  function runInWorker(audio, options, onProgress) {
    return new Promise((resolve, reject) => {
      if (!worker) {
        reject(new Error("Worker chưa sẵn sàng."));
        return;
      }
      const prev = worker.onmessage;
      worker.onmessage = (ev) => {
        const msg = ev.data || {};
        if (msg.type === "progress") {
          onProgress?.(msg.msg, msg.pct);
          return;
        }
        if (msg.type === "result") {
          worker.onmessage = prev;
          resolve(msg);
          return;
        }
        if (msg.type === "error") {
          worker.onmessage = prev;
          reject(new Error(msg.message || "Nhận dạng thất bại."));
        }
      };
      const copy = audio.slice();
      worker.postMessage(
        { type: "transcribe", audio: copy.buffer, options },
        [copy.buffer]
      );
    });
  }

  function mixToMono(audio) {
    const length = audio.length;
    const channels = audio.numberOfChannels;
    const mono = new Float32Array(length);
    for (let c = 0; c < channels; c++) {
      const data = audio.getChannelData(c);
      for (let i = 0; i < length; i++) mono[i] += data[i] / channels;
    }
    if (audio.sampleRate === 16000) return mono;
    const ratio = audio.sampleRate / 16000;
    const newLen = Math.floor(mono.length / ratio);
    const out = new Float32Array(newLen);
    for (let i = 0; i < newLen; i++) out[i] = mono[Math.floor(i * ratio)];
    return out;
  }

  function trimSamples(samples, maxSec = 180) {
    const max = Math.floor(maxSec * 16000);
    if (samples.length <= max) return { samples, trimmed: false, seconds: samples.length / 16000 };
    return { samples: samples.subarray(0, max), trimmed: true, seconds: maxSec };
  }

  async function decodeViaAudioContext(file) {
    const buf = await file.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx({ sampleRate: 16000 });
    try {
      const audio = await ctx.decodeAudioData(buf.slice(0));
      const samples = mixToMono(audio);
      await ctx.close();
      return samples;
    } catch (e) {
      await ctx.close();
      throw e;
    }
  }

  async function decodeViaMediaElement(file, onProgress) {
    onProgress?.("Đang tách âm thanh từ video…", 58);
    const url = URL.createObjectURL(file);
    const isVideo = (file.type || "").startsWith("video") || /\.(mp4|webm|mkv|mov)$/i.test(file.name);
    const el = document.createElement(isVideo ? "video" : "audio");
    el.src = url;
    el.muted = true;
    el.playsInline = true;

    await new Promise((resolve, reject) => {
      el.onloadedmetadata = () => resolve();
      el.onerror = () => reject(new Error("Không mở được file media."));
    });

    if (!el.captureStream && !el.mozCaptureStream) {
      URL.revokeObjectURL(url);
      throw new Error("Trình duyệt không hỗ trợ tách audio từ video. Hãy xuất MP3/WAV rồi upload.");
    }

    const duration = Math.min(el.duration || 0, 3 * 60);
    if (!duration || !isFinite(duration)) {
      URL.revokeObjectURL(url);
      throw new Error("Không đọc được độ dài media.");
    }

    const stream = (el.captureStream || el.mozCaptureStream).call(el);
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) {
      URL.revokeObjectURL(url);
      throw new Error("Video không có track âm thanh.");
    }

    const audioStream = new MediaStream(audioTracks);
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const recorder = new MediaRecorder(audioStream, { mimeType: mime });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
    recorder.start(250);
    el.currentTime = 0;
    await el.play();

    await new Promise((resolve) => {
      const timer = setInterval(() => {
        onProgress?.(
          `Đang tách audio… ${Math.round((el.currentTime / duration) * 100)}%`,
          58 + Math.min(10, (el.currentTime / duration) * 10)
        );
      }, 400);
      el.onended = () => { clearInterval(timer); resolve(); };
      setTimeout(() => {
        try { el.pause(); } catch (_) {}
        clearInterval(timer);
        resolve();
      }, Math.ceil(duration * 1000) + 1500);
    });

    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    URL.revokeObjectURL(url);
    const blob = new Blob(chunks, { type: mime });
    if (!blob.size) throw new Error("Không ghi được audio từ video.");
    return decodeViaAudioContext(new File([blob], "extract.webm", { type: mime }));
  }

  async function decodeToMono16k(file, onProgress) {
    onProgress?.("Đang giải mã âm thanh…", 56);
    try {
      return await decodeViaAudioContext(file);
    } catch (_) {
      return decodeViaMediaElement(file, onProgress);
    }
  }

  function mapLanguage(language) {
    if (!language || language === "auto") return null;
    const map = { vietnamese: "vietnamese", vi: "vietnamese", english: "english", en: "english" };
    return map[language] || language;
  }

  function showOverlay(on) {
    let el = document.getElementById("otAiOverlay");
    if (on) {
      if (!el) {
        el = document.createElement("div");
        el.id = "otAiOverlay";
        el.className = "ot-ai-overlay";
        el.innerHTML = `<div class="ot-ai-overlay-card"><div class="ot-ai-spinner"></div><strong id="otAiOverlayTitle">Đang xử lý…</strong><p id="otAiOverlayMsg">Giữ tab này mở — UI vẫn hiện, model chạy nền.</p></div>`;
        document.body.appendChild(el);
      }
      el.hidden = false;
    } else if (el) {
      el.hidden = true;
    }
  }

  function setOverlayText(title, msg) {
    const t = document.getElementById("otAiOverlayTitle");
    const m = document.getElementById("otAiOverlayMsg");
    if (t && title) t.textContent = title;
    if (m && msg) m.textContent = msg;
  }

  async function transcribe(file, { language = "vietnamese", onProgress } = {}) {
    if (!file) throw new Error("Chọn file audio hoặc video.");
    assertHttpOrigin();
    if (file.size > 25 * 1024 * 1024) {
      throw new Error("File quá lớn (tối đa ~25MB để tránh treo trình duyệt).");
    }

    const progress = (msg, pct) => {
      onProgress?.(msg, pct);
      setOverlayText("Audio → Text", msg || "Đang xử lý…");
    };

    showOverlay(true);
    progress("Chuẩn bị…", 3);

    // Cho UI kịp vẽ overlay trước khi nặng
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 40)));

    try {
      await ensureWorker(progress);
      let audio = await decodeToMono16k(file, progress);
      const trimmed = trimSamples(audio, 180);
      audio = trimmed.samples;
      if (trimmed.trimmed) {
        progress(`Chỉ nhận dạng ${Math.round(trimmed.seconds)}s đầu để nhanh hơn.`, 65);
      }

      const lang = mapLanguage(language);
      const durationSec = audio.length / 16000;
      const options = {
        task: "transcribe",
        return_timestamps: true
      };
      if (durationSec > 20) {
        options.chunk_length_s = 15;
        options.stride_length_s = 2;
      }
      if (lang) options.language = lang;

      progress("Đang nhận dạng (worker)…", 72);
      const result = await runInWorker(audio, options, progress);
      const text = result.text || "";
      const chunks = result.chunks || [];
      const srt = chunksToSrt(chunks);
      progress("Hoàn tất!", 100);

      return {
        text,
        srt,
        chunks,
        trimmed: trimmed.trimmed,
        fileNameTxt: OT.nameWithSuffix(file.name, "-transcript", ".txt"),
        fileNameSrt: OT.nameWithSuffix(file.name, "-transcript", ".srt")
      };
    } finally {
      showOverlay(false);
    }
  }

  return { transcribe, chunksToSrt, formatSrtTime, assertHttpOrigin };
})();
