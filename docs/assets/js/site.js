(function () {
  "use strict";

  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mainNav = document.getElementById("mainNav");
  const siteHeader = document.getElementById("siteHeader");

  const savedTheme = localStorage.getItem("lamai-theme");
  if (savedTheme) {
    html.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    html.setAttribute("data-theme", "dark");
    updateThemeIcon("dark");
  }

  themeToggle?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("lamai-theme", next);
    updateThemeIcon(next);
  });

  mobileMenuToggle?.addEventListener("click", () => {
    toggleNavDrawer();
  });

  document.getElementById("navDrawerClose")?.addEventListener("click", closeNavDrawer);
  document.getElementById("navDrawerBackdrop")?.addEventListener("click", closeNavDrawer);

  document.getElementById("navDrawer")?.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeNavDrawer();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNavDrawer();
  });

  function toggleNavDrawer() {
    const drawer = document.getElementById("navDrawer");
    if (!drawer) return;
    const open = !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) drawer.removeAttribute("inert");
    else drawer.setAttribute("inert", "");
    mobileMenuToggle?.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-drawer-open", open);
    mainNav?.classList.remove("open");
  }

  function closeNavDrawer() {
    const drawer = document.getElementById("navDrawer");
    if (!drawer?.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-drawer-open");
  }

  window.closeNavDrawer = closeNavDrawer;

  const navMega = document.getElementById("navMega");
  const navMegaBtn = document.getElementById("navMegaBtn");
  navMegaBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = navMega?.classList.toggle("is-open");
    navMegaBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (navMega?.classList.contains("is-open") && !navMega.contains(e.target)) {
      navMega.classList.remove("is-open");
      navMegaBtn?.setAttribute("aria-expanded", "false");
    }
    if (!mainNav?.classList.contains("open")) return;
    const t = e.target;
    if (t instanceof Node && !mainNav.contains(t) && t !== mobileMenuToggle) {
      mainNav.classList.remove("open");
    }
  });

  window.addEventListener("scroll", () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });

  highlightActiveNav();

  function updateThemeIcon(theme) {
    if (themeToggle) themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  function highlightActiveNav() {
    if (!mainNav) return;
    const path = window.location.pathname.toLowerCase();
    const onTools =
      path.includes("/cong-cu/") ||
      path.includes("/cong-cu-") ||
      /\/cong-cu\.html$/i.test(path);

    mainNav.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href")?.toLowerCase() || "";
      const isHomeLink = !href.includes("cong-cu") && !href.includes("about");
      const isToolsLink = href.includes("cong-cu");
      const isAboutLink = href.includes("about");

      if (isHomeLink && !onTools && !path.includes("about")) {
        link.classList.add("is-active");
        return;
      }
      if (isToolsLink && onTools) {
        link.classList.add("is-active");
        document.querySelector(".nav-mega-trigger")?.classList.add("is-active");
        return;
      }
      if (isAboutLink && path.includes("about")) link.classList.add("is-active");
    });
  }

  window.showToast = function (message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  window.renderCategoryChips = function (container, activeSeo) {
    if (!container || !window.OTCatalog) return;
    const base = (window.OT_BASE || ".").replace(/\/$/, "");
    const href = (p) => (base === "." || base === "" ? p : `${base}/${p}`);
    const chips = [
      `<a class="chip ${!activeSeo ? "chip--active" : ""}" href="${href("cong-cu.html")}">✨ Tất cả</a>`
    ];
    OTCatalog.categories.forEach(c => {
      const active = c.seo === activeSeo ? " chip--active" : "";
      chips.push(`<a class="chip${active}" href="${href(c.seo + ".html")}">${c.icon} ${c.name}</a>`);
    });
    container.innerHTML = chips.join("");
  };

  window.renderHomeShowcase = function (container, { limit = 3 } = {}) {
    if (!container || !window.OTCatalog) return;
    const base = (window.OT_BASE || ".").replace(/\/$/, "");
    const href = (p) => (base === "." || base === "" ? p : `${base}/${p}`);

    function toolHref(t) {
      const cat = OTCatalog.catBySlug(t.cat);
      if (t.hub) {
        const hubTool = OTCatalog.tools.find(x => x.slug === t.hub);
        const hubCat = OTCatalog.catBySlug(hubTool.cat);
        return href(`${hubCat.seo}/${t.hub}.html`);
      }
      return href(`${cat.seo}/${t.slug}.html`);
    }

    function escAttr(s) {
      return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
    }

    function sortTools(list) {
      return list.slice().sort((a, b) => {
        const ra = Number.isFinite(a.rank) ? a.rank : 999;
        const rb = Number.isFinite(b.rank) ? b.rank : 999;
        if (ra !== rb) return ra - rb;
        return String(a.name || "").localeCompare(String(b.name || ""), "vi");
      });
    }

    function pickTools(catSlug) {
      const items = OTCatalog.tools.filter(t => t.cat === catSlug && !t.hub);
      const featured = sortTools(items.filter(t => t.featured));
      const rest = sortTools(items.filter(t => !t.featured));
      return [...featured, ...rest].slice(0, limit);
    }

    function toolCard(t) {
      const cat = OTCatalog.catBySlug(t.cat);
      return `<a class="tool-card home-tool-card" href="${toolHref(t)}" aria-label="Mở ${escAttr(t.name)}">
        <div class="tool-card-icon" aria-hidden="true">${t.icon}</div>
        <div class="tool-card-body">
          <div class="tool-card-top">
            <span class="tool-card-category">${cat.icon} ${cat.name}</span>
            <span class="credit-badge badge-free">Miễn phí</span>
          </div>
          <h3 class="tool-card-title">${t.name}</h3>
          <p class="tool-card-desc">${t.desc}</p>
          <div class="tool-card-footer">
            <span class="btn btn-primary btn-sm">Mở tool →</span>
          </div>
        </div>
      </a>`;
    }

    container.innerHTML = OTCatalog.categories.map((cat, i) => {
      const tools = pickTools(cat.slug);
      if (!tools.length) return "";
      const catUrl = href(cat.seo + ".html");
      return `<section class="home-cat-row">
        <div class="home-cat-row-head">
          <h2 class="home-cat-row-title">
            <a class="home-cat-row-title-link" href="${catUrl}" aria-label="Xem danh mục ${escAttr(cat.name)}">${i + 1}. ${escAttr(String(cat.name || "").toUpperCase())}</a>
          </h2>
          <a class="home-cat-row-all" href="${catUrl}" aria-label="Xem tất cả ${escAttr(cat.name)}">Xem tất cả ›</a>
        </div>
        <div class="home-cat-row-grid">${tools.map(toolCard).join("")}</div>
      </section>`;
    }).join("");
  };

  window.renderToolGrid = function (container, { categorySeo, featuredOnly, limitPerCategory, variant } = {}) {
    if (!container || !window.OTCatalog) return;
    const base = (window.OT_BASE || ".").replace(/\/$/, "");
    const href = (p) => (base === "." || base === "" ? p : `${base}/${p}`);
    const isHome = variant === "home";
    if (isHome) return;

    const perCatLimit = limitPerCategory ?? 0;

    let tools = OTCatalog.tools.slice();
    if (categorySeo) {
      const cat = OTCatalog.categories.find(c => c.seo === categorySeo);
      if (cat) tools = tools.filter(t => t.cat === cat.slug);
    }
    if (featuredOnly) tools = tools.filter(t => t.featured);

    const groups = {};
    tools.forEach(t => {
      (groups[t.cat] ||= []).push(t);
    });

    function sortTools(list) {
      return list.slice().sort((a, b) => {
        const ra = Number.isFinite(a.rank) ? a.rank : 999;
        const rb = Number.isFinite(b.rank) ? b.rank : 999;
        if (ra !== rb) return ra - rb;
        return String(a.name || "").localeCompare(String(b.name || ""), "vi");
      });
    }

    function pickTools(items) {
      const list = items.filter(t => !t.hub);
      if (!perCatLimit) return sortTools(list);
      const featured = sortTools(list.filter(t => t.featured));
      const rest = sortTools(list.filter(t => !t.featured));
      return [...featured, ...rest].slice(0, perCatLimit);
    }

    function toolHref(t) {
      const cat = OTCatalog.catBySlug(t.cat);
      if (t.hub) {
        const hubTool = OTCatalog.tools.find(x => x.slug === t.hub);
        const hubCat = OTCatalog.catBySlug(hubTool.cat);
        return href(`${hubCat.seo}/${t.hub}.html`);
      }
      return href(`${cat.seo}/${t.slug}.html`);
    }

    function escAttr(s) {
      return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
    }

    function card(t) {
      const cat = OTCatalog.catBySlug(t.cat);
      return `<a class="tool-card" href="${toolHref(t)}" aria-label="Mở ${escAttr(t.name)}">
        <div class="tool-card-icon" aria-hidden="true">${t.icon}</div>
        <div class="tool-card-body">
          <div class="tool-card-top">
            <span class="tool-card-category">${cat.icon} ${cat.name}</span>
            <span class="credit-badge badge-free">Miễn phí</span>
          </div>
          <h3 class="tool-card-title">${t.name}</h3>
          <p class="tool-card-desc">${t.desc}</p>
          <div class="tool-card-footer">
            <span class="btn btn-primary btn-sm">Mở tool →</span>
          </div>
        </div>
      </a>`;
    }

    const order = OTCatalog.categories.map(c => c.slug);
    let html = "";
    order.forEach(slug => {
      const items = pickTools(groups[slug] || []);
      if (!items.length) return;
      const cat = OTCatalog.catBySlug(slug);

      if (!categorySeo) {
        html += `<div class="tool-category-block reveal">
          <div class="tool-category-head">
            <h2>${cat.icon} ${cat.name}</h2>
            <a href="${href(cat.seo + ".html")}" class="hint">Xem danh mục →</a>
          </div>
          <div class="tool-grid">${items.map(card).join("")}</div>
        </div>`;
      } else {
        html += `<div class="tool-grid">${items.map(card).join("")}</div>`;
      }
    });
    container.innerHTML = html || `<div class="empty-state"><h3>Chưa có công cụ</h3></div>`;
    requestAnimationFrame(() => container.querySelectorAll(".reveal,.tool-card").forEach((el, i) => {
      el.style.animationDelay = `${Math.min(i * 0.04, 0.4)}s`;
      el.classList.add("is-in");
    }));
  };

  // scroll reveal — luôn hiện sau 1 frame để tránh trang trắng nếu IO không kịp
  const revealEls = document.querySelectorAll(".feature-card, .section-head, .doc-hero");
  revealEls.forEach(el => {
    el.classList.add("reveal");
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-in"); });
  }, { threshold: 0.08 });
  revealEls.forEach(el => io.observe(el));
  requestAnimationFrame(() => {
    revealEls.forEach(el => el.classList.add("is-in"));
  });
})();
