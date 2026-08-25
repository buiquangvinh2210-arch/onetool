/**
 * Cloudflare Worker — proxy lấy thông tin / tải video TikTok (HD, không logo).
 * Deploy: wrangler deploy -c wrangler-tiktok.toml
 * Cache kết quả + nhiều nguồn API để tránh hết hạn mức ngày.
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
        {
          ok: true,
          service: "onetool-tiktok-proxy",
          version: 7,
          build: "20260825-cdn",
          ytdlp: Boolean(String(env.YTDLP_API_URL || "").trim())
        },
        200,
        cors
      );
    }

    if (url.pathname === "/file" || url.pathname === "/file/") {
      return proxyFile(request, url, cors);
    }

    if (url.pathname === "/resolve" || url.pathname === "/resolve/") {
      return resolveTikTok(request, url, cors, env);
    }

    return json({ error: "Not found. Dùng POST/GET /resolve?url=… hoặc GET /file?src=…" }, 404, cors);
  }
};

async function resolveTikTok(request, url, cors, env) {
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

  tikUrl = prepareTikTokUrl(tikUrl);

  try {
    const cached = await readCache(tikUrl);
    if (cached) return json({ ok: true, data: cached, cached: true }, 200, cors);

    const data = await resolveVideo(tikUrl, env);
    await writeCache(tikUrl, data);
    return json({ ok: true, data }, 200, cors);
  } catch (e) {
    const msg = e.message || "Không lấy được video. Thử link công khai khác.";
    return json({ error: friendlyError(msg) }, 502, cors);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isPerSecondLimit(msg) {
  return /1 request\/second|request\/second|too many requests/i.test(String(msg || ""));
}

function isDailyLimit(msg) {
  return /10000|1 day|per day|\/\s*1\s*day|request\/\s*1\s*day|daily|hết hạn mức/i.test(
    String(msg || "")
  );
}

function isRateLimitMsg(msg) {
  return (
    isPerSecondLimit(msg) ||
    isDailyLimit(msg) ||
    /free api limit|rate limit|quota/i.test(String(msg || ""))
  );
}

function friendlyError(msg) {
  if (isDailyLimit(msg)) {
    return "Mọi nguồn free tạm hết hạn mức hôm nay (kể cả dự phòng). Thử lại sau ~7h sáng (0h UTC), hoặc dùng link video thường (không phải /photo/).";
  }
  if (isPerSecondLimit(msg)) {
    return "Đang quá tải (giới hạn 1 lần/giây). Đợi 2–3 giây rồi bấm Lấy video lại.";
  }
  if (isRateLimitMsg(msg)) {
    return "Máy chủ đang giới hạn tốc độ. Đợi vài giây rồi thử lại.";
  }
  return msg;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function cacheKey(tikUrl) {
  return "https://onetool-tiktok-cache.internal/v1?u=" + encodeURIComponent(normalizeCacheUrl(tikUrl));
}

function normalizeCacheUrl(u) {
  return prepareTikTokUrl(u);
}

/** Chuẩn hóa link trước khi gọi API (bỏ query, /photo/ → /video/) */
function prepareTikTokUrl(raw) {
  let u = String(raw || "").trim();
  try {
    const x = new URL(u);
    x.search = "";
    x.hash = "";
    x.pathname = x.pathname.replace(/\/photo\//i, "/video/");
    return x.toString().replace(/\/$/, "");
  } catch (_) {
    return u.replace(/\/photo\//i, "/video/").replace(/\?.*$/, "");
  }
}

async function readCache(tikUrl) {
  try {
    const cache = caches.default;
    const res = await cache.match(cacheKey(tikUrl));
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (data?.videos?.length) return data;
  } catch (_) {}
  return null;
}

async function writeCache(tikUrl, data) {
  try {
    const cache = caches.default;
    const body = JSON.stringify(data);
    const res = new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=604800"
      }
    });
    await cache.put(cacheKey(tikUrl), res);
  } catch (_) {}
}

