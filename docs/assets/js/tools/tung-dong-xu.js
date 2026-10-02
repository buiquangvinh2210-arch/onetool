(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const STATS_KEY = "ot-coin-stats-v2";
  const SOUND_KEY = "ot-coin-sound";
  const HISTORY_MAX = 30;
  const SHAKE_GOAL = 4;

  const MODES = {
    three: { coins: 3, size: "sm", go: "Gieo 3 đồng xu", ready: "Thành tâm nghĩ điều muốn hỏi rồi gieo" },
    two: { coins: 2, size: "md", go: "Xin âm dương", ready: "Một sấp một ngửa là được" },
    one: { coins: 1, size: "lg", go: "Tung đồng xu", ready: "Sấp hay ngửa? Chạm đồng xu để tung" }
  };

  const THREE = {
    3: {
      name: "Tam Dương",
      tag: "Đại cát",
      tone: "top",
      lead: "Ba mặt dương cùng hiện, khí dương đang vượng. Việc bạn hỏi rất thuận, thời cơ đã tới.",
      advice: [
        "Nên bắt tay vào việc ngay khi còn hứng khởi, đừng để lỡ dịp.",
        "Có quý nhân sẵn lòng giúp đỡ, cứ mạnh dạn mở lời.",
        "Thuận lợi mấy cũng giữ lời hứa và sự khiêm nhường để may mắn bền lâu."
      ]
    },
    2: {
      name: "Dương thịnh",
      tag: "Cát",
      tone: "good",
      lead: "Hai dương một âm, thuận nhiều hơn nghịch. Việc có lợi nếu bạn chủ động và làm đến nơi đến chốn.",
      advice: [
        "Cứ tiến hành, vướng mắc nhỏ ban đầu sẽ tự gỡ dần.",
        "Lắng nghe thêm một ý kiến của người thân trước khi chốt.",
        "Chi tiêu vừa phải, phần dư để dành cho cơ hội sau."
      ]
    },
    1: {
      name: "Âm thịnh",
      tag: "Bình hòa",
      tone: "calm",
      lead: "Một dương hai âm, việc cần thêm thời gian để chín muồi. Chậm mà chắc thì kết quả mới bền.",
      advice: [
        "Chuẩn bị kỹ thêm, đợi thời cơ rõ ràng hơn rồi hãy quyết.",
        "Việc nhỏ cứ làm, việc lớn nên bàn bạc với người tin cậy.",
        "Giữ sức khỏe và tinh thần thoải mái, cơ hội tốt sẽ đến đúng lúc."
      ]
    },
    0: {
      name: "Tam Âm",
      tag: "Tĩnh",
      tone: "still",
      lead: "Ba mặt âm, lúc này nên tĩnh hơn động. Giữ yên, nghỉ ngơi và nhìn lại là lựa chọn khôn ngoan.",
      advice: [
        "Chưa nên vội, để vài hôm cho lòng lắng lại rồi hãy hỏi lại.",
        "Dành thời gian sắp xếp kế hoạch, chăm lo cho bản thân và gia đình.",
        "Lùi một bước không phải là thua, mà để lấy đà đi xa hơn."
      ]
    }
  };

  const TWO = {
    1: {
      name: "Âm dương hòa",
      verdict: "Được",
      tag: "Thuận",
      tone: "top",
      lead: "Một sấp một ngửa, âm dương hòa hợp. Ý nguyện của bạn được chấp thuận, cứ yên tâm mà làm.",
      advice: ["Giữ lòng thành và làm hết sức mình.", "Khi việc thành, đừng quên cảm ơn người đã giúp."]
    },
    2: {
      name: "Hai mặt ngửa",
      verdict: "Xin lại",
      tag: "Chưa rõ",
      tone: "calm",
      lead: "Hai mặt dương, câu trả lời chưa rõ ràng. Hãy tĩnh tâm, nói rõ điều mong cầu rồi xin thêm lần nữa.",
      advice: ["Hỏi một việc cụ thể sẽ dễ có câu trả lời hơn.", "Hít thở chậm vài nhịp trước khi gieo lại."]
    },
    0: {
      name: "Hai mặt sấp",
      verdict: "Chưa thuận",
      tag: "Đợi thời",
      tone: "still",
      lead: "Hai mặt âm, việc này chưa đến lúc. Nên chờ thêm hoặc đổi cách làm, rồi hãy xin lại.",
      advice: ["Thử nhìn việc từ một hướng khác.", "Kiên nhẫn một chút, thời cơ sẽ đến."]
    }
  };

  const els = {
    stage: document.querySelector(".tx-stage"),
    tray: $("txTray"),
    arena: $("txArena"),
    result: $("txResult"),
    resultSub: $("txResultSub"),
    reading: $("txReading"),
    ask: $("txAsk"),
    go: $("txGo"),
    motion: $("txMotion"),
    sound: $("txSound"),
    hint: $("txHint"),
    nameN: $("txNameN"),
    nameS: $("txNameS"),
    presets: $("txPresets"),
    share: $("txShare"),
    stats: $("txStats"),
    ratioN: $("txRatioN"),
    ratioS: $("txRatioS"),
    history: $("txHistory"),
    reset: $("txReset")
  };
  if (!els.arena) return;

  let mode = "three";
  let flipping = false;
  let last = null;
  let stats = loadStats();

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const hasMotion = typeof window.DeviceMotionEvent !== "undefined";
  const needsPermission = hasMotion && typeof DeviceMotionEvent.requestPermission === "function";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  function toast(msg, type) {
    if (typeof window.showToast === "function") window.showToast(msg, type || "success");
  }

  function randomSides(n) {
    const out = [];
    if (window.crypto && crypto.getRandomValues) {
      const buf = new Uint8Array(n);
      crypto.getRandomValues(buf);
      for (let i = 0; i < n; i++) out.push(buf[i] & 1 ? "N" : "S");
    } else {
      for (let i = 0; i < n; i++) out.push(Math.random() < 0.5 ? "N" : "S");
    }
    return out;
  }

  function sideName(side) {
    return side === "N" ? "Ngửa" : "Sấp";
  }

  function customName(side) {
    return (side === "N" ? els.nameN : els.nameS).value.trim();
  }

  /* ── Thống kê ── */
  function emptyStats() {
    return { N: 0, S: 0, tosses: 0, best: 0, runSide: "", run: 0, hist: [] };
  }

  function loadStats() {
    try {
      const s = JSON.parse(localStorage.getItem(STATS_KEY) || "null");
      if (s && typeof s.N === "number" && Array.isArray(s.hist)) return s;
    } catch (_) {}
    return emptyStats();
  }

  function saveStats() {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (_) {}
  }

  function record(sides) {
    sides.forEach((s) => {
      stats[s] += 1;
      if (stats.runSide === s) stats.run += 1;
      else {
        stats.runSide = s;
        stats.run = 1;
      }
      if (stats.run > stats.best) stats.best = stats.run;
    });
    stats.tosses += 1;
    stats.hist.push(sides.join(""));
    if (stats.hist.length > HISTORY_MAX) stats.hist = stats.hist.slice(-HISTORY_MAX);
    saveStats();
    renderStats();
  }

  function pct(a, total) {
    return total ? Math.round((a / total) * 1000) / 10 : 0;
  }

  function histTitle(h) {
    const n = h.split("").filter((c) => c === "N").length;
    if (h.length === 3) return THREE[n].name;
    if (h.length === 2) return TWO[n].verdict;
    return sideName(h);
  }

  function renderStats() {
    const total = stats.N + stats.S;
    const pn = pct(stats.N, total);
    const ps = total ? Math.round((100 - pn) * 10) / 10 : 0;
    els.stats.innerHTML = `
      <div class="tx-stat"><span>Lượt gieo</span><strong>${stats.tosses.toLocaleString("vi-VN")}</strong></div>
      <div class="tx-stat tx-stat--n"><span>Mặt dương (ngửa)</span><strong>${stats.N.toLocaleString("vi-VN")}<small>${String(pn).replace(".", ",")}%</small></strong></div>
      <div class="tx-stat tx-stat--s"><span>Mặt âm (sấp)</span><strong>${stats.S.toLocaleString("vi-VN")}<small>${String(ps).replace(".", ",")}%</small></strong></div>
      <div class="tx-stat"><span>Chuỗi dài nhất</span><strong>${stats.best}<small>xu</small></strong></div>`;
    els.ratioN.style.width = total ? pn + "%" : "50%";
    els.ratioS.style.width = total ? ps + "%" : "50%";
    els.history.innerHTML = stats.hist.length
      ? stats.hist
          .slice()
          .reverse()
          .map(
            (h) =>
              `<span class="tx-h" title="${esc(histTitle(h))}">${h
                .split("")
                .map((c) => `<i class="tx-h--${c.toLowerCase()}"></i>`)
                .join("")}</span>`
          )
          .join("")
      : `<p class="tx-empty">Chưa có lượt gieo nào.</p>`;
  }

  /* ── Âm thanh ── */
  let soundOn = true;
  try {
    soundOn = localStorage.getItem(SOUND_KEY) !== "0";
  } catch (_) {}
  let ac = null;

  function audio() {
    if (!soundOn) return null;
    if (!ac) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try {
        ac = new Ctx();
      } catch (_) {
        return null;
      }
    }
    if (ac.state === "suspended") ac.resume().catch(() => {});
    return ac;
  }

  const GESTURES = ["pointerup", "touchend", "click", "keydown"];

  function unlockAudio() {
    const c = audio();
    if (!c) return;
    try {
      if (navigator.audioSession) navigator.audioSession.type = "playback";
    } catch (_) {}
    try {
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, 22050);
      src.connect(c.destination);
      src.start(0);
    } catch (_) {}
    const done = () => {
      if (c.state === "running") GESTURES.forEach((ev) => document.removeEventListener(ev, unlockAudio, true));
    };
    if (c.state === "running") done();
    else c.resume().then(done, () => {});
  }

  GESTURES.forEach((ev) => document.addEventListener(ev, unlockAudio, true));

  function ping(delay, base, gain, len, partials) {
    const c = audio();
    if (!c) return;
    const t = c.currentTime + delay;
    (partials || [1, 2.76, 5.4]).forEach((mul, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = base * mul;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain / (i + 1), t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len / (i + 1));
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + len + 0.05);
    });
  }

  function clink(delay) {
    ping(delay, 2100 + Math.random() * 500, 0.09, 0.22);
  }

  function landSound(delay) {
    ping(delay, 1250 + Math.random() * 200, 0.13, 0.45);
    clink(delay + 0.09);
  }

  function bell(delay) {
    ping(delay, 392, 0.07, 2.4, [1, 2.0, 3.01, 4.2]);
  }

  function renderSound() {
    els.sound.textContent = soundOn ? "🔊" : "🔇";
    els.sound.setAttribute("aria-pressed", soundOn ? "true" : "false");
    els.sound.title = soundOn ? "Tắt tiếng" : "Bật tiếng";
  }

  /* ── Đồng xu cổ ── */
  function coinHtml(size) {
    return `<div class="tx-slot tx-slot--${size}">
      <div class="tx-lift"><div class="tx-coin">
        <div class="tx-face tx-face--n"><i class="t">景</i><i class="b">興</i><i class="r">通</i><i class="l">寶</i></div>
        <div class="tx-face tx-face--s"></div>
      </div></div>
      <div class="tx-shadow"></div>
    </div>`;
  }

  function renderArena() {
    const m = MODES[mode];
    els.arena.className = "tx-arena tx-arena--" + m.size;
    els.arena.innerHTML = Array.from({ length: m.coins }, () => coinHtml(m.size)).join("");
  }

  function spin(slot, side, duration, delay) {
    const coin = slot.querySelector(".tx-coin");
    const lift = slot.querySelector(".tx-lift");
    const shadow = slot.querySelector(".tx-shadow");
    const cur = coin._rot || 0;
    const z0 = coin._z || 0;
    const z1 = Math.round(Math.random() * 70 - 35);
    const turns = (reduceMotion ? 2 : 5) + Math.floor(Math.random() * 3);
    const end = Math.floor(cur / 360) * 360 + turns * 360 + (side === "S" ? 180 : 0);
    coin._rot = end;
    coin._z = z1;
    const height = slot.classList.contains("tx-slot--lg") ? 170 : slot.classList.contains("tx-slot--md") ? 140 : 120;
    const a = coin.animate(
      [{ transform: `rotateZ(${z0}deg) rotateX(${cur}deg)` }, { transform: `rotateZ(${z1}deg) rotateX(${end}deg)` }],
      { duration, delay, fill: "forwards", easing: "cubic-bezier(0.25, 0.6, 0.35, 1)" }
    );
    lift.animate(
      [
        { transform: "translateY(0) scale(1)", easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
        { transform: `translateY(-${height}px) scale(1.12)`, offset: 0.42, easing: "cubic-bezier(0.6, 0, 0.8, 0.4)" },
        { transform: "translateY(0) scale(1)", offset: 0.86 },
        { transform: "translateY(-7px) scale(1)", offset: 0.93 },
        { transform: "translateY(0) scale(1)" }
      ],
      { duration, delay }
    );
    shadow.animate(
      [
        { transform: "scale(1)", opacity: 0.6 },
        { transform: "scale(0.45)", opacity: 0.2, offset: 0.42 },
        { transform: "scale(1)", opacity: 0.6, offset: 0.86 },
        { transform: "scale(1)", opacity: 0.6 }
      ],
      { duration, delay }
    );
    return a.finished.then(() => {
      coin.style.transform = `rotateZ(${z1}deg) rotateX(${end}deg)`;
      a.cancel();
    });
  }

  function setResult(main, sub, cls) {
    els.result.textContent = main;
    els.result.className = "tx-result-main" + (cls ? " " + cls : "");
    els.resultSub.textContent = sub;
  }

  function renderReading(o) {
    const ask = els.ask ? els.ask.value.trim() : "";
    els.reading.innerHTML = `
      <div class="tx-read-head"><span class="tx-tag tx-tag--${o.tone}">${o.tag}</span>${
        ask ? `<span class="tx-read-ask">Việc hỏi: ${esc(ask)}</span>` : ""
      }</div>
      <p class="tx-read-lead">${o.lead}</p>
      <ul class="tx-read-list">${o.advice.map((a) => `<li>${a}</li>`).join("")}</ul>`;
    els.reading.hidden = false;
  }

  async function flip(method) {
    if (flipping) return;
    flipping = true;
    audio();
    const slots = [...els.arena.querySelectorAll(".tx-slot")];
    const sides = randomSides(slots.length);
    const duration = reduceMotion ? 700 : 1500;
    els.go.disabled = true;
    els.share.disabled = true;
    els.reading.hidden = true;
    els.tray.classList.add("is-tossing");
    setResult("Đang gieo…", slots.length > 1 ? "Các đồng xu đang bay" : "Đồng xu đang bay", "is-wait");
    clink(0);
    clink(0.06);
    if (navigator.vibrate && method === "shake") navigator.vibrate(25);
    const jobs = slots.map((slot, i) => {
      const extra = slots.length > 1 ? Math.floor(Math.random() * 280) : 0;
      landSound((duration * 0.86 + extra + i * 50) / 1000);
      return spin(slot, sides[i], duration + extra, i * 50);
    });
    await Promise.all(jobs);
    els.tray.classList.remove("is-tossing");
    if (navigator.vibrate) navigator.vibrate(35);
    record(sides);
    showOutcome(sides);
    track("coin_flip", { mode, coins: sides.length, method });
    flipping = false;
    els.go.disabled = false;
    els.share.disabled = false;
  }

  function showOutcome(sides) {
    const n = sides.filter((s) => s === "N").length;
    if (mode === "three") {
      const o = THREE[n];
      setResult(o.name, `${n} dương · ${3 - n} âm · ${o.tag}`, "is-" + o.tone);
      renderReading(o);
      if (n >= 2) bell(0.05);
      last = { text: `Mình gieo 3 đồng xu cổ được ${o.name} (${n} dương ${3 - n} âm) — ${o.tag}!` };
      return;
    }
    if (mode === "two") {
      const o = TWO[n];
      setResult(o.verdict, `${o.name} · ${o.tag}`, "is-" + o.tone);
      renderReading(o);
      if (n === 1) bell(0.05);
      last = { text: `Mình xin âm dương bằng 2 đồng xu: ${o.name} — ${o.verdict}!` };
      return;
    }
    const s = sides[0];
    const custom = customName(s);
    setResult(sideName(s).toUpperCase(), custom ? `→ ${custom}` : s === "N" ? "Mặt có chữ (dương)" : "Mặt trơn (âm)", "is-" + s.toLowerCase());
    last = { text: `Mình vừa tung đồng xu ra ${sideName(s).toUpperCase()}${custom ? " — quyết định: " + custom : ""}!` };
  }

  async function share() {
    if (!last) return;
    const canon = document.querySelector('link[rel="canonical"]');
    const url = canon ? canon.href : location.href;
    const text = last.text + " Thử gieo đồng xu online:";
    if (isTouch && navigator.share) {
      try {
        await navigator.share({ title: document.title, text, url });
        track("share", { method: "native", content_type: "tung-dong-xu" });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    try {
      await (window.OT && OT.copyText ? OT.copyText(text + " " + url) : navigator.clipboard.writeText(text + " " + url));
      toast("Đã sao chép kết quả — dán vào Zalo, Messenger để gửi bạn bè.");
      track("share", { method: "copy", content_type: "tung-dong-xu" });
    } catch (_) {
      toast("Không sao chép được.", "error");
    }
  }

  /* ── Lắc điện thoại ── */
  let motionOn = false;
  let prev = null;
  let impulses = 0;
  let lastImpulse = 0;

  function rattle() {
    els.tray.classList.remove("is-rattle");
    void els.tray.offsetWidth;
    els.tray.classList.add("is-rattle");
    clink(0);
  }

  function onMotion(e) {
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (!a || a.x == null) return;
    if (prev && !flipping && document.visibilityState === "visible") {
      const d = Math.abs(a.x - prev.x) + Math.abs(a.y - prev.y) + Math.abs(a.z - prev.z);
      const now = performance.now();
      if (d > 16 && now - lastImpulse > 90) {
        impulses = now - lastImpulse < 700 ? impulses + 1 : 1;
        lastImpulse = now;
        if (impulses >= SHAKE_GOAL) {
          impulses = 0;
          flip("shake");
        } else rattle();
      }
    }
    prev = { x: a.x, y: a.y, z: a.z };
  }

  function listenMotion() {
    if (motionOn) return;
    motionOn = true;
    window.addEventListener("devicemotion", onMotion, { passive: true });
    els.motion.hidden = true;
    els.hint.textContent = "Lắc điện thoại hoặc chạm vào khay để gieo.";
  }

  async function askMotion() {
    audio();
    try {
      if ((await DeviceMotionEvent.requestPermission()) === "granted") {
        listenMotion();
        toast("Đã bật lắc — lắc điện thoại để gieo đồng xu!");
        return;
      }
    } catch (_) {}
    toast("Chưa được cấp quyền chuyển động — bạn chạm vào khay để gieo nhé.", "error");
  }

  /* ── Sự kiện ── */
  function setMode(m) {
    if (flipping || !MODES[m]) return;
    mode = m;
    document.querySelectorAll(".tx-tab").forEach((b) => {
      const on = b.dataset.mode === m;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll("[data-show]").forEach((el) => {
      el.hidden = !el.dataset.show.split(" ").includes(m);
    });
    els.go.textContent = MODES[m].go;
    renderArena();
    setResult("Sẵn sàng", MODES[m].ready, "");
    els.reading.hidden = true;
    last = null;
    els.share.disabled = true;
  }

  document.querySelector(".tx-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]");
    if (b) setMode(b.dataset.mode);
  });

  els.presets.addEventListener("click", (e) => {
    const b = e.target.closest("[data-n]");
    if (!b) return;
    els.nameN.value = b.dataset.n;
    els.nameS.value = b.dataset.s;
  });

  els.go.addEventListener("click", () => flip("button"));
  els.arena.addEventListener("click", () => flip("tap"));
  els.arena.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      flip("key");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || e.repeat) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY)$/.test(t.tagName))) return;
    e.preventDefault();
    flip("key");
  });

  els.motion.addEventListener("click", askMotion);
  els.share.addEventListener("click", share);
  els.reset.addEventListener("click", () => {
    stats = emptyStats();
    saveStats();
    renderStats();
    toast("Đã xóa thống kê.");
  });
  els.sound.addEventListener("click", () => {
    soundOn = !soundOn;
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    } catch (_) {}
    renderSound();
    if (soundOn) landSound(0);
  });

  /* ── Khởi động ── */
  renderSound();
  setMode("three");
  renderStats();
  if (isTouch) els.hint.textContent = "Chạm vào khay để gieo đồng xu.";
  if (isTouch && hasMotion) {
    if (needsPermission) els.motion.hidden = false;
    else listenMotion();
  }

  window.OTCoin = { randomSides, THREE, TWO };
})();
