/**
 * Cloudflare Worker — proxy lấy thông tin / tải video TikTok (HD, không watermark).
 * Deploy: wrangler deploy -c wrangler-tiktok.toml
 * Không cần secret — chỉ ALLOWED_ORIGINS (tuỳ chọn).
 */
export default {
  async fetch(request, env) {
    const corsOrigin = pickCorsOrigin(request, env);
    const cors = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!originAllowed(request, env)) {
      return json({ error: "Origin không được phép." }, 403, cors);
    }

    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "")) {
      return json(
        { ok: true, service: "onetool-tiktok-proxy", version: 2 },
        200,
        cors
      );
    }

    // Stream file CDN qua worker (tránh CORS + gắn tên file)
    if (url.pathname === "/file" || url.pathname === "/file/") {
      return proxyFile(request, url, cors);
    }

    if (url.pathname === "/resolve" || url.pathname === "/resolve/") {
      return resolveTikTok(request, url, cors);
    }

    return json({ error: "Not found. Dùng POST/GET /resolve?url=… hoặc GET /file?src=…" }, 404, cors);
  }
};

async function resolveTikTok(request, url, cors) {
  let tikUrl = "";
  if (request.method === "GET") {
    tikUrl = String(url.searchParams.get("url") || "").trim();
  } else if (request.method === "POST") {
    const ct = (request.headers.get("Content-Type") || "").toLowerCase();
    if (ct.includes("application/json")) {
      try {
        const body = await request.json();
        tikUrl = String(body?.url || "").trim();
      } catch (_) {
        return json({ error: "JSON không hợp lệ." }, 400, cors);
      }
    } else {
      const fd = await request.formData();
      tikUrl = String(fd.get("url") || "").trim();
    }
  } else {
    return json({ error: "GET hoặc POST." }, 405, cors);
  }

  if (!isTikTokUrl(tikUrl)) {
    return json(
      { error: "Link không hợp lệ. Dán link TikTok (tiktok.com / vt.tiktok.com / vm.tiktok.com)." },
      400,
      cors
    );
  }

  try {
    const data = await resolveVideo(tikUrl);
    return json({ ok: true, data }, 200, cors);
  } catch (e) {
    const msg = e.message || "Không lấy được video. Thử link công khai khác.";
    const friendly = isRateLimitMsg(msg)
      ? "Đang quá tải (giới hạn 1 lần/giây). Đợi 2–3 giây rồi bấm Lấy video lại."
      : msg;
    return json({ error: friendly }, 502, cors);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRateLimitMsg(msg) {
  return /free api limit|rate limit|too many|1 request\/second|request\/second/i.test(
    String(msg || "")
  );
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function resolveVideo(tikUrl) {
  const providers = [fetchTikWmGet, fetchTikWmPost];
  let lastErr;
  for (const fn of providers) {
    try {
      return await fn(tikUrl);
    } catch (e) {
      lastErr = e;
      if (!isRateLimitMsg(e.message)) throw e;
    }
  }
  throw lastErr || new Error("Không lấy được video.");
}

async function callTikWm(tikUrl, method) {
  const headers = {
    Accept: "application/json",
    "User-Agent": UA,
    Referer: "https://www.tikwm.com/"
  };
  let res;
  if (method === "POST") {
    const body = new URLSearchParams({ url: tikUrl, hd: "1" });
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    res = await fetch("https://www.tikwm.com/api/", { method: "POST", headers, body });
  } else {
    const api =
      "https://www.tikwm.com/api/?hd=1&url=" + encodeURIComponent(tikUrl);
    res = await fetch(api, { method: "GET", headers });
  }
  const raw = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    throw new Error("Máy chủ phân tích TikTok trả về dữ liệu lỗi.");
  }
  if (!res.ok || parsed?.code !== 0 || !parsed?.data) {
    const msg = parsed?.msg || parsed?.message || "Không tìm thấy video.";
    throw new Error(String(msg));
  }
  return normalizeTikWm(parsed.data);
}

async function fetchTikWmGet(tikUrl) {
  return retryTikWm(() => callTikWm(tikUrl, "GET"));
}

async function fetchTikWmPost(tikUrl) {
  await sleep(1200);
  return retryTikWm(() => callTikWm(tikUrl, "POST"));
}

async function retryTikWm(fn) {
  let lastErr;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isRateLimitMsg(e.message) || attempt >= 5) throw e;
      await sleep(1100 + attempt * 400);
    }
  }
  throw lastErr;
}

async function fetchTikWm(tikUrl) {
  return resolveVideo(tikUrl);
}

