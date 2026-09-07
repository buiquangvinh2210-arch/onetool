/**
 * TTS tiếng Việt UI.
 */
(function () {
  const S = window.OTTextToSpeech;
  if (!S) return;

  const SAMPLES = {
    chao: "Xin chào, đây là giọng đọc tiếng Việt trên OneTool. Bạn có thể nghe thử ngay hoặc tạo file WAV để tải về máy.",
    hoc: "Hôm nay chúng ta học từ mới: kiên trì. Kiên trì nghĩa là không bỏ cuộc, làm đều đặn mỗi ngày cho đến khi thành thạo.",
    qc: "OneTool giúp bạn xử lý PDF, ảnh và media ngay trên trình duyệt. Nhanh, miễn phí, giao diện tiếng Việt rõ ràng."
  };

  const els = {
    input: document.getElementById("inputText"),
    charMeta: document.getElementById("charMeta"),
    voiceGrid: document.getElementById("voiceGrid"),
    speedRange: document.getElementById("speedRange"),
    speedVal: document.getElementById("speedVal"),
    previewBtn: document.getElementById("previewBtn"),
    runBtn: document.getElementById("runBtn"),
    stopBtn: document.getElementById("stopBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    status: document.getElementById("status"),
    progress: document.getElementById("progressBar"),
    audio: document.getElementById("audioEl"),
    canvas: document.getElementById("waveCanvas"),
    playerMeta: document.getElementById("playerMeta"),
    fileInput: document.getElementById("fileInput")
  };

  let voice = "Kore";
  let style = "natural";
  let blob = null;
  let objectUrl = "";
  let busy = false;
  let cloudReady = true;
  let waveTimer = 0;
  const ctx = els.canvas.getContext("2d");

  function fmt(n) {
    return Number(n || 0).toLocaleString("vi-VN");
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.classList.toggle("is-ok", kind === "ok");
    els.status.classList.toggle("is-err", kind === "err");
  }

  function speed() {
    return Number(els.speedRange.value || 100) / 100;
  }

  function currentVoice() {
    return S.VOICES.find((v) => v.id === voice) || S.VOICES[0];
  }

  function updateChars() {
    const n = (els.input.value || "").length;
    els.charMeta.textContent = fmt(n) + " / " + fmt(S.MAX_CHARS) + " ký tự";
  }

  function drawWave(playing) {
    const w = els.canvas.width;
    const h = els.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const bars = 42;
    const gap = 4;
    const bw = (w - gap * (bars - 1)) / bars;
    const t = playing ? Date.now() / 220 : 0;
    for (let i = 0; i < bars; i++) {
      const amp = playing
        ? 0.25 + 0.75 * Math.abs(Math.sin(t + i * 0.33))
        : 0.18 + (i % 5) * 0.05;
      const bh = Math.max(8, amp * (h - 16));
      const x = i * (bw + gap);
      const y = (h - bh) / 2;
      ctx.fillStyle = playing ? "rgba(167, 139, 250, 0.95)" : "rgba(255,255,255,0.22)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, 4);
      else ctx.rect(x, y, bw, bh);
      ctx.fill();
    }
  }

  function startWave() {
    stopWave();
    const tick = () => {
      drawWave(true);
      waveTimer = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopWave() {
    if (waveTimer) cancelAnimationFrame(waveTimer);
    waveTimer = 0;
    drawWave(false);
  }

  function setBlob(next, meta) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    blob = next;
    objectUrl = next ? URL.createObjectURL(next) : "";
    els.audio.src = objectUrl;
    els.audio.playbackRate = speed();
    els.downloadBtn.disabled = !next;
    const kb = next ? (next.size / 1024).toFixed(0) + " KB" : "";
    const ext = (next.type || "").includes("mpeg") || (next.type || "").includes("mp3") ? "MP3" : "WAV";
    els.playerMeta.textContent = next
      ? "File " + ext + " · " + kb
      : "Chưa có file — bấm Tạo file âm thanh.";
  }

  function renderVoices() {
    els.voiceGrid.innerHTML = S.VOICES.map((v) => {
      const on = v.id === voice ? " is-on" : "";
      const initial = v.name.slice(0, 1);
      return (
        '<button type="button" class="tts-voice' +
        on +
        '" data-voice="' +
        v.id +
        '" data-gender="' +
        v.gender +
        '" role="radio" aria-checked="' +
        (v.id === voice) +
        '"><span class="tts-avatar">' +
        initial +
        "</span><span><strong>" +
        v.name +
        "</strong><em>" +
        v.hint +
        "</em></span></button>"
      );
    }).join("");
  }

  function stopAll() {
    S.stopBrowser();
    try {
      els.audio.pause();
      els.audio.currentTime = 0;
    } catch (_) {}
    stopWave();
    els.stopBtn.disabled = true;
  }

  async function preview() {
    const text = els.input.value.trim();
    if (!text) {
      setStatus("Nhập văn bản trước khi nghe thử.", "err");
      return;
    }
    stopAll();
    try {
      if ("speechSynthesis" in window) {
        speechSynthesis.getVoices();
      }
      S.previewBrowser(text, { gender: currentVoice().gender, rate: speed(), voice });
      els.stopBtn.disabled = false;
      startWave();
      setStatus("Đang nghe thử trên máy…", "ok");
      const uEnd = () => {
        stopWave();
        els.stopBtn.disabled = true;
      };
      if (window.speechSynthesis) {
        const waitEnd = setInterval(() => {
          if (!speechSynthesis.speaking) {
            clearInterval(waitEnd);
            uEnd();
          }
        }, 300);
      }
    } catch (e) {
      setStatus(e.message || "Không nghe thử được.", "err");
    }
  }

  async function createFile() {
    const text = els.input.value.trim();
    if (!text) {
      setStatus("Nhập văn bản trước khi tạo file.", "err");
      return;
    }
    if (busy) return;
    busy = true;
    els.runBtn.disabled = true;
    els.progress.hidden = false;
    stopAll();
    setStatus("Đang tạo giọng đọc…");
    try {
      const res = await S.synthesize(text, { voice, style });
      setBlob(res.blob, res.meta);
      els.audio.play().catch(() => {});
      els.stopBtn.disabled = false;
      startWave();
      setStatus("Đã tạo file. Nghe bên phải hoặc tải về.", "ok");
    } catch (e) {
      setStatus(e.message || "Không tạo được file.", "err");
    } finally {
      busy = false;
      els.runBtn.disabled = false;
      els.progress.hidden = true;
    }
  }

  renderVoices();
  updateChars();
  drawWave(false);

  els.voiceGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".tts-voice");
    if (!btn) return;
    voice = btn.dataset.voice;
    renderVoices();
  });

  document.querySelectorAll(".tts-style").forEach((btn) => {
    btn.addEventListener("click", () => {
      style = btn.dataset.style;
      document.querySelectorAll(".tts-style").forEach((b) => b.classList.toggle("is-on", b === btn));
    });
  });

  els.speedRange.addEventListener("input", () => {
    const r = speed();
    els.speedVal.textContent = r.toFixed(2).replace(/0$/, "") + "×";
    els.audio.playbackRate = r;
  });

  els.input.addEventListener("input", updateChars);
  els.previewBtn.addEventListener("click", preview);
  els.runBtn.addEventListener("click", createFile);
  els.stopBtn.addEventListener("click", () => {
    stopAll();
    setStatus("Đã dừng.", "");
  });

  els.downloadBtn.addEventListener("click", () => {
    if (!blob) return;
    const mp3 = (blob.type || "").includes("mpeg") || (blob.type || "").includes("mp3");
    const name = mp3 ? "onetool-giong-doc.mp3" : "onetool-giong-doc.wav";
    if (window.OT && OT.downloadBlob) OT.downloadBlob(blob, name);
    else {
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      a.click();
    }
    setStatus("Đã tải " + name, "ok");
  });

  document.getElementById("sampleBtn")?.addEventListener("click", () => {
    els.input.value = SAMPLES.chao;
    updateChars();
  });
  document.querySelectorAll("[data-sample]").forEach((btn) => {
    btn.addEventListener("click", () => {
      els.input.value = SAMPLES[btn.dataset.sample] || SAMPLES.chao;
      updateChars();
    });
  });
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    els.input.value = "";
    updateChars();
    stopAll();
    setBlob(null);
  });
  document.getElementById("fileBtn")?.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", async () => {
    const f = els.fileInput.files && els.fileInput.files[0];
    if (!f) return;
    const txt = await f.text();
    els.input.value = txt.slice(0, S.MAX_CHARS);
    updateChars();
    els.fileInput.value = "";
  });

  els.audio.addEventListener("play", () => {
    startWave();
    els.stopBtn.disabled = false;
  });
  els.audio.addEventListener("pause", stopWave);
  els.audio.addEventListener("ended", () => {
    stopWave();
    els.stopBtn.disabled = true;
  });

  if (window.speechSynthesis) {
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    speechSynthesis.getVoices();
  }

  S.probeHealth().then((h) => {
    cloudReady = !!(h && h.ready);
    if (cloudReady) return;
    setStatus("Tạo file WAV cần cập nhật Worker (POST /tts). Vẫn nghe thử được trên máy.", "err");
  });
})();
