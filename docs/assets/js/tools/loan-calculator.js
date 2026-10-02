(function () {
  "use strict";

  const METHODS = {
    reducing: { name: "Dư nợ giảm dần", hint: "Gốc chia đều mỗi tháng, lãi tính trên dư nợ còn lại — tháng đầu trả nhiều nhất rồi giảm dần." },
    annuity: { name: "Trả đều hàng tháng", hint: "Mỗi tháng trả một số tiền bằng nhau gồm cả gốc và lãi; chỉ thay đổi khi lãi suất thay đổi." },
    flat: { name: "Lãi phẳng", hint: "Lãi luôn tính trên số tiền vay ban đầu — hay gặp ở vay tiêu dùng, mua trả góp." }
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    methodBtns: document.querySelectorAll("[data-ln-method]"),
    methodHint: $("lnMethodHint"),
    amount: $("lnAmount"),
    presets: $("lnPresets"),
    term: $("lnTerm"),
    termUnit: $("lnTermUnit"),
    promoToggle: $("lnPromoToggle"),
    promo: $("lnPromo"),
    promoBox: $("lnPromoBox"),
    promoRate: $("lnPromoRate"),
    promoMonths: $("lnPromoMonths"),
    rateLabel: $("lnRateLabel"),
    rate: $("lnRate"),
    status: $("status"),
    summary: $("lnSummary"),
    bar: $("lnBar"),
    compare: $("lnCompare"),
    rows: $("lnRows"),
    copyBtn: $("lnCopyBtn")
  };

  let method = "reducing";
  let last = null;

  function parseMoney(v) {
    const digits = String(v || "").replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  }

  function parseRate(v) {
    const n = parseFloat(String(v || "").replace(",", ".").replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  const fmt = (n) => Math.round(n).toLocaleString("vi-VN");
  const fmtVnd = (n) => fmt(n) + " đ";
  const fmtPct = (n) => (Math.round(n * 100) / 100).toLocaleString("vi-VN") + "%";

  function termLabel(months) {
    if (months % 12 === 0) return months / 12 + " năm";
    if (months > 12) return Math.floor(months / 12) + " năm " + (months % 12) + " tháng";
    return months + " tháng";
  }

  function formatInput(input) {
    const n = parseMoney(input.value);
    const pos = input.value.length - input.selectionStart;
    input.value = n ? fmt(n) : "";
    const caret = Math.max(0, input.value.length - pos);
    try {
      input.setSelectionRange(caret, caret);
    } catch (_) {}
  }

  function annuityPayment(balance, monthlyRate, months) {
    if (monthlyRate === 0) return balance / months;
    return (balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  function schedule(loan, months, kind, rate, promo) {
    const rateAt = (m) => (promo && kind !== "flat" && m <= promo.months ? promo.rate : rate) / 100 / 12;
    const rows = [];
    let bal = loan;
    let pay = 0;
    for (let m = 1; m <= months; m++) {
      const r = rateAt(m);
      let principal;
      let interest;
      if (kind === "flat") {
        principal = loan / months;
        interest = (loan * rate) / 100 / 12;
      } else if (kind === "annuity") {
        if (m === 1 || (promo && m === promo.months + 1)) pay = annuityPayment(bal, r, months - m + 1);
        interest = bal * r;
        principal = m === months ? bal : pay - interest;
      } else {
        principal = loan / months;
        interest = bal * r;
      }
      bal = Math.max(0, bal - principal);
      rows.push({ m, principal, interest, pay: principal + interest, bal });
    }
    const totalInterest = rows.reduce((s, x) => s + x.interest, 0);
    return { rows, totalInterest, first: rows[0].pay, lastPay: rows[rows.length - 1].pay };
  }

  function flatEquivalentRate(loan, months, monthlyPay) {
    let lo = 0;
    let hi = 300;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (annuityPayment(loan, mid / 100 / 12, months) < monthlyPay) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  function readOpts() {
    const termVal = Math.max(0, parseInt(els.term.value, 10) || 0);
    const months = termVal * (Number(els.termUnit.value) || 12);
    const promoOn = els.promo.checked && method !== "flat";
    return {
      loan: parseMoney(els.amount.value),
      months,
      rate: parseRate(els.rate.value),
      promo: promoOn ? { rate: parseRate(els.promoRate.value), months: Number(els.promoMonths.value) || 12 } : null
    };
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.className = "sal-status" + (kind ? " is-" + kind : "");
  }

  const stat = (label, value, net, text) => `<div class="sal-stat${net ? " sal-stat--net" : ""}${text ? " is-text" : ""}"><span>${label}</span><strong>${value}</strong></div>`;

  function render(s, o, all) {
    const total = o.loan + s.totalInterest;
    let a;
    let b;
    if (method === "reducing") {
      a = stat("Trả tháng đầu", fmtVnd(s.first));
      b = stat("Trả tháng cuối", fmtVnd(s.lastPay));
    } else if (method === "annuity" && o.promo && o.promo.months < o.months) {
      a = stat(`Mỗi tháng, tháng 1–${o.promo.months}`, fmtVnd(s.first));
      b = stat(`Mỗi tháng, từ tháng ${o.promo.months + 1}`, fmtVnd(s.rows[o.promo.months].pay));
    } else if (method === "annuity") {
      a = stat("Trả mỗi tháng", fmtVnd(s.first));
      b = stat("Số tiền vay", fmtVnd(o.loan));
    } else {
      a = stat("Trả mỗi tháng", fmtVnd(s.first));
      b = stat("Lãi suất thực tương đương", "≈ " + fmtPct(s.equivalent) + "/năm", false, true);
    }
    els.summary.innerHTML = a + b + stat("Tổng tiền lãi", fmtVnd(s.totalInterest)) + stat("Tổng gốc + lãi", fmtVnd(total), true);

    const share = (o.loan / total) * 100;
    els.bar.innerHTML = `<i style="width:${share.toFixed(2)}%"></i><i style="width:${(100 - share).toFixed(2)}%"></i>`;

    const best = Math.min(...Object.values(all).map((x) => x.totalInterest));
    els.compare.innerHTML = Object.keys(METHODS)
      .map((k) => {
        const x = all[k];
        const cls = [k === method ? "is-sub" : "", x.totalInterest === best ? "is-best" : ""].filter(Boolean).join(" ");
        return `<tr${cls ? ` class="${cls}"` : ""}><th scope="row">${METHODS[k].name}</th><td>${fmtVnd(x.first)}</td><td>${fmtVnd(x.lastPay)}</td><td>${fmtVnd(x.totalInterest)}</td></tr>`;
      })
      .join("");

    const out = [];
    let yp = 0;
    let yi = 0;
    s.rows.forEach((x) => {
      yp += x.principal;
      yi += x.interest;
      out.push(`<tr><th scope="row">Tháng ${x.m}</th><td>${fmt(x.principal)}</td><td>${fmt(x.interest)}</td><td>${fmt(x.pay)}</td><td>${fmt(x.bal)}</td></tr>`);
      if (o.months > 12 && (x.m % 12 === 0 || x.m === o.months)) {
        out.push(`<tr class="is-year"><th scope="row">Cộng năm ${Math.ceil(x.m / 12)}</th><td>${fmt(yp)}</td><td>${fmt(yi)}</td><td>${fmt(yp + yi)}</td><td>${fmt(x.bal)}</td></tr>`);
        yp = 0;
        yi = 0;
      }
    });
    els.rows.innerHTML = out.join("");
  }

  function summaryText(s, o) {
    const lines = [
      `Vay ${fmtVnd(o.loan)} trong ${termLabel(o.months)}, ${METHODS[method].name.toLowerCase()}`,
      o.promo ? `Lãi suất ưu đãi ${fmtPct(o.promo.rate)}/năm trong ${o.promo.months} tháng đầu, sau đó ${fmtPct(o.rate)}/năm` : `Lãi suất ${fmtPct(o.rate)}/năm`
    ];
    if (method === "reducing") lines.push(`Tháng đầu trả: ${fmtVnd(s.first)}`, `Tháng cuối trả: ${fmtVnd(s.lastPay)}`);
    else if (o.promo && o.promo.months < o.months) lines.push(`Tháng 1–${o.promo.months}: ${fmtVnd(s.first)}/tháng`, `Từ tháng ${o.promo.months + 1}: ${fmtVnd(s.rows[o.promo.months].pay)}/tháng`);
    else lines.push(`Trả mỗi tháng: ${fmtVnd(s.first)}`);
    if (method === "flat") lines.push(`Lãi suất thực tương đương: ${fmtPct(s.equivalent)}/năm`);
    lines.push(`Tổng tiền lãi: ${fmtVnd(s.totalInterest)}`, `Tổng phải trả: ${fmtVnd(o.loan + s.totalInterest)}`);
    return lines.join("\n");
  }

  function run() {
    const o = readOpts();
    els.promoBox.hidden = !els.promo.checked || method === "flat";
    els.promoToggle.hidden = method === "flat";
    els.rateLabel.textContent = o.promo ? "Lãi suất sau ưu đãi (dự kiến)" : "Lãi suất";

    if (!o.loan || !o.rate) {
      last = null;
      els.copyBtn.disabled = true;
      setStatus(!o.loan ? "Nhập số tiền vay để tính." : "Nhập lãi suất %/năm, ví dụ 9,5.", "");
      return;
    }
    if (!o.months || o.months > 600) {
      setStatus("Thời hạn vay từ 1 tháng đến 50 năm.", "err");
      return;
    }
    if (o.rate > 100 || (o.promo && o.promo.rate > 100)) {
      setStatus("Lãi suất có vẻ quá cao. Nhập theo %/năm.", "err");
      return;
    }
    if (o.promo && !o.promo.rate) {
      setStatus("Nhập lãi suất ưu đãi, hoặc bỏ tick ô ưu đãi.", "err");
      return;
    }

    const all = {};
    Object.keys(METHODS).forEach((k) => {
      all[k] = schedule(o.loan, o.months, k, o.rate, o.promo);
    });
    const s = all[method];
    if (method === "flat") s.equivalent = flatEquivalentRate(o.loan, o.months, s.first);
    last = { s, o };
    render(s, o, all);
    els.copyBtn.disabled = false;

    if (o.promo && o.promo.months >= o.months) {
      setStatus("Thời gian ưu đãi dài bằng cả khoản vay — toàn bộ tính theo lãi ưu đãi.", "warn");
    } else if (method === "flat") {
      setStatus(`Lãi phẳng ${fmtPct(o.rate)}/năm tương đương khoảng ${fmtPct(s.equivalent)}/năm theo dư nợ giảm dần.`, "warn");
    } else if (method === "reducing") {
      setStatus(`Tháng đầu trả ${fmtVnd(s.first)}, giảm dần đến ${fmtVnd(s.lastPay)} ở tháng cuối.`, "ok");
    } else if (o.promo) {
      setStatus(`Trả ${fmtVnd(s.first)}/tháng trong ${o.promo.months} tháng đầu, sau đó ${fmtVnd(s.rows[o.promo.months].pay)}/tháng.`, "ok");
    } else {
      setStatus(`Mỗi tháng trả ${fmtVnd(s.first)}.`, "ok");
    }
    document.dispatchEvent(new CustomEvent("ot:result", {
      detail: { text: summaryText(s, o), title: "Tính lãi vay trả góp" }
    }));
  }

  function setMethod(next) {
    method = next;
    els.methodBtns.forEach((b) => {
      const on = b.dataset.lnMethod === next;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.methodHint.textContent = METHODS[next].hint;
    run();
  }

  els.methodBtns.forEach((b) => b.addEventListener("click", () => setMethod(b.dataset.lnMethod)));
  els.amount.addEventListener("input", () => {
    formatInput(els.amount);
    run();
  });
  [els.rate, els.promoRate, els.term].forEach((el) => el.addEventListener("input", run));
  [els.termUnit, els.promo, els.promoMonths].forEach((el) => el.addEventListener("change", run));
  els.presets.addEventListener("click", (e) => {
    const b = e.target.closest("[data-amount]");
    if (!b) return;
    els.amount.value = fmt(Number(b.dataset.amount));
    run();
  });
  els.copyBtn.addEventListener("click", async () => {
    if (!last) return;
    const text = summaryText(last.s, last.o);
    try {
      await (window.OT?.copyText ? OT.copyText(text) : navigator.clipboard.writeText(text));
      setStatus("Đã sao chép kết quả.", "ok");
    } catch (_) {
      setStatus("Không sao chép được.", "err");
    }
  });

  window.OTLoan = { schedule, annuityPayment, flatEquivalentRate };
  els.methodHint.textContent = METHODS[method].hint;
  run();
})();