async function resolveVideo(tikUrl, env) {
  const ytdlpBase = String(env?.YTDLP_API_URL || "").trim().replace(/\/$/, "");
  const providers = [];
  if (ytdlpBase) {
    providers.push(() => fetchYtdlpApi(tikUrl, env));
  }
  providers.push(
    () => fetchTiklyDown(tikUrl),
    () => fetchSlBjs(tikUrl),
    () => fetchTikDownOrg(tikUrl),
    () => fetchSujoy(tikUrl),
    () => fetchTikWm(tikUrl, "GET"),
    () => fetchTikWm(tikUrl, "POST")
  );

  let lastErr;
  for (let i = 0; i < providers.length; i++) {
    try {
      if (i > 0) await sleep(400);
      return await providers[i]();
    } catch (e) {
      lastErr = e;
      // Hết hạn mức ngày → bỏ qua retry cùng nguồn, sang provider khác ngay
      if (isDailyLimit(e.message)) continue;
      // Limit/giây → chờ rồi thử provider tiếp theo
      if (isPerSecondLimit(e.message)) {
        await sleep(1200);
        continue;
      }
      // Lỗi khác vẫn thử fallback (API có thể chết tạm)
      continue;
    }
  }
  throw lastErr || new Error("Không lấy được video từ mọi nguồn.");
}

/** Nguồn chính — yt-dlp tự host (không giới hạn request/ngày). Xem servers/tiktok-ytdlp/ */
async function fetchYtdlpApi(tikUrl, env) {
  const base = String(env?.YTDLP_API_URL || "").trim().replace(/\/$/, "");
  if (!base) throw new Error("Chưa cấu hình YTDLP_API_URL.");

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": UA
  };
  const key = String(env?.YTDLP_API_KEY || "").trim();
  if (key) headers["X-Api-Key"] = key;

  const res = await fetch(base + "/resolve", {
    method: "POST",
    headers,
    body: JSON.stringify({ url: tikUrl })
  });
  const raw = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    throw new Error("Máy chủ yt-dlp trả dữ liệu lỗi.");
  }
  if (!res.ok || !parsed?.ok || !parsed?.data?.videos?.length) {
    const detail = parsed?.detail;
    const msg =
      (typeof detail === "string" && detail) ||
      (Array.isArray(detail) && detail[0]?.msg) ||
      parsed?.error ||
      "Máy chủ yt-dlp không lấy được video.";
    throw new Error(String(msg));
  }
  return parsed.data;
}

async function fetchTikWm(tikUrl, method) {
  const maxTry = isDailyLimit.name ? 2 : 2;
  let lastErr;
  for (let attempt = 0; attempt < maxTry; attempt++) {
    try {
      return await callTikWm(tikUrl, method);
    } catch (e) {
      lastErr = e;
      if (isDailyLimit(e.message)) throw e;
      if (!isPerSecondLimit(e.message) || attempt >= maxTry - 1) throw e;
      await sleep(1100 + attempt * 400);
    }
  }
  throw lastErr;
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
    const api = "https://www.tikwm.com/api/?hd=1&url=" + encodeURIComponent(tikUrl);
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

/** Fallback #1 — tiklydown */
async function fetchTiklyDown(tikUrl) {
  const api =
    "https://api.tiklydown.eu.org/api/download?url=" + encodeURIComponent(tikUrl);
  const res = await fetch(api, {
    headers: { Accept: "application/json", "User-Agent": UA }
  });
  const raw = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    throw new Error("Nguồn dự phòng (tiklydown) lỗi dữ liệu.");
  }
  if (!res.ok) {
    throw new Error(parsed?.message || parsed?.error || "Nguồn dự phòng lỗi.");
  }

  const video = parsed?.video || parsed?.data?.video || {};
  const author = parsed?.author || parsed?.data?.author || {};
  const music = parsed?.music || parsed?.data?.music || {};
  const noWm =
    String(video?.noWatermark || video?.no_watermark || video?.play || parsed?.video_url || "").trim();
  const hd = String(video?.hd || video?.noWatermarkHD || video?.hdplay || "").trim();
  const wm = String(video?.watermark || video?.wmplay || "").trim();
  const cover = String(parsed?.cover || video?.cover || parsed?.thumbnail || "").trim();
  const title = String(parsed?.title || parsed?.desc || "TikTok video").trim();
  const id = String(parsed?.id || parsed?.aweme_id || "").trim();

  if (!noWm && !hd) throw new Error("Nguồn dự phòng không trả được video không logo.");

  const videos = [];
  if (hd) videos.push({ id: "hd", label: "MP4 HD · Không logo TikTok", url: hd, quality: "hd" });
  if (noWm && noWm !== hd) {
    videos.push({ id: "sd", label: "MP4 · Không logo", url: noWm, quality: "sd" });
  } else if (noWm && !hd) {
    videos.push({ id: "sd", label: "MP4 · Không logo", url: noWm, quality: "sd" });
  }
  if (wm) videos.push({ id: "wm", label: "MP4 · Có logo TikTok", url: wm, quality: "wm" });

  const musicUrl = String(music?.play_url || music?.url || parsed?.music_url || "").trim();

  return {
    id,
    title,
    cover,
    duration: Number(video?.duration || parsed?.duration || 0),
    region: "",
    author: {
      id: String(author?.id || ""),
      uniqueId: String(author?.unique_id || author?.username || ""),
      nickname: String(author?.nickname || author?.name || author?.unique_id || "TikTok")
    },
    stats: {
      play: Number(parsed?.stats?.play || parsed?.play_count || 0),
      digg: Number(parsed?.stats?.digg || parsed?.digg_count || 0),
      comment: Number(parsed?.stats?.comment || 0),
      share: Number(parsed?.stats?.share || 0)
    },
    size: 0,
    hdSize: 0,
    videos,
    music: musicUrl ? { url: musicUrl, title: String(music?.title || "Audio"), author: "" } : null,
    images: Array.isArray(parsed?.images) ? parsed.images.filter(Boolean) : []
  };
}

