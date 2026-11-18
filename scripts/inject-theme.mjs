// Nạp giao diện "tạp chí" vào mọi trang VI, đặt cuối <head> để ghi đè CSS cũ:
//   font Inter, theme.css (làm phẳng lớp cũ), editorial.css (giao diện chính).
//   node scripts/inject-theme.mjs   rồi   node scripts/i18n/build-en.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs");
const VER = "20261118s";
const FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
let n = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!["en", "assets", "_preview"].includes(e.name)) walk(p); continue; }
    if (!e.name.endsWith(".html")) continue;
    let h = fs.readFileSync(p, "utf8");
    const m = h.match(/href="((?:\.\.\/)*)assets\/css\/site\.css/);
    if (!m) continue;
    h = h.replace(/\s*<link rel="stylesheet" href="[^"]*assets\/css\/(?:theme|bento|editorial)\.css[^"]*" \/>/g, "");
    h = h.replace(/\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=(?:Be\+Vietnam\+Pro|Manrope|Inter)[^"]*" \/>/g, "");
    h = h.replace(/(\s*)<\/head>/i, `\n  <link rel="stylesheet" href="${FONTS}" />
  <link rel="stylesheet" href="${m[1]}assets/css/theme.css?v=${VER}" />
  <link rel="stylesheet" href="${m[1]}assets/css/editorial.css?v=${VER}" />$1</head>`);
    fs.writeFileSync(p, h);
    n++;
  }
}
walk(DOCS);
console.log(`editorial theme added to ${n} pages`);
