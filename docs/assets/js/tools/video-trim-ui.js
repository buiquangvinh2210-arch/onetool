import { FFmpeg } from "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js";
import { fetchFile, toBlobURL } from "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js";

(function () {
  "use strict";

  const MAX_BYTES = 512 * 1024 * 1024;
  const WARN_BYTES = 120 * 1024 * 1024;
  const CORE_VER = "0.12.6";
  const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VER}/dist/esm`;
  const RANGE_MAX = 1000;
  const MIN_SEL = 0.05;

  function ffmpegWorkerUrl() {
    const base = (window.OT_BASE || "..").replace(/\/$/, "");
    const rel = `${base}/assets/vendor/ffmpeg/worker.js`;
    return new URL(rel, location.href).href;
  }

  const L = {
    pageTitle: "Cắt video online miễn phí — trim MP4 theo thời gian | OneTool",
    pageDesc:
      "Cắt video theo thời gian (trim) ngay trên trình duyệt. Chọn đoạn start–end, copy nhanh hoặc encode chính xác — miễn phí, file không rời máy bạn.",
    title: "Cắt video online",
    lead: "Chọn đoạn start–end, xem trước rồi cắt — nhanh trên máy bạn.",
    meta: "MP4 · MOV · WebM · MKV · tối đa 512 MB",
    source: "Nguồn",
    dropTitle: "Thả video vào đây",
    dropOr: "hoặc",
    browse: "chọn từ máy",
    lblMode: "Chế độ cắt",
    lblMute: "Tắt tiếng (bỏ audio)",
    lblStart: "Bắt đầu",
    lblEnd: "Kết thúc",
    lblPreview: "Xem trước",
    lblResult: "Kết quả đã cắt",
    lblDurBefore: "Thời lượng gốc",
    lblDurAfter: "Đoạn cắt",
    lblSizeBefore: "Dung lượng gốc",
    lblSizeAfter: "Dung lượng sau",
    setStart: "Đặt start tại đây",
    setEnd: "Đặt end tại đây",
    playSel: "Phát đoạn chọn",
    play: "Phát",
    pause: "Tạm dừng",
    note: "Lần đầu tải bộ xử lý (~25 MB). Lần sau trình duyệt cache — nhanh hơn.",
    hintFast: "Copy nhanh — giữ codec gốc, cắt gần keyframe. Nhanh nhất.",
    hintAccurate: "Encode chính xác — libx264 + AAC, cắt đúng khung hình.",
    run: "Cắt video",
    runBusy: "Đang cắt…",
    loadBusy: "Đang tải bộ xử lý…",
    encodeBusy: "Đang xử lý video…",
    download: "Tải file",
    empty: "Chưa có video — thả file rồi chọn đoạn cần cắt.",
    idle: "Chưa có nội dung",
    protocol: "Cần chạy qua HTTP (IIS hoặc Live Server).",
    needFile: "Chọn file video trước.",
    tooBig: "File quá lớn (tối đa 512 MB).",
    warnBig: "File lớn — xử lý có thể chậm và tốn RAM.",
    badRange: "Đoạn cắt không hợp lệ — end phải lớn hơn start.",
    done: "Hoàn tất — đã cắt xong.",
    modeFast: "Nhanh (stream copy)",
    modeAccurate: "Chính xác (re-encode)",
    selLen: (t) => `Đoạn: ${t}`
  };

  let file = null;
  let duration = 0;
  let startSec = 0;
  let endSec = 0;
  let lastBlob = null;
  let lastName = "trimmed.mp4";
  let previewUrl = null;
  let resultUrl = null;
  let ffmpeg = null;
  let ffmpegLoading = null;
  let loadConfig = null;
  let playingSelection = false;
  let syncing = false;

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
    $("vtTitle").textContent = L.title;
    $("vtLead").textContent = L.lead;
    $("vtMeta").textContent = L.meta;
    $("vtLblSource").textContent = L.source;
    $("vtDropTitle").textContent = L.dropTitle;
    $("vtDropOr").textContent = L.dropOr;
    $("browseBtn").textContent = L.browse;
    $("vtLblMode").textContent = L.lblMode;
    $("vtLblMute").textContent = L.lblMute;
    $("vtLblStart").textContent = L.lblStart;
    $("vtLblEnd").textContent = L.lblEnd;
    $("vtLblPreview").textContent = L.lblPreview;
    $("vtLblResult").textContent = L.lblResult;
    $("vtLblDurBefore").textContent = L.lblDurBefore;
    $("vtLblDurAfter").textContent = L.lblDurAfter;
    $("vtLblSizeBefore").textContent = L.lblSizeBefore;
    $("vtLblSizeAfter").textContent = L.lblSizeAfter;
    $("setStartBtn").textContent = L.setStart;
    $("setEndBtn").textContent = L.setEnd;
    $("playSelBtn").textContent = L.playSel;
    $("vtNote").textContent = L.note;
    $("runBtn").textContent = L.run;
    $("downloadResultBtn").textContent = L.download;
    $("playPauseBtn").textContent = L.play;
    $("vtEmptyText").textContent = L.empty;
    $("protocolBanner").textContent = L.protocol;

    const mode = $("vtMode");
    if (mode) {
      mode.options[0].textContent = L.modeFast;
      mode.options[1].textContent = L.modeAccurate;
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

  function baseName(name) {
    return String(name || "video").replace(/\.[^.]+$/, "") || "video";
  }

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) sec = 0;
    const total = Math.floor(sec + 1e-6);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const frac = sec - total;
    const ms = Math.round(frac * 100);
    const core =
      h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`;
    if (ms > 0 && ms < 100) return `${core}.${String(ms).padStart(2, "0")}`;
    return core;
  }

  function parseTime(raw) {
    const str = String(raw || "").trim().replace(",", ".");
    if (!str) return null;
    if (/^\d+(\.\d+)?$/.test(str)) return Math.max(0, Number(str));
    const parts = str.split(":").map((p) => p.trim());
    if (parts.length < 2 || parts.length > 3) return null;
    if (parts.some((p) => p === "" || Number.isNaN(Number(p)))) return null;
    let h = 0;
    let m = 0;
    let s = 0;
    if (parts.length === 3) {
      h = Number(parts[0]);
      m = Number(parts[1]);
      s = Number(parts[2]);
    } else {
      m = Number(parts[0]);
      s = Number(parts[1]);
    }
    if (![h, m, s].every((n) => Number.isFinite(n) && n >= 0)) return null;
    return h * 3600 + m * 60 + s;
  }

  function clampRange() {
    if (!Number.isFinite(duration) || duration <= 0) {
      startSec = 0;
      endSec = 0;
      return;
    }
    startSec = Math.max(0, Math.min(startSec, duration - MIN_SEL));
    endSec = Math.max(startSec + MIN_SEL, Math.min(endSec, duration));
  }

  function secToRange(sec) {
    if (!duration) return 0;
    return Math.round((sec / duration) * RANGE_MAX);
  }

  function rangeToSec(val) {
    if (!duration) return 0;
    return (Number(val) / RANGE_MAX) * duration;
  }

  function updateRangeFill() {
    const fill = $("rangeFill");
    if (!fill || !duration) return;
    const left = (startSec / duration) * 100;
    const right = 100 - (endSec / duration) * 100;
    fill.style.left = `${left}%`;
    fill.style.right = `${right}%`;
  }

  function updatePlayhead() {
    const video = $("previewVideo");
    const head = $("playhead");
    if (!video || !head || !duration) {
      head?.classList.remove("is-on");
      return;
    }
    const t = video.currentTime || 0;
    const pct = Math.max(0, Math.min(100, (t / duration) * 100));
    head.style.left = pct + "%";
    head.classList.add("is-on");
  }

  function updateSelectionUI() {
    syncing = true;
    clampRange();
    const startIn = $("startInput");
    const endIn = $("endInput");
    const startR = $("startRange");
    const endR = $("endRange");
    if (startIn && document.activeElement !== startIn) startIn.value = formatTime(startSec);
    if (endIn && document.activeElement !== endIn) endIn.value = formatTime(endSec);
    if (startR) startR.value = String(secToRange(startSec));
    if (endR) endR.value = String(secToRange(endSec));
    updateRangeFill();
    $("startLabel").textContent = formatTime(startSec);
    $("endLabel").textContent = formatTime(endSec);
    const sel = Math.max(0, endSec - startSec);
    $("selLabel").textContent = L.selLen(formatTime(sel));
    $("statDurBefore").textContent = duration ? formatTime(duration) : "-";
    $("statDurAfter").textContent = duration ? formatTime(sel) : "-";
    if (file) $("statSizeBefore").textContent = window.OT.formatBytes(file.size);
    syncing = false;
  }

  function setControlsEnabled(on) {
    ["setStartBtn", "setEndBtn", "playSelBtn", "playPauseBtn", "startRange", "endRange", "startInput", "endInput"].forEach(
      (id) => {
        const el = $(id);
        if (!el) return;
        if (on) el.removeAttribute("disabled");
        else el.setAttribute("disabled", "");
      }
    );
  }

  function revokePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  }

  function revokeResult() {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      resultUrl = null;
    }
  }

  function showEmpty() {
    $("resultEmpty")?.classList.remove("hidden");
    $("previewWrap")?.classList.add("hidden");
    $("timelineBox")?.classList.add("hidden");
    $("statsBox")?.classList.add("hidden");
    $("outPreviewWrap")?.classList.add("hidden");
    revokePreview();
    revokeResult();
    lastBlob = null;
    duration = 0;
    startSec = 0;
    endSec = 0;
    playingSelection = false;
    const video = $("previewVideo");
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    const out = $("resultVideo");
    if (out) {
      out.pause();
      out.removeAttribute("src");
      out.load();
    }
    $("downloadResultBtn")?.setAttribute("disabled", "");
    $("playPauseBtn").textContent = L.play;
    setControlsEnabled(false);
    $("statSizeAfter").textContent = "-";
    updateSelectionUI();
  }

  function showSourcePreview(inputFile) {
    showEmpty();
    file = inputFile;
    revokePreview();
    previewUrl = URL.createObjectURL(inputFile);
    const video = $("previewVideo");
    $("resultEmpty")?.classList.add("hidden");
    $("previewWrap")?.classList.remove("hidden");
    $("timelineBox")?.classList.remove("hidden");
    $("statsBox")?.classList.remove("hidden");
    if (video) {
      video.src = previewUrl;
      video.load();
    }
    $("statSizeBefore").textContent = window.OT.formatBytes(inputFile.size);
    $("statSizeAfter").textContent = "-";
  }

  function showResult(blob, outName) {
    lastBlob = blob;
    lastName = outName;
    revokeResult();
    resultUrl = URL.createObjectURL(blob);
    $("outPreviewWrap")?.classList.remove("hidden");
    const video = $("resultVideo");
    if (video) {
      video.src = resultUrl;
      video.load();
    }
    $("statSizeAfter").textContent = window.OT.formatBytes(blob.size);
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

  async function safeUnlink(inst, ...names) {
    for (const name of names) {
      try {
        await inst.deleteFile(name);
      } catch (_) {
        /* ignore */
      }
    }
  }

  function ffTime(sec) {
    const n = Math.max(0, Number(sec) || 0);
    return n.toFixed(3);
  }

  function buildArgs(mode, mute, inputName, outputName) {
    const args = ["-ss", ffTime(startSec), "-to", ffTime(endSec), "-i", inputName];

    if (mode === "fast") {
      if (mute) args.push("-c:v", "copy", "-an");
      else args.push("-c", "copy");
      args.push("-avoid_negative_ts", "make_zero");
    } else {
      args.push("-c:v", "libx264", "-preset", "fast", "-crf", "23");
      if (mute) args.push("-an");
      else args.push("-c:a", "aac");
      args.push("-movflags", "+faststart");
    }

    args.push("-y", outputName);
    return args;
  }

  async function trimVideo(inputFile, mode, mute) {
    const inst = await ensureFfmpeg((msg) => setStatus(msg));
    const input = "in.bin";
    const output = "out.mp4";

    setStatus(L.encodeBusy);
    setProgress(12);

    await safeUnlink(inst, input, output);
    await inst.writeFile(input, await fetchFile(inputFile));
    setProgress(18);

    const args = buildArgs(mode, mute, input, output);
    await inst.exec(args);
    setProgress(92);

    let data;
    try {
      data = await inst.readFile(output);
    } catch (_) {
      throw new Error("Không đọc được file kết quả.");
    }

    await safeUnlink(inst, input, output);

    const blob = new Blob([data.buffer], { type: "video/mp4" });
    const outName = `${baseName(inputFile.name)}_trim.mp4`;
    return { blob, outputName: outName };
  }

  function updateModeHint() {
    const note = $("vtNote");
    const mode = $("vtMode")?.value || "fast";
    if (note) note.textContent = mode === "accurate" ? L.hintAccurate : L.hintFast;
  }

  function onVideoMeta() {
    const video = $("previewVideo");
    if (!video) return;
    duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    startSec = 0;
    endSec = duration;
    setControlsEnabled(!!duration);
    updateSelectionUI();
    updatePlayhead();
    if (file) {
      setStatus(
        file.size > WARN_BYTES
          ? `${window.OT.shortFileName(file.name)} · ${window.OT.formatBytes(file.size)} — ${L.warnBig}`
          : `${window.OT.shortFileName(file.name)} · ${window.OT.formatBytes(file.size)} · ${formatTime(duration)}`,
        "ok"
      );
    }
  }

  function bindVideoEvents() {
    const video = $("previewVideo");
    if (!video) return;

    video.addEventListener("loadedmetadata", onVideoMeta);
    video.addEventListener("timeupdate", () => {
      updatePlayhead();
      if (playingSelection && video.currentTime >= endSec - 0.04) {
        video.pause();
        video.currentTime = endSec;
        playingSelection = false;
        $("playPauseBtn").textContent = L.play;
      }
    });
    video.addEventListener("play", () => {
      $("playPauseBtn").textContent = L.pause;
    });
    video.addEventListener("pause", () => {
      $("playPauseBtn").textContent = L.play;
    });
    video.addEventListener("ended", () => {
      playingSelection = false;
      $("playPauseBtn").textContent = L.play;
    });
  }

  function bindRangeEvents() {
    const startR = $("startRange");
    const endR = $("endRange");
    const startIn = $("startInput");
    const endIn = $("endInput");

    const onStartRange = () => {
      if (syncing || !duration) return;
      let s = rangeToSec(startR.value);
      let e = endSec;
      if (s > e - MIN_SEL) s = e - MIN_SEL;
      startSec = Math.max(0, s);
      updateSelectionUI();
      const video = $("previewVideo");
      if (video) video.currentTime = startSec;
    };

    const onEndRange = () => {
      if (syncing || !duration) return;
      let e = rangeToSec(endR.value);
      let s = startSec;
      if (e < s + MIN_SEL) e = s + MIN_SEL;
      endSec = Math.min(duration, e);
      updateSelectionUI();
      const video = $("previewVideo");
      if (video) video.currentTime = endSec;
    };

    startR?.addEventListener("input", onStartRange);
    endR?.addEventListener("input", onEndRange);

    const commitStart = () => {
      if (!duration) return;
      const v = parseTime(startIn.value);
      if (v == null) {
        updateSelectionUI();
        return;
      }
      startSec = v;
      clampRange();
      updateSelectionUI();
      const video = $("previewVideo");
      if (video) video.currentTime = startSec;
    };

    const commitEnd = () => {
      if (!duration) return;
      const v = parseTime(endIn.value);
      if (v == null) {
        updateSelectionUI();
        return;
      }
      endSec = v;
      clampRange();
      updateSelectionUI();
      const video = $("previewVideo");
      if (video) video.currentTime = endSec;
    };

    startIn?.addEventListener("change", commitStart);
    startIn?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitStart();
        startIn.blur();
      }
    });
    endIn?.addEventListener("change", commitEnd);
    endIn?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEnd();
        endIn.blur();
      }
    });
  }

  function bindEvents() {
    window.OT.bindUploadZone({
      onFiles: (files) => {
        const next = files[0] || null;
        if (!next) {
          file = null;
          showEmpty();
          setStatus(L.idle);
          return;
        }
        if (next.size > MAX_BYTES) {
          setStatus(L.tooBig, "err");
          file = null;
          showEmpty();
          const list = document.getElementById("fileList");
          if (list) list.innerHTML = "";
          document.getElementById("uploadZone")?.classList.remove("has-file");
          return;
        }
        showSourcePreview(next);
        setStatus(`${window.OT.shortFileName(next.name)} · ${window.OT.formatBytes(next.size)}`);
      }
    });

    $("downloadResultBtn")?.addEventListener("click", () => {
      if (!lastBlob) return;
      window.OT.downloadBlob(lastBlob, lastName);
    });

    $("vtMode")?.addEventListener("change", updateModeHint);

    $("playPauseBtn")?.addEventListener("click", () => {
      const video = $("previewVideo");
      if (!video?.src) return;
      playingSelection = false;
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });

    $("setStartBtn")?.addEventListener("click", () => {
      const video = $("previewVideo");
      if (!video || !duration) return;
      startSec = video.currentTime || 0;
      clampRange();
      updateSelectionUI();
    });

    $("setEndBtn")?.addEventListener("click", () => {
      const video = $("previewVideo");
      if (!video || !duration) return;
      endSec = video.currentTime || 0;
      clampRange();
      updateSelectionUI();
    });

    $("playSelBtn")?.addEventListener("click", () => {
      const video = $("previewVideo");
      if (!video || !duration) return;
      clampRange();
      if (endSec <= startSec) {
        setStatus(L.badRange, "err");
        return;
      }
      playingSelection = true;
      video.currentTime = startSec;
      video.play().catch(() => {
        playingSelection = false;
      });
    });

    $("runBtn")?.addEventListener("click", async () => {
      const btn = $("runBtn");
      try {
        if (location.protocol === "file:") throw new Error(L.protocol);
        if (!file) throw new Error(L.needFile);
        clampRange();
        if (!duration || endSec - startSec < MIN_SEL) throw new Error(L.badRange);

        window.OT.setBusy(btn, true, L.runBusy);
        revokeResult();
        lastBlob = null;
        $("outPreviewWrap")?.classList.add("hidden");
        $("downloadResultBtn")?.setAttribute("disabled", "");
        $("statSizeAfter").textContent = "-";
        setProgress(5);

        const mode = $("vtMode")?.value || "fast";
        const mute = !!$("vtMute")?.checked;
        const { blob, outputName } = await trimVideo(file, mode, mute);
        showResult(blob, outputName);
        setStatus(
          `${L.done} · ${formatTime(endSec - startSec)} · ${window.OT.formatBytes(blob.size)}`,
          "ok"
        );
      } catch (e) {
        console.error(e);
        setStatus(e.message || String(e), "err");
        setProgress(0);
      } finally {
        window.OT.setBusy(btn, false);
      }
    });

    bindVideoEvents();
    bindRangeEvents();
  }

  function preloadFfmpeg() {
    if (location.protocol === "file:") return;
    const note = $("vtNote");
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
    setControlsEnabled(false);
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
