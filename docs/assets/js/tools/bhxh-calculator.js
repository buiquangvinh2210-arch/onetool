(function () {
  "use strict";

  const CUTOFF = 2014 * 12;
  const PRE_RATE = 1.5;
  const POST_RATE = 2;
  const UNDER_YEAR_RATE = 0.22;

  const $ = (id) => document.getElementById(id);
  const els = {
    modeBtns: document.querySelectorAll("[data-bh-mode]"),
    showBlocks: document.querySelectorAll("[data-bh-show]"),
    avg: $("bhAvg"),
    preY: $("bhPreY"),
    preM: $("bhPreM"),
    postY: $("bhPostY"),
    postM: $("bhPostM"),
    periods: $("bhPeriods"),
    addPeriod: $("bhAddPeriod"),
    status: $("status"),
    summary: $("bhSummary"),
    breakdown: $("bhBreakdown"),
    periodWrap: $("bhPeriodWrap"),
    periodRows: $("bhPeriodRows"),
    copyBtn: $("bhCopyBtn")
  };

  let mode = "quick";
  let last = null;

  function parseMoney(v) {
    const digits = String(v || "").replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  }

  function parseCoef(v) {
    const s = String(v || "").trim();
    if (!s) return 1;
    const n = parseFloat(s.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : NaN;
  }

  const toInt = (v) => Math.max(0, parseInt(v, 10) || 0);
  const fmt = (n) => Math.round(n).toLocaleString("vi-VN");
  const fmtVnd = (n) => fmt(n) + " đ";
  const fmtNum = (n) => n.toLocaleString("vi-VN", { maximumFractionDigits: 3 });

  function durLabel(months) {
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (!y) return m + " tháng";
    return y + " năm" + (m ? " " + m + " tháng" : "");
  }

  function formatMoneyInput(input) {
    const n = parseMoney(input.value);
    const pos = input.value.length - input.selectionStart;
    input.value = n ? fmt(n) : "";
    const caret = Math.max(0, input.value.length - pos);
    try {
      input.setSelectionRange(caret, caret);
    } catch (_) {}
  }

  function formatMonthInput(input) {
    const d = input.value.replace(/[^\d]/g, "").slice(0, 6);
    input.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  }

  function parseMonth(v) {
    const m = String(v || "").match(/^\s*(\d{1,2})\s*[\/\-.]\s*(\d{4})\s*$/);
    if (!m) return null;
    const mo = Number(m[1]);
    const y = Number(m[2]);
    if (mo < 1 || mo > 12 || y < 1960 || y > 2100) return null;
    return y * 12 + mo - 1;
  }

  function benefit(avg, pre, post) {
    const total = pre + post;
    if (total < 12) {
      const paid = UNDER_YEAR_RATE * avg * total;
      const cap = 2 * avg;
      return { total, under: true, paid, cap, amount: Math.min(paid, cap) };
    }
    const preYears = Math.floor(pre / 12);
    const carried = pre % 12;
    const postAll = post + carried;
    const rem = postAll % 12;
    const postYears = Math.floor(postAll / 12) + (rem === 0 ? 0 : rem <= 6 ? 0.5 : 1);
    const preAmount = PRE_RATE * avg * preYears;
    const postAmount = POST_RATE * avg * postYears;
    return { total, under: false, preYears, carried, postAll, rem, postYears, preAmount, postAmount, amount: preAmount + postAmount };
  }

  function periodTemplate(i) {
    return `<div class="fin-period" data-period>
      <span class="fin-period-head">Giai đoạn ${i}</span>
      <button type="button" class="fin-period-del" data-del aria-label="Xóa giai đoạn ${i}">×</button>
      <div><label>Từ tháng</label><input data-f="from" inputmode="numeric" autocomplete="off" placeholder="01/2015" /></div>
      <div><label>Đến tháng</label><input data-f="to" inputmode="numeric" autocomplete="off" placeholder="12/2020" /></div>
      <div><label>Lương đóng BHXH (đ/tháng)</label><input data-f="salary" inputmode="numeric" autocomplete="off" placeholder="6.000.000" /></div>
      <div><label>Hệ số trượt giá</label><input data-f="coef" inputmode="decimal" autocomplete="off" placeholder="1" /></div>
    </div>`;
  }

  function renumber() {
    els.periods.querySelectorAll("[data-period]").forEach((el, i) => {
      el.querySelector(".fin-period-head").textContent = "Giai đoạn " + (i + 1);
      el.querySelector("[data-del]").setAttribute("aria-label", "Xóa giai đoạn " + (i + 1));
      el.querySelector("[data-del]").hidden = els.periods.children.length === 1;
    });
  }

  function addPeriod() {
    els.periods.insertAdjacentHTML("beforeend", periodTemplate(els.periods.children.length + 1));
    renumber();
  }

  function readDetail() {
    const list = [];
    const blocks = [...els.periods.querySelectorAll("[data-period]")];
    for (let i = 0; i < blocks.length; i++) {
      const get = (f) => blocks[i].querySelector(`[data-f="${f}"]`).value;
      const raw = { from: get("from"), to: get("to"), salary: get("salary"), coef: get("coef") };
      if (!raw.from && !raw.to && !raw.salary && !raw.coef) continue;
      const from = parseMonth(raw.from);
      const to = parseMonth(raw.to);
      const salary = parseMoney(raw.salary);
      const coef = parseCoef(raw.coef);
      const n = i + 1;
      if (from === null) return { error: `Giai đoạn ${n}: nhập "Từ tháng" dạng MM/YYYY, ví dụ 01/2015.` };
      if (to === null) return { error: `Giai đoạn ${n}: nhập "Đến tháng" dạng MM/YYYY, ví dụ 12/2020.` };
      if (to < from) return { error: `Giai đoạn ${n}: tháng kết thúc đang trước tháng bắt đầu.` };
      if (!salary) return { error: `Giai đoạn ${n}: nhập mức lương đóng BHXH.` };
      if (Number.isNaN(coef)) return { error: `Giai đoạn ${n}: hệ số trượt giá không hợp lệ.` };
      const months = to - from + 1;
      const pre = Math.max(0, Math.min(to, CUTOFF - 1) - from + 1);
      list.push({ n, raw, months, pre, post: months - pre, salary, coef });
    }
    if (!list.length) return { empty: true };
    const pre = list.reduce((s, p) => s + p.pre, 0);
    const post = list.reduce((s, p) => s + p.post, 0);
    const weighted = list.reduce((s, p) => s + p.salary * p.coef * p.months, 0);
    return { list, pre, post, avg: weighted / (pre + post) };
  }

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.className = "sal-status" + (kind ? " is-" + kind : "");
  }

  const row = (label, value, cls) => `<tr${cls ? ` class="${cls}"` : ""}><th scope="row">${label}</th><td>${value}</td></tr>`;
  const stat = (label, value, net, text) => `<div class="sal-stat${net ? " sal-stat--net" : ""}${text ? " is-text" : ""}"><span>${label}</span><strong>${value}</strong></div>`;

  function yearsText(b) {
    if (b.under) return "Chưa đủ 1 năm";
    const parts = [];
    if (b.preYears) parts.push(fmtNum(b.preYears) + " năm trước 2014");
    if (b.postYears) parts.push(fmtNum(b.postYears) + " năm từ 2014");
    return parts.join(" + ") || "0 năm";
  }

  function render(b, avg, pre, post, detail) {
    els.summary.innerHTML =
      stat("Tổng thời gian đóng", durLabel(b.total), false, true) +
      stat("Lương bình quân", fmtVnd(avg)) +
      stat("Số năm tính hưởng", yearsText(b), false, true) +
      stat("Tiền BHXH một lần", fmtVnd(b.amount), true);

    const rows = [
      row("Thời gian đóng trước 2014", durLabel(pre)),
      row("Thời gian đóng từ 2014", durLabel(post)),
      row("Mức bình quân tiền lương (Mbq)", fmtVnd(avg), "is-sub")
    ];
    if (b.under) {
      rows.push(
        row(`Số tiền đã đóng: 22% × ${fmt(avg)} × ${b.total} tháng`, fmtVnd(b.paid)),
        row(`Mức tối đa: 2 × Mbq`, fmtVnd(b.cap)),
        row("Tiền BHXH một lần", fmtVnd(b.amount), "is-total")
      );
    } else {
      if (pre) {
        rows.push(row(`Trước 2014: tính ${b.preYears} năm${b.carried ? ` <small>(${b.carried} tháng lẻ chuyển sang giai đoạn từ 2014)</small>` : ""}`, ""));
      }
      const remNote = b.rem ? ` <small>(${b.rem} tháng lẻ ${b.rem <= 6 ? "tính nửa năm" : "tính tròn một năm"})</small>` : "";
      rows.push(row(`Từ 2014${b.carried ? ` (cộng ${b.carried} tháng chuyển sang)` : ""}: ${durLabel(b.postAll)} → tính ${fmtNum(b.postYears)} năm${remNote}`, ""));
      if (b.preYears) rows.push(row(`1,5 × ${fmt(avg)} × ${b.preYears} năm`, fmtVnd(b.preAmount)));
      if (b.postYears) rows.push(row(`2 × ${fmt(avg)} × ${fmtNum(b.postYears)} năm`, fmtVnd(b.postAmount)));
      rows.push(row("Tiền BHXH một lần", fmtVnd(b.amount), "is-total"));
    }
    els.breakdown.innerHTML = rows.join("");

    els.periodWrap.hidden = !detail;
    if (detail) {
      els.periodRows.innerHTML = detail.list
        .map((p) => `<tr><th scope="row">${p.raw.from} – ${p.raw.to}</th><td>${p.months}</td><td>${p.pre}</td><td>${p.post}</td><td>${fmt(p.salary * p.coef)}</td></tr>`)
        .join("");
    }
  }

  function summaryText(b, avg) {
    return [
      `Tổng thời gian đóng BHXH: ${durLabel(b.total)}`,
      `Lương bình quân: ${fmtVnd(avg)}`,
      `Số năm tính hưởng: ${yearsText(b)}`,
      `Tiền BHXH một lần (ước tính): ${fmtVnd(b.amount)}`
    ].join("\n");
  }

  function fail(msg, kind) {
    last = null;
    els.copyBtn.disabled = true;
    setStatus(msg, kind || "");
  }

  function run() {
    let avg;
    let pre;
    let post;
    let detail = null;
    if (mode === "quick") {
      avg = parseMoney(els.avg.value);
      pre = toInt(els.preY.value) * 12 + toInt(els.preM.value);
      post = toInt(els.postY.value) * 12 + toInt(els.postM.value);
      if (toInt(els.preM.value) > 11 || toInt(els.postM.value) > 11) return fail("Số tháng lẻ chỉ từ 0 đến 11.", "err");
      if (!avg) return fail("Nhập lương bình quân đóng BHXH.");
      if (!pre && !post) return fail("Nhập thời gian đã đóng BHXH.");
    } else {
      detail = readDetail();
      if (detail.error) return fail(detail.error, "err");
      if (detail.empty) return fail("Nhập ít nhất một giai đoạn đóng BHXH.");
      ({ avg, pre, post } = detail);
    }
    if (avg > 1e10) return fail("Mức lương quá lớn.", "err");

    const b = benefit(avg, pre, post);
    last = { b, avg };
    render(b, avg, pre, post, detail);
    els.copyBtn.disabled = false;
    setStatus(`Ước tính nhận khoảng ${fmtVnd(b.amount)}.`, "ok");
    document.dispatchEvent(new CustomEvent("ot:result", {
      detail: { text: summaryText(b, avg), title: "Tính BHXH một lần" }
    }));
  }

  function setMode(next) {
    mode = next;
    els.modeBtns.forEach((btn) => {
      const on = btn.dataset.bhMode === next;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.showBlocks.forEach((el) => {
      el.hidden = el.dataset.bhShow !== next;
    });
    run();
  }

  els.modeBtns.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.bhMode)));
  els.avg.addEventListener("input", () => {
    formatMoneyInput(els.avg);
    run();
  });
  [els.preY, els.preM, els.postY, els.postM].forEach((el) => el.addEventListener("input", run));
  els.periods.addEventListener("input", (e) => {
    const f = e.target.dataset.f;
    if (f === "from" || f === "to") formatMonthInput(e.target);
    if (f === "salary") formatMoneyInput(e.target);
    run();
  });
  els.periods.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (!del) return;
    del.closest("[data-period]").remove();
    renumber();
    run();
  });
  els.addPeriod.addEventListener("click", () => {
    addPeriod();
    els.periods.lastElementChild.querySelector("input").focus();
  });
  els.copyBtn.addEventListener("click", async () => {
    if (!last) return;
    const text = summaryText(last.b, last.avg);
    try {
      await (window.OT?.copyText ? OT.copyText(text) : navigator.clipboard.writeText(text));
      setStatus("Đã sao chép kết quả.", "ok");
    } catch (_) {
      setStatus("Không sao chép được.", "err");
    }
  });

  window.OTBhxh = { benefit };
  addPeriod();
  run();
})();
