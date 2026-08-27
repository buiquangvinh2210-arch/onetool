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
      const providers = providerKeys(env);
      return json(
        {
          ok: true,
          service: "onetool-groq-proxy-cf",
          version: 7,
          features: ["whisper", "summarize"],
          chatModel: chatModelId(env),
          providers: {
            groq: providers.groq.startsWith("gsk_"),
            gemini: !!providers.gemini,
            openrouter: !!providers.openrouter
          },
          hasGroqKey: providers.groq.startsWith("gsk_"),
          keyHint: providers.groq ? (providers.groq.startsWith("gsk_") ? "ok" : "invalid_prefix") : "missing"
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

    const providers = providerKeys(env);
    if (!providers.groq.startsWith("gsk_") && !providers.gemini && !providers.openrouter) {
      return json(
        {
          error: "Chưa cấu hình nhà cung cấp AI. Thêm GROQ_API_KEY, GEMINI_API_KEY hoặc OPENROUTER_API_KEY trong Worker Secrets."
        },
        503,
        cors
      );
    }

    if (path === "/summarize") {
      return summarizeText(request, cors, env, providers);
    }

    return whisperTranscribe(request, cors, env, providers);
  }
};

const MAX_CHARS = 20000;
/* Soft cap giúp 1 request vừa khung free ~8k TPM (input+max_tokens). */
const SOFT_CHARS = 12000;

/* Groq đã tắt llama-3.3-70b (16/08/2026). Free/dev → openai/gpt-oss-20b. */
const DEFAULT_CHAT_MODEL = "openai/gpt-oss-20b";
/* Mỗi model có TPM riêng — 429 trên model A có thể thử B. */
const CHAT_FALLBACKS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.6-27b"];
const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-20b:free";

function providerKeys(env) {
  return {
    groq: String(env.GROQ_API_KEY || env.GROQ_KEY || "").trim(),
    gemini: String(env.GEMINI_API_KEY || "").trim(),
    openrouter: String(env.OPENROUTER_API_KEY || "").trim()
  };
}

function chatModelId(env) {
  const custom = String(env?.GROQ_CHAT_MODEL || "").trim();
  return custom || DEFAULT_CHAT_MODEL;
}

function chatModelCandidates(env) {
  const preferred = chatModelId(env);
  return [preferred, ...CHAT_FALLBACKS.filter((m) => m !== preferred)];
}

function geminiModelId(env) {
  const custom = String(env?.GEMINI_MODEL || "").trim();
  /* Gemini có thể vẫn còn giữ model cũ trong Worker Variables. */
  if (!custom || /gemini-2\.5-flash/i.test(custom)) return DEFAULT_GEMINI_MODEL;
  return custom;
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

function isFallbackError(status, msg) {
  const text = String(msg || "").toLowerCase();
  const locationUnsupported =
    Number(status) === 400 &&
    /user location|location.*not supported|not supported.*location|unsupported location|region.*not supported/.test(text);
  return (
    isRateLimited(status, msg) ||
    [408, 409, 425, 500, 502, 503, 504].includes(Number(status)) ||
    locationUnsupported
  );
}

function providerError(provider, status, message) {
  const e = new Error(String(message || `Lỗi từ ${provider}.`));
  e.provider = provider;
  e.status = Number(status) || 502;
  e.rateLimited = isRateLimited(e.status, e.message);
  return e;
}

async function readProviderJson(response, provider) {
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (_) {
    throw providerError(provider, response.status >= 400 ? response.status : 502, raw.slice(0, 240) || "Phản hồi không hợp lệ.");
  }
  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      raw.slice(0, 240) ||
      `HTTP ${response.status}`;
    throw providerError(provider, response.status, typeof message === "string" ? message : "Nhà cung cấp trả lỗi.");
  }
  return data;
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
    "Hết hạn mức AI miễn phí tạm thời. " +
    "Chờ khoảng " +
    s +
    " giây rồi bấm lại — hoặc rút ngắn văn bản."
  );
}

