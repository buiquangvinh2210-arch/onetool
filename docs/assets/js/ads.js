/*
 * OneTool — manual AdSense ad slots.
 *
 * Loaded by layout.js after the page chrome and SEO blocks are in place.
 * The AdSense library itself (adsbygoogle.js) is injected by layout.js.
 *
 * HOW TO TURN A SLOT ON
 *   1. AdSense > Ads > By ad unit > create the unit type listed next to the slot.
 *   2. Copy its data-ad-slot number (10 digits) into SLOTS below.
 *   3. Bump the ?v= of ads.js in layout.js so browsers fetch the new file.
 *   A slot with an empty id renders nothing, so the site stays clean until then.
 *
 * PREVIEW
 *   Add ?ads=preview to any URL to see every position as a dashed box,
 *   even before the ad units exist.
 *
 * NOTE: this file must stay free of Vietnamese text so the i18n build
 * does not fork it into ads.en.js; labels live in ads.css.
 */
(function () {
  "use strict";

  const CLIENT = "ca-pub-9591869402965389";

  // data-ad-slot ids from AdSense. Leave "" until the unit is created.
  const SLOTS = {
    toolAfter: "",   // Display ad, responsive   — under the tool, above the guide
    toolContent: "", // In-article ad            — inside the guide / FAQ text
    articleTop: "",  // In-article ad            — blog post, after the intro
    articleEnd: "",  // Display ad, responsive   — blog post, end of article
    listBottom: ""   // Multiplex ad             — home / category / blog index, bottom
  };

  const FORMATS = {
    display: { "data-ad-format": "auto", "data-full-width-responsive": "true" },
    inArticle: { "data-ad-format": "fluid", "data-ad-layout": "in-article", style: "display:block;text-align:center" },
    multiplex: { "data-ad-format": "autorelaxed" }
  };

  const params = new URLSearchParams(location.search);
  const PREVIEW = params.get("ads") === "preview";
  const OFF = params.get("ads") === "off";

  function shouldSkipPage() {
    if (OFF) return true;
    if (location.protocol === "file:") return true;
    // Pages marked <meta name="ot-ads" content="off"> never carry ads.
    if (document.querySelector('meta[name="ot-ads"][content="off"]')) return true;
    const tool = document.body.dataset.tool || "";
    // Legal / contact pages and the 404 page carry no ads.
    if (["about", "contact", "privacy", "terms"].includes(tool)) return true;
    if (/\/404(\.html)?$/i.test(location.pathname)) return true;
    return false;
  }

  function stylesheet() {
    if (document.querySelector('link[href*="css/ads.css"]')) return;
    const src = document.querySelector('script[src*="js/ads.js"]')?.getAttribute("src") || "";
    const base = src.replace(/js\/ads\.js.*$/, "");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = base + "css/ads.css?v=" + (src.split("?v=")[1] || "1");
    document.head.appendChild(link);
  }

  function build(name, format) {
    const id = SLOTS[name];
    if (!id && !PREVIEW) return null;

    const box = document.createElement("div");
    box.className = "ot-ad ot-ad--" + format;
    box.dataset.slot = name;
    box.setAttribute("data-nosnippet", "");

    if (!id) {
      box.classList.add("ot-ad--preview");
      box.innerHTML = '<span class="ot-ad-preview-name">' + name + " · " + format + "</span>";
      return box;
    }

    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", CLIENT);
    ins.setAttribute("data-ad-slot", id);
    const attrs = FORMATS[format] || FORMATS.display;
    for (const k in attrs) {
      if (k === "style") ins.style.cssText = attrs[k];
      else ins.setAttribute(k, attrs[k]);
    }
    box.appendChild(ins);
    return box;
  }

  function place(name, format, anchor, where) {
    if (!anchor) return;
    const box = build(name, format);
    if (!box) return;
    anchor.insertAdjacentElement(where, box);
    if (box.querySelector("ins.adsbygoogle")) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        /* ad blocked or library missing: leave the empty box hidden by CSS */
      }
    }
  }

  function toolPage(main) {
    const seo = document.getElementById("toolSeo");
    // 1) Right after the tool UI, before the guide.
    if (seo) place("toolAfter", "display", seo, "beforebegin");
    else place("toolAfter", "display", main, "beforeend");

    // 2) Inside the guide, after the second text block (kept away from buttons).
    const blocks = seo ? seo.querySelectorAll(".tool-seo-block") : [];
    if (blocks.length >= 3) place("toolContent", "inArticle", blocks[1], "afterend");
  }

  function articlePage() {
    const prose = document.querySelector(".blog-prose");
    if (!prose) return;
    const heads = prose.querySelectorAll(":scope > h2");
    // 1) Before the second H2 (after intro + first section). Fallback: first H2.
    const top = heads[1] || heads[0];
    if (top) place("articleTop", "inArticle", top, "beforebegin");
    // 2) End of the article body, before "read next".
    place("articleEnd", "display", prose, "afterend");
  }

  function listPage(main) {
    place("listBottom", "multiplex", main, "beforeend");
  }

  function run() {
    if (shouldSkipPage()) return;
    const main = document.querySelector("main");
    if (!main) return;

    const cat = document.body.dataset.cat || "";
    const tool = document.body.dataset.tool || "";

    if (tool === "blog-article") articlePage();
    else if (cat !== "home" && cat !== "hub" && !tool.endsWith("-index")) toolPage(main);
    else listPage(main);

    if (document.querySelector(".ot-ad")) stylesheet();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
