// Tiny static server for previewing docs/ (VI + /en/) locally: node scripts/i18n/serve.mjs [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { DOCS } from "./lib.mjs";

const PORT = +process.argv[2] || 5600;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".wasm": "application/wasm",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2", ".onnx": "application/octet-stream"
};
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(DOCS, p);
  if (!file.startsWith(DOCS)) return res.writeHead(403).end();
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      return fs.createReadStream(path.join(DOCS, "404.html")).pipe(res);
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => console.log(`OneTool preview: http://localhost:${PORT}/  ·  English: http://localhost:${PORT}/en/`));
