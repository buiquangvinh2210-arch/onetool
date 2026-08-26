/**
 * Cloudflare Worker — Groq proxy (Whisper + Tóm tắt AI).
 * Secret: GROQ_API_KEY
 * Deploy: wrangler deploy -c wrangler.toml
 *
 * GET  /           → health
 * POST /           → Whisper (multipart form-data, field file)
 * POST /summarize  → Chat completion tóm tắt (JSON)
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

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "GET" && (path === "/" || path === "")) {
      const key = String(env.GROQ_API_KEY || "").trim();
      return json(
        {
          ok: true,
          service: "onetool-groq-proxy-cf",
          version: 4,
          features: ["whisper", "summarize"],
          chatModel: chatModelId(env),
          hasGroqKey: key.startsWith("gsk_"),
          keyHint: key ? (key.startsWith("gsk_") ? "ok" : "invalid_prefix") : "missing"
        },
        200,
        cors
      );
    }

    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors);
    }

    if (!originAllowed(request, env)) {
      return json({ error: "Origin không được phép." }, 403, cors);
    }

    const key = String(env.GROQ_API_KEY || env.GROQ_KEY || "").trim();
    if (!key.startsWith("gsk_")) {
      return json(
        {
          error:
            "Chưa có GROQ_API_KEY trên Cloudflare Worker. Vào Workers → onetool-whisper → Settings → Variables and Secrets → Add → Secret, Name=GROQ_API_KEY, dán key gsk_... rồi Save."
        },
        500,
        cors
      );
    }

    if (path === "/summarize") {
      return summarizeText(request, key, cors, env);
    }

    return whisperTranscribe(request, key, cors);
  }
};

const MAX_CHARS = 20000;
/* Soft cap giúp 1 request vừa khung free ~8k TPM (input+max_tokens). */
const SOFT_CHARS = 12000;

/* Groq đã tắt llama-3.3-70b (16/08/2026). Free/dev → openai/gpt-oss-20b. */
const DEFAULT_CHAT_MODEL = "openai/gpt-oss-20b";
/* Mỗi model có TPM riêng — 429 trên model A có thể thử B. */
const CHAT_FALLBACKS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.6-27b"];

function chatModelId(env) {
  const custom = String(env?.GROQ_CHAT_MODEL || "").trim();
  return custom || DEFAULT_CHAT_MODEL;
}

function chatModelCandidates(env) {
  const preferred = chatModelId(env);
  return [preferred, ...CHAT_FALLBACKS.filter((m) => m !== preferred)];
}

function isModelUnavailable(msg) {
  const t = String(msg || "").toLowerCase();
  return (
    t.includes("does not exist") ||
    t.includes("do not have access") ||
    t.includes("decommissioned") ||
    t.includes("model_not_found") ||
    t.includes("model_decommissioned")
  );
}

function isRateLimited(status, msg) {
  if (status === 429) return true;
  const t = String(msg || "").toLowerCase();
  return t.includes("rate limit") || t.includes("too many requests");
}

