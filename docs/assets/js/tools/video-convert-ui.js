import { FFmpeg } from "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js";
import { fetchFile, toBlobURL } from "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js";

(function () {
  "use strict";

  const MAX_BYTES = 512 * 1024 * 1024;
  const WARN_BYTES = 120 * 1024 * 1024;
  const CORE_VER = "0.12.6";
  const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VER}/dist/esm`;

  function ffmpegWorkerUrl() {
    const base = (window.OT_BASE || "..").replace(/\/$/, "");
    const rel = `${base}/assets/vendor/ffmpeg/worker.js`;
    return new URL(rel, location.href).href;
  }

  const L = {
    pageTitle: "Nén / Convert video — MP4, WebM, MP3 | OneTool",
    pageDesc: "Nén video MP4, đổi WebM, tách MP3 online miễn phí trên trình duyệt — file không upload server.",
    title: "Nén / Convert video",
    lead: "Nén MP4, đổi WebM hoặc tách MP3 — xử lý ngay trên trình duyệt, file không rời máy bạn.",
    meta: "MP4 · MOV · MKV · WebM · tối đa 512 MB",
    source: "Nguồn",
    dropTitle: "Thả video vào đây",
    dropOr: "hoặc",
    browse: "chọn từ máy",
    lblMode: "Chế độ",
    lblScale: "Kích thước",
    lblResult: "Kết quả",
    note: "Lần đầu tải bộ xử lý (~25 MB). Lần sau trình duyệt cache — nhanh hơn.",
    run: "Xử lý video",
    runBusy: "Đang xử lý…",
    loadBusy: "Đang tải bộ xử lý…",
    encodeBusy: "Đang mã hóa video…",
    encodeWebm: "Đang chuyển WebM (theo thời lượng video)…",
    download: "Tải file",
    empty: "Chưa có kết quả — chọn video và bấm xử lý.",
    idle: "Chưa có nội dung",
    lblBefore: "Trước",
    lblAfter: "Sau",
    lblSaved: "Tiết kiệm",
    protocol: "Cần chạy qua HTTP (IIS hoặc Live Server).",
    needFile: "Chọn file video trước.",
    tooBig: "File quá lớn (tối đa 512 MB).",
    warnBig: "File lớn — xử lý có thể chậm và tốn RAM. Nên chọn Nén mạnh / 720p.",
    done: "Hoàn tất",
    keptOriginal: "Video đã nén sẵn — giữ file gốc (nén lại không nhỏ hơn).",
    retryCompress: "Đang nén lại với bitrate thấp hơn…",
    webmFallback: "WebM: thử lại ở 480p…",
    webmFail: "Trình duyệt không hỗ trợ ghi WebM — dùng Chrome/Edge hoặc chọn MP4.",
    hintBalance: "Chất lượng cao — ưu tiên hình đẹp. Video dài có thể mất 1–3 phút.",
    hintCompress: "Cân bằng — giảm dung lượng vừa phải, chất lượng vẫn ổn.",
    hintStrong: "Nén mạnh — file nhỏ nhất, chi tiết giảm rõ. Nhanh hơn các chế độ khác.",
    hintWebm: "WebM — ghi bằng trình duyệt, mất ~thời lượng video.",
    hintMp3: "Chỉ lấy audio MP3, bỏ hình. Rất nhanh.",
    savedPct: (p) => `${p}%`,
    modeMp4Balance: "MP4 cân bằng (chất lượng tốt)",
    modeMp4Compress: "Nén MP4 (nhỏ hơn)",
    modeMp4Strong: "Nén mạnh (file nhỏ nhất)",
    modeWebm: "WebM (trình duyệt)",
    modeMp3: "Tách MP3 (chỉ audio)",
    scaleOriginal: "Giữ nguyên",
    scale1080: "Tối đa 1080p",
    scale720: "Tối đa 720p",
    scale480: "Tối đa 480p"
  };

  let file = null;
  let lastBlob = null;
  let lastName = "output.mp4";
  let previewUrl = null;
  let ffmpeg = null;
  let ffmpegLoading = null;
  let loadConfig = null;

  const CACHE_NAME = "ot-ffmpeg-core-" + CORE_VER;

  async function cachedToBlobURL(url, mime) {
    try {
      const cache = await caches.open(CACHE_NAME);
      let resp = await cache.match(url);
      if (!resp) {
        resp = await fetch(url, { mode: "cors", cache: "force-cache" });
        if (resp.ok) await cache.put(url, resp.clone());
      }
      const blob = await resp.blob();
      const typed = blob.type ? blob : new Blob([blob], { type: mime });
      return URL.createObjectURL(typed);
    } catch (_) {
      return toBlobURL(url, mime);
    }
  }

  async function getLoadConfig() {
    if (loadConfig) return loadConfig;
    loadConfig = {
      coreURL: await cachedToBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await cachedToBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      classWorkerURL: ffmpegWorkerUrl()
    };
    return loadConfig;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function applyLabels() {
    document.title = L.pageTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = L.pageDesc;
    $("vcTitle").textContent = L.title;
    $("vcLead").textContent = L.lead;
    $("vcMeta").textContent = L.meta;
    $("vcLblSource").textContent = L.source;
    $("vcDropTitle").textContent = L.dropTitle;
    $("vcDropOr").textContent = L.dropOr;
    $("browseBtn").textContent = L.browse;
    $("vcLblMode").textContent = L.lblMode;
    $("vcLblScale").textContent = L.lblScale;
    $("vcLblResult").textContent = L.lblResult;
    $("vcNote").textContent = L.note;
    $("runBtn").textContent = L.run;
    $("downloadResultBtn").textContent = L.download;
    $("vcEmptyText").textContent = L.empty;
    $("vcLblBefore").textContent = L.lblBefore;
    $("vcLblAfter").textContent = L.lblAfter;
    $("vcLblSaved").textContent = L.lblSaved;
    $("protocolBanner").textContent = L.protocol;

    const mode = $("vcMode");
    if (mode) {
      mode.options[0].textContent = L.modeMp4Balance;
      mode.options[1].textContent = L.modeMp4Compress;
      mode.options[2].textContent = L.modeMp4Strong;
      mode.options[3].textContent = L.modeWebm;
      mode.options[4].textContent = L.modeMp3;
    }
    const scale = $("vcScale");
    if (scale) {
      scale.options[0].textContent = L.scaleOriginal;
      scale.options[1].textContent = L.scale1080;
      scale.options[2].textContent = L.scale720;
      scale.options[3].textContent = L.scale480;
    }
  }

  function setStatus(msg, tone) {
    const el = $("status");
    if (!el) return;
    el.textContent = msg || "";
    el.dataset.tone = tone || "";
  }

  function setProgress(pct) {
    const bar = $("progressBar");
    const fill = $("progressFill");
    if (!bar || !fill) return;
    const n = Math.max(0, Math.min(100, Number(pct) || 0));
    fill.style.width = n + "%";
    bar.classList.toggle("is-on", n > 0 && n < 100);
    if (n >= 100) {
      setTimeout(() => {
        fill.style.width = "0%";
        bar.classList.remove("is-on");
      }, 400);
    }
  }

  function extOf(name) {
    const m = String(name || "").match(/\.([a-z0-9]+)$/i);
    return m ? m[1].toLowerCase() : "mp4";
  }

  function baseName(name) {
    return String(name || "video").replace(/\.[^.]+$/, "") || "video";
  }

  function revokePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  }

  function showEmpty() {
    $("resultEmpty")?.classList.remove("hidden");
    $("previewWrap")?.classList.add("hidden");
    $("statsBox")?.classList.add("hidden");
    $("resultVideo")?.classList.add("hidden");
    $("resultAudio")?.classList.add("hidden");
    revokePreview();
    lastBlob = null;
    $("downloadResultBtn")?.setAttribute("disabled", "");
  }

  function showResult(blob, outName, mime) {
    lastBlob = blob;
    lastName = outName;
    revokePreview();
    previewUrl = URL.createObjectURL(blob);

    $("resultEmpty")?.classList.add("hidden");
    $("previewWrap")?.classList.remove("hidden");
    $("statsBox")?.classList.remove("hidden");

    const isAudio = mime.startsWith("audio/");
    const video = $("resultVideo");
    const audio = $("resultAudio");
    if (isAudio) {
      video?.classList.add("hidden");
      audio?.classList.remove("hidden");
      if (audio) {
        audio.src = previewUrl;
        audio.load();
      }
    } else {
      audio?.classList.add("hidden");
      video?.classList.remove("hidden");
      if (video) {
        video.src = previewUrl;
        video.load();
      }
    }

    if (file) {
      $("statBefore").textContent = window.OT.formatBytes(file.size);
      $("statAfter").textContent = window.OT.formatBytes(blob.size);
      const saved = file.size > 0 ? Math.max(0, Math.round((1 - blob.size / file.size) * 100)) : 0;
      $("statSaved").textContent = saved > 0 ? L.savedPct(saved) : "0%";
    }

    $("downloadResultBtn")?.removeAttribute("disabled");
    setProgress(100);
  }

  async function ensureFfmpeg(onStatus) {
    if (ffmpeg?.loaded) return ffmpeg;
    if (ffmpegLoading) return ffmpegLoading;

    ffmpegLoading = (async () => {
      const inst = new FFmpeg();
      inst.on("log", ({ message }) => {
        if (message && /error/i.test(message)) console.warn("[ffmpeg]", message);
      });
      inst.on("progress", ({ progress }) => {
        if (progress > 0 && progress <= 1) {
          setProgress(Math.round(10 + progress * 85));
        }
      });

      onStatus?.(L.loadBusy);
      setProgress(3);

      const cfg = await getLoadConfig();
      await inst.load(cfg);

      ffmpeg = inst;
      setProgress(8);
      return inst;
    })();

    try {
      return await ffmpegLoading;
    } finally {
      ffmpegLoading = null;
    }
  }

  function internalNames(mode) {
    if (mode === "webm") return { input: "in.bin", output: "out.webm", outputAlt: "out2.webm" };
    if (mode === "mp3") return { input: "in.bin", output: "out.mp3", outputAlt: "out2.mp3" };
    return { input: "in.bin", output: "out.mp4", outputAlt: "out2.mp4" };
  }

  async function safeUnlink(inst, ...names) {
    for (const name of names) {
      try { await inst.deleteFile(name); } catch (_) { /* ignore */ }
    }
  }

  function modeHint(mode) {
    if (mode === "mp4-balance") return L.hintBalance;
    if (mode === "mp4-compress") return L.hintCompress;
    if (mode === "mp4-strong") return L.hintStrong;
    if (mode === "webm") return L.hintWebm;
    if (mode === "mp3") return L.hintMp3;
    return L.note;
  }

  function updateModeHint() {
    const note = $("vcNote");
    const mode = $("vcMode")?.value || "mp4-balance";
    if (note) note.textContent = modeHint(mode);
  }

  function buildOutput(mode, inputName) {
    const base = baseName(inputName);
    if (mode === "webm") return { name: `${base}.webm`, mime: "video/webm" };
    if (mode === "mp3") return { name: `${base}.mp3`, mime: "audio/mpeg" };
    return { name: `${base}.mp4`, mime: "video/mp4" };
  }

  function probeVideoInfo(inputFile) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(inputFile);
      const video = document.createElement("video");
      video.preload = "metadata";
      const finish = (val) => {
        URL.revokeObjectURL(url);
        resolve(val);
      };
      video.onloadedmetadata = () => {
        finish({
          durationSec: Number.isFinite(video.duration) && video.duration > 0 ? video.duration : null,
          width: video.videoWidth || 0,
          height: video.videoHeight || 0
        });
      };
      video.onerror = () => finish(null);
      video.src = url;
    });
  }

  function isSizeCompressMode(mode) {
    return mode === "mp4-compress" || mode === "mp4-strong";
  }

  function effectiveScale(mode, scale, height) {
    if (mode !== "webm" || scale !== "original") return scale;
    if (height > 1080) return "720";
    if (height > 720) return "720";
    return scale;
  }

  function calcBitrates(fileSize, durationSec, mode, scale) {
    if (!durationSec || durationSec <= 0) return null;

    const audioK = mode === "mp4-strong" ? 80 : 112;
    const ratio = mode === "mp4-strong" ? 0.58 : 0.78;
    const scaleMul = { original: 1, 1080: 0.85, 720: 0.58, 480: 0.35 }[scale] || 1;
    const srcTotalK = (fileSize * 8) / durationSec / 1000;
    const targetTotalK = srcTotalK * ratio * scaleMul;
    let videoK = Math.max(280, Math.round(targetTotalK - audioK));
    videoK = Math.min(videoK, Math.max(280, Math.round(srcTotalK * 0.92 - audioK)));

    return {
      videoK,
      maxrate: Math.max(videoK + 60, Math.round(videoK * 1.2)),
      bufsize: Math.max(560, Math.round(videoK * 2)),
      audioK,
      srcTotalK
    };
  }

  function buildArgs(mode, scale, inputName, outputName, meta) {
    const args = ["-i", inputName];
    const scaleMap = { 1080: 1080, 720: 720, 480: 480 };
    const height = meta?.height || 0;
    const useScale = effectiveScale(mode, scale, height);
    const h = scaleMap[useScale];
    const srcTotalK = meta?.bitrates?.srcTotalK || 0;

    if (h && mode !== "mp3") {
      const flags = mode === "mp4-balance" ? "lanczos" : "bilinear";
      args.push("-vf", `scale=-2:${h}:flags=${flags}`);
    }

    const mp4Quality = ["-c:v", "libx264", "-preset", "ultrafast", "-movflags", "+faststart"];
    const mp4Fast = ["-c:v", "libx264", "-preset", "ultrafast", "-movflags", "+faststart"];

    if (mode === "mp3") {
      args.push("-vn", "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100");
    } else if (mode === "webm") {
      args.push(
        "-c:v", "libvpx", "-deadline", "realtime", "-cpu-used", "5",
        "-crf", "30", "-b:v", "0",
        "-c:a", "libopus", "-b:a", "96k"
      );
    } else if (mode === "mp4-balance") {
      args.push(...mp4Quality, "-crf", "22", "-c:a", "aac", "-b:a", "160k");
    } else if (mode === "mp4-compress" && meta?.bitrates) {
      const b = meta.bitrates;
      args.push(
        ...mp4Quality, "-crf", "24",
        "-maxrate", `${b.maxrate}k`, "-bufsize", `${b.bufsize}k`,
        "-c:a", "aac", "-b:a", `${b.audioK}k`
      );
    } else if (mode === "mp4-strong" && meta?.bitrates) {
      const b = meta.bitrates;
      args.push(
        ...mp4Fast,
        "-b:v", `${b.videoK}k`,
        "-maxrate", `${b.maxrate}k`, "-bufsize", `${b.bufsize}k`,
        "-c:a", "aac", "-b:a", `${b.audioK}k`
      );
    } else if (mode === "mp4-strong") {
      args.push(...mp4Fast, "-crf", "30", "-c:a", "aac", "-b:a", "96k");
    } else if (mode === "mp4-compress") {
      const cap = srcTotalK > 0 ? Math.round(srcTotalK * 0.9) : 1200;
      args.push(...mp4Quality, "-crf", "26", "-maxrate", `${cap}k`, "-bufsize", `${cap * 2}k`, "-c:a", "aac", "-b:a", "128k");
    } else {
      args.push(...mp4Quality, "-crf", "22", "-c:a", "aac", "-b:a", "160k");
    }

    args.push("-y", outputName);
    return args;
  }

  function outputDimensions(vw, vh, scale) {
    const useScale = effectiveScale("webm", scale, vh);
    const maxH = { 1080: 1080, 720: 720, 480: 480 }[useScale];
    if (!maxH || vh <= maxH) {
      return { w: Math.max(2, vw - (vw % 2)), h: Math.max(2, vh - (vh % 2)) };
    }
    const h = maxH;
    const w = Math.max(2, Math.round(((vw * h) / vh) / 2) * 2);
    return { w, h };
  }

  function pickWebmMime() {
    if (!window.MediaRecorder) return null;
    const list = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    for (const mime of list) {
      if (MediaRecorder.isTypeSupported(mime)) return mime;
    }
    return null;
  }

  function targetWebmBps(fileSize, durationSec) {
    if (!durationSec) return 900000;
    const bps = (fileSize * 8) / durationSec;
    return Math.max(450000, Math.min(2500000, Math.round(bps * 0.9)));
  }

  async function convertWebmNative(inputFile, scale, info, onProgress) {
    const mimeType = pickWebmMime();
    if (!mimeType) throw new Error(L.webmFail);

    const url = URL.createObjectURL(inputFile);
    const video = document.createElement("video");
    video.playsInline = true;
    video.preload = "auto";

    try {
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error(L.webmFail));
        video.src = url;
      });

      const vw = video.videoWidth || info.width || 640;
      const vh = video.videoHeight || info.height || 360;
      const { w, h } = outputDimensions(vw, vh, scale);
      const needsCanvas = w !== vw || h !== vh;
      let stream;
      let rafId = 0;
      let canvas = null;

      if (needsCanvas) {
        canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        stream = canvas.captureStream(30);
        const src = video.captureStream?.() || video.mozCaptureStream?.();
        src?.getAudioTracks().forEach((track) => stream.addTrack(track));
        const draw = () => {
          ctx.drawImage(video, 0, 0, w, h);
          if (!video.ended && !video.paused) rafId = requestAnimationFrame(draw);
        };
        video.onplay = () => draw();
      } else {
        stream = video.captureStream?.() || video.mozCaptureStream?.();
      }

      if (!stream || !stream.getVideoTracks().length) throw new Error(L.webmFail);

      const durationSec = video.duration || info.durationSec || 0;
      const videoBps = targetWebmBps(inputFile.size, durationSec);

      return await new Promise((resolve, reject) => {
        const chunks = [];
        let recorder;
        try {
          recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: videoBps });
        } catch (_) {
          reject(new Error(L.webmFail));
          return;
        }

        recorder.ondataavailable = (e) => {
          if (e.data?.size) chunks.push(e.data);
        };
        recorder.onerror = () => reject(new Error(L.webmFail));
        recorder.onstop = () => {
          if (rafId) cancelAnimationFrame(rafId);
          if (!chunks.length) {
            reject(new Error(L.webmFail));
            return;
          }
          resolve(new Blob(chunks, { type: "video/webm" }));
        };

        video.ontimeupdate = () => {
          if (durationSec > 0) onProgress?.(video.currentTime / durationSec);
        };
        video.onended = () => {
          try {
            if (recorder.state !== "inactive") recorder.stop();
          } catch (_) {
            reject(new Error(L.webmFail));
          }
        };

        recorder.start(250);
        video.play().catch(() => reject(new Error(L.webmFail)));
      });
    } finally {
      URL.revokeObjectURL(url);
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }

  async function encodeOnce(inst, args, outputName, mime, failMsg) {
    await safeUnlink(inst, outputName);
    await inst.exec(args);
    try {
      const data = await inst.readFile(outputName);
      return new Blob([data.buffer], { type: mime });
    } catch (_) {
      throw new Error(failMsg || "Không đọc được file kết quả.");
    }
  }

  async function processVideo(inputFile, mode, scale) {
    const { name: downloadName, mime } = buildOutput(mode, inputFile.name);

    if (mode === "webm") {
      setStatus(L.encodeWebm);
      setProgress(12);
      const info = (await probeVideoInfo(inputFile)) || {};
      const blob = await convertWebmNative(inputFile, scale, info, (p) => {
        setProgress(Math.round(12 + p * 78));
      });
      setProgress(92);
      return { blob, outputName: downloadName, mime, keptOriginal: false };
    }

    const inst = await ensureFfmpeg((msg) => setStatus(msg));
    const names = internalNames(mode);

    setStatus(L.encodeBusy);
    setProgress(12);

    await safeUnlink(inst, names.input, names.output, names.outputAlt);
    await inst.writeFile(names.input, await fetchFile(inputFile));
    setProgress(18);

    const info = (await probeVideoInfo(inputFile)) || {};
    let useScale = scale;
    if (useScale === "original" && info.height > 1080 && mode !== "mp3") {
      useScale = "1080";
    }
    const bitrates = isSizeCompressMode(mode)
      ? calcBitrates(inputFile.size, info.durationSec, mode, useScale)
      : null;
    const meta = { ...info, bitrates };

    const args = buildArgs(mode, useScale, names.input, names.output, meta);
    let blob = await encodeOnce(inst, args, names.output, mime);
    setProgress(92);

    if (isSizeCompressMode(mode) && blob.size >= inputFile.size * 0.95 && bitrates) {
      setStatus(L.retryCompress);
      await safeUnlink(inst, names.output);
      const tighter = {
        ...bitrates,
        videoK: Math.max(220, Math.round(bitrates.videoK * 0.65)),
        maxrate: Math.max(280, Math.round(bitrates.maxrate * 0.65)),
        bufsize: Math.max(440, Math.round(bitrates.bufsize * 0.65)),
        audioK: Math.min(bitrates.audioK, 96)
      };
      meta.bitrates = tighter;
      const args = buildArgs(mode, scale, names.input, names.outputAlt, meta);
      blob = await encodeOnce(inst, args, names.outputAlt, mime);
    }

    if (isSizeCompressMode(mode) && blob.size >= inputFile.size) {
      await safeUnlink(inst, names.input, names.output, names.outputAlt);
      return {
        blob: inputFile,
        outputName: inputFile.name,
        mime: inputFile.type || mime,
        keptOriginal: true
      };
    }

    await safeUnlink(inst, names.input, names.output, names.outputAlt);

    return { blob, outputName: downloadName, mime, keptOriginal: false };
  }

  function bindEvents() {
    window.OT.bindUploadZone({
      onFiles: (files) => {
        file = files[0] || null;
        showEmpty();
        if (!file) {
          setStatus(L.idle);
          return;
        }
        if (file.size > MAX_BYTES) {
          setStatus(L.tooBig, "err");
          file = null;
          const list = document.getElementById("fileList");
          if (list) list.innerHTML = "";
          document.getElementById("uploadZone")?.classList.remove("has-file");
          return;
        }
        setStatus(
          file.size > WARN_BYTES
            ? `${window.OT.shortFileName(file.name)} · ${window.OT.formatBytes(file.size)} — ${L.warnBig}`
            : `${window.OT.shortFileName(file.name)} · ${window.OT.formatBytes(file.size)}`,
          "ok"
        );
      }
    });

    $("downloadResultBtn")?.addEventListener("click", () => {
      if (!lastBlob) return;
      window.OT.downloadBlob(lastBlob, lastName);
    });

    $("vcMode")?.addEventListener("change", updateModeHint);

    $("runBtn")?.addEventListener("click", async () => {
      const btn = $("runBtn");
      try {
        if (location.protocol === "file:") throw new Error(L.protocol);
        if (!file) throw new Error(L.needFile);

        window.OT.setBusy(btn, true, L.runBusy);
        showEmpty();
        setProgress(5);

        const mode = $("vcMode")?.value || "mp4-balance";
        const scale = $("vcScale")?.value || "original";

        const { blob, outputName, mime, keptOriginal } = await processVideo(file, mode, scale);
        showResult(blob, outputName, mime);
        setStatus(keptOriginal ? L.keptOriginal : L.done, keptOriginal ? "" : "ok");
      } catch (e) {
        console.error(e);
        setStatus(e.message || String(e), "err");
        setProgress(0);
        showEmpty();
      } finally {
        window.OT.setBusy(btn, false);
      }
    });
  }

  function preloadFfmpeg() {
    if (location.protocol === "file:") return;
    const note = $("vcNote");
    ensureFfmpeg((msg) => {
      if (note) note.textContent = msg;
    })
      .then(() => updateModeHint())
      .catch(() => updateModeHint());
  }

  function init() {
    if (!window.OT?.bindUploadZone) {
      setStatus("Lỗi tải script. Thử Ctrl+F5.", "err");
      return;
    }
    applyLabels();
    if (location.protocol === "file:") {
      $("protocolBanner")?.classList.add("is-on");
    }
    setStatus(L.idle);
    bindEvents();
    updateModeHint();
    preloadFfmpeg();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
