(function () {
  "use strict";

  const PERIODS = {
    "2026h2": { label: "Từ 01/07/2026", baseSalary: 2530000 },
    "2026h1": { label: "01/01 – 30/06/2026", baseSalary: 2340000 }
  };
  const REGION_MIN = { 1: 5310000, 2: 4730000, 3: 4140000, 4: 3700000 };
  const SELF_DEDUCTION = 15500000;
  const DEPENDENT_DEDUCTION = 6200000;
  const EMPLOYEE_RATES = { bhxh: 0.08, bhyt: 0.015, bhtn: 0.01 };
  const EMPLOYER_RATES = { bhxh: 0.175, bhyt: 0.03, bhtn: 0.01 };
  const BRACKETS = [
    { upTo: 10000000, rate: 0.05 },
    { upTo: 30000000, rate: 0.1 },
    { upTo: 60000000, rate: 0.2 },
    { upTo: 100000000, rate: 0.3 },
    { upTo: Infinity, rate: 0.35 }
  ];

  const $ = (id) => document.getElementById(id);
  const els = {
    modeBtns: document.querySelectorAll("[data-sal-mode]"),
    amountLabel: $("salAmountLabel"),
    amount: $("salAmount"),
    presets: $("salPresets"),
    insFull: $("salInsFull"),
    insCustom: $("salInsCustom"),
    insAmount: $("salInsAmount"),
    deps: $("salDeps"),
    depMinus: $("salDepMinus"),
    depPlus: $("salDepPlus"),
    region: $("salRegion"),
    period: $("salPeriod"),
    status: $("status"),
    summary: $("salSummary"),
    breakdown: $("salBreakdown"),
    brackets: $("salBrackets"),
    employer: $("salEmployer"),
    copyBtn: $("salCopyBtn")
  };

  let mode = "gross";
  let last = null;

  function parseMoney(v) {
    const digits = String(v || "").replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  }

  function fmt(n) {
    return Math.round(n).toLocaleString("vi-VN");
  }

  function fmtVnd(n) {
    return fmt(n) + " đ";
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

  function progressiveTax(assessable) {
    let prev = 0;
    let total = 0;
    const rows = [];
    for (const b of BRACKETS) {
      const portion = Math.max(0, Math.min(assessable, b.upTo) - prev);
      const tax = portion * b.rate;
      rows.push({ from: prev, to: b.upTo, rate: b.rate, portion, tax });
      total += tax;
      prev = b.upTo;
      if (assessable <= b.upTo) break;
    }
    return { total, rows };
  }

  function grossToNet(gross, opts) {
    const period = PERIODS[opts.period];
    const capSocial = period.baseSalary * 20;
    const capUnemployment = REGION_MIN[opts.region] * 20;
    const insBase = opts.insCustom ? opts.insAmount : gross;
    const socialBase = Math.min(insBase, capSocial);
    const unemploymentBase = Math.min(insBase, capUnemployment);

    const bhxh = Math.round(socialBase * EMPLOYEE_RATES.bhxh);
    const bhyt = Math.round(socialBase * EMPLOYEE_RATES.bhyt);
    const bhtn = Math.round(unemploymentBase * EMPLOYEE_RATES.bhtn);
    const insurance = bhxh + bhyt + bhtn;

    const dependentDeduction = opts.deps * DEPENDENT_DEDUCTION;
    const beforeTax = gross - insurance;
    const assessable = Math.max(0, beforeTax - SELF_DEDUCTION - dependentDeduction);
    const tax = progressiveTax(assessable);
    const pit = Math.round(tax.total);

    const employer = {
      bhxh: Math.round(socialBase * EMPLOYER_RATES.bhxh),
      bhyt: Math.round(socialBase * EMPLOYER_RATES.bhyt),
      bhtn: Math.round(unemploymentBase * EMPLOYER_RATES.bhtn)
    };
    employer.total = employer.bhxh + employer.bhyt + employer.bhtn;

    return {
      gross,
      insBase,
      socialBase,
      unemploymentBase,
      capSocial,
      capUnemployment,
      bhxh,
      bhyt,
      bhtn,
      insurance,
      beforeTax,
      dependentDeduction,
      assessable,
      taxRows: tax.rows,
      pit,
      net: gross - insurance - pit,
      employer,
      cost: gross + employer.total
    };
  }

  function netToGross(net, opts) {
    let lo = net;
    let hi = net * 2 + 50000000;
    for (let i = 0; i < 80 && hi - lo > 0.5; i++) {
      const mid = (lo + hi) / 2;
      if (grossToNet(mid, opts).net < net) lo = mid;
      else hi = mid;
    }
    let gross = Math.ceil(hi);
    while (gross > net && grossToNet(gross - 1, opts).net >= net) gross--;
    return grossToNet(gross, opts);
  }

  function readOpts() {
    return {
      insCustom: els.insCustom.checked,
      insAmount: parseMoney(els.insAmount.value),
      deps: Math.max(0, Math.min(20, parseInt(els.deps.value, 10) || 0)),
      region: Number(els.region.value) || 1,
      period: els.period.value in PERIODS ? els.period.value : "2026h2"
    };
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.className = "sal-status" + (kind ? " is-" + kind : "");
  }

  function row(label, value, cls) {
    return `<tr${cls ? ` class="${cls}"` : ""}><th scope="row">${label}</th><td>${value}</td></tr>`;
  }

  function render(r, opts) {
    els.summary.innerHTML = `
      <div class="sal-stat"><span>Lương Gross</span><strong>${fmtVnd(r.gross)}</strong></div>
      <div class="sal-stat"><span>Bảo hiểm (NLĐ đóng)</span><strong>− ${fmtVnd(r.insurance)}</strong></div>
      <div class="sal-stat"><span>Thuế TNCN</span><strong>− ${fmtVnd(r.pit)}</strong></div>
      <div class="sal-stat sal-stat--net"><span>Lương Net thực nhận</span><strong>${fmtVnd(r.net)}</strong></div>`;

    const capNote = r.insBase > r.capSocial ? ` <small>(trần ${fmt(r.capSocial)})</small>` : "";
    const capUiNote = r.insBase > r.capUnemployment ? ` <small>(trần ${fmt(r.capUnemployment)})</small>` : "";
    els.breakdown.innerHTML = [
      row("Lương Gross", fmtVnd(r.gross)),
      row("Lương đóng bảo hiểm", fmtVnd(r.insBase)),
      row("BHXH (8%)" + capNote, "− " + fmtVnd(r.bhxh)),
      row("BHYT (1,5%)" + capNote, "− " + fmtVnd(r.bhyt)),
      row("BHTN (1%)" + capUiNote, "− " + fmtVnd(r.bhtn)),
      row("Thu nhập trước thuế", fmtVnd(r.beforeTax), "is-sub"),
      row("Giảm trừ bản thân", "− " + fmtVnd(SELF_DEDUCTION)),
      row(`Giảm trừ người phụ thuộc (${opts.deps} người)`, "− " + fmtVnd(r.dependentDeduction)),
      row("Thu nhập tính thuế", fmtVnd(r.assessable), "is-sub"),
      row("Thuế TNCN", "− " + fmtVnd(r.pit)),
      row("Lương Net", fmtVnd(r.net), "is-total")
    ].join("");

    els.brackets.innerHTML = r.assessable > 0
      ? r.taxRows
          .map((b, i) => {
            const range = b.to === Infinity ? `Trên ${fmt(b.from / 1e6)} triệu` : `${b.from ? fmt(b.from / 1e6) : "0"} – ${fmt(b.to / 1e6)} triệu`;
            return `<tr><th scope="row">Bậc ${i + 1}: ${range}</th><td>${Math.round(b.rate * 100)}%</td><td>${fmtVnd(b.portion)}</td><td>${fmtVnd(b.tax)}</td></tr>`;
          })
          .join("")
      : `<tr><td colspan="4" class="sal-muted">Thu nhập tính thuế bằng 0 — không phải nộp thuế TNCN.</td></tr>`;

    els.employer.innerHTML = [
      row("Lương Gross", fmtVnd(r.gross)),
      row("BHXH (17,5%)", "+ " + fmtVnd(r.employer.bhxh)),
      row("BHYT (3%)", "+ " + fmtVnd(r.employer.bhyt)),
      row("BHTN (1%)", "+ " + fmtVnd(r.employer.bhtn)),
      row("Tổng chi phí doanh nghiệp", fmtVnd(r.cost), "is-total")
    ].join("");
  }

  function summaryText(r, opts) {
    return [
      `Lương Gross: ${fmtVnd(r.gross)}`,
      `Bảo hiểm NLĐ đóng: ${fmtVnd(r.insurance)} (BHXH ${fmt(r.bhxh)} · BHYT ${fmt(r.bhyt)} · BHTN ${fmt(r.bhtn)})`,
      `Thuế TNCN: ${fmtVnd(r.pit)} (${opts.deps} người phụ thuộc)`,
      `Lương Net: ${fmtVnd(r.net)}`,
      `Chi phí doanh nghiệp: ${fmtVnd(r.cost)}`,
      `Áp dụng ${PERIODS[opts.period].label}, vùng ${opts.region}.`
    ].join("\n");
  }

  function run() {
    const opts = readOpts();
    els.insAmount.disabled = !opts.insCustom;
    const amount = parseMoney(els.amount.value);
    if (!amount) {
      last = null;
      els.copyBtn.disabled = true;
      setStatus(mode === "gross" ? "Nhập lương Gross để tính lương Net." : "Nhập lương Net mong muốn để tính lương Gross.", "");
      return;
    }
    if (amount > 10000000000) {
      setStatus("Số tiền quá lớn.", "err");
      return;
    }
    if (opts.insCustom && !opts.insAmount) {
      setStatus("Nhập mức lương đóng bảo hiểm, hoặc chọn đóng trên lương Gross.", "err");
      return;
    }

    const r = mode === "gross" ? grossToNet(amount, opts) : netToGross(amount, opts);
    last = { r, opts };
    render(r, opts);
    els.copyBtn.disabled = false;

    const floor = REGION_MIN[opts.region];
    if (r.insBase < floor) {
      setStatus(`Lưu ý: lương đóng bảo hiểm thấp hơn lương tối thiểu vùng ${opts.region} (${fmtVnd(floor)}) — mức sàn theo quy định.`, "warn");
    } else {
      setStatus(mode === "gross" ? `Lương Net thực nhận: ${fmtVnd(r.net)}.` : `Cần thỏa thuận lương Gross: ${fmtVnd(r.gross)}.`, "ok");
    }
    document.dispatchEvent(new CustomEvent("ot:result", {
      detail: { text: summaryText(r, opts), title: "Tính lương Gross ↔ Net 2026" }
    }));
  }

  function setMode(next) {
    mode = next;
    els.modeBtns.forEach((b) => {
      const on = b.dataset.salMode === next;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.amountLabel.textContent = next === "gross" ? "Lương Gross (trước thuế, bảo hiểm)" : "Lương Net mong muốn (thực nhận)";
    run();
  }

  els.modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.salMode)));
  [els.amount, els.insAmount].forEach((input) =>
    input.addEventListener("input", () => {
      formatInput(input);
      run();
    })
  );
  [els.insFull, els.insCustom, els.region, els.period].forEach((el) => el.addEventListener("change", run));
  els.deps.addEventListener("input", run);
  els.depMinus.addEventListener("click", () => {
    els.deps.value = Math.max(0, (parseInt(els.deps.value, 10) || 0) - 1);
    run();
  });
  els.depPlus.addEventListener("click", () => {
    els.deps.value = Math.min(20, (parseInt(els.deps.value, 10) || 0) + 1);
    run();
  });
  els.presets.addEventListener("click", (e) => {
    const b = e.target.closest("[data-amount]");
    if (!b) return;
    els.amount.value = fmt(Number(b.dataset.amount));
    run();
  });
  els.copyBtn.addEventListener("click", async () => {
    if (!last) return;
    try {
      await (window.OT?.copyText ? OT.copyText(summaryText(last.r, last.opts)) : navigator.clipboard.writeText(summaryText(last.r, last.opts)));
      setStatus("Đã sao chép bảng tóm tắt.", "ok");
    } catch (_) {
      setStatus("Không sao chép được.", "err");
    }
  });

  window.OTSalary = { grossToNet, netToGross };
  run();
})();
