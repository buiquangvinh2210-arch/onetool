(function () {
  "use strict";

  const MAX_FILES = 40;
  const MAX_BYTES = 15 * 1024 * 1024;

  /** @type {{ id: string, file: File, url: string }[]} */
  let items = [];
  let pageSize = "fit";
  let lastBlob = null;
  let lastName = "images.pdf";

  const els = {
    shell: document.getElementById("shell"),
    list: document.getElementById("list"),
    empty: document.getElementById("emptyHint"),
    status: document.getElementById("status"),
    runBtn: document.getElementById("runBtn"),
    downloadBtn: document.getElementById("downloadResultBtn"),
    input: document.getElementById("fileInput")
  };

  function uid() {
    return "i" + Math.random().toString(36).slice(2, 9);
  }

  function revokeAll() {
    items.forEach((it) => URL.revokeObjectURL(it.url));
  }

  function syncUi() {
    const n = items.length;
    els.runBtn.disabled = n === 0;
    if (els.list) els.list.hidden = n === 0;
    if (els.empty) els.empty.hidden = n > 0;
    if (n === 0) {
      els.status.textContent = "Thêm ảnh — tối đa 40 file · 15 MB mỗi ảnh";
    } else {
      const total = items.reduce((s, it) => s + it.file.size, 0);
      els.status.textContent = n + " ảnh · " + OT.formatBytes(total) + " — sắp xếp rồi bấm Tạo PDF";
    }
    renderList();
  }

  function renderList() {
    if (!els.list) return;
    els.list.innerHTML = items
      .map(
        (it, idx) => `
      <div class="ip-item" data-id="${it.id}">
        <img src="${it.url}" alt="" />
        <div>
          <strong title="${it.file.name.replace(/"/g, "&quot;")}">${OT.shortFileName(it.file.name)}</strong>
          <span>Trang ${idx + 1} · ${OT.formatBytes(it.file.size)}</span>
        </div>
        <div class="ip-item-actions">
          <button type="button" data-act="up" title="Lên" ${idx === 0 ? "disabled" : ""}>↑</button>
          <button type="button" data-act="down" title="Xuống" ${idx === items.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" data-act="rm" title="Xóa">×</button>
        </div>
      </div>`
      )
      .join("");
  }

  function syncFromCore(fileList) {
    const incoming = Array.from(fileList || []);
    const next = [];
    const used = new Set();

    for (const f of incoming) {
      if (!f.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name)) {
        continue;
      }
      if (f.size > MAX_BYTES) {
        showToast?.("«" + f.name + "» vượt 15MB.", "error");
        continue;
      }
      if (next.length >= MAX_FILES) {
        showToast?.("Tối đa " + MAX_FILES + " ảnh.", "error");
        break;
      }
      const existing = items.find(
        (it) =>
          !used.has(it.id) &&
          it.file.name === f.name &&
          it.file.size === f.size &&
          it.file.lastModified === f.lastModified
      );
      if (existing) {
        used.add(existing.id);
        next.push(existing);
      } else {
        next.push({ id: uid(), file: f, url: URL.createObjectURL(f) });
      }
    }

    items.forEach((it) => {
      if (!next.includes(it)) URL.revokeObjectURL(it.url);
    });
    items = next;
    lastBlob = null;
    if (els.downloadBtn) els.downloadBtn.disabled = true;
    syncUi();
  }

  function moveItem(id, dir) {
    const i = items.findIndex((x) => x.id === id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
    lastBlob = null;
    if (els.downloadBtn) els.downloadBtn.disabled = true;
    syncUi();
  }

  function removeItem(id) {
    const i = items.findIndex((x) => x.id === id);
    if (i < 0) return;
    URL.revokeObjectURL(items[i].url);
    items.splice(i, 1);
    lastBlob = null;
    if (els.downloadBtn) els.downloadBtn.disabled = true;
    syncUi();
  }

  OT.bindUploadZone({
    multiple: true,
    onFiles: (files) => syncFromCore(files)
  });

  document.getElementById("pageSizeGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ip-opt");
    if (!btn) return;
    pageSize = btn.dataset.size || "fit";
    document.querySelectorAll("#pageSizeGrid .ip-opt").forEach((b) => {
      b.classList.toggle("is-on", b === btn);
    });
    lastBlob = null;
    if (els.downloadBtn) els.downloadBtn.disabled = true;
  });

  els.list?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    const row = e.target.closest(".ip-item");
    if (!btn || !row) return;
    const id = row.dataset.id;
    if (btn.dataset.act === "up") moveItem(id, -1);
    else if (btn.dataset.act === "down") moveItem(id, 1);
    else if (btn.dataset.act === "rm") removeItem(id);
  });

  els.runBtn?.addEventListener("click", async () => {
    const btn = els.runBtn;
    try {
      if (!items.length) throw new Error("Thêm ít nhất một ảnh.");
      if (!OTPdf.imagesToPdf) throw new Error("Đang dùng pdf.js cũ — Ctrl+F5.");
      OT.setBusy(btn, true, "Đang tạo PDF…");
      els.status.textContent = "Đang nhúng ảnh vào PDF…";
      const files = items.map((it) => it.file);
      const r = await OTPdf.imagesToPdf(files, {
        pageSize,
        margin: 36,
        jpegQuality: 0.98,
        onProgress: ({ page, total, name }) => {
          els.status.textContent = "Trang " + page + "/" + total + " · " + (name || "");
        }
      });
      lastBlob = r.blob;
      lastName = OT.nameWithSuffix(files[0].name.replace(/\.[^.]+$/, "") || "images", "", ".pdf");
      if (files.length > 1) lastName = "anh-" + files.length + "-trang.pdf";
      OT.setLastResult({ blob: lastBlob, fileName: lastName, contentType: "application/pdf" });
      if (els.downloadBtn) els.downloadBtn.disabled = false;
      els.status.textContent =
        "Xong — " + r.pageCount + " trang · " + OT.formatBytes(lastBlob.size);
      showToast?.("Đã tạo PDF!", "success");
    } catch (err) {
      els.status.textContent = err.message || String(err);
      showToast?.(err.message || "Không tạo được PDF.", "error");
      console.error(err);
    } finally {
      OT.setBusy(btn, false);
    }
  });

  window.addEventListener("beforeunload", revokeAll);
  syncUi();
})();
