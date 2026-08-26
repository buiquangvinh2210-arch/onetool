/**
 * Word / character counter — tiếng Việt + tiếng Anh.
 */
window.OTWordCounter = (function () {
  "use strict";

  function normalize(text) {
    return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function countWords(text) {
    const t = normalize(text).trim();
    if (!t) return 0;
    // Split on whitespace / punctuation boundaries; keep VN syllables as space-separated tokens
    const parts = t
      .replace(/[\u2018\u2019\u201C\u201D]/g, "")
      .split(/[\s\u00A0]+/)
      .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
      .filter(Boolean);
    return parts.length;
  }

  function countSentences(text) {
    const t = normalize(text).trim();
    if (!t) return 0;
    const parts = t.split(/(?<=[.!?…。！？])\s+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 1 && /[.!?…]$/.test(t) === false && t.length > 0) return 1;
    return parts.length || (t ? 1 : 0);
  }

  function countParagraphs(text) {
    const t = normalize(text).trim();
    if (!t) return 0;
    return t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length;
  }

  function countLines(text) {
    const t = normalize(text);
    if (!t) return 0;
    return t.split("\n").length;
  }

  function topKeywords(text, limit) {
    const stop = new Set(
      "và hoặc của các một những là có trong trên với từ về để cho không được này đó lại đã sẽ đang the a an and or of to in on for is are was were be been it this that with as by from at".split(
        /\s+/
      )
    );
    const freq = new Map();
    const t = normalize(text).toLowerCase();
    const words = t
      .split(/[\s\u00A0]+/)
      .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
      .filter((w) => w.length > 1 && !stop.has(w) && !/^\d+$/.test(w));
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "vi"))
      .slice(0, limit || 12)
      .map(([word, count]) => ({ word, count }));
  }

  function analyze(text) {
    const raw = normalize(text);
    const chars = raw.length;
    const charsNoSpace = raw.replace(/[\s\u00A0]/g, "").length;
    const words = countWords(raw);
    const sentences = countSentences(raw);
    const paragraphs = countParagraphs(raw);
    const lines = countLines(raw);
    const readingMinVi = words / 200; // ~200 từ/phút tiếng Việt
    const readingMinEn = words / 230;
    const speakingMin = words / 130;
    return {
      chars,
      charsNoSpace,
      words,
      sentences,
      paragraphs,
      lines,
      avgWordLen: words ? Math.round((charsNoSpace / words) * 10) / 10 : 0,
      avgSentenceWords: sentences ? Math.round((words / sentences) * 10) / 10 : 0,
      readingMinVi,
      readingMinEn,
      speakingMin,
      keywords: topKeywords(raw, 15)
    };
  }

  function formatMinutes(min) {
    if (!min || min < 0.05) return "< 1 phút";
    if (min < 1) return `${Math.max(1, Math.round(min * 60))} giây`;
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return s ? `${m} phút ${s} giây` : `${m} phút`;
  }

  return { analyze, countWords, formatMinutes };
})();
