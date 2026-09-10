(function () {
  "use strict";

  const ONES = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const SCALES = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  function readTriple(n, hasHigher) {
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const one = n % 10;
    const out = [];
    if (hundred > 0) {
      out.push(ONES[hundred], "trăm");
    } else if (hasHigher && n > 0) {
      out.push("không", "trăm");
    }
    if (ten === 0) {
      if (one > 0) {
        if (hundred > 0 || hasHigher) out.push("lẻ");
        out.push(ONES[one]);
      }
    } else if (ten === 1) {
      out.push("mười");
      if (one === 1) out.push("một");
      else if (one === 5) out.push("lăm");
      else if (one > 0) out.push(ONES[one]);
    } else {
      out.push(ONES[ten], "mươi");
      if (one === 1) out.push("mốt");
      else if (one === 4) out.push("tư");
      else if (one === 5) out.push("lăm");
      else if (one > 0) out.push(ONES[one]);
    }
    return out;
  }

  function readInt(n) {
    n = Math.trunc(Math.abs(n));
    if (n === 0) return "không";
    const groups = [];
    while (n > 0) {
      groups.push(n % 1000);
      n = Math.floor(n / 1000);
    }
    const parts = [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      if (g === 0) continue;
      const hasHigher = i < groups.length - 1 && parts.length > 0;
      parts.push(...readTriple(g, hasHigher || (g < 100 && i < groups.length - 1)));
      if (SCALES[i]) parts.push(SCALES[i]);
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function parseInput(raw) {
    let s = String(raw || "").trim();
    if (!s) return null;
    s = s.replace(/\s/g, "").replace(/đồng|vnd|vnđ|d$/i, "");
    s = s.replace(/\./g, "").replace(/,/g, ".");
    if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
    return s;
  }

  function toWords(raw, asMoney) {
    const parsed = parseInput(raw);
    if (parsed == null) throw new Error("Nhập số hợp lệ, ví dụ 1250000 hoặc 1.250.000");
    const neg = parsed.startsWith("-");
    const [intPart, fracPart] = parsed.replace("-", "").split(".");
    if (intPart.length > 15) throw new Error("Số quá lớn (tối đa 15 chữ số).");
    let text = readInt(Number(intPart));
    if (fracPart && Number(fracPart) > 0 && !asMoney) {
      const digits = fracPart.replace(/0+$/, "").split("").map((d) => ONES[Number(d)]);
      text += " phẩy " + digits.join(" ");
    }
    if (neg) text = "âm " + text;
    if (asMoney) text += Number(intPart) === 0 ? " đồng" : " đồng chẵn";
    return cap(text);
  }

  const input = document.getElementById("numInput");
  const out = document.getElementById("result");
  const status = document.getElementById("status");
  const moneyChk = document.getElementById("asMoney");

  function run() {
    try {
      if (!input.value.trim()) {
        out.value = "";
        status.textContent = "Nhập số để đổi thành chữ.";
        return;
      }
      out.value = toWords(input.value, moneyChk.checked);
      status.textContent = "Đã đổi — sao chép vào hợp đồng / hóa đơn.";
      status.className = "ntw-status is-ok";
    } catch (e) {
      out.value = "";
      status.textContent = e.message || String(e);
      status.className = "ntw-status is-err";
    }
  }

  input.addEventListener("input", run);
  moneyChk.addEventListener("change", run);
  document.getElementById("copyBtn").addEventListener("click", async () => {
    if (!out.value) return;
    try {
      await navigator.clipboard.writeText(out.value);
      status.textContent = "Đã sao chép.";
      status.className = "ntw-status is-ok";
    } catch {
      status.textContent = "Không sao chép được.";
      status.className = "ntw-status is-err";
    }
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    input.value = "";
    out.value = "";
    status.textContent = "Đã xóa.";
    status.className = "ntw-status";
    input.focus();
  });
  document.querySelectorAll("[data-ex]").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.ex;
      run();
    });
  });
})();
