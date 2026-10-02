/**
 * Trang Lịch âm: banner hôm nay + đếm ngược Tết, lịch tháng (ngày âm, hoàng đạo, ngày lễ),
 * tờ lịch chi tiết, ngày giỗ của tôi (localStorage) và đổi ngày Dương ↔ Âm.
 */
(function () {
  "use strict";

  const L = window.OTLunar;
  if (!L) return;

  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const track = (name, params) => window.OTEngage?.track?.(name, params);

  const SOLAR_EVENTS = {
    "1-1": { name: "Tết Dương lịch", off: true },
    "3-2": { name: "Thành lập Đảng Cộng sản Việt Nam" },
    "14-2": { name: "Lễ tình nhân (Valentine)" },
    "8-3": { name: "Quốc tế Phụ nữ" },
    "30-4": { name: "Ngày Giải phóng miền Nam", off: true },
    "1-5": { name: "Quốc tế Lao động", off: true },
    "1-6": { name: "Quốc tế Thiếu nhi" },
    "27-7": { name: "Ngày Thương binh Liệt sĩ" },
    "2-9": { name: "Quốc khánh", off: true },
    "20-10": { name: "Ngày Phụ nữ Việt Nam" },
    "20-11": { name: "Ngày Nhà giáo Việt Nam" },
    "22-12": { name: "Thành lập Quân đội Nhân dân" },
    "24-12": { name: "Đêm Giáng sinh" },
    "25-12": { name: "Lễ Giáng sinh" }
  };

  const LUNAR_EVENTS = {
    "1-1": { name: "Tết Nguyên Đán", off: true },
    "2-1": { name: "Mùng 2 Tết", off: true },
    "3-1": { name: "Mùng 3 Tết", off: true },
    "15-1": { name: "Rằm tháng Giêng" },
    "3-3": { name: "Tết Hàn thực" },
    "10-3": { name: "Giỗ Tổ Hùng Vương", off: true },
    "15-4": { name: "Lễ Phật Đản" },
    "5-5": { name: "Tết Đoan Ngọ" },
    "15-7": { name: "Lễ Vu Lan" },
    "15-8": { name: "Tết Trung thu" },
    "23-12": { name: "Ông Công ông Táo" }
  };

  const CHI_ICON = ["🐭", "🐮", "🐯", "🐱", "🐲", "🐍", "🐴", "🐐", "🐵", "🐔", "🐶", "🐷"];

  const F = window.OTFortune;
  const STORE_KEY = "ot-lunar-mine";
  const BIRTH_KEY = "ot-lunar-birth";
  const QUE_KEY = "ot-lunar-que";
  const VK_KEY = "ot-lunar-vk";
  let mine = loadMine();
  let birthYear = parseInt(readStore(BIRTH_KEY), 10) || null;
  let pickAct = null;

  function readStore(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {}
  }

  function loadMine() {
    try {
      const list = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      return Array.isArray(list) ? list.filter((e) => e && e.name && e.d && e.m) : [];
    } catch (_) {
      return [];
    }
  }

  function saveMine() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(mine));
    } catch (_) {}
  }

  function dateParts(date) {
    return { d: date.getDate(), m: date.getMonth() + 1, y: date.getFullYear() };
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  function jdOf(date) {
    return L.jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
  }

  function lunarOf(date) {
    return L.solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear(), 7);
  }

  function dayInfo(date) {
    const { d, m, y } = dateParts(date);
    const jd = L.jdFromDate(d, m, y);
    const lunar = L.solarToLunar(d, m, y, 7);
    const events = [];
    const se = SOLAR_EVENTS[d + "-" + m];
    if (se) events.push(se);
    let lastOfMonth = null;
    const isLastOfMonth = () => {
      if (lastOfMonth === null) lastOfMonth = lunarOf(addDays(date, 1)).day === 1;
      return lastOfMonth;
    };
    if (!lunar.leap) {
      const le = LUNAR_EVENTS[lunar.day + "-" + lunar.month];
      if (le) events.push(le);
      if (lunar.month === 12 && lunar.day >= 29 && isLastOfMonth()) events.push({ name: "Giao thừa" });
    }
    mine.forEach((e) => {
      const hit =
        e.cal === "solar"
          ? e.d === d && e.m === m
          : !lunar.leap && e.m === lunar.month && (e.d === lunar.day || (e.d === 30 && lunar.day === 29 && isLastOfMonth()));
      if (hit) events.push({ name: e.name, mine: true });
    });
    const guide = L.dayGuide(jd, lunar.month);
    return { date, d, m, y, jd, lunar, events, guide };
  }

  function lunarShort(lunar) {
    return lunar.day + "/" + lunar.month + (lunar.leap ? "N" : "");
  }

  function lunarMonthName(lunar) {
    return (lunar.leap ? "Tháng nhuận " : "Tháng ") + L.MONTH_VI[lunar.month];
  }

  const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const fmtDate = (date) => pad(date.getDate()) + "/" + pad(date.getMonth() + 1) + "/" + date.getFullYear();
  const wdShort = (date) => (date.getDay() === 0 ? "CN" : "T" + (date.getDay() + 1));

  const today = new Date();
  const todayJd = jdOf(today);
  const todayLunar = lunarOf(today);
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth() + 1;
  let selected = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  function daysLabel(n) {
    if (n === 0) return "hôm nay";
    if (n === 1) return "ngày mai";
    return "còn " + n + " ngày";
  }

  function nextMine(e, fromJd) {
    for (let k = 0; k < 4; k++) {
      let date = null;
      if (e.cal === "solar") {
        const y = today.getFullYear() + k;
        const c = new Date(y, e.m - 1, e.d);
        if (c.getMonth() === e.m - 1) date = c;
      } else {
        const ly = todayLunar.year - 1 + k;
        let s = L.lunarToSolar(e.d, e.m, ly, false, 7);
        if (s) {
          const back = L.solarToLunar(s.day, s.month, s.year, 7);
          if (back.day !== e.d || back.month !== e.m || back.leap) s = e.d === 30 ? L.lunarToSolar(29, e.m, ly, false, 7) : null;
        }
        if (s) date = new Date(s.year, s.month - 1, s.day);
      }
      if (date && jdOf(date) >= fromJd) return { date, jd: jdOf(date) };
    }
    return null;
  }

  function upcoming(limit, horizon) {
    const items = [];
    for (let i = 0; i <= horizon && items.length < limit + 4; i++) {
      const info = dayInfo(addDays(today, i));
      info.events.filter((e) => !e.mine).forEach((e) => items.push({ name: e.name, off: e.off, date: info.date, days: i }));
    }
    mine.forEach((e) => {
      const n = nextMine(e, todayJd);
      if (n && n.jd - todayJd <= horizon) items.push({ name: e.name, mine: true, date: n.date, days: n.jd - todayJd });
    });
    return items.sort((a, b) => a.days - b.days).slice(0, limit);
  }

  function nextTet() {
    const startedThisYear = todayLunar.month === 1 && !todayLunar.leap && todayLunar.day <= 3;
    const year = startedThisYear ? todayLunar.year : todayLunar.year + 1;
    const s = L.lunarToSolar(1, 1, year, false, 7);
    return { year, date: new Date(s.year, s.month - 1, s.day), started: startedThisYear };
  }

  /* ── Banner hôm nay ── */
  let countdownTimer = 0;

  function renderHero() {
    const info = dayInfo(today);
    const full = L.convertSolarToLunar(info.d, info.m, info.y);
    const moon = L.moonPhase(info.lunar.day);
    const term = L.solarTerm(info.jd);
    const tet = nextTet();
    const soon = upcoming(3, 120);
    const yearChi = (info.lunar.year + 8) % 12;

    $("lnHero").innerHTML = `
      <div class="ln-hero-medal" aria-hidden="true">
        <span class="ln-hero-moon">${moon.icon}</span>
        <strong>${info.lunar.day}</strong>
        <em>${esc(lowerFirst(lunarMonthName(info.lunar)))}</em>
      </div>
      <div class="ln-hero-text">
        <span class="ln-hero-kicker">Hôm nay · ${esc(full.weekday)}, ${fmtDate(today)}</span>
        <h2 class="ln-hero-title">Ngày ${info.lunar.day} ${esc(lowerFirst(lunarMonthName(info.lunar)))} năm ${esc(full.yearCanChi)} <span aria-hidden="true">${CHI_ICON[yearChi]}</span></h2>
        <div class="ln-hero-chips">
          <span>Ngày ${esc(full.dayCanChi)}</span>
          <span class="${info.guide.good ? "is-good" : "is-bad"}">${info.guide.good ? "✦ Hoàng đạo" : "Hắc đạo"} · ${esc(info.guide.god)}</span>
          <span>Tiết ${esc(term)}</span>
          <span>${moon.icon} ${esc(moon.name)}</span>
          ${heroTuoiChip(info)}
        </div>
      </div>
      <div class="ln-hero-count">
        <span class="ln-count-label">🧧 ${tet.started ? "Chúc mừng năm mới" : "Đếm ngược Tết"} ${esc(L.yearCanChi(tet.year))}</span>
        <span class="ln-count-date">${esc(L.WEEKDAYS[tet.date.getDay()])}, ${fmtDate(tet.date)}</span>
        <div class="ln-count-boxes" id="tetCount" aria-live="off">
          <div><b data-u="d">0</b><span>ngày</span></div>
          <div><b data-u="h">00</b><span>giờ</span></div>
          <div><b data-u="m">00</b><span>phút</span></div>
          <div><b data-u="s">00</b><span>giây</span></div>
        </div>
        ${
          soon.length
            ? `<div class="ln-hero-soon"><b>Sắp tới</b>${soon
                .map(
                  (e) =>
                    `<button type="button" data-date="${e.date.getFullYear()}-${e.date.getMonth() + 1}-${e.date.getDate()}" class="${e.mine ? "is-mine" : ""}"><span>${e.mine ? "⭐ " : ""}${pad(e.date.getDate())}/${pad(e.date.getMonth() + 1)} · ${esc(e.name)}</span><small>${daysLabel(e.days)}</small></button>`
                )
                .join("")}</div>`
            : ""
        }
      </div>`;

    const boxes = {};
    $("tetCount").querySelectorAll("b[data-u]").forEach((b) => (boxes[b.dataset.u] = b));
    const tick = () => {
      const ms = Math.max(0, tet.date.getTime() - Date.now());
      const s = Math.floor(ms / 1000);
      boxes.d.textContent = String(Math.floor(s / 86400));
      boxes.h.textContent = pad(Math.floor((s % 86400) / 3600));
      boxes.m.textContent = pad(Math.floor((s % 3600) / 60));
      boxes.s.textContent = pad(s % 60);
    };
    tick();
    clearInterval(countdownTimer);
    countdownTimer = setInterval(tick, 1000);
  }

  function heroTuoiChip(info) {
    if (!F) return "";
    if (!birthYear) return '<button type="button" class="ln-hero-cta" data-go="tuoi">🔮 Xem vận may tuổi bạn →</button>';
    const t = F.tuoiDay(birthYear, info.jd, info.lunar.month);
    return `<button type="button" class="ln-hero-cta" data-go="tuoi">🔮 Tuổi ${esc(t.chiName)}: ${starText(t.stars)} ${esc(t.label)}</button>`;
  }

  const starText = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  $("lnHero").addEventListener("click", (e) => {
    if (e.target.closest("[data-go='tuoi']")) {
      setView("tuoi");
      $("tabTuoi").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const b = e.target.closest("button[data-date]");
    if (!b) return;
    setView("calendar");
    selectDate(parseDateAttr(b.dataset.date));
    $("dayPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  /* ── Lịch tháng ── */
  const grid = $("calGrid");
  const monthSel = $("calMonth");
  const yearInput = $("calYear");
  for (let i = 1; i <= 12; i++) monthSel.add(new Option("Tháng " + i, String(i)));

  function renderCalendar(dir) {
    monthSel.value = String(viewMonth);
    yearInput.value = String(viewYear);

    const first = new Date(viewYear, viewMonth - 1, 1);
    const dim = new Date(viewYear, viewMonth, 0).getDate();
    const offset = (first.getDay() + 6) % 7;
    const total = Math.ceil((offset + dim) / 7) * 7;
    const selJd = jdOf(selected);

    const cells = [];
    for (let i = 0; i < total; i++) {
      const info = dayInfo(addDays(first, i - offset));
      const cls = ["ln-cell"];
      if (info.m !== viewMonth) cls.push("is-out");
      if (info.jd === todayJd) cls.push("is-today");
      if (info.jd === selJd) cls.push("is-sel");
      if (info.date.getDay() === 0) cls.push("is-sun");
      if (info.lunar.day === 1 || info.lunar.day === 15) cls.push("is-moon");
      if (info.events.length) cls.push("has-event");
      if (info.events.some((e) => e.off)) cls.push("is-off");
      if (info.events.some((e) => e.mine)) cls.push("is-mine");
      if (pickAct && info.m === viewMonth) cls.push(F.fitsActivity(info.jd, info.lunar, pickAct, birthChi()) ? "is-pick" : "is-dim");
      const moonIcon = info.lunar.day === 1 ? "🌑" : info.lunar.day === 15 ? "🌕" : "";
      const lunarText = info.lunar.day === 1 ? lunarShort(info.lunar) : String(info.lunar.day);
      const ev = info.events.find((e) => e.mine) || info.events[0];
      const label =
        L.weekdayName(info.jd) + " " + info.d + "/" + info.m + "/" + info.y +
        ", âm lịch " + lunarShort(info.lunar) +
        (info.guide.good ? ", ngày hoàng đạo" : "") +
        (info.events.length ? ", " + info.events.map((e) => e.name).join(", ") : "");
      cells.push(
        `<button type="button" class="${cls.join(" ")}" data-date="${info.y}-${info.m}-${info.d}" aria-label="${esc(label)}" title="${esc(label)}">
          <span class="c-solar">${info.d}</span>
          ${info.guide.good ? '<i class="c-good" aria-hidden="true"></i>' : ""}
          <span class="c-lunar">${moonIcon ? `<i aria-hidden="true">${moonIcon}</i>` : ""}${lunarText}</span>
          ${ev ? `<span class="c-event">${esc(ev.name)}</span>` : ""}
        </button>`
      );
    }
    grid.innerHTML = cells.join("");
    if (dir) {
      grid.classList.remove("is-swap-next", "is-swap-prev");
      void grid.offsetWidth;
      grid.classList.add(dir > 0 ? "is-swap-next" : "is-swap-prev");
    }

    const a = L.solarToLunar(1, viewMonth, viewYear, 7);
    const b = L.solarToLunar(dim, viewMonth, viewYear, 7);
    const range =
      a.year === b.year
        ? (a.month === b.month && a.leap === b.leap ? lunarMonthName(a) : lunarMonthName(a) + " – " + lowerFirst(lunarMonthName(b))) +
          " năm " + L.yearCanChi(a.year)
        : lunarMonthName(a) + " năm " + L.yearCanChi(a.year) + " – " + lowerFirst(lunarMonthName(b)) + " năm " + L.yearCanChi(b.year);
    $("calLunarRange").textContent = "Âm lịch: " + range;

    renderEvents(first, dim);
    renderPick(first, dim);
  }

  const birthChi = () => (birthYear ? (birthYear + 8) % 12 : null);

  function renderPickBar() {
    if (!F) return;
    $("pickBar").innerHTML =
      '<span class="ln-pick-label">✨ Tìm ngày tốt:</span>' +
      F.ACTIVITIES.map(
        (a) => `<button type="button" data-act="${a.id}" class="${pickAct === a.id ? "is-on" : ""}" aria-pressed="${pickAct === a.id}">${a.icon} ${esc(a.name)}</button>`
      ).join("");
  }

  function renderPick(first, dim) {
    const card = $("pickCard");
    if (!F || !pickAct) {
      card.hidden = true;
      return;
    }
    const act = F.ACTIVITIES.find((a) => a.id === pickAct);
    const items = [];
    for (let i = 0; i < dim; i++) {
      const info = dayInfo(addDays(first, i));
      const fit = F.fitsActivity(info.jd, info.lunar, pickAct, birthChi());
      if (!fit) continue;
      const diff = info.jd - todayJd;
      items.push(
        `<li><button type="button" data-date="${info.y}-${info.m}-${info.d}" class="${diff < 0 ? "is-past" : ""}">
          <span class="ln-ev-date"><b>${pad(info.d)}</b><small>${wdShort(info.date)}</small></span>
          <span class="ln-ev-body">
            <span class="ln-ev-name">${esc(L.weekdayName(info.jd))}, ${fmtDate(info.date)}</span>
            <span class="ln-ev-lunar">${lunarShort(info.lunar)} âm lịch · Trực ${esc(fit.truc)} · ${esc(fit.god)}</span>
          </span>
          <span class="ln-ev-good">${diff >= 0 ? daysLabel(diff) : "đã qua"}</span>
        </button></li>`
      );
    }
    $("pickTitle").textContent = act.icon + " Ngày tốt để " + act.name.toLowerCase() + " — tháng " + viewMonth + "/" + viewYear;
    $("pickNote").textContent =
      "Đã lọc: ngày hoàng đạo, trực hợp việc, tránh Tam nương & Nguyệt kỵ" +
      (birthYear ? ", không xung tuổi " + L.CHI[birthChi()] + " của bạn." : ". Nhập năm sinh ở tab Xem tuổi để lọc thêm ngày hợp tuổi.");
    $("pickList").innerHTML = items.length
      ? items.join("")
      : '<li class="ln-ev-empty">Tháng này không có ngày thật đẹp cho việc này — thử xem tháng sau.</li>';
    card.hidden = false;
  }

  $("pickBar").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    pickAct = pickAct === b.dataset.act ? null : b.dataset.act;
    renderPickBar();
    renderCalendar();
    if (pickAct) track("lunar_pick", { act: pickAct });
  });
  const syncPickEnd = () => {
    const bar = $("pickBar");
    bar.classList.toggle("is-end", bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 4);
  };
  $("pickBar").addEventListener("scroll", syncPickEnd, { passive: true });
  window.addEventListener("resize", syncPickEnd);
  $("pickList").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-date]");
    if (b) selectDate(parseDateAttr(b.dataset.date));
  });

  function renderEvents(first, dim) {
    $("eventsTitle").textContent = "📅 Sự kiện tháng " + viewMonth + "/" + viewYear;
    const items = [];
    for (let i = 0; i < dim; i++) {
      const info = dayInfo(addDays(first, i));
      info.events.forEach((e) => {
        const diff = info.jd - todayJd;
        items.push(
          `<li><button type="button" data-date="${info.y}-${info.m}-${info.d}" class="${e.mine ? "is-mine" : ""}${diff < 0 ? " is-past" : ""}">
            <span class="ln-ev-date"><b>${pad(info.d)}</b><small>${wdShort(info.date)}</small></span>
            <span class="ln-ev-body">
              <span class="ln-ev-name">${esc(e.name)}</span>
              <span class="ln-ev-lunar">${lunarShort(info.lunar)} âm lịch${diff >= 0 ? " · " + daysLabel(diff) : ""}</span>
            </span>
            ${e.off ? '<span class="ln-ev-off">Nghỉ lễ</span>' : e.mine ? '<span class="ln-ev-tag">Của tôi</span>' : ""}
          </button></li>`
        );
      });
    }
    $("eventsList").innerHTML = items.length ? items.join("") : '<li class="ln-ev-empty">Tháng này không có ngày lễ lớn.</li>';
    const link = $("monthPageLink");
    const hasPage = viewYear === 2026 || viewYear === 2027;
    link.href = hasPage ? "../lich-am/thang-" + viewMonth + "-" + viewYear + ".html" : "../lich-am/index.html";
    link.textContent = hasPage ? "Ngày tốt & giờ hoàng đạo cả tháng " + viewMonth + "/" + viewYear + " →" : "Xem lịch âm từng tháng →";
  }

  function findNext(fromDate, lunarDay) {
    for (let i = 1; i <= 31; i++) {
      const d = addDays(fromDate, i);
      if (lunarOf(d).day === lunarDay) return { date: d, days: i };
    }
    return null;
  }

  function relLabel(jd) {
    const diff = jd - todayJd;
    if (diff === 0) return "Hôm nay";
    if (diff === 1) return "Ngày mai";
    if (diff === -1) return "Hôm qua";
    return diff > 0 ? "Còn " + diff + " ngày" : -diff + " ngày trước";
  }

  let dayText = "";

  function renderDay() {
    const info = dayInfo(selected);
    const full = L.convertSolarToLunar(info.d, info.m, info.y);
    const term = L.solarTerm(info.jd);
    const hours = L.luckyHours(info.jd);
    const moon = L.moonPhase(info.lunar.day);
    const g = info.guide;
    const nextFirst = findNext(selected, 1);
    const nextFull = findNext(selected, 15);
    const tet = L.lunarToSolar(1, 1, info.lunar.year + 1, false, 7);
    const tetDays = tet ? L.jdFromDate(tet.day, tet.month, tet.year) - info.jd : 0;
    const fmtNext = (n) => wdShort(n.date) + " " + pad(n.date.getDate()) + "/" + pad(n.date.getMonth() + 1) + " · sau " + n.days + " ngày";
    const red = info.date.getDay() === 0 || info.events.some((e) => e.off);
    const dayChi = (info.jd + 1) % 12;
    const advice = F ? F.dayAdvice(info.jd, info.lunar) : null;
    const tuoi = F && birthYear ? F.tuoiDay(birthYear, info.jd, info.lunar.month) : null;
    const vkId = !F
      ? ""
      : info.events.some((e) => e.mine)
        ? "gio"
        : info.lunar.month === 12 && info.lunar.day === 23
          ? "tao-quan"
          : info.lunar.day === 1
            ? "mung1"
            : info.lunar.day === 15
              ? "ram"
              : "";

    $("dayPanel").innerHTML = `
      <div class="ln-bloc">
        <div class="ln-bloc-head">
          <span>Tháng ${info.m} · ${info.y}</span>
          <span class="ln-bloc-rel">${relLabel(info.jd)}</span>
        </div>
        <div class="ln-bloc-body${red ? " is-red" : ""}">
          <strong class="ln-bloc-num">${info.d}</strong>
          <span class="ln-bloc-wd">${esc(full.weekday)}</span>
          ${info.events.length ? `<div class="ln-bloc-events">${info.events.map((e) => `<span class="${e.mine ? "is-mine" : e.off ? "is-off" : ""}">${e.mine ? "⭐" : e.off ? "🎌" : "🎉"} ${esc(e.name)}</span>`).join("")}</div>` : ""}
        </div>
        <div class="ln-bloc-foot">
          <div class="ln-bloc-lunar">
            <span>${esc(lunarMonthName(info.lunar))}</span>
            <strong>${info.lunar.day}</strong>
            <em>Năm ${esc(full.yearCanChi)}</em>
          </div>
          <dl class="ln-bloc-cc">
            <div><dt>Ngày</dt><dd>${esc(full.dayCanChi)}</dd></div>
            <div><dt>Tháng</dt><dd>${esc(full.monthCanChi)}</dd></div>
            <div><dt>Tiết</dt><dd>${esc(term)}</dd></div>
          </dl>
        </div>
      </div>

      <div class="ln-day-badges">
        <span class="ln-badge ${g.good ? "is-good" : "is-bad"}">${g.good ? "✦ Ngày hoàng đạo" : "Ngày hắc đạo"}<small>${esc(g.god)}</small></span>
        <span class="ln-badge">${moon.icon} ${esc(moon.name)}<small>${CHI_ICON[dayChi]} Ngày ${esc(L.CHI[dayChi])}</small></span>
      </div>

      <div class="ln-day-sec">
        <h3>Giờ hoàng đạo</h3>
        <div class="ln-hours">${hours.map((h) => `<span><i aria-hidden="true">${CHI_ICON[L.CHI.indexOf(h.name)]}</i><b>${h.name}</b><small>${h.from}h–${h.to}h</small></span>`).join("")}</div>
      </div>

      ${advice ? `<div class="ln-nenky">
        <div class="ln-nenky-head"><h3>Trực ${esc(advice.truc)}</h3>${advice.warn ? `<span class="ln-nenky-warn">⚠ Ngày ${esc(advice.warn)}</span>` : ""}</div>
        <p class="is-good"><b>Nên</b><span>${esc(advice.good.join(", "))}</span></p>
        <p class="is-bad"><b>Kỵ</b><span>${esc(advice.bad.join(", "))}${advice.warn ? ", việc lớn (ngày " + esc(advice.warn) + ")" : ""}</span></p>
      </div>` : ""}

      <div class="ln-day-facts">
        <div><span>🧭 Hướng Hỷ thần</span><b>${esc(g.hyThan)}</b></div>
        <div><span>⚡ Tuổi xung</span><b>${esc(g.clash)} (${esc(g.clashAnimal)})</b></div>
      </div>

      ${tuoi ? `<button type="button" class="ln-day-link" data-go="tuoi"><span>🔮 Tuổi ${esc(tuoi.chiName)} của bạn hôm nay</span><b>${starText(tuoi.stars)}</b></button>` : ""}
      ${vkId ? `<button type="button" class="ln-day-link" data-vk="${vkId}"><span>🙏 Văn khấn ${esc(F.VAN_KHAN.find((v) => v.id === vkId).name.toLowerCase())}</span><b>Xem bài →</b></button>` : ""}

      <ul class="ln-day-next">
        ${nextFirst ? `<li><i>🌑</i><span>Mùng 1 tới</span><b>${fmtNext(nextFirst)}</b></li>` : ""}
        ${nextFull ? `<li><i>🌕</i><span>Rằm tới</span><b>${fmtNext(nextFull)}</b></li>` : ""}
        ${tetDays > 0 ? `<li><i>🧧</i><span>Tết ${esc(L.yearCanChi(info.lunar.year + 1))}</span><b>${pad(tet.day)}/${pad(tet.month)}/${tet.year} · còn ${tetDays} ngày</b></li>` : ""}
      </ul>

      <div class="ln-day-actions">
        <button type="button" class="ln-act is-main" id="dayShare" title="Tạo ảnh lịch ngày này để gửi Zalo, Facebook">🖼️ Ảnh chia sẻ</button>
        <button type="button" class="ln-act" id="dayCopy" title="Sao chép thông tin ngày">📋 Sao chép</button>
        <button type="button" class="ln-act" id="daySave" title="Lưu làm ngày giỗ / sự kiện hằng năm">⭐ Lưu ngày giỗ</button>
        <button type="button" class="ln-act" id="dayConvert" title="Đổi ngày âm ↔ dương">🔄 Đổi ngày</button>
      </div>
      <p class="ln-day-note">Giờ, ngày hoàng đạo, trực và việc nên/kỵ theo phong tục, chỉ mang tính tham khảo.</p>`;

    dayText =
      "Dương lịch: " + full.weekday + ", " + pad(info.d) + "/" + pad(info.m) + "/" + info.y + "\n" +
      "Âm lịch: ngày " + info.lunar.day + " " + lowerFirst(lunarMonthName(info.lunar)) + " năm " + full.yearCanChi + "\n" +
      "Ngày " + full.dayCanChi + ", tháng " + full.monthCanChi + ", năm " + full.yearCanChi + "\n" +
      (g.good ? "Ngày hoàng đạo (" : "Ngày hắc đạo (") + g.god + ") · Tiết khí: " + term + "\n" +
      "Giờ hoàng đạo: " + hours.map((h) => h.name + " (" + h.from + "h–" + h.to + "h)").join(", ") + "\n" +
      "Hướng Hỷ thần: " + g.hyThan + " · Tuổi xung: " + g.clash +
      (advice ? "\nTrực " + advice.truc + " · Nên: " + advice.good.join(", ") + " · Kỵ: " + advice.bad.join(", ") : "") +
      (info.events.length ? "\nSự kiện: " + info.events.map((e) => e.name).join(", ") : "") +
      "\n— Xem lịch âm: https://onetool.vn/cong-cu-tien-ich/lunar-calendar.html";

    $("dayCopy").addEventListener("click", async () => {
      try {
        await (window.OT?.copyText ? OT.copyText(dayText) : navigator.clipboard.writeText(dayText));
        $("dayCopy").textContent = "✓ Đã chép";
        track("lunar_day_copy");
      } catch (_) {
        $("dayCopy").textContent = "Không chép được";
      }
    });
    $("daySave").addEventListener("click", () => {
      $("mineCal").value = info.lunar.leap ? "solar" : "lunar";
      $("mineDay").value = String(info.lunar.leap ? info.d : info.lunar.day);
      $("mineMonth").value = String(info.lunar.leap ? info.m : info.lunar.month);
      $("mineCard").scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => $("mineName").focus({ preventScroll: true }), 350);
    });
    $("dayConvert").addEventListener("click", () => {
      fillDate(info.d, info.m, info.y, false);
      setMode("solar");
      convert();
      setView("convert");
    });
    $("dayShare").addEventListener("click", () => openShare(info));
  }

  $("dayPanel").addEventListener("click", (e) => {
    if (e.target.closest("[data-go='tuoi']")) {
      setView("tuoi");
      $("tabTuoi").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const vk = e.target.closest("[data-vk]");
    if (vk) {
      vkType = vk.dataset.vk;
      setView("vankhan");
      $("tabVankhan").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  function selectDate(date, keepFocus) {
    selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let dir = 0;
    if (selected.getMonth() + 1 !== viewMonth || selected.getFullYear() !== viewYear) {
      dir = selected > new Date(viewYear, viewMonth - 1, 1) ? 1 : -1;
      viewMonth = selected.getMonth() + 1;
      viewYear = selected.getFullYear();
    }
    renderCalendar(dir);
    renderDay();
    if (!$("viewTuoi").hidden) renderTuoi();
    if (!$("viewVankhan").hidden) renderVkText();
    if (keepFocus) grid.querySelector(".is-sel")?.focus();
  }

  function parseDateAttr(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  grid.addEventListener("click", (e) => {
    const cell = e.target.closest(".ln-cell");
    if (!cell) return;
    selectDate(parseDateAttr(cell.dataset.date));
    if (window.matchMedia("(max-width: 900px)").matches) $("dayPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  grid.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    selectDate(addDays(selected, step), true);
  });
  $("eventsList").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-date]");
    if (b) selectDate(parseDateAttr(b.dataset.date));
  });

  function shiftMonth(n) {
    const d = new Date(viewYear, viewMonth - 1 + n, 1);
    if (d.getFullYear() < 1800 || d.getFullYear() > 2199) return;
    viewYear = d.getFullYear();
    viewMonth = d.getMonth() + 1;
    renderCalendar(n);
  }
  $("calPrev").addEventListener("click", () => shiftMonth(-1));
  $("calNext").addEventListener("click", () => shiftMonth(1));
  $("calToday").addEventListener("click", () => selectDate(today));
  monthSel.addEventListener("change", () => {
    const next = Number(monthSel.value);
    const dir = Math.sign(next - viewMonth);
    viewMonth = next;
    renderCalendar(dir);
  });
  yearInput.addEventListener("change", () => {
    const y = Math.min(2199, Math.max(1800, parseInt(yearInput.value, 10) || today.getFullYear()));
    const dir = Math.sign(y - viewYear);
    viewYear = y;
    renderCalendar(dir);
  });

  let touchX = null;
  grid.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  grid.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 60) shiftMonth(dx < 0 ? 1 : -1);
  });

  /* ── Ngày giỗ & sự kiện của tôi ── */
  const mineMonth = $("mineMonth");
  for (let i = 1; i <= 12; i++) mineMonth.add(new Option("Tháng " + i, String(i)));

  function gcalLink(e, date) {
    const ymd = (dt) => dt.getFullYear() + pad(dt.getMonth() + 1) + pad(dt.getDate());
    const details =
      (e.cal === "lunar" ? "Ngày " + e.d + "/" + e.m + " âm lịch hằng năm. " : "") +
      "Xem lịch âm: https://onetool.vn/cong-cu-tien-ich/lunar-calendar.html";
    return (
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(e.name) +
      "&dates=" + ymd(date) + "/" + ymd(addDays(date, 1)) +
      "&details=" + encodeURIComponent(details)
    );
  }

  function renderMine() {
    const list = mine
      .map((e, idx) => ({ e, idx, next: nextMine(e, todayJd) }))
      .sort((a, b) => (a.next?.jd ?? Infinity) - (b.next?.jd ?? Infinity));
    $("mineList").innerHTML = list.length
      ? list
          .map(({ e, idx, next }) => {
            const days = next ? next.jd - todayJd : null;
            return `<li>
              <button type="button" class="ln-mine-main" data-date="${next ? next.date.getFullYear() + "-" + (next.date.getMonth() + 1) + "-" + next.date.getDate() : ""}">
                <span class="ln-mine-days${days !== null && days <= 7 ? " is-soon" : ""}"><b>${days === null ? "—" : days === 0 ? "Nay" : days}</b><small>${days ? "ngày" : ""}</small></span>
                <span class="ln-mine-body">
                  <span class="ln-mine-name">${esc(e.name)}</span>
                  <span class="ln-mine-when">${e.d}/${e.m} ${e.cal === "lunar" ? "âm lịch" : "dương lịch"}${next ? " → " + wdShort(next.date) + " " + fmtDate(next.date) : ""}</span>
                </span>
              </button>
              ${next ? `<a class="ln-mine-icon" href="${esc(gcalLink(e, next.date))}" target="_blank" rel="noopener" title="Thêm vào Google Calendar" aria-label="Thêm ${esc(e.name)} vào Google Calendar">📅</a>` : ""}
              <button type="button" class="ln-mine-icon" data-del="${idx}" title="Xóa" aria-label="Xóa ${esc(e.name)}">✕</button>
            </li>`;
          })
          .join("")
      : '<li class="ln-mine-empty">Chưa có ngày nào. Thêm ngày giỗ, sinh nhật âm lịch… để lịch tự nhắc mỗi năm.</li>';
  }

  $("mineForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("mineName").value.trim().slice(0, 60);
    const cal = $("mineCal").value === "solar" ? "solar" : "lunar";
    const d = parseInt($("mineDay").value, 10);
    const m = parseInt(mineMonth.value, 10);
    const max = cal === "lunar" ? 30 : new Date(2024, m, 0).getDate();
    if (!name || !(d >= 1 && d <= max)) {
      $("mineDay").focus();
      return;
    }
    mine.push({ name, cal, d, m });
    saveMine();
    $("mineName").value = "";
    $("mineDay").value = "";
    track("lunar_mine_add", { cal });
    refreshAll();
  });

  $("mineList").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      mine.splice(Number(del.dataset.del), 1);
      saveMine();
      refreshAll();
      return;
    }
    const go = e.target.closest("button[data-date]");
    if (go && go.dataset.date) {
      selectDate(parseDateAttr(go.dataset.date));
      $("dayPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  function refreshAll() {
    renderCalendar();
    renderDay();
    renderMine();
    renderHero();
  }

  /* ── Đổi ngày Dương ↔ Âm ── */
  let mode = "solar";
  let lastText = "";
  const monthInput = $("monthInput");
  for (let i = 1; i <= 12; i++) monthInput.add(new Option("Tháng " + i, String(i)));

  const els = {
    day: $("dayInput"),
    month: monthInput,
    year: $("yearInput"),
    leap: $("leapInput"),
    leapWrap: $("leapWrap"),
    label: $("lnInputLabel"),
    status: $("status"),
    empty: $("lnEmpty"),
    out: $("lnOut"),
    copyBtn: $("copyBtn")
  };
  let lastSolar = null;

  function setStatus(msg, kind) {
    els.status.textContent = msg;
    els.status.className = "ln-status" + (kind ? " is-" + kind : "");
  }

  function setMode(next) {
    mode = next;
    ["Solar", "Lunar"].forEach((k) => {
      const on = mode === k.toLowerCase();
      $("mode" + k).classList.toggle("is-on", on);
      $("mode" + k).setAttribute("aria-selected", on ? "true" : "false");
    });
    els.label.textContent = mode === "solar" ? "Ngày dương lịch" : "Ngày âm lịch";
    els.leapWrap.hidden = mode !== "lunar";
  }

  function fillDate(d, m, y, leap) {
    els.day.value = String(d);
    els.month.value = String(m);
    els.year.value = String(y);
    els.leap.checked = !!leap;
  }

  function showResult(info) {
    const solarStr = L.formatSolar(info.solar.day, info.solar.month, info.solar.year);
    const lunarStr = L.formatLunar(info.lunar.day, info.lunar.month, info.lunar.year, info.lunar.leap);
    $("outSolar").textContent = solarStr;
    $("outWeekday").textContent = info.weekday;
    $("outLunar").textContent = lunarStr;
    $("outMonthLabel").textContent = info.monthLabel;
    $("outYearCC").textContent = info.yearCanChi;
    $("outAnimal").textContent = info.yearAnimal;
    $("outMonthCC").textContent = info.monthCanChi;
    $("outDayCC").textContent = info.dayCanChi;
    lastText =
      "Dương lịch: " + solarStr + " (" + info.weekday + ")\n" +
      "Âm lịch: " + lunarStr + " — " + info.monthLabel + "\n" +
      "Năm Can Chi: " + info.yearCanChi + " (" + info.yearAnimal + ")\n" +
      "Tháng Can Chi: " + info.monthCanChi + "\n" +
      "Ngày Can Chi: " + info.dayCanChi;
    lastSolar = new Date(info.solar.year, info.solar.month - 1, info.solar.day);
    els.empty.hidden = true;
    els.out.hidden = false;
    els.copyBtn.disabled = false;
  }

  function convert() {
    try {
      const d = parseInt(els.day.value, 10);
      const m = parseInt(els.month.value, 10);
      const y = parseInt(els.year.value, 10);
      const info = mode === "solar" ? L.convertSolarToLunar(d, m, y) : L.convertLunarToSolar(d, m, y, els.leap.checked);
      showResult(info);
      setStatus("Đã đổi lịch.", "ok");
    } catch (e) {
      setStatus(e.message || String(e), "err");
    }
  }

  $("modeSolar").addEventListener("click", () => setMode("solar"));
  $("modeLunar").addEventListener("click", () => setMode("lunar"));
  $("runBtn").addEventListener("click", () => {
    convert();
    track("lunar_convert", { mode });
  });
  $("todayBtn").addEventListener("click", () => {
    setMode("solar");
    const info = L.todayInfo();
    fillDate(info.solar.day, info.solar.month, info.solar.year, false);
    showResult(info);
    setStatus("Hôm nay.", "ok");
  });
  $("tetBtn").addEventListener("click", () => {
    setMode("lunar");
    fillDate(1, 1, today.getFullYear(), false);
    convert();
  });
  $("midBtn").addEventListener("click", () => {
    setMode("lunar");
    fillDate(15, 8, today.getFullYear(), false);
    convert();
  });
  $("copyBtn").addEventListener("click", async () => {
    if (!lastText) return;
    try {
      await navigator.clipboard.writeText(lastText);
      setStatus("Đã sao chép kết quả.", "ok");
    } catch (_) {
      setStatus("Không sao chép được.", "err");
    }
  });
  $("showInCalBtn").addEventListener("click", () => {
    if (!lastSolar) return;
    setView("calendar");
    selectDate(lastSolar);
  });

  /* ── Xem tuổi ── */
  function renderTuoi() {
    const out = $("tuoiOut");
    if (!F) return;
    if (!birthYear) {
      out.innerHTML = `<div class="ln-tuoi-empty">
        <div class="ln-tuoi-zodiac" aria-hidden="true">${CHI_ICON.map((c) => `<span>${c}</span>`).join("")}</div>
        <p>Nhập năm sinh để xem ngày hợp tuổi, màu sắc, con số và giờ tốt riêng cho bạn.</p>
      </div>`;
      return;
    }
    const info = dayInfo(selected);
    const t = F.tuoiDay(birthYear, info.jd, info.lunar.month);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const w = dayInfo(addDays(today, i));
      const s = F.tuoiDay(birthYear, w.jd, w.lunar.month).stars;
      week.push(
        `<button type="button" data-date="${w.y}-${w.m}-${w.d}" class="s${s}${w.jd === info.jd ? " is-sel" : ""}" aria-label="${esc(L.weekdayName(w.jd))} ${w.d}/${w.m}: ${s} sao">
          <small>${i === 0 ? "Nay" : wdShort(w.date)}</small><b>${pad(w.d)}/${pad(w.m)}</b><span>${"★".repeat(s)}</span>
        </button>`
      );
    }
    out.innerHTML = `
      <div class="ln-tuoi-hero s${t.stars}">
        <span class="ln-tuoi-icon" aria-hidden="true">${CHI_ICON[t.chi]}</span>
        <div class="ln-tuoi-who">
          <strong>Tuổi ${esc(t.canChi)} <small>(${birthYear})</small></strong>
          <span>Mệnh ${esc(t.napAm.name)} · hành ${esc(t.napAm.element)}</span>
        </div>
        <div class="ln-tuoi-score">
          <span class="ln-stars" aria-label="${t.stars} trên 5 sao">${starText(t.stars)}</span>
          <b>${esc(t.label)}</b>
          <small>${esc(relLabel(info.jd))} · ${esc(L.weekdayName(info.jd))} ${pad(info.d)}/${pad(info.m)}</small>
        </div>
      </div>
      <p class="ln-tuoi-advice">${esc(t.advice)}</p>
      <ul class="ln-tuoi-reasons">${t.reasons
        .map((r) => `<li class="${r.ok === true ? "is-ok" : r.ok === false ? "is-bad" : "is-mid"}"><i aria-hidden="true">${r.ok === true ? "✓" : r.ok === false ? "✕" : "•"}</i>${esc(r.text)}</li>`)
        .join("")}</ul>
      <div class="ln-tuoi-grid">
        <div><span>🎨 Màu hợp mệnh</span><p class="ln-swatches">${t.colors.map(([n, h]) => `<em><i style="background:${h}"></i>${esc(n)}</em>`).join("")}</p></div>
        <div><span>🔢 Con số may mắn</span><b>${t.numbers.join(" · ")}</b></div>
        <div><span>⏰ Giờ tốt cho bạn</span><b>${t.hours.map((h) => esc(h.name)).join(", ")}</b></div>
        <div><span>🧭 Xuất hành</span><b>Hướng ${esc(t.hyThan)}</b></div>
      </div>
      <h3 class="ln-tuoi-sub">7 ngày tới của tuổi ${esc(t.chiName)}</h3>
      <div class="ln-week">${week.join("")}</div>
      <p class="ln-day-note">Tính theo ngũ hành nạp âm, hợp – xung địa chi và ngày hoàng đạo. Chỉ mang tính tham khảo, giải trí.</p>`;
  }

  $("tuoiYear").value = birthYear ? String(birthYear) : "";
  $("tuoiForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const y = parseInt($("tuoiYear").value, 10);
    if (!(y >= 1920 && y <= 2030)) {
      $("tuoiYear").focus();
      return;
    }
    birthYear = y;
    writeStore(BIRTH_KEY, String(y));
    track("lunar_tuoi", { chi: (y + 8) % 12 });
    refreshAll();
    renderTuoi();
  });
  $("tuoiOut").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-date]");
    if (b) selectDate(parseDateAttr(b.dataset.date));
  });

  /* ── Gieo quẻ đầu ngày ── */
  const QUE_LEVELS = ["Đại cát", "Thượng cát", "Trung cát", "Tiểu cát", "Bình", "Hạ"];
  let queShaking = false;

  function todayQue() {
    try {
      const s = JSON.parse(readStore(QUE_KEY) || "null");
      return s && s.day === todayJd && F.QUE[s.idx] ? s.idx : null;
    } catch (_) {
      return null;
    }
  }

  function renderQue(reveal) {
    if (!F) return;
    const idx = todayQue();
    const box = $("queBox");
    if (idx === null) {
      box.innerHTML = `
        <div class="ln-que-stage">
          <div class="ln-que-tube" id="queTube" aria-hidden="true">
            <span class="ln-que-sticks">${"<i></i>".repeat(7)}</span>
            <span class="ln-que-body">Quẻ</span>
          </div>
          <p>Thành tâm nghĩ về điều bạn mong muốn hôm nay, rồi lắc ống quẻ.</p>
          <button type="button" class="btn btn-primary" id="queShake">🎋 Lắc quẻ</button>
        </div>`;
      return;
    }
    const q = F.QUE[idx];
    box.innerHTML = `
      <div class="ln-que-result lv${QUE_LEVELS.indexOf(q.level)}${reveal ? " is-reveal" : ""}">
        <div class="ln-que-top"><span class="ln-que-no">Quẻ số ${pad(idx + 1)}</span><span class="ln-que-lv">${esc(q.level)}</span></div>
        <h3>${esc(q.title)}</h3>
        <p class="ln-que-verse">${q.verse.map(esc).join("<br>")}</p>
        <dl class="ln-que-aspects">
          <div><dt>💼 Công việc</dt><dd>${esc(q.work)}</dd></div>
          <div><dt>💰 Tài lộc</dt><dd>${esc(q.money)}</dd></div>
          <div><dt>❤️ Tình cảm</dt><dd>${esc(q.love)}</dd></div>
          <div><dt>🌿 Sức khỏe</dt><dd>${esc(q.health)}</dd></div>
        </dl>
        <div class="ln-que-foot">
          <span>Đã gieo quẻ hôm nay — quay lại ngày mai để gieo quẻ mới.</span>
          <button type="button" class="ln-act is-main" id="queShare">🖼️ Ảnh chia sẻ</button>
        </div>
      </div>`;
  }

  $("queBox").addEventListener("click", (e) => {
    if (e.target.closest("#queShare")) {
      const idx = todayQue();
      openShare(dayInfo(today), idx === null ? null : F.QUE[idx]);
      return;
    }
    if (!e.target.closest("#queShake") || queShaking) return;
    queShaking = true;
    $("queTube").classList.add("is-shaking");
    $("queShake").disabled = true;
    $("queShake").textContent = "Đang lắc…";
    const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 200 : 1500;
    setTimeout(() => {
      const idx = Math.floor(Math.random() * F.QUE.length);
      writeStore(QUE_KEY, JSON.stringify({ day: todayJd, idx }));
      queShaking = false;
      renderQue(true);
      track("lunar_que", { level: F.QUE[idx].level });
    }, wait);
  });

  /* ── Văn khấn ── */
  let vkType = null;
  let vkValues = {};
  try {
    vkValues = JSON.parse(readStore(VK_KEY) || "{}") || {};
  } catch (_) {}
  ["vkName", "vkAddr", "vkFamily", "vkDeceased"].forEach((id) => {
    $(id).value = vkValues[id] || "";
    $(id).addEventListener("input", () => {
      vkValues[id] = $(id).value;
      writeStore(VK_KEY, JSON.stringify(vkValues));
      renderVkText();
    });
  });

  function nextLunarDay(lunarDay) {
    for (let i = 0; i <= 31; i++) {
      const d = addDays(today, i);
      if (lunarOf(d).day === lunarDay) return d;
    }
    return today;
  }

  function vkDateOf(id) {
    if (id === "mung1") return nextLunarDay(1);
    if (id === "ram") return nextLunarDay(15);
    if (id === "tao-quan") {
      for (const ly of [todayLunar.year, todayLunar.year + 1]) {
        const s = L.lunarToSolar(23, 12, ly, false, 7);
        if (s && L.jdFromDate(s.day, s.month, s.year) >= todayJd) return new Date(s.year, s.month - 1, s.day);
      }
    }
    return selected;
  }

  function renderVk() {
    if (!F) return;
    if (!vkType) vkType = nextLunarDay(1) <= nextLunarDay(15) ? "mung1" : "ram";
    $("vkTypes").innerHTML = F.VAN_KHAN.map(
      (v) => `<button type="button" role="tab" data-vk="${v.id}" class="${v.id === vkType ? "is-on" : ""}" aria-selected="${v.id === vkType}">${v.icon} ${esc(v.name)}</button>`
    ).join("");
    renderVkText();
  }

  function renderVkText() {
    const vk = F.VAN_KHAN.find((v) => v.id === vkType);
    if (!vk) return;
    const date = vkDateOf(vk.id);
    const info = dayInfo(date);
    const diff = info.jd - todayJd;
    const lunarDay = info.lunar.day <= 10 ? "mùng " + info.lunar.day : String(info.lunar.day);
    const dateText =
      "ngày " + lunarDay + " " + lowerFirst(lunarMonthName(info.lunar)) + " năm " + L.yearCanChi(info.lunar.year) +
      " (tức ngày " + fmtDate(date) + " dương lịch)";
    const val = (id) => ($(id).value.trim() || "……………");
    $("vkDeceasedWrap").hidden = vk.id !== "gio";
    $("vkDate").innerHTML =
      `📅 <b>${esc(L.weekdayName(info.jd))}, ${fmtDate(date)}</b> — ${esc(lunarDay)} ${esc(lowerFirst(lunarMonthName(info.lunar)))} âm lịch` +
      (diff > 0 ? ` <span>(còn ${diff} ngày)</span>` : diff === 0 ? " <span>(hôm nay)</span>" : "") +
      (vk.id === "gio" || vk.id === "than-tai" ? '<small>Theo ngày đang chọn trên lịch tháng.</small>' : "");
    $("vkOffer").innerHTML = "<b>Lễ vật:</b> " + esc(vk.offerings);
    $("vkTitle").textContent = "Văn khấn " + vk.name.toLowerCase();
    $("vkText").textContent = vk.body({
      family: val("vkFamily"),
      name: val("vkName"),
      address: val("vkAddr"),
      deceased: val("vkDeceased"),
      date: dateText
    });
  }

  $("vkTypes").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-vk]");
    if (!b) return;
    vkType = b.dataset.vk;
    renderVk();
    track("lunar_vankhan", { type: vkType });
  });
  $("vkCopy").addEventListener("click", async () => {
    const text = $("vkTitle").textContent + "\n\n" + $("vkText").textContent;
    try {
      await (window.OT?.copyText ? OT.copyText(text) : navigator.clipboard.writeText(text));
      $("vkCopy").textContent = "✓ Đã sao chép";
      setTimeout(() => ($("vkCopy").textContent = "📋 Sao chép văn khấn"), 1800);
    } catch (_) {
      $("vkCopy").textContent = "Không chép được";
    }
  });

  /* ── Ảnh chia sẻ ── */
  let shareFile = null;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fitText(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t.trimEnd() + "…";
  }

  function wrapLines(ctx, text, maxW, maxLines) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const w of words) {
      const next = line ? line + " " + w : w;
      if (ctx.measureText(next).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] = fitText(ctx, lines[maxLines - 1] + " …", maxW);
    }
    return lines;
  }

  function drawShare(info, que) {
    const W = 1080;
    const H = 1350;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    const font = getComputedStyle(document.body).fontFamily || "sans-serif";
    const f = (weight, size) => `${weight} ${size}px ${font}`;
    const full = L.convertSolarToLunar(info.d, info.m, info.y);
    const g = info.guide;
    const advice = F ? F.dayAdvice(info.jd, info.lunar) : null;
    const red = "#c0262d";
    const gold = "#f5c451";

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#7f1d1d");
    bg.addColorStop(0.55, "#b91c1c");
    bg.addColorStop(1, "#7c2d12");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(245,196,81,.14)";
    ctx.lineWidth = 3;
    [[90, 90, 160], [W - 60, 260, 220], [80, H - 120, 200], [W - 120, H - 60, 140]].forEach(([x, y, r]) => {
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(x, y, r - k * 34, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = gold;
    ctx.font = f(800, 46);
    ctx.fillText(info.jd === todayJd ? "✦ LỊCH ÂM HÔM NAY ✦" : "✦ LỊCH ÂM ✦", W / 2, 112);

    const cx = 70;
    const cy = 150;
    const cw = W - 140;
    const ch = 1070;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    roundRect(ctx, cx, cy, cw, ch, 44);
    ctx.fillStyle = "#fffaf0";
    ctx.fill();
    ctx.restore();
    roundRect(ctx, cx + 14, cy + 14, cw - 28, ch - 28, 34);
    ctx.strokeStyle = "rgba(192,38,45,.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    const isRed = info.date.getDay() === 0 || info.events.some((e) => e.off);
    ctx.fillStyle = red;
    ctx.font = f(700, 38);
    ctx.fillText("THÁNG " + info.m + " · " + info.y, W / 2, cy + 92);
    ctx.fillStyle = isRed ? red : "#57534e";
    ctx.font = f(600, 46);
    ctx.fillText(full.weekday, W / 2, cy + 152);
    const ev = info.events.find((e) => e.mine) || info.events[0];
    ctx.fillStyle = red;
    ctx.font = f(800, ev ? 230 : 290);
    ctx.fillText(String(info.d), W / 2, cy + (ev ? 370 : 420));

    let y = cy + (ev ? 430 : 480);
    if (ev) {
      ctx.font = f(700, 36);
      const label = fitText(ctx, (ev.mine ? "⭐ " : "🎉 ") + ev.name, cw - 160);
      const tw = ctx.measureText(label).width + 56;
      roundRect(ctx, W / 2 - tw / 2, y - 40, tw, 58, 29);
      ctx.fillStyle = "#fdecc8";
      ctx.fill();
      ctx.fillStyle = "#9a3412";
      ctx.fillText(label, W / 2, y + 2);
      y += 50;
    } else y += 10;

    ctx.strokeStyle = "rgba(120,53,15,.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(cx + 70, y);
    ctx.lineTo(cx + cw - 70, y);
    ctx.stroke();
    ctx.setLineDash([]);

    const my = y + 135;
    const mx = cx + 175;
    const medal = ctx.createLinearGradient(mx - 100, my - 100, mx + 100, my + 100);
    medal.addColorStop(0, "#dc2626");
    medal.addColorStop(1, "#991b1b");
    ctx.beginPath();
    ctx.arc(mx, my, 100, 0, Math.PI * 2);
    ctx.fillStyle = medal;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = gold;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = f(800, 92);
    ctx.fillText(String(info.lunar.day), mx, my + 20);
    ctx.font = f(700, 24);
    ctx.fillStyle = "#fde68a";
    ctx.fillText("ÂM LỊCH", mx, my + 60);

    ctx.textAlign = "left";
    const tx = mx + 140;
    const tw = cx + cw - 60 - tx;
    ctx.fillStyle = "#1c1917";
    ctx.font = f(800, 46);
    ctx.fillText(fitText(ctx, "Ngày " + info.lunar.day + " " + lowerFirst(lunarMonthName(info.lunar)), tw), tx, my - 38);
    ctx.font = f(700, 38);
    ctx.fillStyle = red;
    ctx.fillText("Năm " + full.yearCanChi + " " + CHI_ICON[(info.lunar.year + 8) % 12], tx, my + 14);
    ctx.font = f(500, 32);
    ctx.fillStyle = "#78716c";
    ctx.fillText(fitText(ctx, "Ngày " + full.dayCanChi + " · Tháng " + full.monthCanChi, tw), tx, my + 62);

    y = my + 170;
    const pills = [
      [(g.good ? "✦ Hoàng đạo · " : "Hắc đạo · ") + g.god, g.good ? "#dcfce7" : "#f5f5f4", g.good ? "#166534" : "#57534e"],
      advice ? ["Trực " + advice.truc, "#fdecc8", "#9a3412"] : null,
      ["Tiết " + L.solarTerm(info.jd), "#fdecc8", "#9a3412"]
    ].filter(Boolean);
    ctx.font = f(700, 30);
    const widths = pills.map((p) => ctx.measureText(p[0]).width + 44);
    let px = W / 2 - (widths.reduce((a, b) => a + b, 0) + 16 * (pills.length - 1)) / 2;
    pills.forEach((p, i) => {
      roundRect(ctx, px, y - 36, widths[i], 54, 27);
      ctx.fillStyle = p[1];
      ctx.fill();
      ctx.fillStyle = p[2];
      ctx.fillText(p[0], px + 22, y);
      px += widths[i] + 16;
    });

    const lx = cx + 70;
    const lw = cw - 140;
    const row = (label, text, color, lines) => {
      y += 62;
      ctx.font = f(800, 30);
      ctx.fillStyle = color;
      ctx.fillText(label, lx, y);
      const off = ctx.measureText(label + "  ").width;
      ctx.font = f(500, 30);
      ctx.fillStyle = "#44403c";
      wrapLines(ctx, text, lw - off, lines).forEach((ln, i) => {
        if (i) y += 42;
        ctx.fillText(ln, lx + off, y);
      });
    };
    row("Giờ tốt", L.luckyHours(info.jd).map((h) => h.name + " " + h.from + "–" + h.to + "h").join(", "), red, 2);
    if (que) {
      row("Quẻ", que.level + " — " + que.title, "#9a3412", 1);
      ctx.font = f(500, 30);
      y += 46;
      ctx.fillStyle = "#57534e";
      ctx.fillText(fitText(ctx, "“" + que.verse[0] + " / " + que.verse[1] + "”", lw), lx, y);
    } else if (advice) {
      row("Nên", advice.good.join(", "), "#166534", 1);
      row("Kỵ", advice.bad.join(", ") + (advice.warn ? ", ngày " + advice.warn : ""), red, 1);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = gold;
    ctx.font = f(800, 40);
    ctx.fillText("onetool.vn", W / 2, H - 70);
    ctx.font = f(500, 28);
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.fillText("Lịch âm · Xem tuổi · Gieo quẻ · Văn khấn", W / 2, H - 28);
    return cv;
  }

  async function openShare(info, que) {
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch (_) {}
    const cv = drawShare(info, que || null);
    const name = "lich-am-" + info.y + "-" + pad(info.m) + "-" + pad(info.d) + ".png";
    const url = cv.toDataURL("image/png");
    $("shareImg").src = url;
    $("shareDownload").href = url;
    $("shareDownload").download = name;
    shareFile = null;
    cv.toBlob((blob) => {
      if (blob && typeof File === "function") shareFile = new File([blob], name, { type: "image/png" });
      $("shareNative").hidden = !(shareFile && navigator.canShare?.({ files: [shareFile] }));
    }, "image/png");
    const dlg = $("shareDlg");
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    track("lunar_share_image", { que: !!que });
  }

  function closeShare() {
    const dlg = $("shareDlg");
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  $("shareClose").addEventListener("click", closeShare);
  $("shareDlg").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeShare();
  });
  $("shareNative").addEventListener("click", async () => {
    if (!shareFile) return;
    try {
      await navigator.share({ files: [shareFile], title: "Lịch âm hôm nay", text: "Xem lịch âm: https://onetool.vn/cong-cu-tien-ich/lunar-calendar.html" });
      track("lunar_share_native");
    } catch (_) {}
  });

  /* ── Chuyển chế độ ── */
  const VIEWS = {
    calendar: ["tabCalendar", "viewCalendar", ""],
    tuoi: ["tabTuoi", "viewTuoi", "#xem-tuoi"],
    vankhan: ["tabVankhan", "viewVankhan", "#van-khan"],
    convert: ["tabConvert", "viewConvert", "#doi-ngay"]
  };

  function setView(view) {
    if (!VIEWS[view]) view = "calendar";
    Object.entries(VIEWS).forEach(([key, [tab, panel]]) => {
      const on = key === view;
      $(panel).hidden = !on;
      $(tab).classList.toggle("is-on", on);
      $(tab).setAttribute("aria-selected", on ? "true" : "false");
    });
    if (view === "tuoi") {
      renderTuoi();
      renderQue();
    }
    if (view === "vankhan") renderVk();
    const hash = VIEWS[view][2];
    if (location.hash !== hash) history.replaceState(null, "", location.pathname + location.search + hash);
  }

  const viewFromHash = () => Object.keys(VIEWS).find((k) => VIEWS[k][2] && VIEWS[k][2] === location.hash) || "calendar";

  document.querySelectorAll(".ln-tab[data-view]").forEach((tab) =>
    tab.addEventListener("click", () => {
      setView(tab.dataset.view);
      if (tab.dataset.view !== "calendar") track("lunar_view", { view: tab.dataset.view });
    })
  );

  setMode("solar");
  $("todayBtn").click();
  renderPickBar();
  syncPickEnd();
  refreshAll();
  setView(viewFromHash());
  window.addEventListener("hashchange", () => setView(viewFromHash()));
})();
