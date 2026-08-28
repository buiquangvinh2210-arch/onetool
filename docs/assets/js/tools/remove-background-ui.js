/**
 * Remove background UI — custom upload (no core fileList inject).
 */
(function () {
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.matchMedia("(max-width: 900px)").matches);
  const maxBytes = isMobile ? 6 * 1024 * 1024 : 8 * 1024 * 1024;

  let file = null;
  let sourceUrl = null;
  let lastBlob = null;
  let lastUrl = null;

  const els = {
    shell: document.getElementById("shell"),
    zone: document.getElementById("uploadZone"),
    input: document.getElementById("fileInput"),
    browseBtn: document.getElementById("browseBtn"),
    changeBtn: document.getElementById("changeBtn"),
    sourceImg: document.getElementById("sourceImg"),
    sourceMeta: document.getElementById("sourceMeta"),
    runBtn: document.getElementById("runBtn"),
    status: document.getElementById("status"),
    preview: document.getElementById("preview"),
    outBar: document.getElementById("outBar"),
    bgToggle: document.getElementById("bgToggle"),
    copyBtn: document.getElementById("copyResultBtn"),
    downloadBtn: document.getElementById("downloadResultBtn"),
    progress: document.getElementById("otProgress")
  };

  function fmtBytes(n) {
    if (window.OT && OT.formatBytes) return OT.formatBytes(n);
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.classList.toggle("is-ok", kind === "ok");
    els.status.classList.toggle("is-err", kind === "err");
  }

  function revokeSource() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = null;
  }

  function revokeResult() {
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = null;
    lastBlob = null;
  }

  function waitMarkup() {
    return '<div class="rb-wait" id="resultEmpty">Kết quả hiện ở đây</div>';
  }

  function clearResult() {
    revokeResult();
    els.shell.classList.remove("is-done");
    if (els.outBar) els.outBar.hidden = true;
    els.preview.querySelectorAll("img").forEach((img) => img.remove());
    if (!els.preview.querySelector(".rb-wait")) els.preview.innerHTML = waitMarkup();
    els.copyBtn.disabled = true;
    els.downloadBtn.disabled = true;
  }

  function setProgress(pct) {
    const bar = els.progress && els.progress.querySelector("span");
    if (!bar) return;
    bar.style.width = Math.max(0, Math.min(100, pct || 0)) + "%";
    els.progress.setAttribute("aria-hidden", pct > 0 && pct < 100 ? "false" : "true");
  }

  function showSource(f) {
    revokeSource();
    clearResult();
    file = f;
    sourceUrl = URL.createObjectURL(f);
    els.sourceImg.src = sourceUrl;
    els.sourceImg.hidden = false;
    els.sourceMeta.textContent = f.name + " · " + fmtBytes(f.size);
    els.shell.classList.add("has-file");
    els.runBtn.disabled = false;
    setStatus("Chờ xử lý", "");
    setProgress(0);
  }

  function loadFile(f) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      (window.showToast || alert)("Chọn file ảnh (JPG, PNG, WebP).", "error");
      return;
    }
    if (f.size > maxBytes) {
      (window.showToast || alert)(
        isMobile ? "Ảnh tối đa 6MB trên điện thoại." : "Ảnh tối đa 8MB.",
        "error"
      );
      return;
    }
    showSource(f);
  }

  function showResultBlob(blob) {
    revokeResult();
    lastBlob = blob;
    lastUrl = URL.createObjectURL(blob);
    els.preview.querySelectorAll(".rb-wait, img").forEach((n) => n.remove());
    const img = document.createElement("img");
    img.alt = "Ảnh đã xóa nền";
    img.src = lastUrl;
    els.preview.appendChild(img);
    els.shell.classList.add("is-done");
    if (els.outBar) els.outBar.hidden = false;
    els.copyBtn.disabled = false;
    els.downloadBtn.disabled = false;
  }

  // ——— Upload ———
  els.browseBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    els.input.click();
  });
  els.changeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    els.input.click();
  });
  els.input?.addEventListener("change", () => {
    const f = els.input.files && els.input.files[0];
    els.input.value = "";
    if (f) loadFile(f);
  });

  ["dragenter", "dragover"].forEach((ev) => {
    els.zone?.addEventListener(ev, (e) => {
      e.preventDefault();
      els.zone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach((ev) => {
    els.zone?.addEventListener(ev, (e) => {
      e.preventDefault();
      els.zone.classList.remove("dragover");
    });
  });
  els.zone?.addEventListener("drop", (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) loadFile(f);
  });
  els.zone?.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    els.input.click();
  });

  els.bgToggle?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-bg]");
    if (!btn) return;
    els.preview.dataset.bg = btn.dataset.bg;
    els.bgToggle.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b === btn));
  });

  els.copyBtn?.addEventListener("click", async () => {
    if (!lastBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [lastBlob.type || "image/png"]: lastBlob })
      ]);
      (window.showToast || (() => {}))("Đã sao chép PNG.", "success");
    } catch {
      (window.showToast || alert)("Không sao chép được ảnh — hãy tải PNG.", "error");
    }
  });

  els.downloadBtn?.addEventListener("click", () => {
    if (!lastUrl || !lastBlob) return;
    const base = (file && file.name ? file.name.replace(/\.[^.]+$/, "") : "anh") + "-no-bg";
    const a = document.createElement("a");
    a.href = lastUrl;
    a.download = base + ".png";
    a.click();
  });

  els.runBtn?.addEventListener("click", async () => {
    try {
      if (location.protocol === "file:") {
        throw new Error("Cần chạy local server (HTTP), không mở file://.");
      }
      if (!file) throw new Error("Chọn ảnh trước.");
      if (!window.OTImage || !OTImage.removeBackground) {
        throw new Error("Chưa tải xong engine — thử lại sau giây lát.");
      }

      els.runBtn.disabled = true;
      els.runBtn.classList.add("is-busy");
      els.runBtn.textContent = "Đang…";
      setStatus("Đang xử lý…", "");
      els.preview.classList.add("is-busy");
      clearResult();
      const empty = document.getElementById("resultEmpty");
      if (empty) empty.textContent = "Đang tách nền…";
      setProgress(15);

      const r = await OTImage.removeBackground(file, {
        onProgress: (msg) => {
          setStatus(msg || "Đang xử lý…", "");
          setProgress(40);
        }
      });

      const blob = r && (r.blob || r);
      if (!blob || !(blob instanceof Blob)) throw new Error("Không nhận được kết quả PNG.");

      showResultBlob(blob);
      setStatus("Xong · " + fmtBytes(blob.size), "ok");
      setProgress(100);
      (window.showToast || (() => {}))("Đã xóa nền!", "success");
    } catch (e) {
      setStatus(e.message || String(e), "err");
      if (!els.preview.querySelector(".rb-wait")) els.preview.innerHTML = waitMarkup();
      const empty = document.getElementById("resultEmpty");
      if (empty) empty.textContent = "Lỗi — thử ảnh khác.";
      setProgress(0);
      console.error(e);
    } finally {
      els.preview.classList.remove("is-busy");
      els.runBtn.classList.remove("is-busy");
      els.runBtn.textContent = "Xóa nền";
      els.runBtn.disabled = !file;
    }
  });
})();
