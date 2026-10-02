/* OneTool service worker
 * Trang & asset cùng origin: network-first (deploy mới luôn được dùng ngay), cache chỉ để chạy offline.
 * Thư viện CDN có version cố định (@x.y.z): cache-first vì nội dung không đổi.
 */
const VERSION = "20261002i";
const PAGE_CACHE = "ot-pages-" + VERSION;
const ASSET_CACHE = "ot-assets-" + VERSION;
const CDN_CACHE = "ot-cdn-v1";
const OFFLINE_URL = "/";

const CDN_HOSTS = new Set(["cdn.jsdelivr.net", "unpkg.com", "staticimgly.com", "fonts.gstatic.com"]);
const VERSIONED_CDN = /@\d+\.\d+(\.\d+)?/;
const MAX_ASSET_BYTES = 8 * 1024 * 1024;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((c) => c.add(new Request(OFFLINE_URL, { cache: "reload" }))).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("ot-") && k !== PAGE_CACHE && k !== ASSET_CACHE && k !== CDN_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isCacheableResponse(res) {
  if (!res || !res.ok || res.type === "opaque") return false;
  const len = Number(res.headers.get("content-length") || 0);
  return !len || len <= MAX_ASSET_BYTES;
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (isCacheableResponse(res)) cache.put(request, res.clone()).catch(() => {});
    return res;
  } catch (err) {
    const hit = (await cache.match(request, { ignoreSearch: request.mode === "navigate" })) ||
      (fallbackUrl && (await cache.match(fallbackUrl)));
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CDN_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && res.ok && res.type !== "opaque") cache.put(request, res.clone()).catch(() => {});
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.headers.has("range")) return;

  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;
    if (req.mode === "navigate") {
      event.respondWith(networkFirst(req, PAGE_CACHE, OFFLINE_URL));
      return;
    }
    if (/\.(js|mjs|css|png|jpe?g|webp|svg|ico|woff2?|json|webmanifest|wasm)$/i.test(url.pathname)) {
      event.respondWith(networkFirst(req, ASSET_CACHE));
    }
    return;
  }

  if (CDN_HOSTS.has(url.hostname) && (url.hostname === "fonts.gstatic.com" || VERSIONED_CDN.test(url.pathname))) {
    event.respondWith(cacheFirst(req));
  }
});
