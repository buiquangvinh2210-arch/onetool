(function () {
  "use strict";

  const PAYOUT_LABEL = { end: "Lĩnh lãi cuối kỳ", monthly: "Lĩnh lãi hàng tháng", roll: "Tái tục gốc và lãi" };

  const $ = (id) => document.getElementById(id);
  const els = {
    modeBtns: document.querySelectorAll("[data-sv-mode]"),
    showBlocks: document.querySelectorAll("[data-sv-show]"),
    amountLabel: $("svAmountLabel"),
    amount: $("svAmount"),
    presets: $("svPresets"),
    rate: $("svRate"),
    term: $("svTerm"),
    payouts: document.querySelectorAll('input[name="svPayout"]'),
    rollBox: $("svRollBox"),
    years: $("svYears"),
    months: $("svMonths"),
    status: $("status"),
    summary: $("svSummary"),
    bar: $("svBar"),
    breakdown: $("svBreakdown"),
    scheduleTitle: $("svScheduleTitle"),
    head: $("svHead"),
    rows: $("svRows"),
    copyBtn: $("svCopyBtn")
  };

  let mode = "once";
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

  function monthsLabel(m) {
    if (m % 12 === 0) return m / 12 + " năm";
    return m + " tháng";
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

  function calcOnce(principal, rate, term, payout, totalMonths) {
    const r = rate / 100;
    if (payout === "monthly") {
      const perMonth = (principal * r) / 12;
      const rows = [];
      for (let m = 1; m <= term; m++) rows.push({ label: "Tháng " + m, a: perMonth, b: perMonth * m });
      return { principal, interest: perMonth * term, months: term, perMonth, rows };
    }
    if (payout === "roll") {
      const n = Math.max(1, Math.floor(totalMonths / term));
      const rows = [];
      let bal = principal;
      for (let i = 0; i < n; i++) {
        const it = (bal * r * term) / 12;
        const from = i * term + 1;
        const to = (i + 1) * term;
        rows.push({ label: "Kỳ " + (i + 1) + (term > 1 ? ` <small>(tháng ${from}–${to})</small>` : ` <small>(tháng ${to})</small>`), a: bal, b: it, c: bal + it });
        bal += it;
      }
      const months = n * term;
      return { principal, interest: bal - principal, months, terms: n, effective: Math.pow(bal / principal, 12 / months) - 1, rows };
    }
    const interest = (principal * r * term) / 12;
    return { principal, interest, months: term, perMonth: interest / term, rows: [{ label: "Đáo hạn <small>(tháng " + term + ")</small>", a: principal, b: interest, c: principal + interest }] };
  }

  function calcMonthly(deposit, rate, months) {
    const i = rate / 100 / 12;
    const rows = [];
    let bal = 0;
    for (let m = 1; m <= months; m++) {
      bal = (bal + deposit) * (1 + i);
      if (m % 12 === 0 || m === months) {
        const label = months <= 12 ? "Tháng " + m : m % 12 === 0 ? "Năm " + m / 12 : "Tháng " + m;
        rows.push({ label, a: deposit * m, b: bal - deposit * m, c: bal });
      }
    }
    return { principal: deposit * months, interest: bal - deposit * months, months, deposit, rows };
  }

  function readOpts() {
    const payout = [...els.payouts].find((p) => p.checked)?.value || "end";
    return {
      amount: parseMoney(els.amount.value),
      rate: parseRate(els.rate.value),
      term: Number(els.term.value) || 12,
      payout,
      totalMonths: Number(els.years.value) || 36,
      months: Number(els.months.value) || 60
    };
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.className = "sal-status" + (kind ? " is-" + kind : "");
  }

  const row = (label, value, cls) => `<tr${cls ? ` class="${cls}"` : ""}><th scope="row">${label}</th><td>${value}</td></tr>`;
  const stat = (label, value, net) => `<div class="sal-stat${net ? " sal-stat--net" : ""}"><span>${label}</span><strong>${value}</strong></div>`;

  function render(r, o) {
    const total = r.principal + r.interest;
    let stats;
    let breakdown;
    let head;
    let rows;
    let title;

    if (mode === "monthly") {
      stats = [stat("Gửi mỗi tháng", fmtVnd(r.deposit)), stat("Tổng tiền đã gửi", fmtVnd(r.principal)), stat("Tiền lãi", "+ " + fmtVnd(r.interest)), stat("Số dư sau " + monthsLabel(r.months), fmtVnd(total), true)];
      breakdown = [
        row("Gửi mỗi tháng", fmtVnd(r.deposit)),
        row("Số tháng gửi", r.months + " tháng"),
        row("Lãi suất", fmtPct(o.rate) + "/năm <small>(" + fmtPct(o.rate / 12) + "/tháng)</small>"),
        row("Tổng tiền đã gửi", fmtVnd(r.principal), "is-sub"),
        row("Tiền lãi cộng dồn", "+ " + fmtVnd(r.interest)),
        row("Số dư cuối cùng", fmtVnd(total), "is-total")
      ];
      title = "Số dư theo thời gian";
      head = '<tr><th scope="col">Thời điểm</th><th scope="col">Đã gửi</th><th scope="col">Lãi cộng dồn</th><th scope="col">Số dư</th></tr>';
      rows = r.rows.map((x) => `<tr><th scope="row">${x.label}</th><td>${fmtVnd(x.a)}</td><td>${fmtVnd(x.b)}</td><td>${fmtVnd(x.c)}</td></tr>`);
    } else if (o.payout === "monthly") {
      stats = [stat("Tiền gửi", fmtVnd(r.principal)), stat("Lãi mỗi tháng", "+ " + fmtVnd(r.perMonth)), stat("Tổng lãi " + r.months + " tháng", "+ " + fmtVnd(r.interest)), stat("Tổng nhận (gốc + lãi)", fmtVnd(total), true)];
      breakdown = [
        row("Tiền gửi", fmtVnd(r.principal)),
        row("Lãi suất", fmtPct(o.rate) + "/năm"),
        row(`Lãi mỗi tháng <small>(${fmt(r.principal)} × ${fmtPct(o.rate)} ÷ 12)</small>`, fmtVnd(r.perMonth)),
        row("Tổng lãi " + r.months + " tháng", "+ " + fmtVnd(r.interest), "is-sub"),
        row("Tổng nhận", fmtVnd(total), "is-total")
      ];
      title = "Lịch nhận lãi hàng tháng";
      head = '<tr><th scope="col">Tháng</th><th scope="col">Lãi nhận</th><th scope="col">Lãi cộng dồn</th></tr>';
      rows = r.rows.map((x) => `<tr><th scope="row">${x.label}</th><td>${fmtVnd(x.a)}</td><td>${fmtVnd(x.b)}</td></tr>`);
    } else if (o.payout === "roll") {
      stats = [stat("Tiền gửi ban đầu", fmtVnd(r.principal)), stat("Tổng lãi " + r.terms + " kỳ", "+ " + fmtVnd(r.interest)), stat("Lãi suất thực tế/năm", fmtPct(r.effective * 100)), stat("Tổng nhận sau " + monthsLabel(r.months), fmtVnd(total), true)];
      breakdown = [
        row("Tiền gửi ban đầu", fmtVnd(r.principal)),
        row("Kỳ hạn", o.term + " tháng × " + r.terms + " kỳ"),
        row("Lãi suất", fmtPct(o.rate) + "/năm"),
        row("Tổng lãi", "+ " + fmtVnd(r.interest), "is-sub"),
        row("Tổng nhận", fmtVnd(total), "is-total")
      ];
      title = "Lãi từng kỳ khi tái tục";
      head = '<tr><th scope="col">Kỳ</th><th scope="col">Gốc đầu kỳ</th><th scope="col">Lãi kỳ này</th><th scope="col">Gốc cuối kỳ</th></tr>';
      rows = r.rows.map((x) => `<tr><th scope="row">${x.label}</th><td>${fmtVnd(x.a)}</td><td>${fmtVnd(x.b)}</td><td>${fmtVnd(x.c)}</td></tr>`);
    } else {
      stats = [stat("Tiền gửi", fmtVnd(r.principal)), stat("Tiền lãi", "+ " + fmtVnd(r.interest)), stat("Lãi bình quân mỗi tháng", fmtVnd(r.perMonth)), stat("Tổng nhận khi đáo hạn", fmtVnd(total), true)];
      breakdown = [
        row("Tiền gửi", fmtVnd(r.principal)),
        row("Kỳ hạn", o.term + " tháng"),
        row(`Tiền lãi <small>(${fmt(r.principal)} × ${fmtPct(o.rate)} × ${o.term} ÷ 12)</small>`, "+ " + fmtVnd(r.interest)),
        row("Tổng nhận", fmtVnd(total), "is-total")
      ];
      title = "Khi đáo hạn";
      head = '<tr><th scope="col">Thời điểm</th><th scope="col">Tiền gốc</th><th scope="col">Tiền lãi</th><th scope="col">Tổng nhận</th></tr>';
      rows = r.rows.map((x) => `<tr><th scope="row">${x.label}</th><td>${fmtVnd(x.a)}</td><td>${fmtVnd(x.b)}</td><td>${fmtVnd(x.c)}</td></tr>`);
    }

    els.summary.innerHTML = stats.join("");
    els.breakdown.innerHTML = breakdown.join("");
    els.scheduleTitle.textContent = title;
    els.head.innerHTML = head;
    els.rows.innerHTML = rows.join("");
    const share = total > 0 ? (r.principal / total) * 100 : 100;
    els.bar.innerHTML = `<i style="width:${share.toFixed(2)}%"></i><i style="width:${(100 - share).toFixed(2)}%"></i>`;
  }

  function summaryText(r, o) {
    const total = r.principal + r.interest;
    if (mode === "monthly") {
      return [
        `Tích lũy ${fmtVnd(r.deposit)}/tháng trong ${monthsLabel(r.months)}, lãi suất ${fmtPct(o.rate)}/năm`,
        `Tổng tiền đã gửi: ${fmtVnd(r.principal)}`,
        `Tiền lãi: ${fmtVnd(r.interest)}`,
        `Số dư cuối: ${fmtVnd(total)}`
      ].join("\n");
    }
    const lines = [`Gửi ${fmtVnd(r.principal)}, lãi suất ${fmtPct(o.rate)}/năm, kỳ hạn ${o.term} tháng (${PAYOUT_LABEL[o.payout].toLowerCase()})`];
    if (o.payout === "monthly") lines.push(`Lãi mỗi tháng: ${fmtVnd(r.perMonth)}`);
    if (o.payout === "roll") lines.push(`Tái tục ${r.terms} kỳ (${monthsLabel(r.months)})`);
    lines.push(`Tiền lãi: ${fmtVnd(r.interest)}`, `Tổng nhận: ${fmtVnd(total)}`);
    return lines.join("\n");
  }

  function run() {
    const o = readOpts();
    els.rollBox.hidden = o.payout !== "roll";
    if (!o.amount || !o.rate) {
      last = null;
      els.copyBtn.disabled = true;
      setStatus(!o.amount ? (mode === "monthly" ? "Nhập số tiền gửi mỗi tháng." : "Nhập số tiền gửi để tính tiền lãi.") : "Nhập lãi suất %/năm, ví dụ 5,5.", "");
      return;
    }
    if (o.amount > 1e13) {
      setStatus("Số tiền quá lớn.", "err");
      return;
    }
    if (o.rate > 30) {
      setStatus("Lãi suất có vẻ quá cao. Nhập theo %/năm, ví dụ 5,5.", "err");
      return;
    }

    const r = mode === "monthly" ? calcMonthly(o.amount, o.rate, o.months) : calcOnce(o.amount, o.rate, o.term, o.payout, o.totalMonths);
    last = { r, o };
    render(r, o);
    els.copyBtn.disabled = false;

    const total = r.principal + r.interest;
    if (mode === "once" && o.payout === "roll" && o.totalMonths % o.term) {
      setStatus(`Tính ${r.terms} kỳ trọn vẹn (${monthsLabel(r.months)}) vì ${monthsLabel(o.totalMonths)} không chia hết cho kỳ hạn ${o.term} tháng.`, "warn");
    } else if (mode === "once" && o.payout === "monthly") {
      setStatus(`Mỗi tháng nhận ${fmtVnd(r.perMonth)} tiền lãi.`, "ok");
    } else {
      setStatus(`Sau ${monthsLabel(r.months)} bạn có ${fmtVnd(total)}, trong đó lãi ${fmtVnd(r.interest)}.`, "ok");
    }
    document.dispatchEvent(new CustomEvent("ot:result", {
      detail: { text: summaryText(r, o), title: "Tính lãi tiết kiệm ngân hàng" }
    }));
  }

  function setMode(next) {
    mode = next;
    els.modeBtns.forEach((b) => {
      const on = b.dataset.svMode === next;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.showBlocks.forEach((el) => {
      el.hidden = el.dataset.svShow !== next;
    });
    els.amountLabel.textContent = next === "monthly" ? "Số tiền gửi mỗi tháng" : "Số tiền gửi";
    els.amount.placeholder = next === "monthly" ? "Ví dụ: 2.000.000" : "Ví dụ: 100.000.000";
    els.presets.querySelectorAll("[data-amount]").forEach((b) => {
      const v = Number(next === "monthly" ? b.dataset.monthly : b.dataset.amount);
      b.textContent = v >= 1e9 ? fmt(v / 1e9) + " tỷ" : fmt(v / 1e6) + " triệu";
    });
    run();
  }

  els.modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.svMode)));
  els.amount.addEventListener("input", () => {
    formatInput(els.amount);
    run();
  });
  els.rate.addEventListener("input", run);
  [els.term, els.years, els.months, ...els.payouts].forEach((el) => el.addEventListener("change", run));
  els.presets.addEventListener("click", (e) => {
    const b = e.target.closest("[data-amount]");
    if (!b) return;
    els.amount.value = fmt(Number(mode === "monthly" ? b.dataset.monthly : b.dataset.amount));
    run();
  });
  els.copyBtn.addEventListener("click", async () => {
    if (!last) return;
    const text = summaryText(last.r, last.o);
    try {
      await (window.OT?.copyText ? OT.copyText(text) : navigator.clipboard.writeText(text));
      setStatus("Đã sao chép kết quả.", "ok");
    } catch (_) {
      setStatus("Không sao chép được.", "err");
    }
  });

  window.OTSavings = { calcOnce, calcMonthly };
  run();
})();
