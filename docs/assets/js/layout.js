(function () {
  "use strict";

  try {
    var savedTheme = localStorage.getItem("lamai-theme");
    var root = document.documentElement;
    if (savedTheme) root.setAttribute("data-theme", savedTheme);
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.setAttribute("data-theme", "dark");
    }
  } catch (_) {}

  const base = (window.OT_BASE || ".").replace(/\/$/, "");
  // Ngôn ngữ trang: bản tiếng Anh nằm trong /en/ (cùng đường dẫn), đặt window.OT_LANG = "en".
  // OT_BASE luôn trỏ về gốc site (nơi có assets/), link trang tự thêm "en/" khi là bản EN.
  const LANG = window.OT_LANG === "en" ? "en" : "vi";
  const LANG_PREFIX = LANG === "en" ? "en/" : "";
  const rootHref = (p) => (base === "." || base === "" ? p : `${base}/${p}`);
  const href = (p) => rootHref(LANG_PREFIX + p);
  const homeHref = () => rootHref(LANG_PREFIX) || "./";
  const asset = (p) => rootHref(`assets/${p}`);

  // Google Analytics 4 — ID từ analytics.google.com (onetool.vn)
  // Có thể ghi đè bằng OT_CONFIG.gaMeasurementId nếu đã nạp ot-config.js
  const GA_MEASUREMENT_ID_FALLBACK = "G-K0VXT2W644";

  function getGaMeasurementId() {
    const fromConfig =
      (window.OT_CONFIG && window.OT_CONFIG.gaMeasurementId) || "";
    const id = String(fromConfig || GA_MEASUREMENT_ID_FALLBACK || "").trim();
    return /^G-[A-Z0-9]+$/i.test(id) ? id : "";
  }

  function injectGoogleAnalytics() {
    const id = getGaMeasurementId();
    if (!id) return;
    if (document.getElementById("ot-ga") || window.__OT_GA_LOADED) return;
    window.__OT_GA_LOADED = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });

    const s = document.createElement("script");
    s.id = "ot-ga";
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  try {
    injectGoogleAnalytics();
  } catch (err) {
    console.error("[OneTool layout] ga", err);
  }

  // Shell CSS: ưu tiên nạp sớm trong <head> (ot-shell.css). Chỉ inject fallback nếu thiếu.
  const shellHref = asset("css/ot-shell.css?v=20260826q");
  if (!document.querySelector('link[href*="ot-shell.css"]')) {
    const legacy = [
      "css/skins.css",
      "css/tool-chrome.css",
      "css/chrome.css",
      "css/readability.css",
      "css/mobile.css?v=20260825a",
      "css/dark-tools.css?v=20260824a"
    ];
    legacy.forEach((file) => {
      if (!document.querySelector(`link[href*="${file.split("?")[0]}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = asset(file);
        document.head.appendChild(link);
      }
    });
    const shell = document.createElement("link");
    shell.rel = "stylesheet";
    shell.href = shellHref;
    document.head.appendChild(shell);
  }

  function markChromeReady() {
    const root = document.documentElement;
    root.classList.add("ot-ready");
    root.classList.remove("ot-pending");
  }

  // Favicon — SVG + PNG (Google Search ưu tiên PNG ≥48px)
  function ensureIcon(rel, href, attrs) {
    if (document.querySelector(`link[rel="${rel}"][href*="${href.split("/").pop()}"]`)) return;
    const el = document.createElement("link");
    el.rel = rel;
    el.href = asset(href);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  ensureIcon("icon", "img/favicon.svg", { type: "image/svg+xml" });
  ensureIcon("icon", "img/favicon-48.png", { type: "image/png", sizes: "48x48" });
  ensureIcon("icon", "img/favicon-192.png", { type: "image/png", sizes: "192x192" });
  ensureIcon("apple-touch-icon", "img/apple-touch-icon.png", { sizes: "180x180" });

  function pathToolMeta() {
    const path = location.pathname.replace(/\\/g, "/").toLowerCase();
    const file = path.split("/").pop() || "";

    if (file === "about.html") {
      return { cat: "home", tool: "about" };
    }

    if (file === "lien-he.html") {
      return { cat: "home", tool: "contact" };
    }

    if (file === "chinh-sach.html") {
      return { cat: "home", tool: "privacy" };
    }

    if (file === "dieu-khoan.html") {
      return { cat: "home", tool: "terms" };
    }

    if (/\/blog\/?($|index\.html$)/i.test(path) || file === "blog") {
      return { cat: "home", tool: "blog-index" };
    }

    if (/\/blog\//i.test(path)) {
      return { cat: "home", tool: "blog-article" };
    }

    if (file === "cong-cu.html" || /\/cong-cu\/?($|\/?index\.html?$)/i.test(path)) {
      return { cat: "hub", tool: "tools-index" };
    }

    const cats = window.OTCatalog?.categories || [];
    for (const c of cats) {
      if (file === `${c.seo.toLowerCase()}.html`) {
        return { cat: c.slug, tool: c.seo + "-index" };
      }
      const marker = `/${c.seo.toLowerCase()}/`;
      const idx = path.indexOf(marker);
      if (idx === -1) continue;
      const rest = path.slice(idx + marker.length).replace(/\.html$/i, "").replace(/\/$/, "");
      if (rest && rest !== "index") {
        const rec = window.OTCatalog?.toolBySlug?.(rest);
        return { cat: rec?.cat || c.slug, tool: rest };
      }
    }
    return { cat: "home", tool: "home" };
  }

  const meta = pathToolMeta();
  document.body.dataset.cat = meta.cat;
  document.body.dataset.tool = meta.tool;

  const SITE_ORIGIN = "https://onetool.vn";
  // Gốc URL của trang theo ngôn ngữ (https://onetool.vn hoặc https://onetool.vn/en)
  const PAGE_ORIGIN = SITE_ORIGIN + (LANG === "en" ? "/en" : "");
  const OG_IMAGE = SITE_ORIGIN + "/assets/img/og-share.jpg";
  const ADSENSE_CLIENT = "ca-pub-9591869402965389";

  function injectAdSense() {
    if (location.protocol === "file:") return;
    setMeta("name", "google-adsense-account", ADSENSE_CLIENT, false);
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      return;
    }
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADSENSE_CLIENT;
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }

  function sitePath() {
    let path = (location.pathname || "/").replace(/\\/g, "/");
    path = path.replace(/\/index\.html$/i, "/");
    if (!path || path === ".") path = "/";
    if (!path.startsWith("/")) path = "/" + path;
    return path;
  }

  function canonicalUrl() {
    const path = sitePath();
    if (path === "/" || path === "/index.html") return SITE_ORIGIN + "/";
    return SITE_ORIGIN + path;
  }

  function setMeta(attr, key, value, overwrite) {
    if (!value) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    if (overwrite || !el.getAttribute("content")) el.setAttribute("content", value);
  }

  function setLink(rel, href, extra) {
    let el = document.querySelector(`link[rel="${rel}"]${extra || ""}`);
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  function applyPageMeta() {
    // Title/description viết sẵn trong HTML là bản chuẩn (bot không chạy JS cũng đọc); pageMeta chỉ bù khi thiếu.
    const staticDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    if (document.title.trim() && staticDesc.trim()) return;
    const tool = window.OTCatalog?.toolBySlug?.(meta.tool);
    let pack = window.OTCatalog?.pageMeta?.[meta.tool];
    if (!pack && tool) {
      pack = {
        title: tool.name + " online miễn phí | OneTool",
        desc: String(tool.desc || tool.name) + " Miễn phí, không cần đăng ký."
      };
    }
    if (!pack) return;

    let title = pack.title || "";
    let desc = pack.desc || "";
    // CTR hooks — bổ sung nếu thiếu (toàn site)
    if (title && !/\|\s*OneTool\s*$/i.test(title)) title = title.replace(/\s*$/, "") + " | OneTool";
    if (desc) {
      const low = desc.toLowerCase();
      const extras = [];
      if (!/miễn phí/.test(low)) extras.push("Miễn phí");
      if (!/không (cần )?đăng ký|không bắt buộc đăng nhập|không tài khoản/.test(low)) {
        extras.push("không cần đăng ký");
      }
      const fileish =
        tool &&
        /pdf|image|video|audio|file|excel|word|heic|ocr|convert|merge|split|compress|sign|watermark|lock/i.test(
          tool.slug + " " + (tool.cat || "")
        );
      if (
        fileish &&
        !/trình duyệt|không (tải lên|upload)|không gửi lên server|trên máy bạn|riêng tư/.test(low)
      ) {
        extras.push("xử lý trên trình duyệt");
      }
      if (extras.length) {
        desc = desc.replace(/\.\s*$/, "") + ". " + extras.join(", ") + ".";
      }
      if (desc.length > 160) desc = desc.slice(0, 157).replace(/\s+\S*$/, "") + "…";
    }

    if (title) document.title = title;
    if (desc) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.name = "description";
        document.head.appendChild(el);
      }
      el.setAttribute("content", desc);
    }
  }

  function injectSeo() {
    applyPageMeta();
    const title = document.title || "OneTool";
    const desc =
      document.querySelector('meta[name="description"]')?.content ||
      "OneTool — công cụ PDF, ảnh, video và tiện ích trên trình duyệt. Miễn phí, không đăng nhập.";
    const url = location.protocol === "file:" ? SITE_ORIGIN + "/" : canonicalUrl();

    setMeta("name", "theme-color", "#7c3aed", false);
    setMeta("name", "author", "OneTool", false);
    const noindex = /noindex/i.test(document.querySelector('meta[name="robots"]')?.content || "");
    if (!noindex) {
      setMeta("name", "robots", "index,follow,max-image-preview:large", false);
      setMeta("name", "googlebot", "index,follow,max-image-preview:large", false);
    }

    const seoCopy = window.OTCatalog?.seo?.[meta.tool];
    const kw = seoCopy?.keywords
      ? "onetool, " + seoCopy.keywords
      : "onetool, công cụ online miễn phí, đổi ảnh, gộp pdf, nén video, audio to text, tạo qr, xóa nền";
    setMeta("name", "keywords", kw, !!seoCopy?.keywords);

    setMeta("property", "og:type", "website", true);
    setMeta("property", "og:site_name", "OneTool", true);
    setMeta("property", "og:title", title, true);
    setMeta("property", "og:description", desc, true);
    setMeta("property", "og:locale", LANG === "en" ? "en_US" : "vi_VN", true);
    setMeta("property", "og:locale:alternate", LANG === "en" ? "vi_VN" : "en_US", true);
    setMeta("property", "og:url", url, true);
    const pageImage = document.querySelector('meta[property="og:image"]')?.content;
    const ogImage = pageImage || OG_IMAGE;
    setMeta("property", "og:image", ogImage, true);
    setMeta("property", "og:image:width", "1200", true);
    setMeta("property", "og:image:height", "630", true);
    setMeta("property", "og:image:alt", pageImage ? title : "OneTool — công cụ file online miễn phí", true);
    setMeta("name", "twitter:card", "summary_large_image", true);
    setMeta("name", "twitter:title", title, true);
    setMeta("name", "twitter:description", desc, true);
    setMeta("name", "twitter:image", ogImage, true);

    if (location.protocol !== "file:") {
      const existingCanon = document.querySelector('link[rel="canonical"]');
      const existingHref = (existingCanon && existingCanon.getAttribute("href") || "").trim();
      if (!existingHref) setLink("canonical", url);
    }

    const isTool = meta.cat !== "home" && meta.cat !== "hub" && !String(meta.tool).endsWith("-index");
    const tool = window.OTCatalog?.toolBySlug?.(meta.tool);

    document.getElementById("ot-jsonld")?.remove();
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = "ot-jsonld";
    const org = {
      "@type": "Organization",
      name: "OneTool",
      url: SITE_ORIGIN + "/",
      logo: SITE_ORIGIN + "/assets/img/logo-mark-512.png",
      email: "onetools27@gmail.com",
      contactPoint: {
        "@type": "ContactPoint",
        email: "onetools27@gmail.com",
        contactType: "customer support",
        availableLanguage: ["Vietnamese", "English"],
        areaServed: "VN"
      }
    };
    ld.textContent = JSON.stringify(
      isTool
        ? {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: (tool?.name || title).replace(/\s*\|\s*OneTool$/, ""),
            url,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires JavaScript",
            offers: { "@type": "Offer", price: "0", priceCurrency: LANG === "en" ? "USD" : "VND" },
            description: desc,
            inLanguage: LANG,
            publisher: org,
            isAccessibleForFree: true
          }
        : {
            "@context": "https://schema.org",
            "@graph": [
              org,
              {
                "@type": "WebSite",
                name: "OneTool",
                url: PAGE_ORIGIN + "/",
                description: desc,
                inLanguage: LANG,
                publisher: org
              }
            ]
          }
    );
    document.head.appendChild(ld);

    if (isTool && seoCopy?.howto?.length) {
      document.getElementById("ot-jsonld-howto")?.remove();
      const how = document.createElement("script");
      how.type = "application/ld+json";
      how.id = "ot-jsonld-howto";
      const firstPara = seoCopy.sections?.[0]?.paras?.[0] || desc;
      how.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Cách dùng " + (tool?.name || title),
        description: String(firstPara).replace(/\*\*/g, ""),
        inLanguage: LANG,
        step: seoCopy.howto.map((text, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text
        }))
      });
      document.head.appendChild(how);
    }

    if (isTool && seoCopy?.faqs?.length) {
      document.getElementById("ot-jsonld-faq")?.remove();
      const faqLd = document.createElement("script");
      faqLd.type = "application/ld+json";
      faqLd.id = "ot-jsonld-faq";
      faqLd.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: seoCopy.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: String(f.a).replace(/\*\*/g, "")
          }
        }))
      });
      document.head.appendChild(faqLd);
    }

    if (isTool) {
      document.getElementById("ot-jsonld-crumb")?.remove();
      const cat = window.OTCatalog?.catBySlug?.(meta.cat);
      const crumb = document.createElement("script");
      crumb.type = "application/ld+json";
      crumb.id = "ot-jsonld-crumb";
      crumb.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: PAGE_ORIGIN + "/" },
          { "@type": "ListItem", position: 2, name: "Công cụ", item: PAGE_ORIGIN + "/cong-cu.html" },
          cat
            ? { "@type": "ListItem", position: 3, name: cat.name, item: PAGE_ORIGIN + "/" + cat.seo + ".html" }
            : null,
          { "@type": "ListItem", position: cat ? 4 : 3, name: tool?.name || title, item: url }
        ].filter(Boolean)
      });
      document.head.appendChild(crumb);
    }
  }

  function buildMegaMenu() {
    const cats = window.OTCatalog?.categories || [];
    const links = cats.map((c) => `
      <a class="nav-mega-link" href="${href(`${c.seo}.html`)}" aria-label="${esc(c.name)}">
        <em aria-hidden="true">${c.icon}</em>
        <span><strong>${esc(c.name)}</strong><small>${esc(c.desc)}</small></span>
      </a>`).join("");
    return links || "";
  }

  function buildDrawerMenu() {
    const cats = window.OTCatalog?.categories || [];
    const tools = window.OTCatalog?.tools || [];
    return cats.map((cat) => {
      let items = tools.filter((t) => t.cat === cat.slug && !t.hub);
      items = items.slice().sort((a, b) => {
        const ra = Number.isFinite(a.rank) ? a.rank : 999;
        const rb = Number.isFinite(b.rank) ? b.rank : 999;
        return ra - rb;
      });
      if (items.length > 8) {
        const feat = items.filter((t) => t.featured);
        items = feat.length ? feat : items.slice(0, 8);
      }
      const toolLinks = items.map((t) => `
        <a class="nav-drawer-tool" href="${href(OTCatalog.hrefFor(t))}" aria-label="Mở ${esc(t.name)}">
          <em aria-hidden="true">${t.icon}</em><span>${esc(t.name)}</span>
        </a>`).join("");
      return `
        <div class="nav-drawer-group">
          <a class="nav-drawer-cat" href="${href(`${cat.seo}.html`)}" aria-label="${esc(cat.name)}">
            <span aria-hidden="true">${cat.icon}</span> ${esc(cat.name)} <span>${tools.filter((t) => t.cat === cat.slug && !t.hub).length} tool</span>
          </a>
          <div class="nav-drawer-tools">${toolLinks}</div>
        </div>`;
    }).join("");
  }

  function injectChrome() {
    const headerHost = document.getElementById("site-header");
    const footerHost = document.getElementById("site-footer");
    const megaLinks = buildMegaMenu();
    const drawerBody = buildDrawerMenu();
    const toolCount = window.OTCatalog?.tools?.filter((t) => !t.hub)?.length || 55;
    const chromeHtml = (window.OTChromeHtml = {});

    if (headerHost) {
      headerHost.outerHTML = chromeHtml.header = `
<header class="site-header" id="siteHeader">
  <div class="header-shell">
    <div class="container header-inner">
      <a class="logo logo--rich" href="${homeHref()}" aria-label="OneTool — Về trang chủ">
        <span class="logo-icon" aria-hidden="true"><img class="logo-mark" src="${asset("img/logo-mark-96.png")}?v=20261024a" width="46" height="46" alt="" /></span>
        <span class="logo-stack">
          <span class="logo-text">OneTool</span>
          <span class="logo-tag">${toolCount} công cụ · Miễn phí</span>
        </span>
      </a>
      <nav class="main-nav" id="mainNav" aria-label="Menu chính">
        <a href="${homeHref()}" data-nav="home">Trang chủ</a>
        <div class="nav-item nav-item--mega" id="navMega">
          <button type="button" class="nav-mega-trigger" id="navMegaBtn" aria-expanded="false" aria-haspopup="true">
            Công cụ <span class="nav-mega-caret" aria-hidden="true">▾</span>
          </button>
          <div class="nav-mega-panel" role="menu">
            <div class="nav-mega-grid">${megaLinks}</div>
            <a class="nav-mega-all" href="${href("cong-cu.html")}">Xem tất cả ${toolCount} công cụ →</a>
          </div>
        </div>
        <a href="${href("about.html")}" data-nav="about">Giới thiệu</a>
        <a href="${href("blog/")}" data-nav="blog">Blog</a>
        <a href="${href("lien-he.html")}" data-nav="contact">Liên hệ</a>
      </nav>
      <div class="header-actions">
        ${languageSwitchHtml()}
        <button type="button" class="btn-icon" id="toolSearchBtn" aria-label="Tìm công cụ" aria-haspopup="dialog" aria-controls="toolSearchModal" title="Tìm kiếm (Ctrl+K)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        </button>
        <button type="button" class="btn-icon" id="themeToggle" aria-label="Đổi giao diện sáng/tối">🌙</button>
        <a class="btn btn-primary btn-glow btn-header-cta header-cta-desktop" href="${href("cong-cu.html")}">Tất cả công cụ</a>
        <button type="button" class="btn-icon mobile-menu-toggle" id="mobileMenuToggle" aria-label="Mở menu" aria-expanded="false" aria-controls="navDrawer">☰</button>
      </div>
    </div>
  </div>
</header>
<div class="tool-search" id="toolSearchModal" hidden aria-hidden="true">
  <div class="tool-search-backdrop" id="toolSearchBackdrop"></div>
  <div class="tool-search-panel" role="dialog" aria-modal="true" aria-labelledby="toolSearchTitle">
    <div class="tool-search-head">
      <h2 id="toolSearchTitle" class="visually-hidden">Tìm công cụ</h2>
      <div class="tool-search-field">
        <span class="tool-search-ico" aria-hidden="true">⌕</span>
        <input type="search" id="toolSearchInput" placeholder="Tìm công cụ… ví dụ: nén PDF, HEIC, cắt video" autocomplete="off" spellcheck="false" enterkeyhint="search" />
        <kbd class="tool-search-kbd" aria-hidden="true">Esc</kbd>
      </div>
      <button type="button" class="btn-icon tool-search-close" id="toolSearchClose" aria-label="Đóng tìm kiếm">✕</button>
    </div>
    <div class="tool-search-body" id="toolSearchBody">
      <p class="tool-search-label" id="toolSearchLabel">Gợi ý nổi bật</p>
      <div class="tool-search-list" id="toolSearchList" role="listbox" aria-label="Kết quả tìm kiếm"></div>
      <p class="tool-search-empty" id="toolSearchEmpty" hidden>Không thấy công cụ phù hợp. Thử từ khác hoặc xem <a href="${href("cong-cu.html")}">tất cả công cụ</a>.</p>
    </div>
    <div class="tool-search-foot">
      <span>Gõ để lọc · Enter mở mục đầu</span>
      <a href="${href("cong-cu.html")}">Tất cả công cụ →</a>
    </div>
  </div>
</div>
<div class="nav-drawer" id="navDrawer" aria-hidden="true">
  <div class="nav-drawer-backdrop" id="navDrawerBackdrop"></div>
  <aside class="nav-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
    <div class="nav-drawer-head">
      <a class="logo" href="${homeHref()}" aria-label="OneTool — Về trang chủ">
        <span class="logo-icon" aria-hidden="true"><img class="logo-mark" src="${asset("img/logo-mark-96.png")}?v=20261024a" width="36" height="36" alt="" /></span>
        <span class="logo-text">OneTool</span>
      </a>
      <button type="button" class="nav-drawer-close" id="navDrawerClose" aria-label="Đóng menu">✕</button>
    </div>
    <div class="nav-drawer-primary">
      <a href="${homeHref()}">🏠 Trang chủ</a>
      <a href="${href("cong-cu.html")}">⚡ Tất cả công cụ</a>
      <a href="${href("blog/")}">📝 Blog hướng dẫn</a>
      <a href="${href("about.html")}">ℹ️ Giới thiệu</a>
      <a href="${href("lien-he.html")}">📞 Liên hệ &amp; Góp ý</a>
    </div>
    <div class="nav-drawer-scroll">
      <p class="nav-drawer-kicker">Danh sách công cụ</p>
      ${drawerBody}
    </div>
    <div class="nav-drawer-foot">
      <a class="btn btn-primary btn-block" href="${href("cong-cu-anh/image-convert.html")}">Bắt đầu — Convert ảnh</a>
    </div>
  </aside>
</div>`;
    }

    if (footerHost) {
      footerHost.outerHTML = chromeHtml.footer = `
<footer class="site-footer">
  <div class="footer-cta-band">
    <div class="container footer-cta-inner">
      <div class="footer-cta-copy">
        <h3>Góp ý để OneTool tốt hơn</h3>
        <p class="footer-cta-desc">Báo lỗi hoặc đề xuất tính năng — gửi góp ý trên trang Liên hệ.</p>
      </div>
      <a class="btn btn-primary btn-glow footer-cta-btn" href="${href("lien-he.html")}">Gửi góp ý</a>
    </div>
  </div>
  <div class="container footer-inner">
    <div class="footer-brand">
      <a class="logo footer-logo" href="${homeHref()}" aria-label="OneTool — Về trang chủ">
        <span class="logo-icon" aria-hidden="true"><img class="logo-mark" src="${asset("img/logo-mark-96.png")}?v=20261024a" width="40" height="40" alt="" /></span>
        <span class="logo-text">OneTool</span>
      </a>
      <p class="footer-brand-desc">Công cụ file online cho người Việt — nhanh, riêng tư, miễn phí.</p>
      <div class="footer-social">
        <a href="${href("cong-cu.html")}" aria-label="Tất cả công cụ">⚡</a>
        <a href="${href("about.html")}" aria-label="Giới thiệu">ℹ</a>
      </div>
    </div>
    <div class="footer-nav">
      <div class="footer-col">
        <h4>Danh mục</h4>
        <div class="footer-links">
          ${OTCatalog.categories.map((c) => `<a href="${href(`${c.seo}.html`)}">${esc(c.name)}</a>`).join("")}
        </div>
      </div>
      <div class="footer-col">
        <h4>Phổ biến</h4>
        <div class="footer-links">
          <a href="${href("cong-cu-media/tiktok-download.html")}">Tải TikTok không logo</a>
          <a href="${href("cong-cu-media/audio-to-text.html")}">Audio → Text</a>
          <a href="${href("cong-cu-media/text-to-speech.html")}">Văn bản → giọng nói</a>
          <a href="${href("cong-cu-media/video-to-gif.html")}">Video sang GIF</a>
          <a href="${href("cong-cu-tien-ich/salary-calculator.html")}">Tính lương Gross Net</a>
          <a href="${href("cong-cu-tien-ich/currency-convert.html")}">Đổi tiền tệ</a>
          <a href="${href("cong-cu-tien-ich/lunar-calendar.html")}">Lịch âm hôm nay</a>
          <a href="${href("cong-cu-pdf/pdf-to-word.html")}">PDF to Word</a>
          <a href="${href("cong-cu-pdf/pdf-to-excel.html")}">PDF sang Excel</a>
          <a href="${href("cong-cu-pdf/image-pdf.html")}">Ảnh ↔ PDF</a>
          <a href="${href("cong-cu-anh/image-ocr.html")}">OCR ảnh</a>
          <a href="${href("cong-cu-anh/image-crop.html")}">Crop ảnh</a>
          <a href="${href("cong-cu-anh/image-compress.html")}">Nén ảnh</a>
          <a href="${href("cong-cu-pdf/pdf-merge.html")}">Gộp PDF</a>
          <a href="${href("cong-cu-anh/remove-background.html")}">Xóa nền ảnh</a>
        </div>
      </div>
      <div class="footer-col footer-col--contact">
        <h4>Liên hệ &amp; Góp ý</h4>
        <div class="footer-links">
          <a href="${href("lien-he.html")}">Gửi góp ý</a>
          <a href="${href("blog/")}">Blog hướng dẫn</a>
          <a href="${href("about.html")}">Giới thiệu</a>
          <a href="${href("chinh-sach.html")}">Chính sách bảo mật</a>
          <a href="${href("dieu-khoan.html")}">Điều khoản &amp; bản quyền</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-copy">&copy; ${new Date().getFullYear()} OneTool</p>
      <span class="footer-tagline">Miễn phí · 🇻🇳 Việt Nam</span>
    </div>
  </div>
</footer>
<div id="toastContainer" class="toast-container"></div>`;
    }
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rich(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([a-z0-9\-/.]+\.html)\)/gi, (_, text, path) => `<a href="${href(path)}">${text}</a>`);
  }

  function injectToolCrumb() {
    const isTool = meta.cat !== "home" && meta.cat !== "hub" && !String(meta.tool).endsWith("-index");
    if (!isTool) return;

    const cat = window.OTCatalog?.catBySlug?.(meta.cat);
    const tool = window.OTCatalog?.toolBySlug?.(meta.tool);
    const toolLabel = tool?.name || document.title.replace(/\s*\|\s*OneTool$/, "").trim();
    const catLabel = cat?.name || meta.cat;
    const catHref = cat ? href(`${cat.seo}.html`) : href("cong-cu.html");

    document.querySelectorAll(".breadcrumb, .rb-crumb, .at-crumb, .ir-crumb").forEach((el) => el.remove());

    let nav = document.getElementById("otCrumb");
    if (!nav) {
      nav = document.createElement("nav");
      nav.id = "otCrumb";
      const main = document.querySelector("main");
      if (main) main.prepend(nav);
      else return;
    }
    nav.className = "ot-crumb-wrap container";
    nav.setAttribute("aria-label", "Breadcrumb");
    nav.innerHTML = `
      <div class="ot-crumb">
        <a href="${homeHref()}">Trang chủ</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="${href("cong-cu.html")}">Công cụ</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="${catHref}">${esc(catLabel)}</a>
        <span class="sep" aria-hidden="true">/</span>
        <span class="now">${esc(toolLabel)}</span>
      </div>`;
  }

  function injectToolSeoBody() {
    const isTool = meta.cat !== "home" && meta.cat !== "hub" && !String(meta.tool).endsWith("-index");
    if (!isTool || !window.OTCatalog) return;
    const main = document.querySelector("main");
    if (!main) return;
    const existing = document.getElementById("toolSeo");
    if (existing && existing.dataset.static === "1") return;

    const tool = OTCatalog.toolBySlug(meta.tool);
    const copy = OTCatalog.seo[meta.tool];
    if (!tool || !copy?.sections?.length) return;

    const related = OTCatalog.relatedTools(meta.tool, 6);
    const howto = copy.howto?.length
      ? `<section class="tool-seo-block"><h2>Cách dùng ${esc(tool.name)}</h2>
          <ol class="tool-seo-howto">${copy.howto.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></section>`
      : "";
    const blocks = copy.sections.map((sec) => {
      const paras = (sec.paras || []).map((p) => `<p>${rich(p)}</p>`).join("");
      const list = sec.list?.length
        ? `<ul>${sec.list.map((item) => `<li><strong>${esc(item.title)}</strong> ${rich(item.text)}</li>`).join("")}</ul>`
        : "";
      return `<section class="tool-seo-block"><h2>${esc(sec.title)}</h2>${paras}${list}</section>`;
    }).join("");
    const faqBlock = copy.faqs?.length
      ? `<section class="tool-seo-block"><h2>Câu hỏi thường gặp</h2>
          <dl class="tool-seo-faq">${copy.faqs
            .map(
              (f) =>
                `<div class="tool-seo-faq-item"><dt>${esc(f.q)}</dt><dd>${rich(f.a)}</dd></div>`
            )
            .join("")}</dl></section>`
      : "";

    const more = related
      .map((t) => {
        const target = href(OTCatalog.hrefFor(t));
        return `<li><a class="tool-seo-card" href="${target}" aria-label="Mở ${esc(t.name)}">
          <span class="tool-seo-card-icon" aria-hidden="true">${esc(t.icon)}</span>
          <span class="tool-seo-card-body">
            <strong class="tool-seo-card-title">${esc(t.name)}</strong>
            <span class="tool-seo-card-sapo">${esc(t.desc)}</span>
          </span>
        </a></li>`;
      })
      .join("");

    const privacyNote =
      `<section class="tool-seo-block"><h2>Vì sao dùng OneTool?</h2>
        <ul>
          <li><strong>Miễn phí</strong> — không bắt buộc đăng ký hay trả phí ẩn.</li>
          <li><strong>Riêng tư</strong> — nhiều công cụ xử lý ngay trên trình duyệt, file không gửi lên server OneTool.</li>
          <li><strong>Nhanh</strong> — kéo thả, xem trước, tải kết quả trong vài bước.</li>
        </ul></section>`;

    const html = `
      <div class="tool-seo-wrap">
        ${howto}
        ${blocks}
        ${faqBlock}
        ${privacyNote}
        ${more ? `<section class="tool-seo-block"><h2>Công cụ liên quan</h2>
          <ul class="tool-seo-more">${more}</ul></section>` : ""}
      </div>`;
    if (existing) {
      existing.classList.add("tool-seo");
      existing.innerHTML = html;
      return;
    }
    const section = document.createElement("section");
    section.className = "tool-seo";
    section.id = "toolSeo";
    section.innerHTML = html;
    main.appendChild(section);
  }

  function isCategoryIndex() {
    return meta.cat !== "home" && meta.cat !== "hub" && String(meta.tool).endsWith("-index");
  }

  function injectCategorySeoMeta() {
    if (!isCategoryIndex() || !window.OTCatalog) return;
    const cat = OTCatalog.catBySlug(meta.cat);
    if (!cat) return;

    if (cat.seoTitle) document.title = cat.seoTitle;
    if (cat.seoDescription) {
      let desc = document.querySelector('meta[name="description"]');
      if (!desc) {
        desc = document.createElement("meta");
        desc.name = "description";
        document.head.appendChild(desc);
      }
      desc.setAttribute("content", cat.seoDescription);
    }
    if (cat.seoKeywords) setMeta("name", "keywords", "onetool, " + cat.seoKeywords, true);

    ensureCategoryStyles();
    document.body.classList.add("cat-page");
    polishCategoryHero();
  }

  function isToolPage() {
    return meta.cat !== "home" && meta.cat !== "hub" && !String(meta.tool).endsWith("-index");
  }

  function ensureToolPageStyles() {
    if (!isToolPage()) return;
    document.body.classList.add("tool-page");
    if (document.querySelector('link[href*="tool-page.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = asset("css/tool-page.css?v=20260908d");
    document.head.appendChild(link);
  }

  function enhanceHubPage() {
    if (meta.cat !== "hub") return;
    document.body.classList.add("cat-page", "cat-hub");
    ensureCategoryStyles();
    const hero = document.querySelector(".page-hero .container");
    const filter = document.getElementById("catFilter");
    if (hero && filter && !hero.contains(filter)) hero.appendChild(filter);
  }

  function ensureCategoryStyles() {
    if (document.querySelector('link[href*="category.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = asset("css/category.css?v=20260908a");
    document.head.appendChild(link);
  }

  function polishCategoryHero() {
    const hero = document.querySelector(".cat-hero");
    const inner = hero && hero.querySelector(".container");
    if (!hero || !inner) return;

    if (!hero.querySelector(".cat-hero-orbs")) {
      const orbs = document.createElement("div");
      orbs.className = "cat-hero-orbs";
      orbs.setAttribute("aria-hidden", "true");
      orbs.innerHTML = '<span class="cat-orb cat-orb--a"></span><span class="cat-orb cat-orb--b"></span>';
      hero.prepend(orbs);
    }

    const filter = document.getElementById("catFilter");
    if (filter && !inner.contains(filter)) inner.appendChild(filter);

    const cat = window.OTCatalog && OTCatalog.catBySlug(meta.cat);
    if (cat && !inner.querySelector(".cat-hero-count")) {
      const n = OTCatalog.tools.filter((t) => t.cat === cat.slug && !t.hub).length;
      if (n) {
        const el = document.createElement("p");
        el.className = "cat-hero-count";
        el.innerHTML = "<strong>" + n + "</strong> công cụ trong danh mục này";
        const lead = inner.querySelector(".cat-hero-lead");
        (lead || inner).insertAdjacentElement(lead ? "afterend" : "beforeend", el);
      }
    }
  }

  function injectCategoryCrumb() {
    if (!isCategoryIndex() || document.getElementById("otCrumb")) return;
    const cat = window.OTCatalog?.catBySlug?.(meta.cat);
    if (!cat) return;

    const nav = document.createElement("nav");
    nav.className = "ot-crumb-wrap container";
    nav.id = "otCrumb";
    nav.setAttribute("aria-label", "Breadcrumb");
    nav.innerHTML = `
      <div class="ot-crumb">
        <a href="${homeHref()}">Trang chủ</a>
        <span class="sep" aria-hidden="true">/</span>
        <a href="${href("cong-cu.html")}">Công cụ</a>
        <span class="sep" aria-hidden="true">/</span>
        <span class="now">${esc(cat.name)}</span>
      </div>`;

    const main = document.querySelector("main");
    if (main) main.prepend(nav);
  }

  function injectCategorySeoBody() {
    if (!isCategoryIndex() || !window.OTCatalog || document.getElementById("catSeo")) return;
    const cat = OTCatalog.catBySlug(meta.cat);
    const copy = OTCatalog.categorySeo?.[cat?.seo];
    if (!cat || !copy) return;

    const hero = document.querySelector(".cat-hero-lead");
    if (hero && copy.intro) hero.innerHTML = rich(copy.intro);

    const main = document.querySelector("main");
    if (!main || !copy.sections?.length) return;

    const blocks = copy.sections.map((sec) => {
      const paras = (sec.paras || []).map((p) => `<p>${rich(p)}</p>`).join("");
      return `<section class="cat-seo-block"><h2>${esc(sec.title)}</h2>${paras}</section>`;
    }).join("");

    const section = document.createElement("section");
    section.className = "cat-seo";
    section.id = "catSeo";
    section.innerHTML = `<div class="container cat-seo-wrap">${blocks}</div>`;
    main.appendChild(section);
  }

  function injectCategoryJsonLd() {
    if (!isCategoryIndex() || !window.OTCatalog || document.getElementById("ot-jsonld-cat")) return;
    const cat = OTCatalog.catBySlug(meta.cat);
    if (!cat) return;
    const tools = OTCatalog.tools.filter((t) => t.cat === cat.slug && !t.hub);

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = "ot-jsonld-cat";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: cat.name,
      description: cat.seoDescription || cat.desc,
      inLanguage: LANG,
      url: canonicalUrl(),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: tools.length,
        itemListElement: tools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: PAGE_ORIGIN + "/" + OTCatalog.pathFor(t)
        }))
      }
    });
    document.head.appendChild(ld);
  }

  // ---------- Ngôn ngữ: nút VI | EN + gợi ý cho khách dùng trình duyệt tiếng Anh ----------
  // Bản EN là trang tĩnh thật trong /en/ (Google index được), không dùng Google Translate.
  const LANGUAGE_CHOICE_KEY = "ot-language-choice";

  function getLanguageChoice() {
    try {
      return localStorage.getItem(LANGUAGE_CHOICE_KEY) || "";
    } catch (_) {
      return "";
    }
  }

  function setLanguageChoice(value) {
    try {
      localStorage.setItem(LANGUAGE_CHOICE_KEY, value);
    } catch (_) {}
  }

  function prefersEnglish() {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language || ""];
    return !/^vi(?:-|$)/i.test(String(languages[0] || ""));
  }

  // URL của trang hiện tại ở ngôn ngữ kia: /x/y.html <-> /en/x/y.html (giữ ?query và #hash)
  function languageUrls() {
    let rootPath = "/";
    try {
      rootPath = new URL((base === "." || base === "" ? "." : base) + "/", location.href).pathname;
    } catch (_) {}
    let rest = location.pathname.startsWith(rootPath)
      ? location.pathname.slice(rootPath.length)
      : location.pathname.replace(/^\//, "");
    rest = rest.replace(/^en(\/|$)/, "");
    const tail = location.search + location.hash;
    return { vi: rootPath + rest + tail, en: rootPath + "en/" + rest + tail };
  }

  function languageSwitchHtml() {
    const urls = languageUrls();
    const item = (code, label, title) =>
      `<a class="lang-switch-opt${LANG === code ? " is-active" : ""}" href="${esc(urls[code])}" hreflang="${code}" lang="${code}" data-lang="${code}" title="${title}"${LANG === code ? ' aria-current="true"' : ""}>${label}</a>`;
    return `<div class="lang-switch" role="group" aria-label="Language">${item("vi", "VI", "Tiếng Việt")}${item("en", "EN", "English")}</div>`;
  }

  function bindLanguageSwitch() {
    document.querySelectorAll(".lang-switch-opt").forEach((a) => {
      a.addEventListener("click", () => setLanguageChoice(a.dataset.lang));
    });
  }

  // Thẻ hreflang (bản tĩnh đã có sẵn từ build; đây chỉ bù khi thiếu)
  function injectHreflang() {
    if (location.protocol === "file:") return;
    if (/noindex/i.test(document.querySelector('meta[name="robots"]')?.content || "")) return;
    if (document.querySelector('link[rel="alternate"][hreflang]')) return;
    const path = sitePath().replace(/^\/en(\/|$)/, "/");
    const viUrl = SITE_ORIGIN + path;
    const enUrl = SITE_ORIGIN + "/en" + path;
    [["vi", viUrl], ["en", enUrl], ["x-default", viUrl]].forEach(([lang, url]) => {
      const l = document.createElement("link");
      l.rel = "alternate";
      l.hreflang = lang;
      l.href = url;
      document.head.appendChild(l);
    });
  }

  function ensureLanguageStyles() {
    if (document.getElementById("ot-language-styles")) return;
    const style = document.createElement("style");
    style.id = "ot-language-styles";
    style.textContent = `
      .lang-switch {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 3px;
        border-radius: 999px;
        background: #f1f2f6;
        border: 1px solid rgba(15, 23, 42, 0.08);
        flex-shrink: 0;
      }
      .lang-switch-opt {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.1rem;
        height: 1.75rem;
        padding: 0 0.55rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        line-height: 1;
        color: #64748b;
        text-decoration: none;
        transition: background 0.15s, color 0.15s;
      }
      .lang-switch-opt:hover { color: #0f172a; }
      .lang-switch-opt.is-active {
        background: #0f172a;
        color: #fff;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.25);
      }
      html[data-theme="dark"] .lang-switch {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.1);
      }
      html[data-theme="dark"] .lang-switch-opt { color: #a1a1aa; }
      html[data-theme="dark"] .lang-switch-opt:hover { color: #fff; }
      html[data-theme="dark"] .lang-switch-opt.is-active { background: #f4f4f5; color: #18181b; }
      .ot-language-banner {
        position: relative;
        z-index: 190;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.8rem 1rem;
        flex-wrap: wrap;
        padding: 0.6rem 1rem;
        background: linear-gradient(90deg, #eef2ff, #ecfeff);
        border-bottom: 1px solid rgba(79, 70, 229, 0.16);
        color: #312e81;
        font-size: 0.86rem;
        line-height: 1.4;
      }
      .ot-language-banner strong { font-weight: 750; }
      .ot-language-actions { display: inline-flex; gap: 0.4rem; }
      .ot-language-actions a,
      .ot-language-actions button {
        border: 1px solid rgba(79, 70, 229, 0.25);
        border-radius: 999px;
        padding: 0.35rem 0.75rem;
        background: #fff;
        color: #3730a3;
        font: inherit;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
      }
      .ot-language-actions a { color: #fff; border-color: #4f46e5; background: #4f46e5; }
      html[data-theme="dark"] .ot-language-banner {
        background: linear-gradient(90deg, #1e1b4b, #083344);
        border-bottom-color: rgba(165, 180, 252, 0.2);
        color: #e0e7ff;
      }
      html[data-theme="dark"] .ot-language-actions button {
        background: #1c1824;
        border-color: rgba(165, 180, 252, 0.3);
        color: #c7d2fe;
      }
      @media (max-width: 640px) {
        .lang-switch-opt { min-width: 1.9rem; height: 1.6rem; padding: 0 0.45rem; font-size: 0.72rem; }
        .ot-language-banner { padding: 0.55rem 0.75rem; text-align: center; }
      }
    `;
    document.head.appendChild(style);
  }
  ensureLanguageStyles();

  // Khách có trình duyệt tiếng Anh vào trang tiếng Việt: mời sang bản EN. Không tự chuyển hướng —
  // Googlebot cũng dùng tiếng Anh, tự redirect sẽ làm Google không index được bản tiếng Việt.
  function injectLanguagePrompt() {
    bindLanguageSwitch();
    injectHreflang();
    if (LANG === "en") return;
    const choice = getLanguageChoice();
    if (choice === "vi" || !prefersEnglish() || document.getElementById("otLanguageBanner")) return;

    const banner = document.createElement("section");
    banner.id = "otLanguageBanner";
    banner.className = "ot-language-banner";
    banner.setAttribute("aria-label", "Language preference");
    banner.setAttribute("lang", "en");
    banner.innerHTML = `
      <strong>🌐 This page is available in English</strong>
      <span class="ot-language-actions">
        <a href="${esc(languageUrls().en)}" id="otEnglishBtn" hreflang="en">View in English</a>
        <button type="button" id="otVietnameseBtn" lang="vi">Tiếng Việt</button>
      </span>`;

    const header = document.getElementById("siteHeader");
    if (header?.parentNode) header.insertAdjacentElement("afterend", banner);
    else document.body.prepend(banner);

    document.getElementById("otEnglishBtn")?.addEventListener("click", () => setLanguageChoice("en"));
    document.getElementById("otVietnameseBtn")?.addEventListener("click", () => {
      setLanguageChoice("vi");
      banner.remove();
    });
  }

  const ENGAGE_VERSION = "20261002e";

  function injectEngage() {
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifest = document.createElement("link");
      manifest.rel = "manifest";
      manifest.href = "/site.webmanifest";
      document.head.appendChild(manifest);
    }
    if (!document.querySelector('link[href*="engage.css"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = asset(`css/engage.css?v=${ENGAGE_VERSION}`);
      document.head.appendChild(css);
    }
    if (!document.querySelector('script[src*="engage.js"]')) {
      const js = document.createElement("script");
      js.src = asset(`js/engage.js?v=${ENGAGE_VERSION}`);
      js.defer = true;
      document.body.appendChild(js);
    }
  }

  function injectInAppBanner() {
    if (document.getElementById("otInAppBanner")) return;
    const ua = navigator.userAgent || "";
    const inApp =
      /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Line\/|Zalo|MicroMessenger|Twitter|TikTok|BytedanceWebview|Snapchat|Messenger/i.test(
        ua
      );
    if (!inApp) return;
    const el = document.createElement("div");
    el.id = "otInAppBanner";
    el.className = "ot-inapp-banner";
    el.setAttribute("role", "status");
    el.innerHTML =
      "<strong>Đang mở trong app</strong> — tải file dễ lỗi trên Facebook/Zalo. " +
      "Bấm <b>⋮</b> góc trên → <b>Mở bằng trình duyệt</b> (Chrome/Safari) để tải ổn định.";
    const header = document.getElementById("siteHeader");
    if (header && header.parentNode) {
      header.insertAdjacentElement("afterend", el);
    } else {
      document.body.prepend(el);
    }
  }

  try {
    injectCategorySeoMeta();
    enhanceHubPage();
    ensureToolPageStyles();
    injectSeo();
    injectAdSense();
  } catch (err) {
    console.error("[OneTool layout] seo", err);
  }
  try {
    injectChrome();
  } catch (err) {
    console.error("[OneTool layout] chrome", err);
  }
  try {
    injectLanguagePrompt();
  } catch (err) {
    console.error("[OneTool layout] language", err);
  }
  try {
    injectInAppBanner();
    injectCategoryCrumb();
    injectToolCrumb();
    injectCategorySeoBody();
    injectCategoryJsonLd();
    injectToolSeoBody();
  } catch (err) {
    console.error("[OneTool layout] extras", err);
  }
  try {
    injectEngage();
  } catch (err) {
    console.error("[OneTool layout] engage", err);
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(markChromeReady);
  });
})();
