// Dựng trang chủ kiểu "tạp chí" (bản B): hero + danh sách nổi bật, dải danh mục nhiều màu,
// ba cam kết, khối danh mục (HTML tĩnh cho SEO), hướng dẫn blog, trích dẫn, dải kêu gọi.
//   node scripts/prerender-home.mjs   rồi   node scripts/i18n/build-en.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(DOCS, "assets/js/catalog.js"), "utf8"), ctx);
const C = ctx.window.OTCatalog;
const live = C.tools.filter((t) => !t.hub);
const bySlug = (s) => live.find((t) => t.slug === s);

const TONE = { ai: "ai", media: "media", "pdf-tools": "pdf", images: "image", utilities: "utility", "file-converter": "data", developer: "dev", units: "units" };
const ICON = {
  pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  media: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m10 9 5 3-5 3z"/>',
  ai: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4"/>',
  utility: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  dev: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  units: '<path d="M7 4 3 8l4 4"/><path d="M3 8h18"/><path d="m17 20 4-4-4-4"/><path d="M21 16H3"/>'
};
const svg = (k) => `<svg class="ed-i" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
const ARR = '<svg class="ed-i ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>';
const NEXT = '<svg class="ed-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
const NUM = ["01", "02", "03", "04", "05", "06", "07", "08"];
const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const tone = (t) => TONE[t.cat] || "ai";

const top = ["pdf-to-word", "remove-background", "audio-to-text", "pdf-merge", "tiktok-download"].map(bySlug).filter(Boolean);
const popular = ["heic-convert", "vietqr", "image-compress"].map(bySlug).filter(Boolean);

const SEARCH_ICON = '<svg class="ed-i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const HERO = `<section class="hx-hero">
  <div class="container hx-inner">
    <p class="hx-badge"><span class="hx-dot"></span><span><b id="otToolCount">${live.length}</b> công cụ miễn phí · không cần đăng ký</span></p>
    <h1>Mọi công cụ file bạn cần,<br /><em>ngay trên trình duyệt.</em></h1>
    <p class="hx-lead">PDF, ảnh, video và AI tiếng Việt trong một nơi. Mở trang là dùng — không cài đặt, không tài khoản, không watermark.</p>
    <button type="button" class="hx-search" data-open-search>${SEARCH_ICON}<span class="hx-search-text">Tìm công cụ — ví dụ: gộp PDF, xóa nền…</span><span class="hx-search-go"><span>Tìm</span>${NEXT}</span></button>
    <p class="hx-popular">Phổ biến:${popular.map((t) => `<a data-tone="${tone(t)}" href="${C.hrefFor(t)}">${t.name}</a>`).join("")}</p>
  </div>
</section>
<div class="container">
<section class="hx-top" aria-label="Được dùng nhiều">
  <div class="hx-top-h"><span>Được dùng nhiều</span></div>
  <div class="hx-top-grid">
    ${top.map((t) => `<a class="hx-card" data-tone="${tone(t)}" href="${C.hrefFor(t)}"><span class="hx-card-ic">${ctx.window.OTToolIcon(t.slug, t.cat)}</span><b>${t.name}</b><small>${t.desc}</small></a>`).join("\n    ")}
    <a class="hx-card hx-card--all" href="cong-cu.html"><span class="hx-card-ic">${NEXT}</span><b>Tất cả công cụ</b><small>AI · PDF · Ảnh · Media · Tiện ích · Lập trình</small></a>
  </div>
</section>
<nav class="ed-strip" aria-label="Danh mục công cụ">
  ${C.categories.map((c) => `<a data-tone="${TONE[c.slug]}" href="${c.seo}.html"><span>${svg(TONE[c.slug])}</span>${esc(c.name.replace(/^Công cụ /, ""))}</a>`).join("\n  ")}
</nav>
<div class="ed-pillars">
  <div data-tone="data"><span class="n">i.</span><h3>Riêng tư</h3><p>PDF và ảnh được xử lý ngay trong trình duyệt. File của bạn không rời khỏi máy.</p></div>
  <div data-tone="pdf"><span class="n">ii.</span><h3>Tức thì</h3><p>Kéo thả, xử lý, tải về. Phần lớn công việc xong trong vài giây.</p></div>
  <div data-tone="ai"><span class="n">iii.</span><h3>Miễn phí</h3><p>Không đăng ký, không watermark, không giới hạn ẩn.</p></div>
</div>
</div>`;

const cats = C.categories.map((c, i) => {
  const all = live.filter((t) => t.cat === c.slug);
  const list = all.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.rank ?? 99) - (b.rank ?? 99)).slice(0, 8);
  if (!list.length) return "";
  const k = TONE[c.slug];
  return `<section class="ed-cat" data-tone="${k}">
      <div class="ed-cat-l">
        <span class="ed-cat-ic">${ctx.window.OTCatIcon(c.slug)}</span>
        <span class="n">${NUM[i]}</span>
        <h3><a href="${c.seo}.html">${esc(c.name)}</a></h3>
        <p>${esc(c.desc)}</p>
        <a class="ed-cat-all" href="${c.seo}.html">Xem tất cả ›</a>
      </div>
      <div class="ed-rows">
        ${list.map((t) => `<a class="ed-row" href="${C.hrefFor(t)}"><span class="ed-row-ic">${ctx.window.OTToolIcon(t.slug, t.cat)}</span><span class="ed-row-tx"><b>${t.name}</b><span>${t.desc}</span></span>${ARR}</a>`).join("\n        ")}
      </div>
    </section>`;
}).join("\n    ");

const SHOWCASE = `<section class="home-showcase">
  <div class="container">
    <div class="ed-sec-h">
      <div><span class="ed-kicker">Danh mục</span><h2>Tám bộ công cụ,<br /><em>một</em> nơi duy nhất.</h2></div>
      <a class="btn btn-outline btn-lg" href="cong-cu.html">Tất cả công cụ</a>
    </div>
    ${cats}
  </div>
</section>`;

const TAIL = `<div class="container">
  <div class="ed-quote">
    <p>Công cụ tốt là công cụ bạn quên mất mình đang dùng — chỉ thấy việc đã xong.</p>
    <small>Tinh thần OneTool</small>
  </div>
  <section class="ed-cta">
    <h2>Bắt đầu với <em>một file</em><br />bất kỳ.</h2>
    <a class="btn btn-lg" href="cong-cu.html">Khám phá công cụ →</a>
  </section>
</div>`;

const file = path.join(DOCS, "index.html");
let h = fs.readFileSync(file, "utf8");
const guides = (h.match(/<section class="home-guides"[\s\S]*?\n<\/section>/) || [""])[0];
if (!guides) throw new Error("không tìm thấy khối home-guides");
const main = `<main role="main">

${HERO}

${SHOWCASE}

${guides}

${TAIL}

</main>`;
h = h.replace(/<main role="main">[\s\S]*?<\/main>/, main);
if (!h.includes("data-open-search]")) {
  h = h.replace(/(if \(typeof initHomeMotion === "function"\) initHomeMotion\(\);)/,
    `$1\n  document.querySelectorAll("[data-open-search]").forEach((b) => b.addEventListener("click", () => document.getElementById("toolSearchBtn")?.click()));`);
}
fs.writeFileSync(file, h);
console.log(`home: ${top.length} top tools, ${(cats.match(/class="ed-cat"/g) || []).length} categories`);
