(function () {
  "use strict";

  const els = {
    input: document.getElementById("textInput"),
    fileInput: document.getElementById("fileInput"),
    pasteBtn: document.getElementById("pasteBtn"),
    loadBtn: document.getElementById("loadBtn"),
    clearBtn: document.getElementById("clearBtn"),
    copyStatsBtn: document.getElementById("copyStatsBtn"),
    status: document.getElementById("status"),
    keywordList: document.getElementById("keywordList"),
    words: document.getElementById("statWords"),
    chars: document.getElementById("statChars"),
    charsNoSpace: document.getElementById("statCharsNoSpace"),
    sentences: document.getElementById("statSentences"),
    paragraphs: document.getElementById("statParagraphs"),
    lines: document.getElementById("statLines"),
    timeReadVi: document.getElementById("timeReadVi"),
    timeReadEn: document.getElementById("timeReadEn"),
    timeSpeak: document.getElementById("timeSpeak"),
    avgWordLen: document.getElementById("avgWordLen"),
    avgSentenceWords: document.getElementById("avgSentenceWords")
  };

  let lastStats = null;

  function setStatus(msg, kind) {
    if (!els.status) return;
    els.status.textContent = msg;
    els.status.classList.remove("is-ok", "is-err");
    if (kind === "ok") els.status.classList.add("is-ok");
    if (kind === "err") els.status.classList.add("is-err");
  }

  function fmtNum(n) {
    return Number(n || 0).toLocaleString("vi-VN");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderKeywords(stats) {
    if (!els.keywordList) return;
    const kws = stats.keywords || [];
    const total = stats.words || 0;
    if (!kws.length) {
      els.keywordList.innerHTML =
        '<p class="wc-empty">Gõ văn bản để xem từ xuất hiện nhiều nhất.</p>';
      return;
    }
    els.keywordList.innerHTML = kws
      .map((k) => {
        const pct = total ? Math.round((k.count / total) * 1000) / 10 : 0;
        return (
          '<div class="wc-kw">' +
          '<span class="wc-kw-word">' +
          escapeHtml(k.word) +
          "</span>" +
          '<span class="wc-kw-count">×' +
          k.count +
          "</span>" +
          '<span class="wc-kw-pct">' +
          pct +
          "%</span>" +
          "</div>"
        );
      })
      .join("");
  }

  function applyStats(stats) {
    lastStats = stats;
    if (els.words) els.words.textContent = fmtNum(stats.words);
    if (els.chars) els.chars.textContent = fmtNum(stats.chars);
    if (els.charsNoSpace) els.charsNoSpace.textContent = fmtNum(stats.charsNoSpace);
    if (els.sentences) els.sentences.textContent = fmtNum(stats.sentences);
    if (els.paragraphs) els.paragraphs.textContent = fmtNum(stats.paragraphs);
    if (els.lines) els.lines.textContent = fmtNum(stats.lines);
    if (els.avgWordLen) els.avgWordLen.textContent = String(stats.avgWordLen || 0);
    if (els.avgSentenceWords) els.avgSentenceWords.textContent = String(stats.avgSentenceWords || 0);

    const fmt = OTWordCounter.formatMinutes;
    if (els.timeReadVi) els.timeReadVi.textContent = fmt(stats.readingMinVi);
    if (els.timeReadEn) els.timeReadEn.textContent = fmt(stats.readingMinEn);
    if (els.timeSpeak) els.timeSpeak.textContent = fmt(stats.speakingMin);

    renderKeywords(stats);
  }

  function refresh() {
    if (!window.OTWordCounter) return;
    const text = els.input?.value || "";
    const stats = OTWordCounter.analyze(text);
    applyStats(stats);
    if (!text.trim()) {
      setStatus("Sẵn sàng — dán văn bản hoặc mở file .txt.");
    } else {
      setStatus(
        fmtNum(stats.words) +
          " từ · " +
          fmtNum(stats.chars) +
          " ký tự · đọc ~" +
          OTWordCounter.formatMinutes(stats.readingMinVi),
        "ok"
      );
    }
  }

  function buildSummary() {
    const s = lastStats || OTWordCounter.analyze(els.input?.value || "");
    const fmt = OTWordCounter.formatMinutes;
    const lines = [
      "Thống kê Word Counter — OneTool",
      "────────────────────────",
      "Từ: " + s.words,
      "Ký tự: " + s.chars,
      "Ký tự (không khoảng trắng): " + s.charsNoSpace,
      "Câu: " + s.sentences,
      "Đoạn: " + s.paragraphs,
      "Dòng: " + s.lines,
      "Độ dài từ TB: " + s.avgWordLen,
      "Từ / câu TB: " + s.avgSentenceWords,
      "Thời gian đọc (VI): " + fmt(s.readingMinVi),
      "Thời gian đọc (EN): " + fmt(s.readingMinEn),
      "Thời gian nói: " + fmt(s.speakingMin)
    ];
    if (s.keywords?.length) {
      lines.push("", "Top từ khóa:");
      s.keywords.slice(0, 10).forEach((k, i) => {
        lines.push(i + 1 + ". " + k.word + " (" + k.count + ")");
      });
    }
    return lines.join("\n");
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      if (els.input) {
        els.input.value = text;
        els.input.focus();
      }
      refresh();
      setStatus("Đã dán từ clipboard.", "ok");
      showToast?.("Đã dán văn bản.", "success");
    } catch (e) {
      setStatus("Không đọc được clipboard — dùng Ctrl+V.", "err");
      showToast?.("Hãy dán bằng Ctrl+V.", "error");
      els.input?.focus();
    }
  }

  function clearText() {
    if (els.input) els.input.value = "";
    if (els.fileInput) els.fileInput.value = "";
    refresh();
    setStatus("Đã xóa văn bản.");
  }

  async function loadFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus("File .txt tối đa 5MB.", "err");
      showToast?.("File quá lớn (tối đa 5MB).", "error");
      return;
    }
    try {
      const text = await file.text();
      if (els.input) els.input.value = text;
      refresh();
      setStatus("Đã tải " + file.name + ".", "ok");
      showToast?.("Đã mở " + file.name, "success");
    } catch (e) {
      setStatus(e.message || "Không đọc được file.", "err");
      showToast?.(e.message || "Không đọc được file.", "error");
    }
  }

  async function copyStats() {
    try {
      await OT.copyText(buildSummary());
      setStatus("Đã sao chép thống kê.", "ok");
      showToast?.("Đã sao chép thống kê.", "success");
    } catch (e) {
      setStatus(e.message || "Không sao chép được.", "err");
      showToast?.(e.message || "Không sao chép được.", "error");
    }
  }

  els.input?.addEventListener("input", refresh);
  els.pasteBtn?.addEventListener("click", () => pasteText());
  els.clearBtn?.addEventListener("click", () => clearText());
  els.copyStatsBtn?.addEventListener("click", () => copyStats());
  els.loadBtn?.addEventListener("click", () => els.fileInput?.click());
  els.fileInput?.addEventListener("change", () => {
    const f = els.fileInput?.files?.[0];
    loadFile(f);
    if (els.fileInput) els.fileInput.value = "";
  });

  refresh();
})();
