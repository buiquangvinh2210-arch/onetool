const fs = require("fs");
const path = require("path");
const vm = require("vm");
const code = fs.readFileSync("e:/AITool/docs/assets/js/catalog.js", "utf8");
const s = { window: {} };
vm.runInNewContext(code, s);
const cat = s.window.OTCatalog;
const tools = cat.tools.filter((t) => !t.hub);
const rows = tools.map((t) => {
  const p = cat.pathFor(t);
  const html = path.join("e:/AITool/docs", p);
  const meta = cat.pageMeta[t.slug];
  const seo = cat.seo[t.slug];
  let h1 = null,
    title = null;
  if (fs.existsSync(html)) {
    const raw = fs.readFileSync(html, "utf8");
    title = (raw.match(/<title>([^<]*)<\/title>/i) || [])[1] || null;
    h1 = (raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, "").trim() || null;
  }
  return {
    slug: t.slug,
    name: t.name,
    path: p,
    exists: fs.existsSync(html),
    hasMeta: !!meta,
    howto: seo?.howto?.length || 0,
    sections: seo?.sections?.length || 0,
    h1,
    title: title?.slice(0, 70),
  };
});
console.log(JSON.stringify(rows, null, 2));
console.log("TOTAL", rows.length);
