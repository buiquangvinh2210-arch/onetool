(function () {
  "use strict";

  const SAMPLE_VI = "Xin chào OneTool! 🇻🇳\nEncode/decode tiếng Việt có dấu: ă â ê ô ơ ư đ.";
  const SAMPLE_B64 = "WGlulG4gY2jDoG8gT25lVG9vbCEg8J+Hti4KRW5jb2RlL2RlY29kZSB0aWVuZyBWaeG7h3QgY8OzIGThu6E6IMSQw6Qg4buLLg==";

  let mode = "encode";
  let lastBlob = null;
  let lastFileName = "base64.txt";
  let lastMime = "text/plain;charset=utf-8";

  const L = {
    intro: "Encode / decode UTF-8, URL-safe, file ↔ Base64 — xử lý ngay trên trình duyệt, hỗ trợ tiếng Việt có dấu.",
    source: "Nguồn",
    result: "Kết quả",
    wrapLines: "Xuống dòng 76 ký tự",
    openFile: "Mở file",
    sample: "Mẫu tiếng Việt",
    swap: "Hoán đổi ↔",
    clear: "Xóa",
    copy: "Sao chép",
    download: "Tải file",
    modeAria: "Chế độ xử lý",
    pageTitle: "Encode Decode Base64 online — UTF-8 tiếng Việt, file, ảnh | OneTool",
    pageDesc: "Encode/decode Base64 UTF-8 (tiếng Việt), URL-safe, file ↔ Base64 trên trình duyệt."
  };

  function applyLabels() {
    document.getElementById("introDesc").textContent = L.intro;
    document.getElementById("lblSource").textContent = L.source;
    document.getElementById("lblResult").textContent = L.result;
    document.getElementById("lblWrapLines").textContent = L.wrapLines;
    document.getElementById("openFileBtn").textContent = L.openFile;
    document.getElementById("sampleBtn").textContent = L.sample;
    document.getElementById("swapBtn").textContent = L.swap;
    document.getElementById("clearBtn").textContent = L.clear;
    document.getElementById("copyResultBtn").textContent = L.copy;
    document.getElementById("downloadResultBtn").textContent = L.download;
    els.tabs?.setAttribute("aria-label", L.modeAria);
    document.title = L.pageTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", L.pageDesc);
  }

  const els = {
    input: document.getElementById("inputText"),
    meta: document.getElementById("inputMeta"),
    valid: document.getElementById("validBadge"),
    status: document.getElementById("status"),
    preview: document.getElementById("preview"),
    tabs: document.getElementById("modeTabs"),
    fileInput: document.getElementById("fileInput"),
    fileChip: document.getElementById("fileChip"),
    imgPreview: document.getElementById("imgPreview"),
    imgOut: document.getElementById("imgOut"),
    urlSafe: document.getElementById("urlSafe"),
    dataUrl: document.getElementById("dataUrl"),
    wrapLines: document.getElementById("wrapLines"),
    dataUrlWrap: document.getElementById("dataUrlWrap"),
    wrapLinesWrap: document.getElementById("wrapLinesWrap")
  };

  function wrapBase64(str, width) {
    if (!width) return str;
    const parts = [];
    for (let i = 0; i < str.length; i += width) parts.push(str.slice(i, i + width));
    return parts.join("\n");
  }

  function setMode(next) {
    mode = next;
    els.tabs.querySelectorAll("button[data-mode]").forEach((btn) => {
      const on = btn.dataset.mode === mode;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.getElementById("runBtn").textContent = mode === "encode" ? "Encode → Base64" : "Decode → Text";
    els.dataUrlWrap.hidden = mode !== "encode";
    els.wrapLinesWrap.hidden = mode !== "encode";
    syncPlaceholder();
    updateMeta();
  }

  function syncPlaceholder() {
    els.input.placeholder = mode === "encode"
      ? "Nhập văn bản UTF-8 (tiếng Việt OK) hoặc mở file…"
      : "Dán chuỗi Base64 hoặc data:image/png;base64,…";
  }

  function clearResult(resetStatus) {
    els.preview.textContent = "Chưa có kết quả";
    els.preview.classList.add("is-empty");
    els.imgPreview.classList.remove("is-on");
    els.imgOut.removeAttribute("src");
    lastBlob = null;
    document.getElementById("copyResultBtn").disabled = true;
    document.getElementById("downloadResultBtn").disabled = true;
    if (resetStatus) {
      els.status.textContent = "Kết quả hiện ở đây sau khi Encode hoặc Decode.";
      els.status.className = "b64-status";
    }
  }

  function showTextResult(text, fileName, mime) {
    els.preview.classList.remove("is-empty");
    els.preview.textContent = text;
    els.imgPreview.classList.remove("is-on");
    lastBlob = null;
    lastFileName = fileName;
    lastMime = mime;
    OT.showResult({ text, fileName, contentType: mime });
  }

  function showBlobResult(blob, fileName, mime, previewText) {
    els.preview.classList.remove("is-empty");
    els.preview.textContent = previewText || ("File nhị phân · " + OT.formatBytes(blob.size));
    lastBlob = blob;
    lastFileName = fileName;
    lastMime = mime;
    OT.showResult({ blob, fileName, contentType: mime, text: previewText || "" });
    if (OTUtils.isImageMime(mime)) {
      const url = URL.createObjectURL(blob);
      els.imgOut.onload = () => URL.revokeObjectURL(url);
      els.imgOut.src = url;
      els.imgPreview.classList.add("is-on");
    } else {
      els.imgPreview.classList.remove("is-on");
    }
  }

  function updateMeta() {
    const text = els.input.value;
    const fileLabel = els.fileChip.hidden ? "" : els.fileChip.textContent;
    if (!text.trim() && !fileLabel) {
      els.meta.textContent = "Chưa có dữ liệu";
      els.valid.textContent = "";
      els.valid.className = "";
      return;
    }
    if (fileLabel) {
      els.meta.textContent = fileLabel;
    } else {
      els.meta.textContent = text.length + " ký tự · " + OT.formatBytes(new Blob([text]).size);
    }
    if (mode === "decode" && text.trim()) {
      if (OTUtils.isValidBase64(text)) {
        els.valid.textContent = "Base64 hợp lệ";
        els.valid.className = "valid";
      } else {
        els.valid.textContent = "Chưa hợp lệ";
        els.valid.className = "invalid";
      }
    } else {
      els.valid.textContent = "";
      els.valid.className = "";
    }
  }

  async function runConvert() {
    const btn = document.getElementById("runBtn");
    const urlSafe = els.urlSafe.checked;
    const pickedFile = els.fileInput._pickedFile || null;

    try {
      OT.setBusy(btn, true, mode === "encode" ? "Đang encode…" : "Đang decode…");
      els.status.textContent = "Đang xử lý…";
      els.status.className = "b64-status";

      if (mode === "encode") {
        let out;
        if (pickedFile) {
          out = await OTUtils.fileToBase64(pickedFile, {
            urlSafe,
            dataUrl: els.dataUrl.checked
          });
        } else {
          const input = els.input.value;
          if (!input) throw new Error("Nhập văn bản hoặc mở file trước.");
          out = OTUtils.encodeBase64(input, { urlSafe });
          if (els.dataUrl.checked) out = "data:text/plain;charset=utf-8;base64," + out;
        }
        if (els.wrapLines.checked && !out.startsWith("data:")) out = wrapBase64(out, 76);
        showTextResult(out, "encoded.txt", "text/plain;charset=utf-8");
        els.status.textContent = "Đã encode · " + out.replace(/\s/g, "").length + " ký tự Base64.";
        els.status.className = "b64-status is-ok";
      } else {
        const input = els.input.value.trim();
        if (!input) throw new Error("Dán chuỗi Base64 trước.");
        const mime = OTUtils.guessBase64Mime(input);
        if (mime && !/^text\//i.test(mime)) {
          const blob = OTUtils.base64ToBlob(input, mime);
          const ext = (mime.split("/")[1] || "bin").split("+")[0];
          showBlobResult(blob, "decoded." + ext, mime);
          els.status.textContent = "Đã decode file · " + mime + " · " + OT.formatBytes(blob.size);
        } else {
          try {
            const text = OTUtils.decodeBase64(input, { urlSafe });
            showTextResult(text, "decoded.txt", "text/plain;charset=utf-8");
            els.status.textContent = "Đã decode · " + text.length + " ký tự UTF-8.";
          } catch {
            const blob = OTUtils.base64ToBlob(input);
            showBlobResult(blob, "decoded.bin", "application/octet-stream");
            els.status.textContent = "Đã decode file nhị phân · " + OT.formatBytes(blob.size);
          }
        }
        els.status.className = "b64-status is-ok";
      }
      showToast?.(mode === "encode" ? "Encode xong!" : "Decode xong!", "success");
    } catch (e) {
      els.status.textContent = e.message || String(e);
      els.status.className = "b64-status is-err";
      clearResult(false);
    } finally {
      OT.setBusy(btn, false);
    }
  }

  els.tabs?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (!btn) return;
    setMode(btn.dataset.mode);
    clearResult(true);
  });

  els.input?.addEventListener("input", () => {
    els.fileInput._pickedFile = null;
    els.fileChip.hidden = true;
    updateMeta();
    clearResult(true);
  });

  document.getElementById("sampleBtn")?.addEventListener("click", () => {
    els.input.value = mode === "encode" ? SAMPLE_VI : SAMPLE_B64;
    els.fileInput._pickedFile = null;
    els.fileChip.hidden = true;
    updateMeta();
    clearResult(true);
  });

  document.getElementById("swapBtn")?.addEventListener("click", () => {
    const out = els.preview.classList.contains("is-empty") ? "" : els.preview.textContent;
    if (!out && !els.input.value.trim()) return;
    els.input.value = out;
    setMode(mode === "encode" ? "decode" : "encode");
    clearResult(true);
    updateMeta();
  });

  document.getElementById("clearBtn")?.addEventListener("click", () => {
    els.input.value = "";
    els.fileInput._pickedFile = null;
    els.fileInput.value = "";
    els.fileChip.hidden = true;
    updateMeta();
    clearResult(true);
  });

  document.getElementById("openFileBtn")?.addEventListener("click", () => els.fileInput.click());

  els.fileInput?.addEventListener("change", () => {
    const file = els.fileInput.files?.[0];
    els.fileInput.value = "";
    if (!file) return;
    els.fileInput._pickedFile = file;
    els.fileChip.hidden = false;
    els.fileChip.textContent = "📎 " + file.name + " · " + OT.formatBytes(file.size);
    if (file.type.startsWith("text/") || /\.(txt|json|xml|html?|csv|md)$/i.test(file.name)) {
      file.text().then((t) => { els.input.value = t; updateMeta(); }).catch(() => updateMeta());
    } else {
      els.input.value = "";
      updateMeta();
    }
    clearResult(true);
    setMode("encode");
  });

  document.getElementById("runBtn").onclick = runConvert;

  els.input?.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runConvert();
    }
  });

  setMode("encode");
  applyLabels();
  clearResult(true);
  updateMeta();
})();
