/* OneTool — giữ chân người dùng: tool gần đây / yêu thích, bước tiếp theo, chia sẻ, PWA */
(function () {
  "use strict";
  if (window.OTEngage) return;

  const base = (window.OT_BASE || ".").replace(/\/$/, "");
  const href = (p) => (base === "." || base === "" ? p : `${base}/${p}`);
  const SITE_ORIGIN = "https://onetool.vn";

  const RECENT_KEY = "ot-recent-tools";
  const FAV_KEY = "ot-fav-tools";
  const INSTALL_DISMISS_KEY = "ot-install-dismissed";
  const MAX_RECENT = 8;
  const HANDOFF_MAX_BYTES = 400 * 1024 * 1024;
  const HANDOFF_TTL_MS = 15 * 60 * 1000;

  /* ── helpers ── */
  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readList(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (_) {
      return [];
    }
  }

  function writeList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (_) {}
  }

  function realTool(slug) {
    const t = window.OTCatalog?.toolBySlug?.(slug);
    return t && !t.hub ? t : null;
  }

  function toolHref(t) {
    return href(window.OTCatalog.hrefFor(t));
  }

  function currentSlug() {
    const cat = document.body.dataset.cat;
    const slug = document.body.dataset.tool;
    if (!slug || cat === "home" || cat === "hub") return "";
    return realTool(slug) ? slug : "";
  }

  function track(name, params) {
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, params || {});
    } catch (_) {}
  }

  function toast(msg, type) {
    if (typeof window.showToast === "function") window.showToast(msg, type || "success");
  }

  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
  }

  function isIos() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent || "") && !/CriOS|FxiOS|EdgiOS/i.test(navigator.userAgent || "");
  }

  function canonicalUrl() {
    const c = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (c && /^https?:/i.test(c)) return c;
    return location.protocol === "file:" ? SITE_ORIGIN + "/" : location.origin + location.pathname;
  }

  /* ── 1. Tool gần đây & yêu thích ── */
  function recentSlugs() {
    return readList(RECENT_KEY).filter(realTool);
  }

  function favSlugs() {
    return readList(FAV_KEY).filter(realTool);
  }

  function isFav(slug) {
    return favSlugs().includes(slug);
  }

  function recordVisit(slug) {
    const list = readList(RECENT_KEY).filter((s) => s !== slug);
    list.unshift(slug);
    writeList(RECENT_KEY, list.slice(0, MAX_RECENT));
  }

  function toggleFav(slug) {
    const list = favSlugs();
    const on = !list.includes(slug);
    writeList(FAV_KEY, on ? [slug].concat(list) : list.filter((s) => s !== slug));
    track(on ? "tool_favorite" : "tool_unfavorite", { tool: slug });
    return on;
  }

  function personalTools(limit) {
    const seen = new Set();
    const out = [];
    favSlugs().concat(recentSlugs()).forEach((slug) => {
      if (seen.has(slug)) return;
      seen.add(slug);
      const t = realTool(slug);
      if (t) out.push(Object.assign({ isFav: isFav(slug) }, t));
    });
    return limit ? out.slice(0, limit) : out;
  }

  function paintFavBtn(btn, on) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.classList.toggle("is-on", on);
    btn.innerHTML = on
      ? '<span class="ot-fav-ico" aria-hidden="true">★</span><span>Đã lưu</span>'
      : '<span class="ot-fav-ico" aria-hidden="true">☆</span><span>Lưu tool này</span>';
    btn.title = on ? "Bỏ khỏi danh sách đã lưu" : "Lưu để mở nhanh từ trang chủ và ô tìm kiếm";
  }

  function mountFavButton(slug) {
    const h1 = document.querySelector("main h1");
    if (!h1 || document.getElementById("otFavBtn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "otFavBtn";
    btn.className = "ot-fav-btn";
    paintFavBtn(btn, isFav(slug));
    btn.addEventListener("click", () => {
      const on = toggleFav(slug);
      paintFavBtn(btn, on);
      toast(on ? "Đã lưu — tool hiện ở trang chủ và ô tìm kiếm." : "Đã bỏ lưu.");
    });
    h1.insertAdjacentElement("afterend", btn);
  }

  function mountHomeMyTools() {
    if (document.body.dataset.tool !== "home") return;
    const anchor = document.querySelector(".home-showcase");
    if (!anchor) return;
    document.getElementById("otMyTools")?.remove();
    const tools = personalTools(8);
    if (!tools.length) return;

    const section = document.createElement("section");
    section.className = "ot-mytools";
    section.id = "otMyTools";
    section.setAttribute("aria-labelledby", "otMyToolsTitle");
    section.innerHTML = `
      <div class="container">
        <div class="ot-mytools-head">
          <h2 id="otMyToolsTitle">Tool của bạn</h2>
          <button type="button" class="ot-mytools-clear" id="otMyToolsClear">Xóa lịch sử</button>
        </div>
        <div class="ot-mytools-list">
          ${tools
            .map(
              (t) => `<a class="ot-mytool" href="${toolHref(t)}">
                <em aria-hidden="true">${esc(t.icon)}</em>
                <span>${esc(t.name)}</span>
                ${t.isFav ? '<b class="ot-mytool-star" title="Đã lưu" aria-label="Đã lưu">★</b>' : ""}
              </a>`
            )
            .join("")}
        </div>
      </div>`;
    anchor.insertAdjacentElement("beforebegin", section);
    document.getElementById("otMyToolsClear")?.addEventListener("click", () => {
      writeList(RECENT_KEY, []);
      mountHomeMyTools();
      toast("Đã xóa lịch sử. Tool đã lưu (★) vẫn được giữ.");
    });
  }

  function mountLunarToday() {
    if (document.body.dataset.tool !== "home" || !window.OTLunar) return;
    const anchor = document.querySelector(".home-showcase");
    if (!anchor || document.getElementById("otToday")) return;
    const L = window.OTLunar;
    const now = new Date();
    let info;
    try {
      info = L.convertSolarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
    } catch (_) {
      return;
    }
    const lunar = info.lunar;
    const fmt = (d) => String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");

    let next = null;
    for (let i = 1; i <= 31 && !next; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const l = L.solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear(), 7);
      if (l.day === 1 || l.day === 15) next = { days: i, date: d, label: l.day === 15 ? "Rằm" : "Mùng 1" };
    }
    const tet = L.lunarToSolar(1, 1, lunar.year + 1, false, 7);
    const tetDays = tet ? L.jdFromDate(tet.day, tet.month, tet.year) - info.jd : 0;

    const todaySpecial = lunar.day === 1 ? "Hôm nay mùng 1" : lunar.day === 15 ? "Hôm nay ngày Rằm" : "";
    const chips = [];
    if (todaySpecial) chips.push(`<span class="ot-today-chip ot-today-chip--hot">🌕 ${todaySpecial}</span>`);
    if (next) chips.push(`<span class="ot-today-chip">${next.label === "Rằm" ? "🌕" : "🌑"} ${next.label} sau ${next.days} ngày (${L.WEEKDAYS[next.date.getDay()].toLowerCase()} ${fmt(next.date)})</span>`);
    if (tetDays > 0) chips.push(`<span class="ot-today-chip">🧧 Tết ${esc(L.yearCanChi(lunar.year + 1))} còn ${tetDays} ngày</span>`);

    const section = document.createElement("section");
    section.className = "ot-today";
    section.id = "otToday";
    section.setAttribute("aria-label", "Lịch âm hôm nay");
    section.innerHTML = `
      <div class="container">
        <a class="ot-today-card" href="${href("cong-cu-tien-ich/lunar-calendar.html")}">
          <span class="ot-today-day" aria-hidden="true"><b>${lunar.day}</b><small>${esc(lunar.leap ? "Nhuận " + lunar.month : "Th " + lunar.month)}</small></span>
          <span class="ot-today-body">
            <span class="ot-today-label">${esc(info.weekday)}, ${fmt(now)}/${now.getFullYear()} · Âm lịch hôm nay</span>
            <strong>Ngày ${lunar.day} tháng ${esc((lunar.leap ? "nhuận " : "") + L.MONTH_VI[lunar.month])} năm ${esc(info.yearCanChi)}</strong>
            <span class="ot-today-sub">Ngày ${esc(info.dayCanChi)} · tháng ${esc(info.monthCanChi)}</span>
          </span>
          <span class="ot-today-chips">${chips.join("")}</span>
          <span class="ot-today-more">Xem lịch âm →</span>
        </a>
      </div>`;
    section.querySelector("a").addEventListener("click", () => track("lunar_today_click"));
    anchor.insertAdjacentElement("beforebegin", section);
  }

  /* ── 2. Bước tiếp theo + chuyển file sang tool kế tiếp ── */
  const TARGETS_BY_KIND = {
    pdf: ["pdf-compress", "pdf-sign", "pdf-lock", "pdf-merge", "pdf-watermark", "pdf-to-word", "pdf-split", "pdf-to-image", "pdf-pages"],
    image: ["image-compress", "remove-background", "image-crop", "image-to-pdf", "image-resize", "image-convert", "image-ocr"],
    audio: ["audio-to-text", "subtitle-srt"],
    video: ["video-to-mp3", "video-trim", "subtitle-srt", "video-convert", "audio-to-text", "video-to-gif"],
    docx: ["office-to-pdf"],
    xlsx: ["office-to-pdf"]
  };

  const TARGETS_BY_SOURCE = {
    "pdf-merge": ["pdf-compress", "pdf-sign", "pdf-lock"],
    "pdf-compress": ["pdf-sign", "pdf-lock", "pdf-merge"],
    "pdf-sign": ["pdf-compress", "pdf-lock", "pdf-merge"],
    "pdf-lock": ["pdf-merge", "pdf-compress"],
    "pdf-split": ["pdf-compress", "pdf-to-word", "pdf-merge"],
    "pdf-pages": ["pdf-compress", "pdf-sign", "pdf-merge"],
    "pdf-watermark": ["pdf-compress", "pdf-lock", "pdf-sign"],
    "image-to-pdf": ["pdf-compress", "pdf-sign", "pdf-merge"],
    "office-to-pdf": ["pdf-compress", "pdf-sign", "pdf-merge"],
    "heic-convert": ["image-compress", "image-to-pdf", "remove-background"],
    "remove-background": ["image-crop", "image-compress", "image-resize"],
    "image-compress": ["image-to-pdf", "image-crop", "remove-background"],
    "image-crop": ["image-compress", "remove-background", "image-to-pdf"],
    "image-resize": ["image-compress", "image-to-pdf", "remove-background"],
    "image-convert": ["image-compress", "image-to-pdf", "image-crop"],
    "image-blur": ["image-compress", "image-to-pdf"],
    "pdf-to-image": ["image-compress", "image-ocr", "image-crop"],
    "tiktok-download": ["video-to-mp3", "video-trim", "subtitle-srt"],
    "video-trim": ["video-to-mp3", "subtitle-srt", "video-to-gif"],
    "video-convert": ["video-trim", "subtitle-srt", "video-to-mp3"],
    "video-to-mp3": ["audio-to-text", "subtitle-srt"],
    "text-to-speech": ["subtitle-srt"]
  };

  function kindOf(blob, name) {
    const type = String(blob?.type || "").toLowerCase();
    const ext = String(name || "").toLowerCase().split(".").pop();
    if (type === "application/pdf" || ext === "pdf") return "pdf";
    if (type.startsWith("image/") || /^(jpe?g|png|webp|gif|bmp)$/.test(ext)) return "image";
    if (type.startsWith("audio/") || /^(mp3|wav|m4a|ogg|aac)$/.test(ext)) return "audio";
    if (type.startsWith("video/") || /^(mp4|webm|mov|mkv|m4v)$/.test(ext)) return "video";
    if (type.includes("wordprocessingml") || ext === "docx") return "docx";
    if (type.includes("spreadsheetml") || ext === "xlsx") return "xlsx";
    return "";
  }

  function nextTargets(source, kind) {
    const byKind = TARGETS_BY_KIND[kind] || [];
    const preferred = (TARGETS_BY_SOURCE[source] || []).filter((s) => byKind.includes(s));
    const seen = new Set([source]);
    const out = [];
    preferred.concat(byKind).forEach((slug) => {
      if (seen.has(slug) || out.length >= 3) return;
      seen.add(slug);
      const t = realTool(slug);
      if (t) out.push(t);
    });
    return out;
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("no idb"));
      const req = indexedDB.open("onetool", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("handoff");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function withStore(mode, op) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("handoff", mode);
      const req = op(tx.objectStore("handoff"));
      let result;
      req.onsuccess = () => {
        result = req.result;
      };
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onerror = tx.onabort = () => {
        db.close();
        reject(tx.error);
      };
    });
  }

  function saveHandoff(rec) {
    return withStore("readwrite", (s) => s.put(rec, "file"));
  }

  async function takeHandoff() {
    const rec = await withStore("readonly", (s) => s.get("file"));
    await withStore("readwrite", (s) => s.delete("file")).catch(() => {});
    return rec;
  }

  let lastClicked = null;
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest?.("button, a");
      if (btn) lastClicked = { el: btn, at: Date.now() };
    },
    true
  );

  let deferredInstall = null;

  function installBlock() {
    if (isStandalone() || recentlyDismissedInstall()) return "";
    if (deferredInstall) {
      return `<div class="ot-next-install">
        <span>📲 Cài OneTool lên máy — mở nhanh từ màn hình chính, không cần tìm lại trên Google.</span>
        <button type="button" class="btn btn-outline btn-sm" data-ot-install>Cài ứng dụng</button>
      </div>`;
    }
    if (isIos() && isMobile()) {
      return `<div class="ot-next-install">
        <span>📲 Lưu OneTool lên iPhone: bấm nút <b>Chia sẻ</b> của Safari → <b>Thêm vào MH chính</b>.</span>
      </div>`;
    }
    return "";
  }

  const NEXT_STEP_CATS = new Set(["pdf-tools", "images", "media", "ai"]);

  function showNextStep(blob, fileName) {
    const source = currentSlug();
    if (!source || !blob || !NEXT_STEP_CATS.has(realTool(source).cat)) return;
    const kind = kindOf(blob, fileName);
    const targets = kind ? nextTargets(source, kind) : [];
    if (!targets.length) return;

    document.getElementById("otNextStep")?.remove();
    const card = document.createElement("section");
    card.id = "otNextStep";
    card.className = "ot-next";
    card.setAttribute("aria-label", "Bước tiếp theo");
    const carry = blob.size <= HANDOFF_MAX_BYTES;
    card.innerHTML = `
      <div class="ot-next-head">
        <strong>Làm tiếp với file này?</strong>
        <button type="button" class="ot-next-close" aria-label="Đóng gợi ý">✕</button>
      </div>
      <div class="ot-next-list">
        ${targets
          .map(
            (t) => `<a class="ot-next-item" href="${toolHref(t)}" data-slug="${esc(t.slug)}">
              <em aria-hidden="true">${esc(t.icon)}</em>
              <span><strong>${esc(t.name)}</strong></span>
              <i aria-hidden="true">→</i>
            </a>`
          )
          .join("")}
      </div>
      <p class="ot-next-note">${
        carry
          ? "File «" + esc(fileName) + "» được mở sẵn ở tool kế tiếp — không cần chọn lại."
          : "File lớn — bạn sẽ chọn lại file ở tool kế tiếp."
      }</p>
      ${installBlock()}`;

    card.querySelector(".ot-next-close").addEventListener("click", () => card.remove());
    card.querySelectorAll(".ot-next-item").forEach((a) => {
      a.addEventListener("click", async (e) => {
        const to = a.dataset.slug;
        track("next_step", { from: source, to });
        if (!carry) return;
        e.preventDefault();
        const target = a.getAttribute("href");
        try {
          await saveHandoff({ blob, name: fileName, type: blob.type, from: source, target: to, at: Date.now() });
          location.href = target + (target.includes("?") ? "&" : "?") + "tiep=" + encodeURIComponent(source);
        } catch (_) {
          location.href = target;
        }
      });
    });
    bindInstallButtons(card);

    const clicked = lastClicked && Date.now() - lastClicked.at < 8000 ? lastClicked.el : null;
    const row = clicked && clicked.isConnected && clicked.closest("main") ? clicked.parentElement : null;
    if (row) {
      row.insertAdjacentElement("afterend", card);
    } else {
      const host = document.querySelector(".result-panel .tool-panel-body") || document.querySelector(".result-panel");
      if (host) host.appendChild(card);
      else {
        card.classList.add("ot-next--float");
        document.body.appendChild(card);
      }
    }
    requestAnimationFrame(() => {
      if (!card.classList.contains("ot-next--float")) card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  function injectFile(file) {
    const input = document.getElementById("fileInput");
    if (!input || typeof DataTransfer === "undefined") return false;
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    } catch (_) {
      return false;
    }
  }

  async function receiveHandoff(slug) {
    const params = new URLSearchParams(location.search);
    const from = params.get("tiep");
    if (!from) return;
    params.delete("tiep");
    const clean = location.pathname + (params.toString() ? "?" + params.toString() : "") + location.hash;
    history.replaceState(null, "", clean);

    let rec = null;
    try {
      rec = await takeHandoff();
    } catch (_) {
      return;
    }
    if (!rec || rec.target !== slug || Date.now() - rec.at > HANDOFF_TTL_MS || !rec.blob) return;
    const file = new File([rec.blob], rec.name || "file", { type: rec.type || rec.blob.type || "" });
    if (injectFile(file)) {
      const fromTool = realTool(rec.from);
      toast("Đã mở «" + file.name + "»" + (fromTool ? " từ " + fromTool.name : "") + " — bấm xử lý để tiếp tục.");
      track("next_step_received", { from: rec.from, to: slug });
    }
  }

  /* ── 3. Chia sẻ ── */
  const SHARE_ANCHORS = {
    vietqr: ".vqr-actions",
    "qr-generator": ".qr-actions",
    "number-to-words": ".ntw-card #status",
    "salary-calculator": ".sal-actions",
    "loan-calculator": ".sal-actions",
    "savings-calculator": ".sal-actions",
    "bhxh-calculator": ".sal-actions"
  };

  function mountShare(slug) {
    const selector = SHARE_ANCHORS[slug];
    if (!selector) return;
    let payload = null;
    let panel = null;

    function ensurePanel() {
      if (panel) return panel;
      const anchor = document.querySelector(selector);
      if (!anchor) return null;
      const canNative = isMobile() && typeof navigator.share === "function";
      panel = document.createElement("div");
      panel.className = "ot-share";
      panel.id = "otShare";
      panel.innerHTML = `
        <span class="ot-share-label">Chia sẻ:</span>
        ${canNative ? '<button type="button" class="ot-share-btn ot-share-btn--main" data-share="native">Gửi qua Zalo / Messenger</button>' : ""}
        <button type="button" class="ot-share-btn" data-share="facebook">Facebook</button>
        <button type="button" class="ot-share-btn" data-share="copy">Sao chép link</button>`;
      panel.addEventListener("click", (e) => {
        const b = e.target.closest("[data-share]");
        if (b) doShare(b.dataset.share);
      });
      anchor.insertAdjacentElement("afterend", panel);
      return panel;
    }

    async function doShare(method) {
      const url = canonicalUrl();
      const title = (payload && payload.title) || document.title;
      track("share", { method, content_type: slug });
      if (method === "facebook") {
        window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank", "noopener,width=640,height=560");
        return;
      }
      if (method === "copy") {
        try {
          await (window.OT?.copyText ? OT.copyText(url) : navigator.clipboard.writeText(url));
          toast("Đã sao chép link — dán vào Zalo, Messenger hoặc email.");
        } catch (_) {
          toast("Không sao chép được link.", "error");
        }
        return;
      }
      try {
        if (payload?.blob) {
          const file = new File([payload.blob], payload.fileName || "onetool.png", { type: payload.blob.type || "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title, text: title + " — tạo miễn phí tại " + url });
            return;
          }
        }
        const text = payload?.text ? payload.text + "\n\nĐổi miễn phí tại: " + url : title;
        await navigator.share({ title, text, url: payload?.text ? undefined : url });
      } catch (err) {
        if (err && err.name === "AbortError") return;
        toast("Thiết bị không hỗ trợ chia sẻ trực tiếp — dùng Sao chép link.", "error");
      }
    }

    document.addEventListener("ot:result", (e) => {
      payload = e.detail || null;
      const p = ensurePanel();
      if (p) p.hidden = !payload;
    });
  }

  /* ── 4. PWA ── */
  function recentlyDismissedInstall() {
    try {
      const at = Number(localStorage.getItem(INSTALL_DISMISS_KEY) || 0);
      return at && Date.now() - at < 14 * 24 * 3600 * 1000;
    } catch (_) {
      return false;
    }
  }

  async function promptInstall() {
    if (!deferredInstall) return;
    const ev = deferredInstall;
    deferredInstall = null;
    ev.prompt();
    try {
      const choice = await ev.userChoice;
      track("pwa_install_prompt", { outcome: choice?.outcome || "unknown" });
      if (choice?.outcome !== "accepted") {
        try {
          localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
        } catch (_) {}
      }
    } catch (_) {}
    refreshInstallUi();
  }

  function bindInstallButtons(root) {
    (root || document).querySelectorAll("[data-ot-install]").forEach((b) => {
      if (b.dataset.otInstallBound) return;
      b.dataset.otInstallBound = "1";
      b.addEventListener("click", promptInstall);
    });
  }

  function refreshInstallUi() {
    const show = !!deferredInstall && !isStandalone();
    let link = document.getElementById("otFooterInstall");
    const host = document.querySelector(".footer-col--contact .footer-links");
    if (show && !link && host) {
      link = document.createElement("button");
      link.type = "button";
      link.id = "otFooterInstall";
      link.className = "ot-footer-install";
      link.setAttribute("data-ot-install", "");
      link.textContent = "📲 Cài ứng dụng OneTool";
      host.prepend(link);
      bindInstallButtons(host);
    }
    if (link) link.hidden = !show;
    if (!show) document.querySelectorAll(".ot-next-install [data-ot-install]").forEach((b) => b.closest(".ot-next-install")?.remove());
  }

  function initPwa() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstall = e;
      refreshInstallUi();
    });
    window.addEventListener("appinstalled", () => {
      deferredInstall = null;
      track("pwa_installed");
      refreshInstallUi();
      toast("Đã cài OneTool — mở từ màn hình chính lần sau nhé!");
    });
    if (isStandalone()) track("pwa_open");

    const secure = location.protocol === "https:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    if ("serviceWorker" in navigator && secure) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }

  /* ── init ── */
  function onReady(fn) {
    if (document.readyState === "complete") setTimeout(fn, 120);
    else window.addEventListener("load", () => setTimeout(fn, 120), { once: true });
  }

  function init() {
    const slug = currentSlug();
    if (slug) {
      recordVisit(slug);
      mountFavButton(slug);
      mountShare(slug);
      document.addEventListener("ot:download", (e) => {
        const d = e.detail || {};
        showNextStep(d.blob, d.fileName);
      });
      onReady(() => receiveHandoff(slug));
    }
    mountLunarToday();
    mountHomeMyTools();
    initPwa();
  }

  window.OTEngage = { personalTools, isFav, toggleFav, track };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
