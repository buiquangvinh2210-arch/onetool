(async function () {
  "use strict";

  const SYNC_META = new URLSearchParams(location.search).has("sync");
  const logEl = document.getElementById("log");
  const log = (s) => { logEl.textContent += "\n" + s; };

  const escText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escAttr = (s) => escText(s).replace(/"/g, "&quot;");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function capture(url, file) {
    const f = document.createElement("iframe");
    f.style.cssText = "position:fixed;left:-3000px;top:0;width:1280px;height:900px";
    f.src = url;
    document.body.appendChild(f);
    for (let i = 0; i < 200; i++) {
      await sleep(50);
      const w = f.contentWindow;
      if (w && w.OTChromeHtml && w.OTChromeHtml.footer && f.contentDocument.readyState !== "loading") break;
    }
    await sleep(200);
    const w = f.contentWindow;
    const d = f.contentDocument;
    const cap = {
      header: w.OTChromeHtml?.header || "",
      footer: w.OTChromeHtml?.footer || "",
      crumb: d.getElementById("otCrumb")?.outerHTML || "",
      ld: [...d.querySelectorAll('script[type="application/ld+json"][id^="ot-jsonld"]')]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((s) => s.outerHTML.replace(/https:\/\/onetool\.vn\/docs\//g, "https://onetool.vn/")),
      catSeo: d.getElementById("catSeo")?.outerHTML || "",
      toolSeo: (() => {
        const el = d.getElementById("toolSeo");
        return el && el.dataset.static !== "1" ? el.outerHTML : "";
      })(),
      lead: d.querySelector(".cat-hero-lead")?.innerHTML ?? null,
      count: d.querySelector(".cat-hero-count")?.outerHTML || "",
      title: d.title,
      desc: d.querySelector('meta[name="description"]')?.getAttribute("content") || "",
      toolCount: (w.OTCatalog?.tools || []).filter((t) => !t.hub).length,
      grids: {}
    };
    const pageSeo = file.replace(/\.html$/, "");
    const render = (fn, ...args) => {
      const box = d.createElement("div");
      fn(box, ...args);
      return box.innerHTML;
    };
    if (d.getElementById("homeToolRows")) cap.grids.homeToolRows = render(w.renderHomeShowcase);
    if (d.getElementById("catTools")) cap.grids.catTools = render(w.renderToolGrid, { categorySeo: pageSeo });
    if (d.getElementById("allTools")) cap.grids.allTools = render(w.renderToolGrid);
    if (d.getElementById("catFilter")) {
      const isCat = (w.OTCatalog?.categories || []).some((c) => c.seo === pageSeo);
      cap.grids.catFilter = render(w.renderCategoryChips, isCat ? pageSeo : null);
    }
    f.remove();
    return cap;
  }

  function block(id, inner) {
    return { re: new RegExp(`<div id="${id}"[^>]*>(?:[\\s\\S]*?</div><!--/${id}-->|</div>)`), html: `<div id="${id}">\n${inner.trim()}\n</div><!--/${id}-->` };
  }

  function transform(src, cap) {
    let h = src;
    for (const [id, inner] of [["site-header", cap.header], ["site-footer", cap.footer]]) {
      if (!inner) continue;
      const b = block(id, inner);
      h = h.replace(b.re, () => b.html);
    }

    if (cap.crumb) {
      h = h.replace(/\s*<nav[^>]*id="otCrumb"[\s\S]*?<\/nav>/, "");
      h = h.replace(/<main[^>]*>/, (m) => `${m}\n${cap.crumb}`);
    }

    h = h.replace(/\s*<script type="application\/ld\+json" id="ot-jsonld[^"]*">[\s\S]*?<\/script>/g, "");
    if (cap.ld.length) h = h.replace(/\s*<\/head>/, (m) => `\n  ${cap.ld.join("\n  ")}${m}`);

    for (const [id, inner] of Object.entries(cap.grids)) {
      const re = new RegExp(`(<div[^>]*id="${id}"[^>]*>)(?:[\\s\\S]*?</div><!--/${id}-->|</div>)`);
      h = h.replace(re, (_, open) => `${open}\n${inner.trim()}\n</div><!--/${id}-->`);
    }

    if (cap.toolSeo) {
      h = h.replace(/<section class="tool-seo" id="toolSeo"(?![^>]*data-static)[^>]*>[\s\S]*?<\/section>(\s*<\/main>)/, (_, end) => cap.toolSeo + end);
    }

    h = h.replace(/\s*<section class="cat-seo" id="catSeo">[\s\S]*?<\/section><!--\/catSeo-->/, "");
    if (cap.catSeo) h = h.replace(/\s*<\/main>/, (m) => `\n${cap.catSeo}<!--/catSeo-->${m}`);

    if (cap.lead != null) {
      h = h.replace(/(<p class="cat-hero-lead">)[\s\S]*?(<\/p>)/, (_, a, b) => a + cap.lead + b);
      h = h.replace(/\s*<p class="cat-hero-count">[\s\S]*?<\/p>/, "");
      if (cap.count) h = h.replace(/<p class="cat-hero-lead">[\s\S]*?<\/p>/, (m) => `${m}\n  ${cap.count}`);
    }

    h = h.replace(/\s*<nav class="tool-crawl-index"[\s\S]*?<\/nav>/, "");
    if (cap.toolCount) h = h.replace(/(<strong id="otToolCount">)\d+(<\/strong>)/, (_, a, b) => a + cap.toolCount + b);

    if (SYNC_META) {
      if (cap.title) h = h.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escText(cap.title)}</title>`);
      if (cap.desc) h = h.replace(/(<meta name="description" content=")[^"]*(")/, (_, a, b) => a + escAttr(cap.desc) + b);
    }
    return h;
  }

  const sm = await (await fetch("/docs/sitemap.xml", { cache: "no-store" })).text();
  const paths = [...sm.matchAll(/<loc>https:\/\/onetool\.vn\/([^<]*)<\/loc>/g)].map((m) =>
    !m[1] || m[1].endsWith("/") ? m[1] + "index.html" : m[1]
  );

  const out = {};
  const report = [];
  for (const p of paths) {
    const src = await (await fetch("/docs/" + p, { cache: "no-store" })).text();
    const cap = await capture("/docs/" + p, p.split("/").pop());
    if (!cap.header || !cap.footer) { log("BỎ QUA (layout không chạy): " + p); continue; }
    const doc = new DOMParser().parseFromString(src, "text/html");
    const srcTitle = doc.title;
    const srcDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    if (srcTitle !== cap.title || srcDesc !== cap.desc) {
      report.push({ p, srcTitle, runTitle: cap.title, srcDesc, runDesc: cap.desc });
    }
    const html = transform(src, cap);
    if (html !== src) out[p] = html;
    log(`${p}  ${html !== src ? "đổi" : "giữ"}`);
  }
  window.__report = report;
  window.__out = out;
  log(`\nXong: ${Object.keys(out).length}/${paths.length} trang thay đổi, ${report.length} trang lệch title/description.`);
})();