/** Fallback #2 — sl-bjs Cloudflare Worker (free, không key) */
async function fetchSlBjs(tikUrl) {
  const api = "https://tdownv4.sl-bjs.workers.dev/?down=" + encodeURIComponent(tikUrl);
  const res = await fetch(api, { headers: { Accept: "application/json", "User-Agent": UA } });
  const raw = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    throw new Error("Nguồn dự phòng (sl-bjs) lỗi dữ liệu.");
  }
  const video = String(parsed?.download_url || parsed?.video || "").trim();
  if (!video) throw new Error(parsed?.error || parsed?.message || "sl-bjs không trả link MP4.");

  const author = parsed?.author || {};
  const audio = String(author?.audio_url || parsed?.audio_url || "").trim();

  return {
    id: String(parsed?.video_id || ""),
    title: String(parsed?.title || "TikTok video").trim(),
    cover: String(author?.avatar || parsed?.thumbnail || "").trim(),
    duration: Number(author?.duration || parsed?.duration || 0),
    region: "",
    author: {
      id: "",
      uniqueId: String(author?.username || ""),
      nickname: String(author?.nickname || author?.username || "TikTok")
    },
    stats: {
      play: Number(author?.view_count || 0),
      digg: Number(author?.like_count || 0),
      comment: 0,
      share: 0
    },
    size: 0,
    hdSize: 0,
    videos: [{ id: "hd", label: "MP4 · Không logo TikTok", url: video, quality: "hd" }],
    music: audio ? { url: audio, title: "Audio", author: "" } : null,
    images: []
  };
}

/** Fallback #3 — tikdown.org style JSON */
async function fetchTikDownOrg(tikUrl) {
  const res = await fetch("https://tikdown.org/getJson", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": UA,
      Origin: "https://tikdown.org",
      Referer: "https://tikdown.org/"
    },
    body: new URLSearchParams({ url: tikUrl })
  });
  const raw = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    throw new Error("Nguồn dự phòng (tikdown) lỗi dữ liệu.");
  }
  if (!res.ok || parsed?.status !== "ok" && parsed?.status !== true && !parsed?.video) {
    throw new Error(parsed?.message || "Nguồn dự phòng không lấy được video.");
  }

  const play = String(parsed?.video || parsed?.download || parsed?.nwm_video_url || "").trim();
  const hd = String(parsed?.hd || parsed?.nwm_video_url_HQ || "").trim();
  if (!play && !hd) throw new Error("Nguồn dự phòng không có link MP4.");

  const videos = [];
  if (hd) videos.push({ id: "hd", label: "MP4 HD · Không logo TikTok", url: hd, quality: "hd" });
  if (play && play !== hd) {
    videos.push({ id: "sd", label: "MP4 · Không logo", url: play, quality: "sd" });
  } else if (play && !hd) {
    videos.push({ id: "sd", label: "MP4 · Không logo", url: play, quality: "sd" });
  }

  return {
    id: String(parsed?.id || ""),
    title: String(parsed?.title || parsed?.desc || "TikTok video").trim(),
    cover: String(parsed?.cover || parsed?.thumbnail || "").trim(),
    duration: Number(parsed?.duration || 0),
    region: "",
    author: {
      id: "",
      uniqueId: String(parsed?.author || parsed?.username || ""),
      nickname: String(parsed?.author_name || parsed?.author || "TikTok")
    },
    stats: { play: 0, digg: 0, comment: 0, share: 0 },
    size: 0,
    hdSize: 0,
    videos,
    music: parsed?.music
      ? { url: String(parsed.music), title: "Audio", author: "" }
      : null,
    images: []
  };
}

