// Báo cho Bing / Yandex / Seznam… (IndexNow) các trang mới hoặc vừa sửa.
//
//   node scripts/indexnow.mjs                      -> gửi các trang đổi trong commit gần nhất
//   node scripts/indexnow.mjs --since 2a53d59      -> gửi các trang đổi từ commit đó đến nay
//   node scripts/indexnow.mjs --all                -> gửi toàn bộ URL trong sitemap.xml
//   node scripts/indexnow.mjs /blog/abc.html ...   -> gửi đúng các đường dẫn này
//
// Chạy SAU khi đã push và GitHub Pages đã cập nhật (trang phải truy cập được).
// Không gửi đi gửi lại cùng một URL nhiều lần trong ngày.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const HOST = "onetool.vn";
const ORIGIN = `https://${HOST}`;
const KEY = "cd70b78111490aff998a49249ef801dc";

if (!fs.existsSync(path.join(DOCS, `${KEY}.txt`))) {
  console.error(`Thiếu file khóa docs/${KEY}.txt`);
  process.exit(1);
}

const args = process.argv.slice(2);
const sitemap = fs.readFileSync(path.join(DOCS, "sitemap.xml"), "utf8");
const inSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

function fileToUrl(f) {
  // docs/blog/index.html -> https://onetool.vn/blog/
  let p = f.replace(/\\/g, "/").replace(/^docs\//, "");
  if (!p.endsWith(".html")) return null;
  p = p.replace(/(^|\/)index\.html$/, "$1");
  return `${ORIGIN}/${p}`;
}

let urls;
if (args.includes("--all")) {
  urls = [...inSitemap];
} else if (args.length && !args[0].startsWith("--")) {
  urls = args.map((a) => (a.startsWith("http") ? a : ORIGIN + (a.startsWith("/") ? a : "/" + a)));
} else {
  const i = args.indexOf("--since");
  const range = i >= 0 ? `${args[i + 1]}..HEAD` : "HEAD~1..HEAD";
  const changed = execSync(`git diff --name-only ${range} -- docs`, { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
  urls = changed.map(fileToUrl).filter(Boolean);
}

// Chỉ gửi URL có trong sitemap (bỏ trang noindex, trang chuyển hướng, 404…)
urls = [...new Set(urls)].filter((u) => inSitemap.has(u));
if (!urls.length) {
  console.log("Không có URL nào (trong sitemap) để gửi.");
  process.exit(0);
}

const body = { host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList: urls.slice(0, 10000) };
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
console.log(`IndexNow: HTTP ${res.status} ${res.statusText} — ${body.urlList.length} URL`);
if (res.status >= 300) console.log(await res.text());
