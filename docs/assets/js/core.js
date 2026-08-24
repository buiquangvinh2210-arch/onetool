window.OT = window.OT || {};

(function (OT) {
  "use strict";

  let lastResult = null;

  function formatBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function shortFileName(name, max = 34) {
    const s = String(name || "");
    if (s.length <= max) return s;
    const dot = s.lastIndexOf(".");
    const ext = dot > 0 ? s.slice(dot) : "";
    const base = dot > 0 ? s.slice(0, dot) : s;
    const budget = max - ext.length - 1;
    if (budget < 6) return s.slice(0, max - 1) + "…";
    const head = Math.ceil(budget * 0.55);
    const tail = Math.floor(budget * 0.45);
    return base.slice(0, head) + "…" + base.slice(-tail) + ext;
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadBytes(bytes, fileName, contentType) {
    downloadBlob(new Blob([bytes], { type: contentType || "application/octet-stream" }), fileName);
  }

  function downloadText(text, fileName, contentType) {
    downloadBlob(new Blob([text], { type: contentType || "text/plain;charset=utf-8" }), fileName);
  }

  async function copyText(text) {
    if (text == null || text === "") throw new Error("Chưa có nội dung để sao chép.");
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  function isImageResult(result) {
    if (!result) return false;
    const ct = result.contentType || result.blob?.type || "";
    return ct.startsWith("image/") && !!(result.blob || result.bytes);
  }

  function hasCopyableText(result) {
    return !!(result?.text != null && String(result.text).trim());
  }

  function hasDownloadableResult(result) {
    return !!(result && (result.text != null || result.blob || result.bytes));
  }

  function canCopyResult(result) {
    return hasCopyableText(result) || isImageResult(result);
  }

  function setResultActionsEnabled(on) {
    const copyBtn = document.getElementById("copyResultBtn");
    const dlBtn = document.getElementById("downloadResultBtn");
    const canCopy = on && canCopyResult(lastResult);
    const canDownload = on && hasDownloadableResult(lastResult);
    if (copyBtn) {
      copyBtn.hidden = !canCopy;
      copyBtn.disabled = !canCopy;
    }
    if (dlBtn) {
      dlBtn.disabled = !canDownload;
    }
    document.querySelector(".result-actions")?.classList.toggle("result-actions--solo", canDownload && !canCopy);
  }

  function setLastResult(result) {
    lastResult = result || null;
    setResultActionsEnabled(hasDownloadableResult(lastResult));
  }

  function flashStatus(msg) {
    const status = document.getElementById("status");
    if (!status) return;
    const prev = status.dataset.prev || status.textContent;
    status.dataset.prev = prev;
    status.textContent = msg;
    clearTimeout(status._flashTimer);
    status._flashTimer = setTimeout(() => {
      status.textContent = status.dataset.sticky || prev;
    }, 1600);
  }

  function showResult({ text, blob, bytes, fileName, contentType, html }, previewEl) {
    const preview = previewEl || document.getElementById("preview");
    const ct = contentType || (blob && blob.type) || "application/octet-stream";
    setLastResult({ text, blob, bytes, fileName, contentType: ct, html });
    document.querySelector(".result-panel")?.classList.add("is-ready");
    setProgress(100);
    setTimeout(() => setProgress(-1), 700);

    if (html && preview) {
      preview.innerHTML = html;
    } else if (blob && ct.startsWith("image/") && preview) {
      const url = URL.createObjectURL(blob);
      preview.innerHTML = `<img alt="result" src="${url}" style="max-width:100%;border-radius:8px" />`;
    } else if (bytes && ct.startsWith("image/") && preview) {
      const b = new Blob([bytes], { type: ct });
      const url = URL.createObjectURL(b);
      preview.innerHTML = `<img alt="result" src="${url}" style="max-width:100%;border-radius:8px" />`;
      setLastResult({ text, blob: b, bytes, fileName, contentType: ct });
    } else if ((blob || bytes) && preview) {
      const size = bytes ? bytes.byteLength : blob.size;
      preview.innerHTML = `<div class="file-chip" style="margin:0"><span class="file-chip-icon">OK</span><div><strong>${fileName || "file"}</strong><span class="text-muted">${formatBytes(size)} · sẵn sàng tải</span></div></div>`;
    } else if (text != null && preview) {
      const t = String(text);
      preview.textContent = t.length > 12000 ? t.slice(0, 12000) + "\n…" : t;
    }

    setStatus(
      canCopyResult(lastResult) ? "Hoàn tất — tải hoặc sao chép kết quả." : "Hoàn tất — tải kết quả.",
      "ok"
    );
  }

  async function copyLastResult() {
    if (isImageResult(lastResult)) {
      const blob = lastResult.blob
        || new Blob([lastResult.bytes], { type: lastResult.contentType || "image/png" });
      const type = blob.type || "image/png";
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error("Trình duyệt không hỗ trợ sao chép ảnh — hãy tải file.");
      }
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
      flashStatus("Đã sao chép ảnh vào clipboard.");
      return;
    }

    const text = lastResult?.text
      ?? (lastResult?.html ? null : null)
      ?? document.getElementById("preview")?.textContent
      ?? "";
    if (!text || lastResult?.bytes || (lastResult?.blob && lastResult.text == null) || /sẵn sàng tải/i.test(text)) {
      throw new Error("Kết quả là file — dùng nút Tải.");
    }
    await copyText(text);
    flashStatus("Đã sao chép vào clipboard.");
  }

  function downloadLastResult() {
    if (!lastResult) throw new Error("Chưa có kết quả để tải.");
    if (lastResult.blob) {
      downloadBlob(lastResult.blob, lastResult.fileName);
    } else if (lastResult.bytes) {
      downloadBytes(lastResult.bytes, lastResult.fileName, lastResult.contentType);
    } else {
      downloadText(lastResult.text || "", lastResult.fileName || "result.txt", lastResult.contentType);
    }
    flashStatus("Đang tải «" + (lastResult.fileName || "file") + "»…");
  }

  let resultActionsBound = false;
  function bindResultActions() {
    if (resultActionsBound) return;
    const copyBtn = document.getElementById("copyResultBtn");
    const dlBtn = document.getElementById("downloadResultBtn");
    if (!copyBtn && !dlBtn) return;
    resultActionsBound = true;
    setResultActionsEnabled(false);
    copyBtn?.addEventListener("click", async () => {
      try { await copyLastResult(); }
      catch (err) { flashStatus(err.message || "Không sao chép được."); }
    });
    dlBtn?.addEventListener("click", () => {
      try { downloadLastResult(); }
      catch (err) { flashStatus(err.message || "Không tải được."); }
    });
  }

  function setStatus(msg, kind) {
    const status = document.getElementById("status");
    if (!status) return;
    status.textContent = msg;
    status.classList.remove("status-ok", "status-err");
    if (kind === "ok") status.classList.add("status-ok");
    if (kind === "err") status.classList.add("status-err");
    status.dataset.sticky = msg;
  }

  function setFileStatus(file, emptyMsg) {
    const status = document.getElementById("status");
    if (!status) return;
    if (!file) {
      setStatus(emptyMsg || "Chưa có file.", "");
      status.removeAttribute("title");
      return;
    }
    status.title = file.name;
    setStatus(`${shortFileName(file.name)} · ${formatBytes(file.size)}`, "ok");
  }

  function ensureProgress() {
    let bar = document.getElementById("otProgress");
    if (bar) return bar;
    const host = document.querySelector(".result-panel .tool-panel-body")
      || document.querySelector(".tool-panel-body");
    if (!host) return null;
    bar = document.createElement("div");
    bar.className = "ot-progress";
    bar.id = "otProgress";
    bar.innerHTML = "<span></span>";
    const status = document.getElementById("status");
    if (status) status.insertAdjacentElement("afterend", bar);
    else host.prepend(bar);
    return bar;
  }

  function setProgress(pct) {
    const bar = ensureProgress();
    if (!bar) return;
    const on = pct != null && pct >= 0;
    bar.classList.toggle("is-on", on);
    const span = bar.querySelector("span");
    if (span) span.style.width = Math.max(0, Math.min(100, pct || 0)) + "%";
  }

  function setBusy(btn, on, label) {
    if (!btn) return;
    if (on) {
      btn.dataset.label = btn.dataset.label || btn.textContent;
      btn.classList.add("is-busy");
      btn.disabled = true;
      if (label) btn.textContent = label;
    } else {
      btn.classList.remove("is-busy");
      btn.disabled = false;
      if (btn.dataset.label) btn.textContent = btn.dataset.label;
    }
  }

  function fileKey(f) {
    return `${f.name}|${f.size}|${f.lastModified}`;
  }

  function mergeFiles(existing, incoming) {
    const out = [...(existing || [])];
    const seen = new Set(out.map(fileKey));
    (incoming || []).forEach((f) => {
      const key = fileKey(f);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(f);
      }
    });
    return out;
  }

  function ensureFileList() {
    let list = document.getElementById("fileList");
    if (list) return list;
    const zone = document.getElementById("uploadZone");
    if (!zone || !zone.parentElement) return null;
    list = document.createElement("div");
    list.className = "file-list";
    list.id = "fileList";
    zone.insertAdjacentElement("afterend", list);
    return list;
  }

  function ensureAddMoreBtn(label, onClick) {
    let btn = document.getElementById("addMoreBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "addMoreBtn";
      btn.className = "ot-add-more";
      const anchor = document.getElementById("fileList") || document.getElementById("uploadZone");
      anchor?.insertAdjacentElement("afterend", btn);
    }
    btn.textContent = label;
    btn.hidden = false;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    };
    return btn;
  }

  function hideAddMoreBtn() {
    const btn = document.getElementById("addMoreBtn");
    if (btn) btn.hidden = true;
  }

  function setUploadHasFile(on, { multiple = false } = {}) {
    const zone = document.getElementById("uploadZone");
    if (!zone) return;
    if (multiple) {
      zone.classList.remove("has-file");
      zone.classList.toggle("has-files", !!on);
    } else {
      zone.classList.remove("has-files");
      zone.classList.toggle("has-file", !!on);
    }
    const ph = zone.querySelector(".upload-placeholder");
    if (ph) {
      ph.classList.toggle("hidden", !!on && !multiple);
      ph.classList.toggle("is-compact", !!on && multiple);
    }
  }

  function extMark(name) {
    const ext = (name.split(".").pop() || "FILE").toUpperCase();
    return ext.slice(0, 4);
  }

  function renderFileList(files, { sortable = false, multiple = false, addLabel = "+ Thêm file", onAdd, onChange } = {}) {
    const list = ensureFileList();
    if (!list) return null;
    let items = [...(files || [])];

    function paint() {
      setUploadHasFile(items.length > 0, { multiple });
      if (!items.length) {
        list.innerHTML = "";
        hideAddMoreBtn();
        return;
      }
      list.innerHTML = items.map((f, i) => `
        <div class="file-chip" data-idx="${i}">
          <span class="file-chip-icon">${extMark(f.name)}</span>
          <div class="file-chip-body">
            <strong title="${f.name.replace(/"/g, "&quot;")}">${shortFileName(f.name)}</strong>
            <span class="text-muted">${formatBytes(f.size)}</span>
          </div>
          <div class="file-chip-actions">
            ${sortable ? `<button type="button" data-act="up" title="Lên">↑</button><button type="button" data-act="down" title="Xuống">↓</button>` : ""}
            <button type="button" data-act="rm" title="Xóa">×</button>
          </div>
        </div>`).join("");
      if (multiple && onAdd) ensureAddMoreBtn(addLabel, onAdd);
      else hideAddMoreBtn();
    }

    list.onclick = (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const chip = btn.closest(".file-chip");
      const idx = Number(chip?.dataset.idx);
      if (Number.isNaN(idx)) return;
      const act = btn.dataset.act;
      if (act === "rm") items.splice(idx, 1);
      if (act === "up" && idx > 0) [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
      if (act === "down" && idx < items.length - 1) [items[idx + 1], items[idx]] = [items[idx], items[idx + 1]];
      paint();
      onChange?.(items);
    };

    paint();
    return {
      getFiles: () => items.slice(),
      setFiles: (next) => {
        items = [...(next || [])];
        paint();
        onChange?.(items);
      }
    };
  }

  function bindUploadZone({ multiple = false, accept, onFiles, sortable = false, addLabel } = {}) {
    const zone = document.getElementById("uploadZone");
    const input = document.getElementById("fileInput");
    const browseBtn = document.getElementById("browseBtn");
    if (!zone || !input) return;

    if (multiple) zone.classList.add("upload-zone--multi");

    // Auto icon kind from accept
    if (!zone.dataset.kind) {
      const acc = (input.getAttribute("accept") || "").toLowerCase();
      if (acc.includes("image")) zone.dataset.kind = "image";
      else if (acc.includes("audio") || acc.includes("video")) zone.dataset.kind = "media";
      else if (acc.includes("pdf")) zone.dataset.kind = "pdf";
    }
    const icon = zone.querySelector(".upload-icon");
    if (icon && zone.dataset.kind === "image") icon.classList.add("upload-icon--image");
    if (icon && zone.dataset.kind === "media") icon.classList.add("upload-icon--media");

    let fileState = null;
    const pickLabel = addLabel || (zone.dataset.kind === "pdf" ? "+ Thêm PDF" : "+ Thêm file");

    function openPicker() {
      input.click();
    }

    function notify(list) {
      onFiles?.(list);
      if (multiple) {
        const n = list.length;
        if (!n) setStatus("Chưa có file.", "");
        else if (n === 1) setStatus("Đã chọn 1 file — thêm ít nhất 1 file nữa.", "ok");
        else setStatus(`${n} file đã chọn — sắp xếp thứ tự rồi bấm xử lý.`, "ok");
      } else if (list.length === 1) {
        setFileStatus(list[0]);
      } else if (list.length > 1) {
        setStatus(`${list.length} file đã chọn.`, "ok");
        document.getElementById("status")?.removeAttribute("title");
      } else {
        setFileStatus(null);
      }
    }

    function ingest(raw) {
      const picked = multiple ? [...raw] : raw.slice(0, 1);
      if (!picked.length) return;

      if (multiple) {
        const merged = fileState ? mergeFiles(fileState.getFiles(), picked) : picked;
        if (!fileState) {
          fileState = renderFileList(merged, {
            sortable,
            multiple: true,
            addLabel: pickLabel,
            onAdd: openPicker,
            onChange: notify
          });
        } else {
          fileState.setFiles(merged);
        }
        notify(fileState.getFiles());
      } else if (sortable) {
        fileState = renderFileList(picked, { sortable: true, onChange: notify });
        notify(fileState.getFiles());
      } else {
        fileState = renderFileList(picked, { sortable: false, onChange: notify });
        notify(fileState.getFiles());
      }
    }

    browseBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      openPicker();
    });
    zone.addEventListener("click", (e) => {
      if (e.target.closest("#browseBtn") || e.target.closest("#changeFileBtn") || e.target.closest("#fileInfo") || e.target.closest("#fileList") || e.target.closest("#addMoreBtn")) return;
      openPicker();
    });
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      const dropped = [...(e.dataTransfer.files || [])];
      if (dropped.length) ingest(dropped);
    });
    input.addEventListener("change", () => {
      const picked = [...(input.files || [])];
      input.value = "";
      if (picked.length) ingest(picked);
    });
  }

  function readFileAsArrayBuffer(file) {
    return file.arrayBuffer();
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Không đọc được ảnh.")); };
      img.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Không xuất được ảnh."))), type, quality);
    });
  }

  function parsePageSpec(spec, pageCount) {
    const set = new Set();
    const parts = String(spec || "").split(",").map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(x => parseInt(x.trim(), 10));
        if (!a || !b || a > b) throw new Error("Khoảng trang không hợp lệ: " + part);
        for (let i = a; i <= b; i++) {
          if (i < 1 || i > pageCount) throw new Error(`Trang ${i} ngoài phạm vi (1–${pageCount}).`);
          set.add(i);
        }
      } else {
        const n = parseInt(part, 10);
        if (!n || n < 1 || n > pageCount) throw new Error(`Trang ${part} ngoài phạm vi (1–${pageCount}).`);
        set.add(n);
      }
    }
    if (!set.size) throw new Error("Nhập ít nhất một trang (VD: 1-3,5).");
    return [...set].sort((a, b) => a - b);
  }

  function nameWithSuffix(name, suffix, ext) {
    const base = (name || "file").replace(/\.[^.]+$/, "");
    return base + suffix + (ext || "");
  }

  function slugifyVi(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  async function shaHex(algo, text) {
    if (window.OTDevCrypto?.digestText) {
      return OTDevCrypto.digestText(algo, text);
    }
    const map = { SHA256: "SHA-256", SHA1: "SHA-1", SHA384: "SHA-384", SHA512: "SHA-512" };
    const name = map[algo] || algo;
    if (algo === "MD5") throw new Error("MD5 không có sẵn trên trình duyệt — dùng SHA-256.");
    if (!crypto.subtle?.digest) {
      throw new Error("Hash cần HTTPS hoặc tải trang dev-crypto.js.");
    }
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest(name, data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function csvToJson(csv) {
    const text = String(csv || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = text.split("\n").filter((l) => l.trim().length);
    if (!lines.length) return [];
    const parseRow = row => {
      const out = [];
      let cur = "", q = false;
      for (let i = 0; i < row.length; i++) {
        const c = row[i];
        if (c === '"') {
          if (q && row[i + 1] === '"') { cur += '"'; i++; }
          else q = !q;
        } else if (c === "," && !q) { out.push(cur); cur = ""; }
        else cur += c;
      }
      out.push(cur);
      return out;
    };
    const headers = parseRow(lines[0]);
    return lines.slice(1).map(line => {
      const cols = parseRow(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i] ?? ""; });
      return obj;
    });
  }

  function jsonToCsv(arr) {
    const rows = Array.isArray(arr) ? arr : arr && typeof arr === "object" ? [arr] : null;
    if (!rows || !rows.length) throw new Error("JSON phải là mảng object hoặc một object.");
    const headers = [...new Set(rows.flatMap(o => Object.keys(o || {})))];
    const esc = v => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers.join(","), ...rows.map(o => headers.map(h => esc(o[h])).join(","))].join("\n");
  }

  OT.formatBytes = formatBytes;
  OT.shortFileName = shortFileName;
  OT.downloadBlob = downloadBlob;
  OT.downloadBytes = downloadBytes;
  OT.downloadText = downloadText;
  OT.copyText = copyText;
  OT.showResult = showResult;
  OT.bindResultActions = bindResultActions;
  OT.bindUploadZone = bindUploadZone;
  OT.renderFileList = renderFileList;
  OT.setBusy = setBusy;
  OT.setProgress = setProgress;
  OT.setStatus = setStatus;
  OT.readFileAsArrayBuffer = readFileAsArrayBuffer;
  OT.loadImage = loadImage;
  OT.canvasToBlob = canvasToBlob;
  OT.parsePageSpec = parsePageSpec;
  OT.nameWithSuffix = nameWithSuffix;
  OT.slugifyVi = slugifyVi;
  OT.shaHex = shaHex;
  OT.csvToJson = csvToJson;
  OT.jsonToCsv = jsonToCsv;
  OT.flashStatus = flashStatus;
  OT.setLastResult = setLastResult;

  document.addEventListener("DOMContentLoaded", bindResultActions);
})(window.OT);
