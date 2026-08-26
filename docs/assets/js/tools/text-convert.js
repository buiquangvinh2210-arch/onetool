/**
 * Chuyển đổi chữ — case, bỏ dấu VN, slug, dọn dòng, encode, tìm/thay.
 * 100% trên trình duyệt, không gọi API.
 */
window.OTTextConvert = (function () {
  "use strict";

  function countStats(text) {
    const t = String(text || "");
    const chars = t.length;
    const charsNoSpace = t.replace(/\s/g, "").length;
    const words = t.trim() ? t.trim().split(/\s+/).length : 0;
    const lines = t ? t.split(/\n/).length : 0;
    const bytes = new TextEncoder().encode(t).length;
    return { chars, charsNoSpace, words, lines, bytes };
  }

  function formatCount(n) {
    return Number(n || 0).toLocaleString("vi-VN");
  }

  /** Bỏ dấu tiếng Việt chính xác (NFD + đ/Đ). */
  function removeAccents(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  function toUpper(str) {
    return String(str || "").toLocaleUpperCase("vi-VN");
  }

  function toLower(str) {
    return String(str || "").toLocaleLowerCase("vi-VN");
  }

  function toTitleCase(str) {
    return String(str || "").replace(/([^\s_-]+)/g, (word) => {
      if (!word) return word;
      const lower = word.toLocaleLowerCase("vi-VN");
      return lower.charAt(0).toLocaleUpperCase("vi-VN") + lower.slice(1);
    });
  }

  function toSentenceCase(str) {
    const s = String(str || "").toLocaleLowerCase("vi-VN");
    return s.replace(/(^\s*[a-zà-ỹđ]|[.!?…]\s+[a-zà-ỹđ])/giu, (m) =>
      m.replace(/[a-zà-ỹđ]/iu, (c) => c.toLocaleUpperCase("vi-VN"))
    );
  }

  function invertCase(str) {
    return Array.from(String(str || ""))
      .map((ch) => {
        const up = ch.toLocaleUpperCase("vi-VN");
        const lo = ch.toLocaleLowerCase("vi-VN");
        if (ch === up && ch !== lo) return lo;
        if (ch === lo && ch !== up) return up;
        return ch;
      })
      .join("");
  }

  function slugify(str, sep) {
    const s = sep === "_" ? "_" : "-";
    return removeAccents(String(str || ""))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, s)
      .replace(new RegExp("^\\" + s + "+|\\" + s + "+$", "g"), "")
      .replace(new RegExp("\\" + s + "{2,}", "g"), s);
  }

  function collapseSpaces(str) {
    return String(str || "")
      .replace(/[^\S\n]+/g, " ")
      .replace(/ ?\n ?/g, "\n")
      .trim();
  }

  function trimLines(str) {
    return String(str || "")
      .split("\n")
      .map((l) => l.trim())
      .join("\n");
  }

  function removeBlankLines(str) {
    return String(str || "")
      .split("\n")
      .filter((l) => l.trim().length)
      .join("\n");
  }

  function normalizeNewlines(str, style) {
    const unified = String(str || "").replace(/\r\n?/g, "\n");
    return style === "crlf" ? unified.replace(/\n/g, "\r\n") : unified;
  }

  function reverseChars(str) {
    return Array.from(String(str || "")).reverse().join("");
  }

  function reverseWords(str) {
    return String(str || "")
      .split(/(\s+)/)
      .map((part) => (/\s/.test(part) ? part : Array.from(part).reverse().join("")))
      .join("");
  }

  function reverseLines(str) {
    return String(str || "").split("\n").reverse().join("\n");
  }

  function sortLines(str, desc) {
    const lines = String(str || "").split("\n");
    const sorted = lines.slice().sort((a, b) =>
      a.localeCompare(b, "vi", { sensitivity: "base", numeric: true })
    );
    if (desc) sorted.reverse();
    return sorted.join("\n");
  }

  function uniqueLines(str, ignoreCase) {
    const seen = new Set();
    const out = [];
    String(str || "")
      .split("\n")
      .forEach((line) => {
        const key = ignoreCase ? line.toLocaleLowerCase("vi-VN") : line;
        if (seen.has(key)) return;
        seen.add(key);
        out.push(line);
      });
    return out.join("\n");
  }

  function numberLines(str, start) {
    const n0 = Number.isFinite(start) ? Number(start) : 1;
    return String(str || "")
      .split("\n")
      .map((line, i) => String(n0 + i) + ". " + line)
      .join("\n");
  }

  function stripPunctuation(str) {
    return String(str || "")
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/[^\S\n]+/g, " ")
      .replace(/ ?\n ?/g, "\n")
      .trim();
  }

  function urlEncode(str) {
    return encodeURIComponent(String(str || ""));
  }

  function urlDecode(str) {
    try {
      return decodeURIComponent(String(str || "").replace(/\+/g, "%20"));
    } catch (_) {
      throw new Error("Chuỗi URL encode không hợp lệ.");
    }
  }

  function htmlEncode(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function htmlDecode(str) {
    const el = document.createElement("textarea");
    el.innerHTML = String(str || "");
    return el.value;
  }

  function unicodeEscape(str) {
    return Array.from(String(str || ""))
      .map((ch) => {
        const cp = ch.codePointAt(0);
        if (cp <= 0x7f) return ch;
        if (cp <= 0xffff) return "\\u" + cp.toString(16).padStart(4, "0");
        const hi = Math.floor((cp - 0x10000) / 0x400) + 0xd800;
        const lo = ((cp - 0x10000) % 0x400) + 0xdc00;
        return (
          "\\u" +
          hi.toString(16).padStart(4, "0") +
          "\\u" +
          lo.toString(16).padStart(4, "0")
        );
      })
      .join("");
  }

  function unicodeUnescape(str) {
    return String(str || "").replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
  }

  function findReplace(str, find, replace, opts) {
    const src = String(str || "");
    const needle = String(find || "");
    if (!needle) throw new Error("Nhập chuỗi cần tìm.");
    const flags = (opts?.ignoreCase ? "i" : "") + (opts?.global !== false ? "g" : "");
    if (opts?.regex) {
      let re;
      try {
        re = new RegExp(needle, flags);
      } catch (e) {
        throw new Error("Regex không hợp lệ: " + (e.message || e));
      }
      return src.replace(re, String(replace ?? ""));
    }
    if (!opts?.ignoreCase) {
      if (opts?.global === false) {
        const i = src.indexOf(needle);
        if (i < 0) return src;
        return src.slice(0, i) + String(replace ?? "") + src.slice(i + needle.length);
      }
      return src.split(needle).join(String(replace ?? ""));
    }
    const re = new RegExp(
      needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      flags
    );
    return src.replace(re, String(replace ?? ""));
  }

  const ACTIONS = {
    upper: { label: "HOA", group: "case", run: (t) => toUpper(t) },
    lower: { label: "thường", group: "case", run: (t) => toLower(t) },
    title: { label: "Title Case", group: "case", run: (t) => toTitleCase(t) },
    sentence: { label: "Câu", group: "case", run: (t) => toSentenceCase(t) },
    invert: { label: "Đảo hoa/thường", group: "case", run: (t) => invertCase(t) },
    accents: { label: "Bỏ dấu VN", group: "vn", run: (t) => removeAccents(t) },
    slug: { label: "Slug URL", group: "vn", run: (t, o) => slugify(t, o?.sep) },
    nfc: { label: "Chuẩn NFC", group: "vn", run: (t) => String(t || "").normalize("NFC") },
    collapse: { label: "Gộp khoảng trắng", group: "clean", run: (t) => collapseSpaces(t) },
    trimLines: { label: "Cắt đầu/cuối dòng", group: "clean", run: (t) => trimLines(t) },
    blank: { label: "Xóa dòng trống", group: "clean", run: (t) => removeBlankLines(t) },
    lf: { label: "Xuống dòng LF", group: "clean", run: (t) => normalizeNewlines(t, "lf") },
    crlf: { label: "Xuống dòng CRLF", group: "clean", run: (t) => normalizeNewlines(t, "crlf") },
    punct: { label: "Xóa dấu câu", group: "clean", run: (t) => stripPunctuation(t) },
    revChars: { label: "Đảo ký tự", group: "lines", run: (t) => reverseChars(t) },
    revWords: { label: "Đảo chữ trong từ", group: "lines", run: (t) => reverseWords(t) },
    revLines: { label: "Đảo dòng", group: "lines", run: (t) => reverseLines(t) },
    sortAsc: { label: "Sắp A→Z", group: "lines", run: (t) => sortLines(t, false) },
    sortDesc: { label: "Sắp Z→A", group: "lines", run: (t) => sortLines(t, true) },
    unique: { label: "Lọc trùng dòng", group: "lines", run: (t) => uniqueLines(t, true) },
    number: { label: "Đánh số dòng", group: "lines", run: (t) => numberLines(t, 1) },
    urlEnc: { label: "URL Encode", group: "encode", run: (t) => urlEncode(t) },
    urlDec: { label: "URL Decode", group: "encode", run: (t) => urlDecode(t) },
    htmlEnc: { label: "HTML Encode", group: "encode", run: (t) => htmlEncode(t) },
    htmlDec: { label: "HTML Decode", group: "encode", run: (t) => htmlDecode(t) },
    uniEsc: { label: "Unicode \\u", group: "encode", run: (t) => unicodeEscape(t) },
    uniUnesc: { label: "Bỏ \\u", group: "encode", run: (t) => unicodeUnescape(t) }
  };

  function apply(actionId, text, opts) {
    const act = ACTIONS[actionId];
    if (!act) throw new Error("Không rõ thao tác.");
    return act.run(String(text || ""), opts || {});
  }

  return {
    ACTIONS,
    countStats,
    formatCount,
    removeAccents,
    slugify,
    findReplace,
    apply
  };
})();