async function summarizeText(request, cors, env, providers) {
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

  const providersToTry = [];
  if (providers.groq.startsWith("gsk_")) {
    providersToTry.push({
      name: "groq",
      run: () => summarizeWithGroq(providers.groq, system, userMsg, maxTokens, env)
    });
  }
  if (providers.gemini) {
    providersToTry.push({
      name: "gemini",
      run: () => summarizeWithGemini(providers.gemini, system, userMsg, maxTokens, env)
    });
  }
  if (providers.openrouter) {
    providersToTry.push({
      name: "openrouter",
      run: () => summarizeWithOpenRouter(providers.openrouter, system, userMsg, maxTokens, env)
    });
  }

  for (const provider of providersToTry) {
    try {
      const result = await provider.run();
      return json(
        {
          ok: true,
          summary: result.summary,
          meta: {
            length,
            format,
            language,
            focus,
            inputChars: text.length,
            outputChars: result.summary.length,
            model: result.model,
            provider: provider.name,
            truncated: !!truncated
          }
        },
        200,
        cors
      );
    } catch (e) {
      lastErr = e.message || lastErr;
      lastStatus = e.status || 502;
      if (e.rateLimited) {
        lastRetry = parseRetryAfterSec(lastErr, e.retryAfter);
      }
      /* Chỉ chuyển nguồn khi lỗi quota / tạm thời; không che lỗi key sai. */
      if (!isFallbackError(lastStatus, lastErr)) {
        return json({ error: String(lastErr), provider: provider.name }, lastStatus, cors);
      }
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

async function summarizeWithGroq(key, system, userMsg, maxTokens, env) {
  let lastError;
  for (const model of chatModelCandidates(env)) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      const data = await readProviderJson(response, "groq");
      const summary = String(data?.choices?.[0]?.message?.content || "").trim();
      if (!summary) throw providerError("groq", 502, "AI không trả về nội dung tóm tắt.");
      return { summary, model };
    } catch (e) {
      lastError = e;
      if (!isRateLimited(e.status, e.message) && !isModelUnavailable(e.message)) throw e;
    }
  }
  throw lastError || providerError("groq", 502, "Groq không trả về kết quả.");
}

async function summarizeWithGemini(key, system, userMsg, maxTokens, env) {
  const model = geminiModelId(env);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userMsg }] }],
        generationConfig: { temperature: 0.25, maxOutputTokens: maxTokens }
      })
    }
  );
  const data = await readProviderJson(response, "gemini");
  const summary = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => String(part?.text || ""))
    .join("")
    .trim();
  if (!summary) throw providerError("gemini", 502, "Gemini không trả về nội dung tóm tắt.");
  return { summary, model };
}

async function summarizeWithOpenRouter(key, system, userMsg, maxTokens, env) {
  const model = openRouterFreeModel(env.OPENROUTER_CHAT_MODEL, DEFAULT_OPENROUTER_MODEL);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://onetool.vn",
      "X-Title": "OneTool"
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
  const data = await readProviderJson(response, "openrouter");
  const summary = String(data?.choices?.[0]?.message?.content || "").trim();
  if (!summary) throw providerError("openrouter", 502, "OpenRouter không trả về nội dung tóm tắt.");
  return { summary, model };
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

async function whisperTranscribe(request, cors, env, providers) {
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

  const candidates = [];
  if (providers.groq.startsWith("gsk_")) {
    candidates.push({
      name: "groq",
      run: () => transcribeWithGroq(providers.groq, file, language, model, prompt)
    });
  }
  if (providers.gemini) {
    candidates.push({
      name: "gemini",
      run: () => transcribeWithGemini(providers.gemini, file, language, env)
    });
  }
  if (providers.openrouter && String(env.OPENROUTER_AUDIO_MODEL || "").trim()) {
    candidates.push({
      name: "openrouter",
      run: () => transcribeWithOpenRouter(providers.openrouter, file, language, env)
    });
  }

  let lastError = providerError("ai", 503, "Không có nhà cung cấp nhận dạng audio khả dụng.");
  for (const candidate of candidates) {
    try {
      const data = await candidate.run();
      data.provider = candidate.name;
      return json(data, 200, cors);
    } catch (e) {
      lastError = e;
      if (!isFallbackError(e.status, e.message)) {
        return json({ error: e.message, provider: candidate.name }, e.status || 502, cors);
      }
    }
  }

  return json(
    {
      error: String(lastError.message || "Không gọi được dịch vụ nhận dạng."),
      code: lastError.rateLimited ? "rate_limit" : "transcription_unavailable"
    },
    lastError.status || 502,
    cors
  );
}

async function transcribeWithGroq(key, file, language, model, prompt) {
  const out = new FormData();
  out.append("file", file, file.name || "audio.mp3");
  out.append("model", model === "whisper-large-v3-turbo" ? "whisper-large-v3" : model);
  if (language && language !== "auto") {
    out.append("language", language === "vietnamese" ? "vi" : language);
  }
  if (prompt) out.append("prompt", prompt.slice(0, 800));
  out.append("response_format", "verbose_json");
  out.append("temperature", "0");

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: out
  });
  return readProviderJson(response, "groq");
}

