import { FFmpeg } from "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js";
import { fetchFile, toBlobURL } from "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js";

(function () {
  "use strict";

  const MAX_BYTES = 200 * 1024 * 1024;
  const WARN_BYTES = 80 * 1024 * 1024;
  const MAX_GIF_SEC = 12;
  const CORE_VER = "0.12.6";
  const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VER}/dist/esm`;
  const CACHE_NAME = "ot-ffmpeg-core-" + CORE_VER;

  let file = null;
  let lastBlob = null;
  let lastName = "output.gif";
  let srcUrl = null;
  let gifUrl = null;
  let duration = 0;
  let ffmpeg = null;
  let ffmpegLoading = null;
  let loadConfig = null;

  function ffmpegWorkerUrl() {
    const base = (window.OT_BASE || "..").replace(/\/$/, "");
    return new URL(`${base}/assets/vendor/ffmpeg/worker.js`, location.href).href;
  }

  function $(id) {
    return document.getElementById(id);
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

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) sec = 0;
    const total = Math.floor(sec + 1e-6);
    const m = Math.floor(total / 60);
    const s = total % 60;
    const ms = Math.round((sec - total) * 100);
    const core = `${m}:${String(s).padStart(2, "0")}`;
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
    return Math.max(0, h * 3600 + m * 60 + s);
  }

  function baseName(name) {
    return String(name || "video").replace(/\.[^.]+$/, "") || "video";
  }

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

  async function ensureFfmpeg() {
    if (ffmpeg?.loaded) return ffmpeg;
    if (ffmpegLoading) return ffmpegLoading;

    ffmpegLoading = (async () => {
      const inst = new FFmpeg();
      inst.on("log", ({ message }) => {
        if (message && /error/i.test(message)) console.warn("[ffmpeg]", message);
      });
      inst.on("progress", ({ progress }) => {
        if (progress > 0 && progress <= 1) {
          setProgress(Math.round(18 + progress * 72));
        }
      });
      setStatus("Đang tải bộ xử lý (~25 MB)…");
      setProgress(4);
      await inst.load(await getLoadConfig());
      ffmpeg = inst;
      setProgress(12);
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

  function revokeSrc() {
    if (srcUrl) {
      URL.revokeObjectURL(srcUrl);
      srcUrl = null;
    }
  }

  function revokeGif() {
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      gifUrl = null;
    }
  }

  function showSourcePreview(f) {
    revokeSrc();
    const video = $("sourceVideo");
    const empty = $("resultEmpty");
    const panels = $("previewPanels");
    if (!f || !video) return;

    srcUrl = URL.createObjectURL(f);
    video.src = srcUrl;
    video.load();
    empty?.classList.add("hidden");
    panels?.classList.remove("hidden");
    $("gifWrap")?.classList.add("hidden");
    $("statsBox")?.classList.add("hidden");
    $("downloadResultBtn")?.setAttribute("disabled", "");
    lastBlob = null;
    revokeGif();

    video.onloadedmetadata = () => {
      duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      const startIn = $("startInput");
      const durIn = $("durInput");
      if (startIn && !startIn.value) startIn.value = "0:00";
      if (durIn) {
        const def = Math.min(MAX_GIF_SEC, duration || 3);
        if (!durIn.value) durIn.value = String(Math.max(1, Math.round(def * 10) / 10));
      }
      setStatus(
        `${window.OT.shortFileName(f.name)} · ${window.OT.formatBytes(f.size)} · ${formatTime(duration)}`,
        "ok"
      );
    };
  }

  function showGifResult(blob, outName, meta) {
    lastBlob = blob;
    lastName = outName;
    revokeGif();
    gifUrl = URL.createObjectURL(blob);

    const img = $("resultGif");
    if (img) {
      img.src = gifUrl;
      img.alt = outName;
    }
    $("gifWrap")?.classList.remove("hidden");
    $("statsBox")?.classList.remove("hidden");
    $("resultEmpty")?.classList.add("hidden");
    $("previewPanels")?.classList.remove("hidden");

    $("statDur").textContent = formatTime(meta.clipSec);
    $("statFps").textContent = String(meta.fps);
    $("statWidth").textContent = meta.width + "px";
    $("statSize").textContent = window.OT.formatBytes(blob.size);
    $("downloadResultBtn")?.removeAttribute("disabled");
    setProgress(100);
  }

  function readOptions() {
    const start = parseTime($("startInput")?.value);
    if (start == null) throw new Error("Thời điểm bắt đầu không hợp lệ (vd. 0:05 hoặc 5).");

    let clip = Number(String($("durInput")?.value || "").replace(",", "."));
    if (!Number.isFinite(clip) || clip <= 0) throw new Error("Nhập độ dài GIF (giây).");
    if (clip > MAX_GIF_SEC) {
      clip = MAX_GIF_SEC;
      if ($("durInput")) $("durInput").value = String(MAX_GIF_SEC);
    }

    if (duration > 0 && start >= duration) {
      throw new Error("Điểm bắt đầu vượt quá độ dài video.");
    }
    if (duration > 0) {
      clip = Math.min(clip, Math.max(0.2, duration - start));
    }

    const fps = Number($("fpsSelect")?.value) || 10;
    const width = Number($("widthSelect")?.value) || 480;
    const quality = $("qualitySelect")?.value || "good";

    return { start, clip, fps, width, quality };
  }

  async function convertToGif(inputFile, opts) {
    const inst = await ensureFfmpeg();
    const input = "in.bin";
    const output = "out.gif";
    const palette = "palette.png";

    setStatus("Đang tạo GIF…");
    setProgress(14);

    await safeUnlink(inst, input, output, palette);
    await inst.writeFile(input, await fetchFile(inputFile));
    setProgress(20);

    // Nhanh: 1 bước scale + palette đơn giản
    if (opts.quality === "fast") {
      const fastArgs = [
        "-ss",
        String(opts.start),
        "-t",
        String(opts.clip),
        "-i",
        input,
        "-an",
        "-vf",
        `fps=${opts.fps},scale=${opts.width}:-1:flags=bilinear,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse`,
        "-loop",
        "0",
        "-y",
        output
      ];
      await inst.exec(fastArgs);
    } else {
      const gen = [
        "-ss",
        String(opts.start),
        "-t",
        String(opts.clip),
        "-i",
        input,
        "-vf",
        `fps=${opts.fps},scale=${opts.width}:-1:flags=lanczos,palettegen=stats_mode=diff`,
        "-y",
        palette
      ];
      await safeUnlink(inst, palette);
      await inst.exec(gen);
      setProgress(55);
      const use = [
        "-ss",
        String(opts.start),
        "-t",
        String(opts.clip),
        "-i",
        input,
        "-i",
        palette,
        "-lavfi",
        `fps=${opts.fps},scale=${opts.width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5`,
        "-loop",
        "0",
        "-y",
        output
      ];
      await safeUnlink(inst, output);
      await inst.exec(use);
    }

    setProgress(92);
    let data;
    try {
      data = await inst.readFile(output);
    } catch (_) {
      throw new Error("Không tạo được GIF — thử đoạn ngắn hơn hoặc giảm độ rộng.");
    }

    await safeUnlink(inst, input, output, palette);
    return new Blob([data.buffer], { type: "image/gif" });
  }

  function bindEvents() {
    window.OT.bindUploadZone({
      onFiles: (files) => {
        file = files[0] || null;
        if (!file) {
          setStatus("Chưa có video.");
          $("resultEmpty")?.classList.remove("hidden");
          $("previewPanels")?.classList.add("hidden");
          return;
        }
        if (file.size > MAX_BYTES) {
          setStatus("File quá lớn (tối đa 200 MB).", "err");
          file = null;
          return;
        }
        showSourcePreview(file);
        if (file.size > WARN_BYTES) {
          setStatus(
            `${window.OT.shortFileName(file.name)} · ${window.OT.formatBytes(file.size)} — file lớn, nên cắt đoạn ≤ ${MAX_GIF_SEC}s.`,
            "ok"
          );
        }
      }
    });

    $("useCurrentBtn")?.addEventListener("click", () => {
      const video = $("sourceVideo");
      if (!video || !file) return;
      $("startInput").value = formatTime(video.currentTime || 0);
      setStatus("Đã lấy thời điểm hiện tại làm điểm bắt đầu.", "ok");
    });

    $("downloadResultBtn")?.addEventListener("click", () => {
      if (!lastBlob) return;
      window.OT.downloadBlob(lastBlob, lastName);
    });

    $("runBtn")?.addEventListener("click", async () => {
      const btn = $("runBtn");
      try {
        if (location.protocol === "file:") {
          throw new Error("Cần chạy qua HTTP (IIS hoặc Live Server).");
        }
        if (!file) throw new Error("Chọn file video trước.");

        const opts = readOptions();
        window.OT.setBusy(btn, true, "Đang tạo GIF…");
        setProgress(6);

        const blob = await convertToGif(file, opts);
        const outName = baseName(file.name) + ".gif";
        showGifResult(blob, outName, {
          clipSec: opts.clip,
          fps: opts.fps,
          width: opts.width
        });
        setStatus(
          `Xong — GIF ${formatTime(opts.clip)} · ${opts.fps} fps · ${window.OT.formatBytes(blob.size)}`,
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
  }

  function preloadFfmpeg() {
    if (location.protocol === "file:") return;
    ensureFfmpeg()
      .then(() => {
        const note = $("vgNote");
        if (note && !file) {
          note.textContent =
            `Đoạn tối đa ${MAX_GIF_SEC}s. Lần đầu tải bộ xử lý (~25 MB), lần sau cache sẵn.`;
        }
      })
      .catch(() => {});
  }

  function init() {
    if (!window.OT?.bindUploadZone) {
      setStatus("Lỗi tải script. Thử Ctrl+F5.", "err");
      return;
    }
    if (location.protocol === "file:") {
      $("protocolBanner")?.classList.add("is-on");
    }
    setStatus("Chọn video, chọn đoạn rồi tạo GIF.");
    bindEvents();
    preloadFfmpeg();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
