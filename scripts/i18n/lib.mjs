// Shared helpers for the OneTool English build.
// Text is translated by exact lookup in the dictionary (dict/*.json, Vietnamese key -> English).
// HTML is split into "units": runs of inline content. Inline tags inside a unit are replaced by
// numbered placeholders (<0>…</0>, <1/>) so the same sentence on different pages shares one key.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as parse5 from "parse5";
import * as acorn from "acorn";

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "../..");
export const DOCS = path.join(ROOT, "docs");

export const VN = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
// Vietnamese words written without diacritics that also need translating ("PDF sang Word", "Trang 3").
const VN_ASCII = /(^|[\s(>«·—\-])(sang|Sang|trang|Trang|sau|Sau|xem|Xem)(?=[\s:.,)<»·]|$)/;
export const hasVN = (s) => VN.test(s || "") || VN_ASCII.test(s || "");

// ---------- files ----------
const SKIP_DIRS = new Set(["en", "App_Data", "api", "workers", "vendor", "node_modules", "data"]);
export function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p, out);
    } else out.push(p);
  }
  return out;
}
export const rel = (p) => path.relative(DOCS, p).split(path.sep).join("/");
export function htmlFiles() {
  return walk(DOCS).filter((p) => p.endsWith(".html") && !/^_|^google/.test(path.basename(p)));
}
export function jsFiles() {
  return walk(path.join(DOCS, "assets", "js")).filter((p) => p.endsWith(".js") && !/local-secrets|\.en\.js$/.test(p));
}

// ---------- dictionary ----------
export function loadDict() {
  const dir = path.join(HERE, "dict");
  const dict = new Map();
  if (!fs.existsSync(dir)) return dict;
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".json")) continue;
    const obj = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const [k, v] of Object.entries(obj)) dict.set(norm(k), v);
  }
  return dict;
}
export const norm = (s) => String(s).replace(/\s+/g, " ").trim();

// Look up a string; keeps the original leading/trailing whitespace. Returns null if missing.
export function lookup(dict, s, missing) {
  const key = norm(s);
  if (!key || !hasVN(key)) return s;
  if (!dict.has(key)) {
    if (missing) missing.add(key);
    return null;
  }
  let v = dict.get(key);
  if (v === "=" || v == null) return s; // marked: keep Vietnamese (data, names…)
  const lead = s.match(/^\s*/)[0];
  const trail = s.match(/\s*$/)[0];
  return lead + v + trail;
}

// ---------- HTML units ----------
const INLINE = new Set([
  "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn", "em", "i", "img", "kbd", "mark",
  "q", "s", "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "del", "ins", "label"
]);
const VOID = new Set(["br", "img", "wbr", "input", "hr", "meta", "link", "source"]);
const RAW = new Set(["script", "style", "noscript", "textarea", "svg", "math", "code", "pre"]);
export const TEXT_ATTRS = new Set(["title", "alt", "placeholder", "aria-label", "data-tip", "data-title", "data-placeholder", "data-label", "data-empty", "data-hint", "data-msg"]);

const isText = (n) => n.nodeName === "#text";
const isEl = (n) => n.tagName != null;

function isInlineDeep(n) {
  if (isText(n) || n.nodeName === "#comment") return true;
  if (!isEl(n)) return false;
  if (!INLINE.has(n.tagName)) return false;
  return (n.childNodes || []).every(isInlineDeep);
}
const textOf = (n) => (isText(n) ? n.value : (n.childNodes || []).map(textOf).join(""));

// Serialize a run of inline nodes with placeholders. Returns { key, tags } where tags[i] = node.
function runToKey(nodes) {
  const tags = [];
  const ser = (n) => {
    if (isText(n)) return escText(n.value);
    if (n.nodeName === "#comment") return "";
    const i = tags.length;
    tags.push(n);
    if (VOID.has(n.tagName)) return `<${i}/>`;
    return `<${i}>${n.childNodes.map(ser).join("")}</${i}>`;
  };
  return { raw: nodes.map(ser).join(""), tags };
}
const escText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;");