async function transcribeWithGemini(key, file, language, env) {
  const MAX_INLINE_AUDIO_BYTES = 14 * 1024 * 1024;
  if (file.size > MAX_INLINE_AUDIO_BYTES) {
    throw providerError(
      "gemini",
      413,
      "File audio quá lớn cho fallback Gemini (tối đa khoảng 14 MB). Hãy dùng file ngắn hơn."
    );
  }

  const mimeType = file.type || mimeTypeFromName(file.name);
  const base64 = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
  const lang = language && language !== "auto" ? ` bằng ngôn ngữ ${language === "vietnamese" ? "tiếng Việt" : language}` : "";
  const customAudioModel = String(env.GEMINI_AUDIO_MODEL || "").trim();
  const model = customAudioModel && !/gemini-2\.5-flash/i.test(customAudioModel)
    ? customAudioModel
    : geminiModelId(env);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Chép lời toàn bộ audio nguyên văn" +
                  lang +
                  ". Chỉ trả về nội dung lời nói, không thêm tiêu đề, nhận xét hay markdown."
              },
              { inlineData: { mimeType, data: base64 } }
            ]
          }
        ],
        generationConfig: { temperature: 0 }
      })
    }
  );
  const data = await readProviderJson(response, "gemini");
  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => String(part?.text || ""))
    .join("")
    .trim();
  if (!text) throw providerError("gemini", 502, "Gemini không trả về bản chép lời.");
  return { text, segments: [{ start: 0, end: 0, text }] };
}

async function transcribeWithOpenRouter(key, file, language, env) {
  const MAX_INLINE_AUDIO_BYTES = 14 * 1024 * 1024;
  if (file.size > MAX_INLINE_AUDIO_BYTES) {
    throw providerError(
      "openrouter",
      413,
      "File audio quá lớn cho fallback OpenRouter (tối đa khoảng 14 MB)."
    );
  }
  const model = String(env.OPENROUTER_AUDIO_MODEL || "").trim();
  if (!model.endsWith(":free")) {
    throw providerError("openrouter", 400, "OpenRouter Audio fallback chỉ cho phép model miễn phí có đuôi :free.");
  }
  const format = mimeTypeFromName(file.name).split("/")[1] || "wav";
  const lang = language && language !== "auto" ? ` bằng ngôn ngữ ${language === "vietnamese" ? "tiếng Việt" : language}` : "";
  const base64 = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://onetool.vn",
      "X-Title": "OneTool"
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Chép lời toàn bộ audio nguyên văn${lang}. Chỉ trả về lời nói.` },
            { type: "input_audio", input_audio: { data: base64, format } }
          ]
        }
      ]
    })
  });
  const data = await readProviderJson(response, "openrouter");
  const text = String(data?.choices?.[0]?.message?.content || "").trim();
  if (!text) throw providerError("openrouter", 502, "OpenRouter không trả về bản chép lời.");
  return { text, segments: [{ start: 0, end: 0, text }] };
}

function openRouterFreeModel(value, fallback) {
  const model = String(value || "").trim();
  return model.endsWith(":free") ? model : fallback;
}

function mimeTypeFromName(name) {
  const ext = String(name || "").toLowerCase().split(".").pop();
  const map = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    mp4: "audio/mp4",
    webm: "audio/webm",
    ogg: "audio/ogg",
    flac: "audio/flac"
  };
  return map[ext] || "audio/wav";
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
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
