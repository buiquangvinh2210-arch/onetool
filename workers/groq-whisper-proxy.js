/**
 * Cloudflare Worker — proxy Groq Whisper (dùng với GitHub Pages).
 * Secret: GROQ_API_KEY (wrangler secret put GROQ_API_KEY)
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

    if (request.method === "GET") {
      return json({ ok: true, service: "onetool-groq-proxy-cf" }, 200, cors);
    }

    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors);
    }

    if (!originAllowed(request, env)) {
      return json({ error: "Origin không được phép." }, 403, cors);
    }

    const key = (env.GROQ_API_KEY || "").trim();
    if (!key.startsWith("gsk_")) {
      return json(
        { error: "Chưa cấu hình GROQ_API_KEY trên Worker (wrangler secret put GROQ_API_KEY)." },
        500,
        cors
      );
    }

    let form;
    try {
      form = await request.formData();
    } catch (_) {
      return json({ error: "Body phải là multipart form-data" }, 400, cors);
    }

    const file = form.get("file");
    if (!file) return json({ error: "Thiếu file audio" }, 400, cors);

    const language = String(form.get("language") || "vi");
    const model = String(form.get("model") || "whisper-large-v3");
    const prompt = String(form.get("prompt") || "").trim();

    const out = new FormData();
    out.append("file", file, file.name || "audio.mp3");
    out.append("model", model === "whisper-large-v3-turbo" ? "whisper-large-v3" : model);
    if (language && language !== "auto") {
      out.append("language", language === "vietnamese" ? "vi" : language);
    }
    if (prompt) out.append("prompt", prompt.slice(0, 800));
    out.append("response_format", "verbose_json");
    out.append("temperature", "0");

    const upstream = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: out
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        ...cors,
        "Content-Type": upstream.headers.get("Content-Type") || "application/json"
      }
    });
  }
};

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
  // Cho phép *.github.io khi preview Pages
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
    headers: { ...cors, "Content-Type": "application/json" }
  });
}
