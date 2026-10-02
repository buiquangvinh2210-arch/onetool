(function () {
  "use strict";

  const DATA = window.OTQueData || [];
  const L = window.OTLunar;
  const $ = (id) => document.getElementById(id);

  const RANKS = [
    { name: "Đại cát", sub: "Thượng thượng", cls: "is-r0" },
    { name: "Thượng cát", sub: "Rất tốt", cls: "is-r1" },
    { name: "Trung cát", sub: "Tốt", cls: "is-r2" },
    { name: "Bình hòa", sub: "Cát dần", cls: "is-r3" }
  ];
  const TOPICS = [
    { id: "tong", name: "Tổng quát", icon: "🔮" },
    { id: "cong", name: "Công việc", icon: "💼" },
    { id: "tai", name: "Tài lộc", icon: "💰" },
    { id: "tinh", name: "Tình duyên", icon: "💞" },
    { id: "gia", name: "Gia đạo", icon: "🏡" },
    { id: "suc", name: "Sức khỏe", icon: "🌿" },
    { id: "hoc", name: "Thi cử", icon: "📚" },
    { id: "di", name: "Xuất hành", icon: "🧭" }
  ];
  const ELEMENTS = [
    { name: "Kim", color: "Trắng, bạc, ánh kim", dir: "Tây, Tây Bắc", sw: ["#f1f5f9", "#cbd5e1"] },
    { name: "Thủy", color: "Xanh dương, đen", dir: "Bắc", sw: ["#2563eb", "#0f172a"] },
    { name: "Mộc", color: "Xanh lá", dir: "Đông, Đông Nam", sw: ["#16a34a", "#86efac"] },
    { name: "Hỏa", color: "Đỏ, hồng, tím", dir: "Nam", sw: ["#dc2626", "#db2777"] },
    { name: "Thổ", color: "Vàng, nâu đất", dir: "Đông Bắc, Tây Nam", sw: ["#eab308", "#92400e"] }
  ];
  const SHAKE_GOAL = 9;
  const STORE_KEY = "ot-gieo-que";
  const SOUND_KEY = "ot-gq-sound";

  const els = {
    topics: $("gqTopics"),
    wish: $("gqWish"),
    today: $("gqToday"),
    cup: $("gqCup"),
    slip: $("gqSlip"),
    slipNo: $("gqSlipNo"),
    meter: $("gqMeter"),
    hint: $("gqHint"),
    go: $("gqGo"),
    motion: $("gqMotion"),
    sound: $("gqSound"),
    stage: $("gqStage"),
    result: $("gqResult")
  };
  if (!els.cup || !DATA.length) return;

  let topic = "tong";
  let state = "idle";
  let energy = 0;
  let lastImpulse = 0;
  let current = null;
  let autoTimer = 0;
  let calmTimer = 0;

  const isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const hasMotion = typeof window.DeviceMotionEvent !== "undefined";
  const needsPermission = hasMotion && typeof DeviceMotionEvent.requestPermission === "function";
  let motionOn = false;
  let motionLive = false;
  let prev = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  function toast(msg, type) {
    if (typeof window.showToast === "function") window.showToast(msg, type || "success");
  }

  function topicOf(id) {
    return TOPICS.find((t) => t.id === id) || TOPICS[0];
  }

  function randomIndex(n) {
    if (window.crypto && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      const limit = Math.floor(0x100000000 / n) * n;
      do crypto.getRandomValues(buf); while (buf[0] >= limit);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function loadStore() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (s && s.d === todayKey() && s.t) return s;
    } catch (_) {}
    return { d: todayKey(), t: {} };
  }

  function saveDraw(topicId, n) {
    const s = loadStore();
    s.t[topicId] = n;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch (_) {}
  }

  function luckyNumbers(n) {
    const a = ((n * 7) % 9) + 1;
    let b = ((n * 4 + 3) % 9) + 1;
    if (b === a) b = (b % 9) + 1;
    return [a, b, 10 + ((n * 37 + 11) % 90)];
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

  function clack(delay, gain) {
    const c = audio();
    if (!c) return;
    const len = Math.floor(c.sampleRate * 0.045);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1600 + Math.random() * 1600;
    f.Q.value = 4;
    const g = c.createGain();
    g.gain.value = gain;
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start(c.currentTime + delay);
  }

  function rattle() {
    for (let i = 0; i < 3; i++) clack(i * 0.035 + Math.random() * 0.02, 0.35 + Math.random() * 0.25);
  }

  function chime() {
    const c = audio();
    if (!c) return;
    clack(0, 0.8);
    [880, 1320].forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      const t = c.currentTime + 0.12 + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 1.5);
    });
  }

  function renderSound() {
    if (!els.sound) return;
    els.sound.textContent = soundOn ? "🔊" : "🔇";
    els.sound.setAttribute("aria-pressed", soundOn ? "true" : "false");
    els.sound.title = soundOn ? "Tắt tiếng" : "Bật tiếng";
  }

  /* ── Chọn việc muốn hỏi ── */
  function renderTopics() {
    els.topics.innerHTML = TOPICS.map(
      (t) =>
        `<button type="button" class="gq-topic${t.id === topic ? " is-on" : ""}" data-topic="${t.id}" aria-pressed="${t.id === topic}"><span aria-hidden="true">${t.icon}</span>${t.name}</button>`
    ).join("");
    renderToday();
  }

  function renderToday() {
    const n = loadStore().t[topic];
    const q = n && DATA[n - 1];
    if (!q) {
      els.today.hidden = true;
      els.today.innerHTML = "";
      return;
    }
    els.today.hidden = false;
    els.today.innerHTML = `Hôm nay bạn đã xin quẻ về <b>${esc(topicOf(topic).name)}</b>: Quẻ số ${q.n} · ${RANKS[q.r].name}. <button type="button" class="gq-linkbtn" data-review="${q.n}">Xem lại</button>`;
  }

  /* ── Hint ── */
  function setHint(text) {
    els.hint.textContent = text;
  }

  function idleHint() {
    if (motionOn && motionLive) return "Thành tâm nghĩ về điều muốn hỏi, rồi lắc điện thoại cho đến khi thẻ quẻ rơi ra.";
    if (motionOn) return "Lắc điện thoại để gieo quẻ — hoặc chạm vào ống quẻ.";
    if (needsPermission) return "Bật “Lắc điện thoại” để gieo bằng cách lắc máy, hoặc chạm vào ống quẻ.";
    return "Thành tâm nghĩ về điều muốn hỏi, rồi bấm “Lắc ống quẻ”.";
  }

  /* ── Lắc ── */
  function setMeter() {
    els.meter.style.width = Math.min(100, (energy / SHAKE_GOAL) * 100) + "%";
  }

  function impulse(fromMotion) {
    if (state === "falling") return;
    if (state === "idle" && !els.slip.hidden) {
      els.slip.classList.remove("is-drop");
      els.slip.hidden = true;
    }
    state = "shaking";
    energy += 1;
    lastImpulse = performance.now();
    els.cup.classList.add("is-shaking");
    rattle();
    if (fromMotion && navigator.vibrate) navigator.vibrate(18);
    setMeter();
    if (energy < SHAKE_GOAL) setHint(energy < 4 ? "Lắc tiếp nào…" : "Sắp ra rồi, lắc thêm chút nữa…");
    clearTimeout(calmTimer);
    calmTimer = setTimeout(calm, 420);
    if (energy >= SHAKE_GOAL) drop();
  }

  function calm() {
    if (state !== "shaking") return;
    els.cup.classList.remove("is-shaking");
    const tick = () => {
      if (state !== "shaking" || performance.now() - lastImpulse < 400) return;
      energy = Math.max(0, energy - 1);
      setMeter();
      if (energy > 0) {
        calmTimer = setTimeout(tick, 160);
      } else {
        state = "idle";
        setHint(idleHint());
      }
    };
    calmTimer = setTimeout(tick, 500);
  }

  function autoShake() {
    if (state === "falling" || autoTimer) return;
    audio();
    track("gieo_que_start", { method: "tap", topic });
    autoTimer = setInterval(() => {
      impulse(false);
      if (state === "falling") {
        clearInterval(autoTimer);
        autoTimer = 0;
      }
    }, 170);
  }

  function onMotion(e) {
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (!a || a.x == null) return;
    if (!motionLive) {
      motionLive = true;
      if (state === "idle") setHint(idleHint());
    }
    if (prev && document.visibilityState === "visible") {
      const d = Math.abs(a.x - prev.x) + Math.abs(a.y - prev.y) + Math.abs(a.z - prev.z);
      const now = performance.now();
      if (d > 14 && now - lastImpulse > 110 && !autoTimer) {
        if (state === "idle") track("gieo_que_start", { method: "shake", topic });
        impulse(true);
      }
    }
    prev = { x: a.x, y: a.y, z: a.z };
  }

  function listenMotion() {
    if (motionOn) return;
    motionOn = true;
    window.addEventListener("devicemotion", onMotion, { passive: true });
    if (els.motion) els.motion.hidden = true;
    if (state === "idle") setHint(idleHint());
  }

  async function askMotion() {
    audio();
    try {
      const res = await DeviceMotionEvent.requestPermission();
      if (res === "granted") {
        listenMotion();
        toast("Đã bật lắc — lắc điện thoại để gieo quẻ nhé!");
        return;
      }
    } catch (_) {}
    toast("Chưa được cấp quyền chuyển động — bạn chạm vào ống quẻ để gieo nhé.", "error");
  }

  /* ── Rơi thẻ quẻ ── */
  function drop() {
    state = "falling";
    clearTimeout(calmTimer);
    els.cup.classList.remove("is-shaking");
    const q = DATA[randomIndex(DATA.length)];
    els.slipNo.textContent = q.n;
    els.slip.classList.remove("is-drop");
    void els.slip.offsetWidth;
    els.slip.classList.add("is-drop");
    els.slip.hidden = false;
    chime();
    if (navigator.vibrate) navigator.vibrate([40, 60, 120]);
    setHint("Thẻ quẻ số " + q.n + " đã rơi ra!");
    saveDraw(topic, q.n);
    track("gieo_que_result", { que: q.n, rank: q.r, topic });
    setTimeout(() => {
      state = "idle";
      energy = 0;
      setMeter();
      showResult(q, topic, { wish: els.wish.value.trim() });
      renderToday();
    }, 1250);
  }

  function reset() {
    if (state === "falling") return;
    clearInterval(autoTimer);
    autoTimer = 0;
    state = "idle";
    energy = 0;
    setMeter();
    els.slip.classList.remove("is-drop");
    els.slip.hidden = true;
    els.go.textContent = "Lắc ống quẻ";
    setHint(idleHint());
    els.stage.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ── Kết quả ── */
  function lunarLine() {
    if (!L) return "";
    try {
      const t = L.todayInfo();
      const now = new Date();
      const hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      return `Xin quẻ lúc ${hm} · ${t.weekday} ${t.solar.day}/${t.solar.month}/${t.solar.year} · ngày ${t.lunar.day}/${t.lunar.month}${t.lunar.leap ? " nhuận" : ""} âm lịch, năm ${t.yearCanChi}`;
    } catch (_) {
      return "";
    }
  }

  function hoursToday() {
    if (!L) return "";
    try {
      const t = L.todayInfo();
      return L.luckyHours(t.jd)
        .map((h) => `${h.name} (${h.from}h–${h.to}h)`)
        .join(", ");
    } catch (_) {
      return "";
    }
  }

  function showResult(q, topicId, opts) {
    current = { q, topic: topicId };
    const rank = RANKS[q.r];
    const t = topicOf(topicId);
    const el = ELEMENTS[q.n % 5];
    const nums = luckyNumbers(q.n);
    const lead = topicId === "tong" ? q.y : q[topicId];
    const shared = !!(opts && opts.shared);
    const wish = opts && opts.wish;
    const hours = shared ? "" : hoursToday();
    const aspects = TOPICS.filter((x) => x.id !== "tong" && x.id !== topicId);
    const canNative = isTouch && typeof navigator.share === "function";

    els.result.innerHTML = `
      ${shared ? `<div class="gq-shared">🎋 Đây là quẻ một người bạn vừa gieo được. <button type="button" class="gq-linkbtn" data-act="again">Gieo quẻ của bạn →</button></div>` : ""}
      <article class="gq-main ${rank.cls}">
        <div class="gq-main-top">
          <span class="gq-no">Quẻ số <b>${q.n}</b><small>/36</small></span>
          <span class="gq-rank">${rank.name}<small>${rank.sub}</small></span>
        </div>
        <h2 class="gq-name">${esc(q.name)}</h2>
        <div class="gq-poem">${q.poem.map((l) => `<p>${esc(l)}</p>`).join("")}</div>
        ${shared ? "" : `<p class="gq-meta">${esc(lunarLine())}</p>`}
      </article>

      <section class="gq-card gq-lead">
        <h3><span aria-hidden="true">${t.icon}</span> Lời quẻ cho việc «${esc(t.name)}»</h3>
        <p class="gq-lead-text">${esc(lead)}</p>
        ${wish ? `<p class="gq-wish">Điều bạn cầu: “${esc(wish)}”</p>` : ""}
      </section>

      <section class="gq-card">
        <h3>Giải quẻ</h3>
        <p>${esc(q.y)}</p>
      </section>

      <section class="gq-aspects" aria-label="Luận quẻ theo từng việc">
        ${aspects
          .map(
            (a) => `<div class="gq-aspect"><h4><span aria-hidden="true">${a.icon}</span> ${a.name}</h4><p>${esc(q[a.id])}</p></div>`
          )
          .join("")}
      </section>

      <section class="gq-card gq-advice">
        <h3>Lời khuyên</h3>
        <p>${esc(q.k)}</p>
      </section>

      <section class="gq-lucky" aria-label="Điều may mắn">
        <div class="gq-lucky-item"><span>Số may mắn</span><strong>${nums.join(" · ")}</strong></div>
        <div class="gq-lucky-item"><span>Màu hợp (hành ${el.name})</span><strong><i class="gq-sw" style="background:linear-gradient(135deg,${el.sw[0]},${el.sw[1]})"></i>${el.color}</strong></div>
        <div class="gq-lucky-item"><span>Hướng tốt</span><strong>${el.dir}</strong></div>
        ${hours ? `<div class="gq-lucky-item gq-lucky-wide"><span>Giờ hoàng đạo hôm nay</span><strong>${hours}</strong></div>` : ""}
      </section>

      <div class="gq-actions">
        <button type="button" class="btn btn-primary" data-act="image">Lưu ảnh quẻ</button>
        ${canNative ? `<button type="button" class="btn btn-outline" data-act="native">Gửi qua Zalo / Messenger</button>` : ""}
        <button type="button" class="btn btn-outline" data-act="facebook">Chia sẻ Facebook</button>
        <button type="button" class="btn btn-outline" data-act="copy">Sao chép link quẻ</button>
        <button type="button" class="btn btn-ghost" data-act="again">Gieo quẻ khác</button>
      </div>
      <p class="gq-note">Quẻ mang tính chiêm nghiệm và giải trí, giúp bạn thêm niềm tin và động lực. Mọi quyết định quan trọng hãy cân nhắc dựa trên thực tế.</p>`;
    els.result.hidden = false;
    if (!shared) els.go.textContent = "Gieo lại";
    requestAnimationFrame(() => els.result.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  /* ── Chia sẻ ── */
  function shareUrl() {
    const canon = document.querySelector('link[rel="canonical"]');
    const base = canon ? canon.href : location.origin + location.pathname;
    return base + "?que=" + current.q.n + "&viec=" + current.topic;
  }

  function shareText() {
    const q = current.q;
    return `Mình vừa gieo được Quẻ số ${q.n} «${q.name}» — ${RANKS[q.r].name} 🎋 Gieo thử quẻ của bạn nhé:`;
  }

  async function copyLink() {
    const url = shareUrl();
    try {
      await (window.OT && OT.copyText ? OT.copyText(url) : navigator.clipboard.writeText(url));
      toast("Đã sao chép link quẻ — dán vào Zalo, Messenger để gửi bạn bè.");
    } catch (_) {
      toast("Không sao chép được link.", "error");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: document.title, text: shareText(), url: shareUrl() });
    } catch (_) {}
  }

  function wrapLines(ctx, text, maxW) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((w) => {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCard() {
    const { q, topic: topicId } = current;
    const t = topicOf(topicId);
    const W = 1080;
    const H = 1350;
    const F = '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#7f1d1d");
    bg.addColorStop(1, "#c0262d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(251,191,36,0.12)";
    ctx.beginPath();
    ctx.arc(W - 60, 80, 260, 0, Math.PI * 2);
    ctx.fill();

    roundRect(ctx, 50, 50, W - 100, H - 100, 36);
    ctx.fillStyle = "#fffaf0";
    ctx.fill();
    ctx.strokeStyle = "#d4a24c";
    ctx.lineWidth = 5;
    ctx.stroke();
    roundRect(ctx, 70, 70, W - 140, H - 140, 26);
    ctx.strokeStyle = "rgba(212,162,76,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#b91c1c";
    ctx.font = `800 34px ${F}`;
    ctx.fillText("QUẺ SỐ " + q.n + " / 36", W / 2, 175);

    const rank = RANKS[q.r].name.toUpperCase();
    ctx.font = `800 30px ${F}`;
    const rw = ctx.measureText(rank).width + 64;
    roundRect(ctx, (W - rw) / 2, 205, rw, 56, 28);
    const gold = ctx.createLinearGradient(0, 205, 0, 261);
    gold.addColorStop(0, "#fde68a");
    gold.addColorStop(1, "#f59e0b");
    ctx.fillStyle = gold;
    ctx.fill();
    ctx.fillStyle = "#7f1d1d";
    ctx.fillText(rank, W / 2, 244);

    ctx.fillStyle = "#3b0d0d";
    ctx.font = `800 72px ${F}`;
    let y = 360;
    wrapLines(ctx, q.name, W - 220).forEach((l) => {
      ctx.fillText(l, W / 2, y);
      y += 84;
    });

    ctx.fillStyle = "#d4a24c";
    ctx.font = `700 30px ${F}`;
    ctx.fillText("✦  ✦  ✦", W / 2, y - 18);
    y += 52;

    ctx.fillStyle = "#57291a";
    ctx.font = `italic 600 40px ${F}`;
    q.poem.forEach((l, i) => {
      ctx.fillText(l, W / 2, y + i * 62);
    });
    y += q.poem.length * 62 + 40;

    const boxX = 120;
    const boxW = W - 240;
    ctx.font = `500 34px ${F}`;
    const lead = topicId === "tong" ? q.y : q[topicId];
    const lines = wrapLines(ctx, lead, boxW - 70).slice(0, 4);
    const boxH = 100 + lines.length * 48;
    roundRect(ctx, boxX, y, boxW, boxH, 24);
    ctx.fillStyle = "rgba(192,38,45,0.07)";
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = "#b91c1c";
    ctx.font = `800 30px ${F}`;
    ctx.fillText("Lời quẻ · " + t.name, boxX + 35, y + 56);
    ctx.fillStyle = "#3f2a1d";
    ctx.font = `500 34px ${F}`;
    lines.forEach((l, i) => ctx.fillText(l, boxX + 35, y + 108 + i * 48));

    ctx.textAlign = "center";
    y += boxH + 70;
    ctx.font = `italic 600 32px ${F}`;
    const advice = wrapLines(ctx, "“" + q.k + "”", boxW);
    if (y + advice.length * 46 < H - 200) {
      ctx.fillStyle = "#8a5a2b";
      advice.forEach((l, i) => ctx.fillText(l, W / 2, y + i * 46));
    }

    ctx.fillStyle = "#9a6b3c";
    ctx.font = `600 28px ${F}`;
    ctx.fillText("Gieo quẻ miễn phí tại", W / 2, H - 150);
    ctx.fillStyle = "#b91c1c";
    ctx.font = `800 40px ${F}`;
    ctx.fillText("onetool.vn", W / 2, H - 100);
    return cv;
  }

  function saveImage() {
    const cv = drawCard();
    const name = "que-so-" + current.q.n + "-onetool.png";
    track("gieo_que_image", { que: current.q.n });
    cv.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], name, { type: "image/png" });
      if (isTouch && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Quẻ số " + current.q.n, text: shareText() + " " + shareUrl() });
          return;
        } catch (e) {
          if (e && e.name === "AbortError") return;
        }
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast("Đã lưu ảnh quẻ — đăng lên Facebook, Zalo để rủ bạn bè cùng gieo.");
    }, "image/png");
  }

  /* ── Sự kiện ── */
  els.topics.addEventListener("click", (e) => {
    const b = e.target.closest("[data-topic]");
    if (!b) return;
    topic = b.dataset.topic;
    renderTopics();
  });

  els.today.addEventListener("click", (e) => {
    const b = e.target.closest("[data-review]");
    if (!b) return;
    const q = DATA[Number(b.dataset.review) - 1];
    if (q && state !== "falling") showResult(q, topic, { wish: els.wish.value.trim() });
  });

  els.go.addEventListener("click", autoShake);
  els.cup.addEventListener("click", autoShake);
  els.cup.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      els.cup.click();
    }
  });

  if (els.motion) els.motion.addEventListener("click", askMotion);

  if (els.sound) {
    renderSound();
    els.sound.addEventListener("click", () => {
      soundOn = !soundOn;
      try {
        localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
      } catch (_) {}
      renderSound();
      if (soundOn) rattle();
    });
  }

  els.result.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || !current) return;
    const act = b.dataset.act;
    if (act === "again") {
      reset();
      return;
    }
    if (act === "image") saveImage();
    if (act === "copy") copyLink();
    if (act === "native") nativeShare();
    if (act === "facebook") {
      window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(shareUrl()), "_blank", "noopener,width=640,height=560");
    }
    if (act !== "image") track("share", { method: act, content_type: "gieo-que" });
  });

  /* ── Khởi động ── */
  renderTopics();
  if (isTouch && hasMotion) {
    if (needsPermission) {
      if (els.motion) els.motion.hidden = false;
    } else {
      listenMotion();
    }
  }
  setHint(idleHint());

  const params = new URLSearchParams(location.search);
  const sharedNo = Number(params.get("que"));
  if (sharedNo >= 1 && sharedNo <= DATA.length) {
    const sharedTopic = TOPICS.some((x) => x.id === params.get("viec")) ? params.get("viec") : "tong";
    topic = sharedTopic;
    renderTopics();
    showResult(DATA[sharedNo - 1], sharedTopic, { shared: true });
  }

  window.OTGieoQue = { data: DATA, luckyNumbers };
})();
