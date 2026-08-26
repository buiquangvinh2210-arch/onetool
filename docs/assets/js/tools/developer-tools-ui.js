(function () {
  "use strict";

  const SAMPLE_HASH = "Hello OneTool — tiếng Việt có dấu!";
  const SAMPLE_SLUG = "Hướng dẫn sử dụng công cụ PDF miễn phí 2026";
  const SAMPLE_TS = "1724317200";

  let mode = "uuid";
  let tsSub = "now";

  const L = {
    intro: "UUID v4, Hash SHA (UTF-8), slugify tiếng Việt, chuyển đổi Unix timestamp — xử lý ngay trên trình duyệt.",
    source: "Nguồn",
    result: "Kết quả",
    copy: "Sao chép",
    download: "Tải file",
    sample: "Mẫu",
    clear: "Xóa",
    openFile: "Hash file",
    modeAria: "Chế độ",
    pageTitle: "UUID Hash Slugify online — SHA-256, timestamp tiếng Việt | OneTool",
    pageDesc: "UUID v4, SHA-256/384/512, slug tiếng Việt, Unix timestamp online miễn phí.",
    runUuid: "Tạo UUID",
    runHash: "Tính Hash",
    runSlug: "Slugify",
    runTsNow: "Lấy thời gian hiện tại",
    runTsConvert: "Chuyển đổi",
    emptyResult: "Chưa có kết quả",
    idleStatus: "Kết quả hiện ở đây sau khi chạy.",
    noInput: "Chưa có dữ liệu",
    uuidHint: "UUID v4 — không cần nhập text",
    lblCount: "Số lượng",
    lblAlgo: "Thuật toán",
    lblUpper: "Chữ HOA",
    lblSep: "Dấu phân cách",
    lblTsNow: "Hiện tại",
    lblTsConvert: "Chuyển đổi"
  };

  const els = {
    input: document.getElementById("inputText"),
    meta: document.getElementById("inputMeta"),
    status: document.getElementById("status"),
    preview: document.getElementById("preview"),
    tabs: document.getElementById("modeTabs"),
    runBtn: document.getElementById("runBtn"),
    fileInput: document.getElementById("fileInput"),
    fileChip: document.getElementById("fileChip"),
    uuidOpts: document.getElementById("uuidOpts"),
    hashOpts: document.getElementById("hashOpts"),
    slugOpts: document.getElementById("slugOpts"),
    tsOpts: document.getElementById("tsOpts"),
    uuidCount: document.getElementById("uuidCount"),
    algo: document.getElementById("algo"),
    hashUpper: document.getElementById("hashUpper"),
    slugSep: document.getElementById("slugSep"),
    tsSubmode: document.getElementById("tsSubmode")
  };

  function applyLabels() {
    document.getElementById("introDesc").textContent = L.intro;
    document.getElementById("lblSource").textContent = L.source;
    document.getElementById("lblResult").textContent = L.result;
    document.getElementById("copyResultBtn").textContent = L.copy;
    document.getElementById("downloadResultBtn").textContent = L.download;
    document.getElementById("sampleBtn").textContent = L.sample;
    document.getElementById("clearBtn").textContent = L.clear;
    document.getElementById("openFileBtn").textContent = L.openFile;
    document.getElementById("lblCount").textContent = L.lblCount;
    document.getElementById("lblAlgo").textContent = L.lblAlgo;
    document.getElementById("lblUpper").textContent = L.lblUpper;
    document.getElementById("lblSep").textContent = L.lblSep;
    document.getElementById("tsNowBtn").textContent = L.lblTsNow;
    document.getElementById("tsConvertBtn").textContent = L.lblTsConvert;
    const slugSep = document.getElementById("slugSep");
    if (slugSep?.options[0]) {
      slugSep.options[0].textContent = "- (gạch ngang)";
      slugSep.options[1].textContent = "_ (gạch dưới)";
    }
    els.tabs?.setAttribute("aria-label", L.modeAria);
    document.title = L.pageTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", L.pageDesc);
  }

  function slugifyWithSep(str, sep) {
    let s = OT.slugifyVi(str);
    if (sep === "_") s = s.replace(/-/g, "_");
    return s;
  }

  async function shaHexBytes(algo, bytes) {
    return OTDevCrypto.digestBytes(algo, bytes);
  }

  function parseTimestampInput(raw) {
    const s = String(raw || "").trim();
    if (!s) throw new Error("Nhập Unix timestamp hoặc chuỗi ngày ISO.");
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      if (!Number.isFinite(n)) throw new Error("Timestamp không hợp lệ.");
      const ms = s.length >= 13 ? n : n * 1000;
      const d = new Date(ms);
      if (Number.isNaN(d.getTime())) throw new Error("Timestamp nằm ngoài phạm vi.");
      return d;
    }
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Không parse được ngày — thử Unix (giây/ms) hoặc ISO 8601.");
    return d;
  }

  function formatTimestampBlock(d) {
    const ms = d.getTime();
    const sec = Math.floor(ms / 1000);
    return [
      "Unix (giây):  " + sec,
      "Unix (ms):    " + ms,
      "ISO 8601:     " + d.toISOString(),
      "Local (vi-VN): " + d.toLocaleString("vi-VN", { hour12: false })
    ].join("\n");
  }

  function generateUuids(count) {
    const n = Math.min(50, Math.max(1, Number(count) || 1));
    const out = [];
    for (let i = 0; i < n; i++) out.push(OTDevCrypto.randomUUIDv4());
    return out.join("\n");
  }

  function clearResult(resetStatus) {
    els.preview.textContent = L.emptyResult;
    els.preview.classList.add("is-empty");
    document.getElementById("copyResultBtn").disabled = true;
    document.getElementById("downloadResultBtn").disabled = true;
    if (resetStatus) {
      els.status.textContent = L.idleStatus;
      els.status.className = "dev-status";
    }
  }

  function showResult(text, fileName, statusMsg) {
    els.preview.classList.remove("is-empty");
    els.preview.textContent = text;
    OT.showResult({ text, fileName, contentType: "text/plain;charset=utf-8" });
    els.status.textContent = statusMsg;
    els.status.className = "dev-status is-ok";
  }

  function updateMeta() {
    if (mode === "uuid") {
      els.meta.textContent = L.uuidHint;
      return;
    }
    if (mode === "timestamp" && tsSub === "now") {
      els.meta.textContent = "Timestamp — không cần nhập text";
      return;
    }
    const fileLabel = els.fileChip.hidden ? "" : els.fileChip.textContent;
    const text = els.input.value;
    if (fileLabel) {
      els.meta.textContent = fileLabel;
    } else if (text.trim()) {
      els.meta.textContent = text.length + " ký tự · " + OT.formatBytes(new Blob([text]).size);
    } else {
      els.meta.textContent = L.noInput;
    }
  }

  function syncInputState() {
    const needsInput = (mode === "hash" || mode === "slugify") || (mode === "timestamp" && tsSub === "convert");
    const inputWrap = document.getElementById("inputWrap");
    if (inputWrap) inputWrap.hidden = !needsInput;
    if (!needsInput) {
      els.input.value = "";
      els.fileInput._pickedFile = null;
      els.fileChip.hidden = true;
    }
    els.input.disabled = !needsInput;
    els.input.classList.toggle("is-disabled", !needsInput);
    document.getElementById("openFileBtn").hidden = mode !== "hash";
    document.getElementById("sampleBtn").hidden = mode === "uuid" || (mode === "timestamp" && tsSub === "now");
    document.getElementById("clearBtn").hidden = !needsInput;

    if (mode === "hash") {
      els.input.placeholder = "Nhập văn bản UTF-8 để băm SHA…";
    } else if (mode === "slugify") {
      els.input.placeholder = "Tiêu đề tiếng Việt cần chuyển slug…";
    } else if (tsSub === "convert") {
      els.input.placeholder = "Unix (giây/ms) hoặc 2026-08-22T10:30:00+07:00…";
    } else {
      els.input.placeholder = "";
    }
  }

  function updateRunLabel() {
    let label;
    if (mode === "uuid") label = L.runUuid;
    else if (mode === "hash") label = L.runHash;
    else if (mode === "slugify") label = L.runSlug;
    else label = tsSub === "now" ? L.runTsNow : L.runTsConvert;
    els.runBtn.textContent = label;
    els.runBtn.dataset.label = label;
  }

  function setTsSub(next) {
    tsSub = next;
    els.tsSubmode.querySelectorAll("button[data-ts]").forEach((btn) => {
      const on = btn.dataset.ts === tsSub;
      btn.classList.toggle("is-on", on);
    });
    syncInputState();
    updateRunLabel();
    updateMeta();
    clearResult(true);
  }

  function setMode(next) {
    mode = next;
    els.tabs.querySelectorAll("button[data-mode]").forEach((btn) => {
      const on = btn.dataset.mode === mode;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.uuidOpts.hidden = mode !== "uuid";
    els.hashOpts.hidden = mode !== "hash";
    els.slugOpts.hidden = mode !== "slugify";
    els.tsOpts.hidden = mode !== "timestamp";
    if (mode === "timestamp") setTsSub(tsSub);
    else syncInputState();
    updateRunLabel();
    updateMeta();
  }

  async function runConvert() {
    const btn = els.runBtn;
    try {
      OT.setBusy(btn, true);
      els.status.textContent = "Đang xử lý…";
      els.status.className = "dev-status";

      let text = "";
      let fileName = "result.txt";

      if (mode === "uuid") {
        const count = els.uuidCount.value;
        text = generateUuids(count);
        fileName = Number(count) > 1 ? "uuids.txt" : "uuid.txt";
        showResult(text, fileName, "Đã tạo " + text.split("\n").length + " UUID v4.");
      } else if (mode === "hash") {
        const algo = els.algo.value;
        const upper = els.hashUpper.checked;
        const picked = els.fileInput._pickedFile || null;
        let hex;
        if (picked) {
          const bytes = await picked.arrayBuffer();
          hex = await shaHexBytes(algo, bytes);
        } else {
          const input = els.input.value;
          if (!input) throw new Error("Nhập văn bản hoặc chọn file để hash.");
          hex = await OTDevCrypto.digestText(algo, input);
        }
        if (upper) hex = hex.toUpperCase();
        text = hex;
        fileName = algo.toLowerCase() + ".txt";
        showResult(text, fileName, algo + " · " + hex.length + " ký tự hex (UTF-8).");
      } else if (mode === "slugify") {
        const input = els.input.value;
        if (!input.trim()) throw new Error("Nhập tiêu đề hoặc văn bản trước.");
        const sep = els.slugSep.value;
        text = slugifyWithSep(input, sep);
        fileName = "slug.txt";
        showResult(text, fileName, "Slug · " + text.length + " ký tự.");
      } else if (mode === "timestamp") {
        const d = tsSub === "now" ? new Date() : parseTimestampInput(els.input.value);
        text = formatTimestampBlock(d);
        fileName = "timestamp.txt";
        showResult(text, fileName, tsSub === "now" ? "Timestamp hiện tại." : "Đã chuyển đổi timestamp.");
      }

      showToast?.("Xong!", "success");
    } catch (e) {
      els.status.textContent = e.message || String(e);
      els.status.className = "dev-status is-err";
      clearResult(false);
    } finally {
      OT.setBusy(btn, false);
      updateRunLabel();
    }
  }

  els.tabs?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (!btn) return;
    setMode(btn.dataset.mode);
    clearResult(true);
  });

  els.tsSubmode?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-ts]");
    if (!btn) return;
    setTsSub(btn.dataset.ts);
  });

  els.input?.addEventListener("input", () => {
    if (mode === "hash") {
      els.fileInput._pickedFile = null;
      els.fileChip.hidden = true;
    }
    updateMeta();
    clearResult(true);
  });

  document.getElementById("sampleBtn")?.addEventListener("click", () => {
    if (mode === "hash") els.input.value = SAMPLE_HASH;
    else if (mode === "slugify") els.input.value = SAMPLE_SLUG;
    else if (mode === "timestamp") els.input.value = SAMPLE_TS;
    els.fileInput._pickedFile = null;
    els.fileChip.hidden = true;
    updateMeta();
    clearResult(true);
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
    els.input.value = "";
    updateMeta();
    clearResult(true);
    setMode("hash");
  });

  els.runBtn.onclick = runConvert;

  els.input?.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runConvert();
    }
  });

  applyLabels();
  setMode("uuid");
  clearResult(true);
  updateMeta();
})();
