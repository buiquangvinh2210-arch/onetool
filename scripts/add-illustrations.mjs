// Gắn ảnh minh họa (docs/assets/img/illus/*.svg) vào trang danh mục, trang công cụ và blog.
// Chạy lại an toàn: ảnh đã gắn sẽ được thay chứ không nhân đôi.
//   node scripts/add-illustrations.mjs   rồi   node scripts/i18n/build-en.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs");
const CSS_VER = "20261118b";

const ALT = {
  pdf: "Minh họa công cụ PDF: gộp, nén và chuyển đổi file PDF",
  image: "Minh họa công cụ ảnh: cắt, nén và đổi định dạng ảnh",
  media: "Minh họa công cụ media: video, nhạc và file MP3",
  ai: "Minh họa công cụ AI: chuyển giọng nói thành văn bản",
  utility: "Minh họa tiện ích: máy tính, mã QR và lịch",
  data: "Minh họa chuyển đổi dữ liệu: bảng Excel sang JSON",
  dev: "Minh họa công cụ lập trình: JSON, Base64, Regex",
  units: "Minh họa đổi đơn vị: khối lượng, nhiệt độ, chiều dài"
};
const CATEGORY = {
  "cong-cu-pdf": "pdf", "cong-cu-anh": "image", "cong-cu-media": "media", "cong-cu-ai": "ai",
  "cong-cu-tien-ich": "utility", "cong-cu-chuyen-doi": "data", "cong-cu-lap-trinh": "dev", "cong-cu-don-vi": "units"
};
const TOOL_OVERRIDE = {
  "audio-to-text": "ai", "subtitle-srt": "ai", "text-to-speech": "ai", "ai-summarize": "ai",
  "ocr-table": "data", "convert-data": "data", "excel-convert": "data", "pdf-to-excel": "data",
  "text-convert": "dev", "word-counter": "dev", "image-pdf": "pdf", "image-to-pdf": "pdf"
};
const BLOG = {
  "anh-sang-pdf": "pdf", "cach-tinh-luong-net-2026": "utility", "chuyen-giong-noi-thanh-van-ban": "ai",
  "ghep-pdf-khong-can-phan-mem": "pdf", "heic-sang-jpg-iphone": "image", "ky-pdf-online": "pdf",
  "nen-pdf-gui-zalo": "pdf", "pdf-sang-word-online": "pdf", "tai-tiktok-khong-logo": "media",
  "tao-ma-vietqr": "utility", "video-sang-mp3": "media", "xoa-nen-anh-shopee": "image"
};

const img = (base, key, cls, eager) =>
  `<img class="ot-illus ${cls}" src="${base}assets/img/illus/${key}.svg" alt="${ALT[key]}" width="480" height="320"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async" />`;