function parseRetryAfterSec(msg, headerVal) {
  const h = Number(headerVal);
  if (Number.isFinite(h) && h > 0) return Math.min(45, Math.ceil(h));
  const m = String(msg || "").match(/try again in\s*([\d.]+)\s*s/i);
  if (m) return Math.min(45, Math.max(1, Math.ceil(Number(m[1]))));
  return 8;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function friendlyRateLimitError(retrySec) {
  const s = Math.max(1, Number(retrySec) || 8);
  return (
    "Hết hạn mức AI miễn phí tạm thời (Groq ~8.000 token/phút). " +
    "Chờ khoảng " +
    s +
    " giây rồi bấm lại — hoặc rút ngắn văn bản."
  );
}

async function summarizeText(request, key, cors, env) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return json({ error: "JSON không hợp lệ." }, 400, cors);
  }

  let text = String(body?.text || "").trim();
  if (!text) return json({ error: "Thiếu nội dung cần tóm tắt." }, 400, cors);
  if (text.length < 40) {
    return json({ error: "Nội dung quá ngắn — cần ít nhất ~40 ký tự." }, 400, cors);
  }
  if (text.length > MAX_CHARS) {
    return json(
      {
        error:
          "Nội dung quá dài (tối đa " +
          MAX_CHARS.toLocaleString("vi-VN") +
          " ký tự). Hãy cắt bớt hoặc chia nhỏ rồi tóm tắt từng phần."
      },
      400,
      cors
    );
  }

  const truncated = text.length > SOFT_CHARS;
  if (truncated) text = text.slice(0, SOFT_CHARS);

  const length = normalizeChoice(body?.length, ["short", "medium", "long"], "medium");
  const format = normalizeChoice(body?.format, ["paragraph", "bullets", "keypoints"], "bullets");
  const language = normalizeChoice(body?.language, ["vi", "en", "auto"], "vi");
  const focus = normalizeChoice(body?.focus, ["general", "action", "study"], "general");

  const system = buildSystemPrompt({ length, format, language, focus });
  const userMsg =
    "Nội dung cần tóm tắt" +
    (truncated ? " (đã cắt phần đầu để vừa hạn mức miễn phí)" : "") +
    ":\n\n---\n" +
    text +
    "\n---\n\nHãy tóm tắt theo yêu cầu.";
  /* max_tokens thấp hơn → ít bị chặn TPM khi đã dùng gần hết phút. */
  const maxTokens = length === "long" ? 900 : length === "short" ? 320 : 560;

  let lastErr = "Không gọi được dịch vụ tóm tắt (Groq). Thử lại sau vài giây.";
  let lastStatus = 502;
  let lastRetry = 8;

  for (const model of chatModelCandidates(env)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0.25,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg }
          ]
        })
      });

      const raw = await upstream.text();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (_) {
        return json({ error: "Máy chủ AI trả dữ liệu lỗi." }, 502, cors);
      }

      if (!upstream.ok) {
        lastErr = parsed?.error?.message || parsed?.message || lastErr;
        lastStatus = upstream.status >= 400 ? upstream.status : 502;

        if (isModelUnavailable(lastErr)) break;

        if (isRateLimited(upstream.status, lastErr)) {
          lastRetry = parseRetryAfterSec(lastErr, upstream.headers.get("retry-after"));
          if (attempt === 0 && lastRetry <= 16) {
            await sleep(lastRetry * 1000);
            continue;
          }
          /* Thử model khác (TPM riêng) trước khi trả lỗi. */
          break;
        }

        return json({ error: String(lastErr) }, lastStatus, cors);
      }

      const summary = String(parsed?.choices?.[0]?.message?.content || "").trim();
      if (!summary) return json({ error: "AI không trả về nội dung tóm tắt." }, 502, cors);

      return json(
        {
          ok: true,
          summary,
          meta: {
            length,
            format,
            language,
            focus,
            inputChars: text.length,
            outputChars: summary.length,
            model,
            truncated: !!truncated
          }
        },
        200,
        cors
      );
    }
  }

  if (isRateLimited(lastStatus, lastErr)) {
    return json(
      {
        error: friendlyRateLimitError(lastRetry),
        code: "rate_limit",
        retryAfter: lastRetry
      },
      429,
      cors
    );
  }

  return json({ error: String(lastErr) }, lastStatus, cors);
}

function buildSystemPrompt({ length, format, language, focus }) {
  const lenMap = {
    short: "Rất ngắn gọn (khoảng 3–5 câu hoặc 4–6 gạch đầu dòng).",
    medium: "Độ dài vừa phải (tóm ý chính, khoảng 8–15 câu hoặc 8–12 gạch đầu dòng).",
    long: "Chi tiết hơn nhưng vẫn cô đọng (đủ ý quan trọng, không lan man)."
  };
  const fmtMap = {
    paragraph: "Viết thành đoạn văn liền mạch, dễ đọc.",
    bullets: "Dùng gạch đầu dòng (- ) rõ ràng, mỗi ý một dòng.",
    keypoints:
      "Cấu trúc: (1) TL;DR 1–2 câu, (2) Các điểm chính dạng gạch đầu dòng, (3) Kết luận ngắn nếu phù hợp."
  };
  const langMap = {
    vi: "Viết toàn bộ bằng tiếng Việt tự nhiên, chuẩn mực.",
    en: "Write the entire summary in clear English.",
    auto: "Giữ cùng ngôn ngữ với nội dung nguồn (nếu hỗn hợp, ưu tiên tiếng Việt)."
  };
  const focusMap = {
    general: "Tập trung ý chính, luận điểm, kết luận.",
    action: "Ưu tiên việc cần làm, quyết định, deadline, người chịu trách nhiệm nếu có.",
    study: "Ưu tiên định nghĩa, công thức, khái niệm then chốt, dễ ôn tập."
  };

  return [
    "Bạn là trợ lý tóm tắt chuyên nghiệp cho OneTool.",
    "Chỉ trả về phần tóm tắt — không mở đầu bằng lời chào, không giải thích quy trình.",
    "Không bịa thông tin không có trong văn bản nguồn.",
    lenMap[length],
    fmtMap[format],
    langMap[language],
    focusMap[focus]
  ].join(" ");
}

function normalizeChoice(v, allowed, fallback) {
  const s = String(v || "").toLowerCase().trim();
  return allowed.includes(s) ? s : fallback;
}

async function whisperTranscribe(request, key, cors) {
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