function normalizeTikWm(d) {
  const author = d.author || {};
  const hd = String(d.hdplay || "").trim();
  const play = String(d.play || "").trim();
  const wm = String(d.wmplay || "").trim();
  const music = String(d.music || "").trim();
  const images = Array.isArray(d.images)
    ? d.images.map((u) => String(u || "").trim()).filter(Boolean)
    : [];

  const videos = [];
  if (hd) videos.push({ id: "hd", label: "MP4 HD · Không watermark", url: hd, quality: "hd" });
  if (play && play !== hd) {
    videos.push({ id: "sd", label: "MP4 · Không watermark", url: play, quality: "sd" });
  } else if (play && !hd) {
    videos.push({ id: "sd", label: "MP4 · Không watermark", url: play, quality: "sd" });
  }
  if (wm) videos.push({ id: "wm", label: "MP4 · Có watermark", url: wm, quality: "wm" });

  return {
    id: String(d.id || ""),
    title: String(d.title || d.desc || "TikTok video").trim(),
    cover: String(d.cover || d.origin_cover || "").trim(),
    duration: Number(d.duration) || 0,
    region: String(d.region || ""),
    author: {
      id: String(author.id || author.unique_id || ""),
      uniqueId: String(author.unique_id || ""),
      nickname: String(author.nickname || author.unique_id || "TikTok")
    },
    stats: {
      play: Number(d.play_count || 0),
      digg: Number(d.digg_count || 0),
      comment: Number(d.comment_count || 0),
      share: Number(d.share_count || 0)
    },
    size: Number(d.size || 0),
    hdSize: Number(d.hd_size || 0),
    videos,
    music: music
      ? { url: music, title: String(d.music_info?.title || "Audio"), author: String(d.music_info?.author || "") }
      : null,
    images
  };
}

async function proxyFile(request, url, cors) {
  if (request.method !== "GET") return json({ error: "GET only" }, 405, cors);

  const src = String(url.searchParams.get("src") || "").trim();
  const name = sanitizeFileName(url.searchParams.get("name") || "tiktok-video.mp4");

  if (!src || !/^https:\/\//i.test(src)) {
    return json({ error: "Thiếu src hợp lệ." }, 400, cors);
  }
  if (!isAllowedCdn(src)) {
    return json({ error: "Nguồn tải không được phép." }, 403, cors);
  }

  const upstream = await fetch(src, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Referer: "https://www.tiktok.com/",
      Range: request.headers.get("Range") || ""
    }
  });

  if (!upstream.ok && upstream.status !== 206) {
    return json({ error: "Không tải được file từ CDN TikTok." }, 502, cors);
  }

  const headers = new Headers(cors);
  headers.set(
    "Content-Type",
    upstream.headers.get("Content-Type") || guessMime(name)
  );
  const len = upstream.headers.get("Content-Length");
  if (len) headers.set("Content-Length", len);
  const cr = upstream.headers.get("Content-Range");
  if (cr) headers.set("Content-Range", cr);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, max-age=300");
  headers.set(
    "Content-Disposition",
    `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`
  );

  return new Response(upstream.body, { status: upstream.status, headers });
}

function isTikTokUrl(u) {
  try {
    const h = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
    return (
      h === "tiktok.com" ||
      h.endsWith(".tiktok.com") ||
      h === "vt.tiktok.com" ||
      h === "vm.tiktok.com" ||
      h === "m.tiktok.com"
    );
  } catch (_) {
    return false;
  }
}

function isAllowedCdn(u) {
  try {
    const h = new URL(u).hostname.toLowerCase();
    return (
      h.includes("tiktokcdn") ||
      h.includes("tiktokv") ||
      h.includes("musical.ly") ||
      h.includes("byteoversea") ||
      h.includes("ibyteimg") ||
      h.includes("tikwm.com") ||
      h.endsWith(".ttlivecdn.com") ||
      h.includes("susercontent")
    );
  } catch (_) {
    return false;
  }
}

function sanitizeFileName(name) {
  const base = String(name || "tiktok-video.mp4")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return base || "tiktok-video.mp4";
}

function guessMime(name) {
  const n = name.toLowerCase();
  if (n.endsWith(".mp3")) return "audio/mpeg";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  return "video/mp4";
}

function allowedList(env) {
  const defaults =
    "https://onetool.vn,https://www.onetool.vn,http://onetool.vn,http://www.onetool.vn";
  return String(env.ALLOWED_ORIGINS || defaults)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function originAllowed(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (!origin) return true;
  const list = allowedList(env);
  if (list.some((o) => origin === o)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".github.io")) return true;
    if (host === "127.0.0.1" || host === "localhost") return true;
  } catch (_) {}
  return false;
}

function pickCorsOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (origin && originAllowed(request, env)) return origin;
  const list = allowedList(env);
  return list[0] || "*";
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" }
  });
}
