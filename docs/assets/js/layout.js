(function () {
  "use strict";

  const base = (window.OT_BASE || ".").replace(/\/$/, "");
  const href = (p) => (base === "." || base === "" ? p : `${base}/${p}`);
  const homeHref = () => (base === "." || base === "" ? "./" : `${base}/`);
  const asset = (p) => href(`assets/${p}`);

  // Skin + tool chrome CSS (once)
  ["css/skins.css", "css/tool-chrome.css", "css/chrome.css", "css/readability.css", "css/mobile.css?v=20260824a", "css/dark-tools.css?v=20260824a"].forEach((file) => {
    if (!document.querySelector(`link[href*="${file.replace(/\//g, "/")}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = asset(file);
      document.head.appendChild(link);
    }
  });

  // Favicon
  if (!document.querySelector('link[rel="icon"]')) {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/svg+xml";
    icon.href = asset("img/favicon.svg");
    document.head.appendChild(icon);
  }
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    apple.href = asset("img/favicon.svg");
    document.head.appendChild(apple);
  }

  function pathToolMeta() {
    const path = location.pathname.replace(/\\/g, "/").toLowerCase();
    const file = path.split("/").pop() || "";

    if (file === "about.html") {
      return { cat: "home", tool: "about" };
    }

    if (file === "lien-he.html") {
      return { cat: "home", tool: "contact" };
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
        return { cat: c.slug, tool: rest };
      }
    }
    return { cat: "home", tool: "home" };
  }

  const meta = pathToolMeta();
  document.body.dataset.cat = meta.cat;
  document.body.dataset.tool = meta.tool;

  const SITE_ORIGIN = "https://onetool.vn";
  const OG_IMAGE = SITE_ORIGIN + "/assets/img/og-cover.svg";

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
    const pack = window.OTCatalog?.pageMeta?.[meta.tool];
    if (!pack) return;
    if (pack.title) document.title = pack.title;
    if (pack.desc) {
      let desc = document.querySelector('meta[name="description"]');
      if (!desc) {
        desc = document.createElement("meta");
        desc.name = "description";
        document.head.appendChild(desc);
      }
      desc.setAttribute("content", pack.desc);
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
    setMeta("property", "og:locale", "vi_VN", true);
    setMeta("property", "og:url", url, true);
    setMeta("property", "og:image", OG_IMAGE, true);
    setMeta("property", "og:image:alt", "OneTool — công cụ file online miễn phí", true);
    setMeta("name", "twitter:card", "summary_large_image", true);
    setMeta("name", "twitter:title", title, true);
    setMeta("name", "twitter:description", desc, true);
    setMeta("name", "twitter:image", OG_IMAGE, true);

    if (location.protocol !== "file:") {
      setLink("canonical", url);
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
      logo: SITE_ORIGIN + "/assets/img/favicon.svg",
      telephone: "+84-982-945-576",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+84-982-945-576",
        contactType: "customer support",
        availableLanguage: ["Vietnamese"],
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
            offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
            description: desc,
            inLanguage: "vi",
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
                url: SITE_ORIGIN + "/",
                description: desc,
                inLanguage: "vi",
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
        inLanguage: "vi",
        step: seoCopy.howto.map((text, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text
        }))
      });
      document.head.appendChild(how);
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
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_ORIGIN + "/" },
          { "@type": "ListItem", position: 2, name: "Công cụ", item: SITE_ORIGIN + "/cong-cu.html" },
          cat
            ? { "@type": "ListItem", position: 3, name: cat.name, item: SITE_ORIGIN + "/" + cat.seo + ".html" }
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
      <a class="nav-mega-link" href="${href(`${c.seo}.html`)}">
        <em>${c.icon}</em>
        <span><strong>${esc(c.name)}</strong><small>${esc(c.desc)}</small></span>
      </a>`).join("");
    return links || "";
  }

  function buildDrawerMenu() {
    const cats = window.OTCatalog?.categories || [];
    const tools = window.OTCatalog?.tools || [];
    return cats.map((cat) => {
      const items = tools.filter((t) => t.cat === cat.slug && !t.hub);
      const toolLinks = items.map((t) => `
        <a class="nav-drawer-tool" href="${href(`${cat.seo}/${t.slug}.html`)}">
          <em>${t.icon}</em><span>${esc(t.name)}</span>
        </a>`).join("");
      return `
        <div class="nav-drawer-group">
          <a class="nav-drawer-cat" href="${href(`${cat.seo}.html`)}">
            ${cat.icon} ${esc(cat.name)} <span>${items.length} tool</span>
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
    const toolCount = window.OTCatalog?.tools?.filter((t) => !t.hub)?.length || "18";

    if (headerHost) {
      headerHost.outerHTML = `
<header class="site-header" id="siteHeader">
  <div class="header-shell">
    <div class="container header-inner">
      <a class="logo logo--rich" href="${homeHref()}">
        <span class="logo-icon">✨</span>
        <span class="logo-stack">
          <span class="logo-text">OneTool</span>
          <span class="logo-tag">${toolCount}+ công cụ · Miễn phí</span>
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
        <a href="${href("lien-he.html")}" data-nav="contact">Liên hệ</a>
      </nav>
      <div class="header-actions">
        <button type="button" class="btn-icon" id="themeToggle" aria-label="Đổi giao diện sáng/tối">🌙</button>
        <a class="btn btn-primary btn-glow btn-header-cta header-cta-desktop" href="${href("cong-cu.html")}">Tất cả công cụ</a>
        <button type="button" class="btn-icon mobile-menu-toggle" id="mobileMenuToggle" aria-label="Mở menu" aria-expanded="false" aria-controls="navDrawer">☰</button>
      </div>
    </div>
  </div>
</header>
<div class="nav-drawer" id="navDrawer" aria-hidden="true">
  <div class="nav-drawer-backdrop" id="navDrawerBackdrop" tabindex="-1"></div>
  <aside class="nav-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
    <div class="nav-drawer-head">
      <a class="logo" href="${homeHref()}">
        <span class="logo-icon">✨</span>
        <span class="logo-text">OneTool</span>
      </a>
      <button type="button" class="nav-drawer-close" id="navDrawerClose" aria-label="Đóng menu">✕</button>
    </div>
    <div class="nav-drawer-primary">
      <a href="${homeHref()}">🏠 Trang chủ</a>
      <a href="${href("cong-cu.html")}">⚡ Tất cả công cụ</a>
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
      footerHost.outerHTML = `
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
      <a class="logo footer-logo" href="${homeHref()}">
        <span class="logo-icon">✨</span>
        <span class="logo-text">OneTool</span>
      </a>
      <p class="footer-brand-desc">Công cụ file online cho người Việt — nhanh, riêng tư, miễn phí.</p>
      <div class="footer-social">
        <a href="${href("cong-cu.html")}" title="Công cụ">⚡</a>
        <a href="${href("about.html")}" title="Giới thiệu">ℹ</a>
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
          <a href="${href("cong-cu-anh/image-convert.html")}">Convert ảnh</a>
          <a href="${href("cong-cu-pdf/pdf-merge.html")}">Gộp PDF</a>
          <a href="${href("cong-cu-anh/remove-background.html")}">Xóa nền ảnh</a>
          <a href="${href("cong-cu-media/audio-to-text.html")}">Audio → Text</a>
          <a href="${href("cong-cu-media/video-convert.html")}">Nén / Convert video</a>
        </div>
      </div>
      <div class="footer-col footer-col--contact">
        <h4>Liên hệ &amp; Góp ý</h4>
        <div class="footer-links">
          <a href="${href("lien-he.html")}">Gửi góp ý</a>
          <span class="footer-plain">0982 945 576</span>
          <a href="${href("about.html")}">Giới thiệu</a>
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
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function injectToolCrumb() {
    const isTool = meta.cat !== "home" && meta.cat !== "hub" && !String(meta.tool).endsWith("-index");
    if (!isTool || document.getElementById("otCrumb")) return;

    const cat = window.OTCatalog?.catBySlug?.(meta.cat);
    const tool = window.OTCatalog?.toolBySlug?.(meta.tool);
    const toolLabel = tool?.name || document.title.replace(/\s*\|\s*OneTool$/, "").trim();
    const catLabel = cat?.name || meta.cat;
    const catHref = cat ? href(`${cat.seo}.html`) : href("cong-cu.html");

    document.querySelectorAll(".breadcrumb, .rb-crumb, .at-crumb, .ir-crumb").forEach((el) => el.remove());

    const nav = document.createElement("nav");
    nav.className = "ot-crumb-wrap";
    nav.id = "otCrumb";
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

    const main = document.querySelector("main");
    if (main) main.prepend(nav);
  }

  function injectToolSeoBody() {
    const isTool = meta.cat !== "home" && meta.cat !== "hub" && !String(meta.tool).endsWith("-index");
    if (!isTool || !window.OTCatalog) return;
    const main = document.querySelector("main");
    if (!main || document.getElementById("toolSeo")) return;

    const tool = OTCatalog.toolBySlug(meta.tool);
    const copy = OTCatalog.seo[meta.tool];
    if (!tool || !copy?.sections?.length) return;

    const related = OTCatalog.relatedTools(meta.tool, 6);
    const blocks = copy.sections.map((sec) => {
      const paras = (sec.paras || []).map((p) => `<p>${rich(p)}</p>`).join("");
      const list = sec.list?.length
        ? `<ul>${sec.list.map((item) => `<li><strong>${esc(item.title)}</strong> ${rich(item.text)}</li>`).join("")}</ul>`
        : "";
      return `<section class="tool-seo-block"><h2>${esc(sec.title)}</h2>${paras}${list}</section>`;
    }).join("");

    const more = related
      .map((t) => {
        const cat = OTCatalog.catBySlug(t.cat);
        const hubTool = t.hub ? OTCatalog.toolBySlug(t.hub) : null;
        const hubCat = hubTool ? OTCatalog.catBySlug(hubTool.cat) : null;
        const target = hubCat
          ? href(`${hubCat.seo}/${hubTool.slug}.html`)
          : href(`${cat.seo}/${t.slug}.html`);
        return `<li><a class="tool-seo-card" href="${target}">
          <span class="tool-seo-card-icon" aria-hidden="true">${esc(t.icon)}</span>
          <span class="tool-seo-card-body">
            <strong class="tool-seo-card-title">${esc(t.name)}</strong>
            <span class="tool-seo-card-sapo">${esc(t.desc)}</span>
          </span>
        </a></li>`;
      })
      .join("");

    const section = document.createElement("section");
    section.className = "tool-seo";
    section.id = "toolSeo";
    section.innerHTML = `
      <div class="tool-seo-wrap">
        ${blocks}
        ${more ? `<section class="tool-seo-block"><h2>Công cụ khác trên OneTool</h2>
          <ul class="tool-seo-more">${more}</ul></section>` : ""}
      </div>`;
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

    if (!document.querySelector('link[href*="category.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = asset("css/category.css");
      document.head.appendChild(link);
    }

    document.body.classList.add("cat-page");
  }

  function injectCategoryCrumb() {
    if (!isCategoryIndex() || document.getElementById("otCrumb")) return;
    const cat = window.OTCatalog?.catBySlug?.(meta.cat);
    if (!cat) return;

    const nav = document.createElement("nav");
    nav.className = "ot-crumb-wrap";
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
      inLanguage: "vi",
      url: canonicalUrl(),
      hasPart: tools.map((t) => ({
        "@type": "WebApplication",
        name: t.name,
        description: t.desc,
        url: SITE_ORIGIN + "/" + cat.seo + "/" + t.slug + ".html"
      }))
    });
    document.head.appendChild(ld);
  }

  try {
    injectCategorySeoMeta();
    injectSeo();
    injectChrome();
    injectCategoryCrumb();
    injectToolCrumb();
    injectCategorySeoBody();
    injectCategoryJsonLd();
    injectToolSeoBody();
  } catch (err) {
    console.error("[OneTool layout]", err);
  }
})();