// Visit all translatable units of a parsed document.
// cb(kind, payload): kind "run" {nodes, parent}, "attr" {node, attr}, "script" {node}, "jsonld" {node}
export function visitUnits(doc, cb) {
  const visit = (node) => {
    if (!node.childNodes) return;
    if (isEl(node)) {
      for (const a of node.attrs || []) if (hasVN(a.value) && isTextAttr(node, a.name)) cb("attr", { node, attr: a });
      if (node.tagName === "script") {
        const type = (node.attrs.find((a) => a.name === "type") || {}).value || "";
        if (type === "application/ld+json") cb("jsonld", { node });
        else if (!type || /javascript|module/.test(type)) cb("script", { node });
        return;
      }
      if (node.tagName === "title") {
        cb("run", { nodes: node.childNodes.slice(), parent: node });
        return;
      }
      if (RAW.has(node.tagName)) {
        if (node.tagName === "noscript" || node.tagName === "code" || node.tagName === "pre") {
          // noscript is parsed as text when scripting is on — treat its text as HTML only if VN
          if (node.tagName !== "noscript" && hasVN(textOf(node))) cb("run", { nodes: node.childNodes.slice(), parent: node });
        }
        return;
      }
    }
    if (node.nodeName === "template" && node.content) visit(node.content);
    // split children into runs of inline content and block nodes
    let run = [];
    const flush = () => {
      if (run.length && hasVN(run.map(textOf).join(""))) emitRun(run, node, cb);
      run = [];
    };
    for (const ch of node.childNodes.slice()) {
      if (isInlineDeep(ch)) {
        run.push(ch);
        // still visit attributes of inline elements
        if (isEl(ch)) visitAttrsDeep(ch, cb);
      } else {
        flush();
        visit(ch);
      }
    }
    flush();
  };
  visit(doc);
}
// A run with its own text ("Gộp <b>PDF</b> nhanh") is one unit. A run made only of elements
// (link cards: <a><span>icon</span><span>name</span></a>) is split into its elements' contents.
function emitRun(run, parent, cb) {
  const ownText = run.some((n) => isText(n) && n.value.trim());
  const els = run.filter((n) => isEl(n) && hasVN(textOf(n)));
  if (ownText || !els.length) return cb("run", { nodes: run, parent });
  for (const el of els) {
    if (VOID.has(el.tagName)) continue;
    emitRun(el.childNodes.slice(), el, cb);
  }
}
function visitAttrsDeep(n, cb) {
  for (const a of n.attrs || []) if (hasVN(a.value) && isTextAttr(n, a.name)) cb("attr", { node: n, attr: a });
  for (const c of n.childNodes || []) if (isEl(c)) visitAttrsDeep(c, cb);
}
function isTextAttr(node, name) {
  if (TEXT_ATTRS.has(name)) return true;
  if (name === "content" && node.tagName === "meta") return true;
  if (name === "value" && node.tagName === "input") {
    const t = (node.attrs.find((a) => a.name === "type") || {}).value;
    return t === "button" || t === "submit" || t === "reset";
  }
  if (name.startsWith("data-") && !/^data-(href|src|url|slug|id|key|cat|tool|lang|value|nav)$/.test(name)) return true;
  return false;
}

export function runKey(nodes) {
  return runToKey(nodes).raw;
}

// Replace a run of nodes with translated HTML (placeholders restored to the original tags).
export function applyRun(parent, nodes, translated) {
  const { tags } = runToKey(nodes);
  const html = translated.replace(/<(\/?)(\d+)(\/?)>/g, (m, close, idx, selfClose) => {
    const n = tags[+idx];
    if (!n) return "";
    if (close) return `</${n.tagName}>`;
    const attrs = n.attrs.map((a) => ` ${a.name}="${a.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`).join("");
    return `<${n.tagName}${attrs}>`;
  });
  const frag = parse5.parseFragment(parent.tagName === "title" ? "" : html);
  const idx = parent.childNodes.indexOf(nodes[0]);
  if (parent.tagName === "title") {
    parent.childNodes = [{ nodeName: "#text", value: decodeEntities(html), parentNode: parent }];
    return;
  }
  for (const n of nodes) {
    const i = parent.childNodes.indexOf(n);
    if (i >= 0) parent.childNodes.splice(i, 1);
  }
  for (const n of frag.childNodes) n.parentNode = parent;
  parent.childNodes.splice(idx, 0, ...frag.childNodes);
  // inner tags must keep translated attributes too: they were serialized from the (already
  // attr-translated) original nodes, so nothing else to do.
}
function decodeEntities(s) {
  const f = parse5.parseFragment(`<p>${s}</p>`);
  return textOf(f.childNodes[0]);
}

// ---------- JS strings ----------
// Returns list of {start, end, value, quote, kind} for string literals / template chunks with VN.
export function jsStrings(code) {
  let ast;
  const opts = { ecmaVersion: "latest", allowHashBang: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true };
  try {
    ast = acorn.parse(code, { ...opts, sourceType: "script" });
  } catch (e1) {
    ast = acorn.parse(code, { ...opts, sourceType: "module" });
  }
  const out = [];
  const walkNode = (n, parent, field) => {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "Literal" && typeof n.value === "string" && hasVN(n.value)) {
      const isKey = parent && parent.type === "Property" && field === "key" && !parent.computed;
      const isImport = parent && /Import|Export/.test(parent.type);
      if (!isKey && !isImport) out.push({ start: n.start, end: n.end, value: n.value, quote: code[n.start], kind: "str" });
    } else if (n.type === "TemplateElement" && hasVN(n.value.cooked ?? n.value.raw)) {
      out.push({ start: n.start, end: n.end, value: n.value.cooked ?? n.value.raw, quote: "`", kind: "tpl" });
    }
    for (const k of Object.keys(n)) {
      if (k === "type" || k === "start" || k === "end") continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach((c) => walkNode(c, n, k));
      else if (v && typeof v.type === "string") walkNode(v, n, k);
    }
  };
  walkNode(ast, null, null);
  return out;
}

export function encodeJs(value, quote, kind) {
  if (kind === "tpl") return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  const body = value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .split(String.fromCharCode(0x2028)).join("\\u2028")
    .split(String.fromCharCode(0x2029)).join("\\u2029")
    .split(quote).join("\\" + quote);
  return quote + body + quote;
}

// Keys that are pure data (diacritic maps, single letters) — never translated.
export function isDataString(s) {
  const k = norm(s);
  if (!k) return true;
  if (!/[a-z]/i.test(k.normalize("NFD").replace(/[̀-ͯ]/g, ""))) return true;
  if (/^[^\s]$/.test(k) || /^\d*[đĐ]$/.test(k)) return true; // single letters "đ", "ơ", currency "0đ"
  if (!/\s/.test(k) && /^[a-zà-ỹđ]+$/i.test(k) && k.length > 12) return true; // char maps "àáảãạ…"
  return false;
}

export function parseHtml(src) {
  return parse5.parse(src, { sourceCodeLocationInfo: false });
}
export const serializeHtml = (doc) => parse5.serialize(doc);