/** Fallback #4 — devlopersujoy Vercel (free, không key) */
async function fetchSujoy(tikUrl) {
  const api = "https://tiktok-downbloder.vercel.app/?url=" + encodeURIComponent(tikUrl);
  const res = await fetch(api, { headers: { Accept: "application/json", "User-Agent": UA } });
  const raw = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    throw new Error("Nguồn dự phòng (sujoy) lỗi dữ liệu.");
  }
  const inner = parsed?.result?.raw?.result || parsed?.result || parsed?.data || {};
  const video = String(inner?.video || inner?.download || parsed?.video || "").trim();
  if (!video) throw new Error("Nguồn dự phòng sujoy không có link MP4.");

  const author = inner?.author || {};
  const music = String(inner?.music || "").trim();
  const stats = inner?.statistics || {};

  return {
    id: "",
    title: String(inner?.desc || inner?.title || "TikTok video").trim(),
    cover: String(author?.avatar || inner?.cover || "").trim(),
    duration: Number(inner?.duration || 0),
    region: "",
    author: {
      id: "",
      uniqueId: "",
      nickname: String(author?.nickname || "TikTok")
    },
    stats: {
      play: 0,
      digg: parseStat(stats?.likeCount),
      comment: parseStat(stats?.commentCount),
      share: parseStat(stats?.shareCount)
    },
    size: 0,
    hdSize: 0,
    videos: [{ id: "hd", label: "MP4 · Không logo TikTok", url: video, quality: "hd" }],
    music: music ? { url: music, title: "Audio", author: "" } : null,
    images: Array.isArray(inner?.images) ? inner.images.filter(Boolean) : []
  };
}

function parseStat(v) {
  const s = String(v || "0").replace(/,/g, "").trim();
  const n = parseFloat(s);
  if (Number.isNaN(n)) return 0;
  if (/k$/i.test(s)) return Math.round(n * 1000);
  if (/m$/i.test(s)) return Math.round(n * 1000000);
  return Math.round(n);
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
  if (hd) videos.push({ id: "hd", label: "MP4 HD · Không logo TikTok", url: hd, quality: "hd" });
  if (play && play !== hd) {
    videos.push({ id: "sd", label: "MP4 · Không logo", url: play, quality: "sd" });
  } else if (play && !hd) {
    videos.push({ id: "sd", label: "MP4 · Không logo", url: play, quality: "sd" });
  }
  if (wm) videos.push({ id: "wm", label: "MP4 · Có logo TikTok", url: wm, quality: "wm" });

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
      "User-Agent": UA,
      Referer: "https://www.tiktok.com/",
      Range: request.headers.get("Range") || ""
    }
  });

  if (!upstream.ok && upstream.status !== 206) {
    return json({ error: "Không tải được file từ CDN TikTok." }, 502, cors);
  }

  const headers = new Headers(cors);
  headers.set("Content-Type", upstream.headers.get("Content-Type") || guessMime(name));
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
      h.includes("tikcdn") ||
      h.includes("tiktokv") ||
      h.includes("musical.ly") ||
      h.includes("byteoversea") ||
      h.includes("ibyteimg") ||
      h.includes("tikwm.com") ||
      h.includes("tiklydown") ||
      h.includes("tikdown") ||
      h.includes("ssstik") ||
      h.includes("snaptik") ||
      h.includes("tikmate") ||
      h.includes("douyinvod") ||
      h.includes("douyin") ||
      h.endsWith(".ttlivecdn.com") ||
      h.includes("susercontent") ||
      h.includes("akamaiedge") ||
      h.includes("akamaized") ||
      h.includes("cloudfront.net")
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
