// Collect every Vietnamese string of the site that has no English entry in dict/ yet.
// Writes todo/NNN.json chunks ({ "vi": "" }) to be translated, and prints stats.
// Usage: node extract.mjs [--chunk 120]
import fs from "node:fs";
import path from "node:path";
import { HERE, htmlFiles, jsFiles, rel, loadDict, norm, hasVN, parseHtml, visitUnits, runKey, jsStrings, isDataString } from "./lib.mjs";

const CHUNK = +(process.argv[process.argv.indexOf("--chunk") + 1] || 0) || 120;
const dict = loadDict();
const found = new Map(); // key -> Set(source)

function add(s, src) {
  const k = norm(s);
  if (!k || !hasVN(k) || isDataString(k)) return;
  if (!found.has(k)) found.set(k, new Set());
  found.get(k).add(src);
}
function addJson(v, src) {
  if (typeof v === "string") add(v, src);
  else if (Array.isArray(v)) v.forEach((x) => addJson(x, src));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => addJson(x, src));
}
function addJs(code, src) {
  try {
    for (const s of jsStrings(code)) add(s.value, src);
  } catch (e) {
    console.warn("JS parse failed:", src, e.message);
  }
}

for (const f of htmlFiles()) {
  const src = rel(f);
  const doc = parseHtml(fs.readFileSync(f, "utf8"));
  visitUnits(doc, (kind, p) => {
    if (kind === "run") add(runKey(p.nodes), src);
    else if (kind === "attr") add(p.attr.value, src);
    else if (kind === "script") addJs(p.node.childNodes.map((c) => c.value).join(""), src);
    else if (kind === "jsonld") {
      try {
        addJson(JSON.parse(p.node.childNodes.map((c) => c.value).join("")), src);
      } catch (e) {
        console.warn("JSON-LD parse failed:", src);
      }
    }
  });
}
for (const f of jsFiles()) addJs(fs.readFileSync(f, "utf8"), rel(f));

const missing = [...found.keys()].filter((k) => !dict.has(k));
// order: group by first source so related strings stay together
missing.sort((a, b) => {
  const sa = [...found.get(a)][0], sb = [...found.get(b)][0];
  return sa === sb ? 0 : sa < sb ? -1 : 1;
});

const todo = path.join(HERE, "todo");
fs.rmSync(todo, { recursive: true, force: true });
fs.mkdirSync(todo, { recursive: true });
let n = 0;
for (let i = 0; i < missing.length; ) {
  // chunk by count but also cap characters
  const chunk = {};
  let chars = 0;
  while (i < missing.length && Object.keys(chunk).length < CHUNK && chars < 9000) {
    chunk[missing[i]] = "";
    chars += missing[i].length;
    i++;
  }
  fs.writeFileSync(path.join(todo, String(++n).padStart(3, "0") + ".json"), JSON.stringify(chunk, null, 1));
}
const chars = missing.reduce((a, k) => a + k.length, 0);
console.log(`strings found: ${found.size}, translated: ${found.size - missing.length}, missing: ${missing.length} (${chars} chars) -> ${n} chunks in todo/`);
fs.writeFileSync(path.join(HERE, "todo", "_sources.json"), JSON.stringify(Object.fromEntries(missing.map((k) => [k, [...found.get(k)].slice(0, 3)])), null, 1));