function ensureCss(html, base) {
  html = html.replace(/\s*<link rel="stylesheet" href="[^"]*illus\.css[^"]*" \/>/g, "");
  return html.replace(/(\s*)<\/head>/i, `\n  <link rel="stylesheet" href="${base}assets/css/illus.css?v=${CSS_VER}" />$1</head>`);
}
const strip = (html) => html.replace(/<img class="ot-illus [^>]*>\s*/g, "").replace(/<figure class="blog-cover">[\s\S]*?<\/figure>\s*/g, "");

// gắn màu danh mục lên <body data-tone="..."> (theme.css tô màu theo đó)
const tone = (html, key) => html.replace(/<body([^>]*)>/, (m, attrs) => `<body${attrs.replace(/ data-tone="[^"]*"/, "")} data-tone="${key}">`);
const iconImg = (base, key, cls) =>
  `<img class="ot-illus ${cls}" src="${base}assets/img/illus/${key}-icon.svg" alt="${ALT[key]}" width="144" height="156" fetchpriority="high" decoding="async" />`;

let n = 0;
function write(file, html) {
  fs.writeFileSync(file, html);
  n++;
}

// 1) Trang danh mục: cong-cu-*.html
for (const [seo, key] of Object.entries(CATEGORY)) {
  const file = path.join(DOCS, seo + ".html");
  if (!fs.existsSync(file)) continue;
  let h = strip(fs.readFileSync(file, "utf8"));
  if (!/<section class="cat-hero">/.test(h)) continue;
  h = h.replace(/(<span class="cat-hero-eyebrow">)/, `${iconImg("", key, "cat-hero-art")}\n  $1`);
  write(file, ensureCss(tone(h, key), ""));
}

// 2) Trang công cụ: có khối tool-seo tĩnh
for (const [seo, catKey] of Object.entries(CATEGORY)) {
  const dir = path.join(DOCS, seo);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".html") || name === "index.html") continue;
    const file = path.join(dir, name);
    const key = TOOL_OVERRIDE[name.replace(/\.html$/, "")] || catKey;
    let h = tone(strip(fs.readFileSync(file, "utf8")), key);
    if (!/<section class="tool-seo"[^>]*>/.test(h) || /noindex/.test(h.slice(0, 4000))) { write(file, h); continue; }
    // ảnh đặt ở đầu khối giới thiệu thứ hai (đoạn "X là gì?"), nếu không có thì khối đầu tiên
    const blocks = [...h.matchAll(/<section class="tool-seo-block">\s*<h2>[^<]*<\/h2>/g)];
    const target = blocks[1] || blocks[0];
    if (!target) continue;
    const at = target.index + target[0].length;
    h = h.slice(0, at) + "\n      " + img("../", key, "tool-seo-art", false) + h.slice(at);
    write(file, ensureCss(h, "../"));
  }
}

// 3) Blog: ảnh bìa bài viết + ảnh nhỏ ở trang danh sách
for (const [slug, key] of Object.entries(BLOG)) {
  const file = path.join(DOCS, "blog", slug + ".html");
  if (!fs.existsSync(file)) continue;
  let h = strip(fs.readFileSync(file, "utf8"));
  h = h.replace(/(<\/header>\s*)(<div class="blog-prose">)/, `$1<figure class="blog-cover">${img("../", key, "", true)}</figure>\n    $2`);
  write(file, ensureCss(h, "../"));
}
{
  const file = path.join(DOCS, "blog", "index.html");
  let h = strip(fs.readFileSync(file, "utf8"));
  h = h.replace(/<a class="blog-card(?: has-thumb)?" href="([^"]+)\.html">/g, (m, slug) => {
    const key = BLOG[slug];
    if (!key) return m;
    return `<a class="blog-card has-thumb" href="${slug}.html">\n        ${img("../", key, "blog-card-thumb", false)}`;
  });
  write(file, ensureCss(h, "../"));
}
// 4) Trang chủ: ảnh nhỏ cạnh tiêu đề mỗi nhóm công cụ (khớp với site.js renderHomeShowcase)
{
  const file = path.join(DOCS, "index.html");
  let h = strip(fs.readFileSync(file, "utf8"));
  const SEO_KEY = Object.fromEntries(Object.entries(CATEGORY).map(([seo, k]) => [seo, k]));
  h = h.replace(/(<div class="home-cat-row-head">)(\s*<h2 class="home-cat-row-title">\s*<a class="home-cat-row-title-link" href="([a-z-]+)\.html")/g, (m, open, rest, seo) => {
    const key = SEO_KEY[seo];
    if (!key) return m;
    return `${open}\n          <img class="ot-illus home-cat-row-art" src="assets/img/illus/${key}-icon.svg" alt="" width="144" height="156" loading="lazy" decoding="async" />${rest}`;
  });
  write(file, ensureCss(h, ""));
}

// 5) Giới thiệu: ảnh ở cột bên phải, trên các con số
{
  const file = path.join(DOCS, "about.html");
  let h = strip(fs.readFileSync(file, "utf8"));
  h = h.replace(/(<aside class="about-visual">)/, `$1${img("", "pdf", "about-art", true)}`);
  write(file, ensureCss(h, ""));
}

console.log(`illustrations added to ${n} pages`);
