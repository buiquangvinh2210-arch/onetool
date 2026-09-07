/**
 * Cloudflare Worker — Groq proxy (Whisper + Tóm tắt AI).
 * Secret: GROQ_API_KEY
 * Deploy: wrangler deploy -c wrangler.toml
 *
 * GET  /           → health
 * POST /           → Whisper (multipart audio) hoặc OCR nếu file là ảnh
 * POST /summarize  → Chat completion tóm tắt (JSON)
 * POST /ocr        → OCR ảnh → chữ (JSON { image, mime, language } hoặc multipart field file)
 * POST /tts        → Text → giọng nói (JSON { text, voice })
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
          version: 21,
          features: ["whisper", "summarize", "ocr", "tts"],
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
    const isTts = path === "/tts" || path.endsWith("/tts");
    if (!isTts && !providers.groq.startsWith("gsk_") && !providers.gemini && !providers.openrouter) {
      return json(
        {
          error: "Chưa cấu hình nhà cung cấp AI. Thêm GROQ_API_KEY, GEMINI_API_KEY hoặc OPENROUTER_API_KEY trong Worker Secrets."
        },
        503,
        cors
      );
    }

    const contentType = (request.headers.get("Content-Type") || "").toLowerCase();

    if (path === "/summarize" || path.endsWith("/summarize")) {
      return summarizeText(request, cors, env, providers);
    }

    if (path === "/ocr" || path.endsWith("/ocr")) {
      return ocrImage(request, cors, env, providers);
    }

    if (path === "/tts" || path.endsWith("/tts")) {
      return ttsSpeak(request, cors, env, providers);
    }

    if (contentType.includes("application/json")) {
      let peek;
      try {
        peek = await request.clone().json();
      } catch (_) {
        return json({ error: "JSON không hợp lệ." }, 400, cors);
      }
      if (peek && typeof peek.image === "string") {
        try {
          return runOcrPayload(parseOcrJson(peek), cors, env, providers);
        } catch (e) {
          return json({ error: e.message || "Không đọc được ảnh OCR." }, e.status || 400, cors);
        }
      }
      return json(
        {
          error: "OCR ảnh: POST /ocr (JSON hoặc multipart). Audio → Text: POST / với multipart field file."
        },
        400,
        cors
      );
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
const DEFAULT_OPENROUTER_MODEL = "google/gemma-4-31b-it:free";
const OPENROUTER_CHAT_FALLBACKS = [
  "google/gemma-4-31b-it:free",
  "minimax/minimax-m2.7:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "liquid/lfm-2.5-2.6b:free"
];
const GROQ_VISION_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct"
];
const OPENROUTER_VISION_FALLBACKS = [
  "openrouter/free",
  "google/gemma-4-31b-it:free"
];
const MAX_OCR_BYTES = 3.5 * 1024 * 1024;
const MAX_TTS_CHARS = 8000;
const EDGE_TTS_CHUNK = 1500;
const EDGE_TTS_PARALLEL = 1;
const GEMINI_TTS_MODELS = [
  "gemini-2.5-flash-preview-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-tts"
];
const GEMINI_TTS_VOICES = [
  "Kore",
  "Aoede",
  "Leda",
  "Zephyr",
  "Charon",
  "Puck",
  "Fenrir",
  "Orus"
];
const GROQ_TTS_VOICE_MAP = {
  Kore: "hannah",
  Aoede: "hannah",
  Leda: "hannah",
  Zephyr: "hannah",
  Charon: "austin",
  Puck: "troy",
  Fenrir: "austin",
  Orus: "troy"
};
const GROQ_TTS_MODELS = ["canopylabs/orpheus-v1-english"];
const OPENROUTER_TTS_MODELS = [
  "google/gemini-3.1-flash-tts-preview",
  "google/gemini-2.5-flash-preview-tts"
];
const VI_TTS_CHUNK = 180;
const EDGE_TTS_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const EDGE_TTS_GEC_VER = "1-143.0.3650.75";
const VI_VOICE_PRESETS = {
  Kore: { name: "vi-VN-HoaiMyNeural", pitch: "+0%", rate: "+0%" },
  Aoede: { name: "vi-VN-HoaiMyNeural", pitch: "+8%", rate: "-5%" },
  Leda: { name: "vi-VN-HoaiMyNeural", pitch: "+14%", rate: "+8%" },
  Zephyr: { name: "vi-VN-HoaiMyNeural", pitch: "+6%", rate: "+12%" },
  Charon: { name: "vi-VN-NamMinhNeural", pitch: "-8%", rate: "-8%" },
  Puck: { name: "vi-VN-NamMinhNeural", pitch: "+6%", rate: "+8%" },
  Fenrir: { name: "vi-VN-NamMinhNeural", pitch: "-14%", rate: "+0%" },
  Orus: { name: "vi-VN-NamMinhNeural", pitch: "-2%", rate: "-6%" }
};

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
    t.includes("model_decommissioned") ||
    t.includes("unavailable for free") ||
    t.includes("use this slug instead") ||
    t.includes("no endpoints found") ||
    t.includes("no available endpoint") ||
    t.includes("not found")
  );
}

function isRateLimited(status, msg) {
  if (status === 429) return true;
  const t = String(msg || "").toLowerCase();
  return t.includes("rate limit") || t.includes("too many requests");
}

function isFallbackError(status, msg) {
  const text = String(msg || "").toLowerCase();
  const badRequest =
    Number(status) === 400 &&
    /invalid argument|unknown name|unknown field|thinkingconfig|reasoning|invalid json/i.test(text);
  const locationUnsupported =
    Number(status) === 400 &&
    /user location|location.*not supported|not supported.*location|unsupported location|region.*not supported/.test(text);
  return (
    isRateLimited(status, msg) ||
    isModelUnavailable(msg) ||
    badRequest ||
    [404, 408, 409, 425, 500, 502, 503, 504].includes(Number(status)) ||
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

function publicErrorStatus(status) {
  const n = Number(status) || 502;
  if (n === 404 || n === 405) return 502;
  return n;
}

function publicOcrError(msg) {
  const t = String(msg || "").trim();
  if (!t) return "Không đọc được chữ trong ảnh. Thử ảnh rõ hơn hoặc crop vùng chữ rồi nhận dạng lại.";
  if (
    /openrouter|gemini|groq|slug instead|unavailable for free|no endpoints found|invalid argument/i.test(t)
  ) {
    return "Không đọc được chữ trong ảnh. Thử ảnh rõ hơn, xoay đúng chiều, hoặc crop vùng chữ rồi nhận dạng lại.";
  }
  return t;
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
  const preferred = openRouterFreeModel(env.OPENROUTER_CHAT_MODEL, DEFAULT_OPENROUTER_MODEL);
  const models = [preferred, ...OPENROUTER_CHAT_FALLBACKS.filter((m) => m !== preferred)];
  let lastError;

  for (const model of models) {
    try {
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
    } catch (e) {
      lastError = e;
      if (!isModelUnavailable(e.message) && !isRateLimited(e.status, e.message)) throw e;
    }
  }

  throw lastError || providerError("openrouter", 502, "OpenRouter không trả về nội dung tóm tắt.");
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

async function ocrImage(request, cors, env, providers) {
  let payload;
  try {
    payload = await parseOcrRequest(request);
  } catch (e) {
    return json({ error: e.message || "Không đọc được ảnh OCR." }, e.status || 400, cors);
  }
  return runOcrPayload(payload, cors, env, providers);
}

function parseOcrJson(body) {
  const mime = String(body?.mime || "image/jpeg").toLowerCase();
  if (!/^image\/(jpeg|jpg|png|webp)$/.test(mime)) {
    const err = new Error("Ảnh OCR chỉ nhận JPG, PNG hoặc WebP.");
    err.status = 400;
    throw err;
  }
  let b64 = String(body?.image || "").replace(/\s/g, "");
  if (b64.indexOf("base64,") >= 0) b64 = b64.slice(b64.indexOf("base64,") + 7);
  if (!b64 || b64.length < 80) {
    const err = new Error("Thiếu dữ liệu ảnh.");
    err.status = 400;
    throw err;
  }
  const approxBytes = Math.ceil((b64.length * 3) / 4);
  if (approxBytes > MAX_OCR_BYTES) {
    const err = new Error("Ảnh quá lớn để OCR (tối đa khoảng 3,5 MB sau khi nén).");
    err.status = 413;
    throw err;
  }
  return {
    mime: mime === "image/jpg" ? "image/jpeg" : mime,
    b64,
    language: normalizeChoice(body?.language, ["vi", "en", "auto", "mix"], "mix")
  };
}

function uint8ToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function parseOcrForm(form) {
  const file = form.get("file") || form.get("image");
  if (!file || typeof file === "string") {
    const err = new Error("Thiếu file ảnh.");
    err.status = 400;
    throw err;
  }
  const mime = String(form.get("mime") || file.type || "image/jpeg").toLowerCase();
  if (!/^image\/(jpeg|jpg|png|webp)$/.test(mime)) {
    const err = new Error("Ảnh OCR chỉ nhận JPG, PNG hoặc WebP.");
    err.status = 400;
    throw err;
  }
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf.byteLength < 32) {
    const err = new Error("Thiếu dữ liệu ảnh.");
    err.status = 400;
    throw err;
  }
  if (buf.byteLength > MAX_OCR_BYTES) {
    const err = new Error("Ảnh quá lớn để OCR (tối đa khoảng 3,5 MB sau khi nén).");
    err.status = 413;
    throw err;
  }
  return {
    mime: mime === "image/jpg" ? "image/jpeg" : mime,
    b64: uint8ToBase64(buf),
    language: normalizeChoice(form.get("language"), ["vi", "en", "auto", "mix"], "mix")
  };
}

async function parseOcrRequest(request) {
  const ct = (request.headers.get("Content-Type") || "").toLowerCase();
  if (ct.includes("multipart/form-data")) {
    let form;
    try {
      form = await request.formData();
    } catch (_) {
      const err = new Error("Form OCR không hợp lệ.");
      err.status = 400;
      throw err;
    }
    return parseOcrForm(form);
  }
  let body;
  try {
    body = await request.json();
  } catch (_) {
    const err = new Error("JSON không hợp lệ.");
    err.status = 400;
    throw err;
  }
  return parseOcrJson(body);
}

async function runOcrPayload(payload, cors, env, providers) {
  const { mime, b64, language } = payload;
  const prompt = buildOcrPrompt(language);

  const providersToTry = [];
  if (providers.gemini) {
    providersToTry.push({
      name: "gemini",
      run: () => ocrWithGemini(providers.gemini, b64, mime, prompt, env)
    });
  }
  if (providers.groq.startsWith("gsk_")) {
    providersToTry.push({
      name: "groq",
      run: () => ocrWithGroq(providers.groq, b64, mime, prompt, env)
    });
  }
  if (providers.openrouter) {
    providersToTry.push({
      name: "openrouter",
      run: () => ocrWithOpenRouter(providers.openrouter, b64, mime, prompt, env)
    });
  }

  if (!providersToTry.length) {
    return json({ error: "Chưa cấu hình nhà cung cấp AI cho OCR." }, 503, cors);
  }

  let lastErr = "Không gọi được dịch vụ OCR.";
  let lastStatus = 502;
  let lastRetry = 8;

  for (const provider of providersToTry) {
    try {
      const result = await provider.run();
      return json(
        {
          ok: true,
          text: result.text,
          meta: {
            language,
            model: result.model,
            provider: provider.name
          }
        },
        200,
        cors
      );
    } catch (e) {
      lastErr = e.message || lastErr;
      lastStatus = e.status || 502;
      if (e.rateLimited) lastRetry = parseRetryAfterSec(lastErr, e.retryAfter);
      if (!isFallbackError(lastStatus, lastErr)) {
        return json({ error: publicOcrError(lastErr), provider: provider.name }, publicErrorStatus(lastStatus), cors);
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

  return json({ error: publicOcrError(lastErr) }, publicErrorStatus(lastStatus), cors);
}

function buildOcrPrompt(language) {
  const langLine =
    language === "en"
      ? "The image may be English, Vietnamese, or mixed. Transcribe every script you see. Do not translate Vietnamese into English."
      : language === "vi"
        ? "Ảnh có thể tiếng Việt, tiếng Anh, hoặc lẫn cả hai. Đọc hết cả hai. Không dịch tiếng Anh sang tiếng Việt."
        : "Ảnh thường lẫn tiếng Việt và tiếng Anh (hóa đơn, CCCD, UI, sách, screenshot). Đọc HẾT cả hai ngôn ngữ — không bỏ ngôn ngữ nào.";
  return [
    "Bạn là OCR song ngữ Việt–Anh.",
    "Đọc TOÀN BỘ chữ nhìn thấy: tiếng Việt CÓ ĐẦY ĐỦ DẤU thanh, và tiếng Anh nguyên văn.",
    langLine,
    "Không dịch, không phiên âm, không tóm tắt, không thêm tiêu đề, không markdown.",
    "Không bỏ dấu tiếng Việt, không chuyển thành không dấu. Phân biệt Đ/đ với D/d, ă/â/ơ/ư, số 0/O, 1/l/I.",
    "Giữ nguyên từ Anh (tên riêng, UI, email, URL, mã). Giữ số và ký hiệu đúng như ảnh.",
    "Giữ xuống dòng và thứ tự đọc (trái→phải, trên→dưới) theo bố cục ảnh.",
    "Không bịa chữ không có trong ảnh. Chỗ không đọc được thì ghi [không rõ].",
    "Chỉ trả về văn bản đã đọc."
  ].join(" ");
}

function stripOcrFences(raw) {
  let s = String(raw || "").trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return s.replace(/\u00A0/g, " ").normalize("NFC").trim();
}

function extractChatText(message) {
  if (!message || typeof message !== "object") return "";
  const chunks = [];
  const push = (v) => {
    const s = String(v || "").trim();
    if (s) chunks.push(s);
  };
  const content = message.content;
  if (typeof content === "string") push(content);
  else if (Array.isArray(content)) {
    content.forEach((part) => {
      if (typeof part === "string") push(part);
      else if (part && typeof part === "object") push(part.text || part.content);
    });
  }
  if (!chunks.length) {
    push(message.reasoning);
    push(message.reasoning_content);
  }
  return stripOcrFences(chunks.join("\n"));
}

function extractGeminiOcrText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return stripOcrFences(parts.map((part) => String(part?.text || "")).join(""));
}

async function ocrWithGemini(key, b64, mime, prompt, env) {
  const preferred = geminiModelId(env);
  const models = [preferred, "gemini-2.5-flash", "gemini-2.0-flash"].filter(
    (m, i, arr) => m && arr.indexOf(m) === i
  );
  let lastError;
  for (const model of models) {
    try {
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
                  { text: prompt },
                  { inlineData: { mimeType: mime === "image/jpg" ? "image/jpeg" : mime, data: b64 } }
                ]
              }
            ],
            generationConfig: { temperature: 0, maxOutputTokens: 8192 }
          })
        }
      );
      const data = await readProviderJson(response, "gemini");
      const text = extractGeminiOcrText(data);
      if (!text) throw providerError("gemini", 502, "Gemini không đọc được chữ trong ảnh.");
      return { text, model };
    } catch (e) {
      lastError = e;
      if (!isFallbackError(e.status, e.message) && !isModelUnavailable(e.message)) throw e;
    }
  }
  throw lastError || providerError("gemini", 502, "Gemini không đọc được chữ trong ảnh.");
}

async function ocrWithGroq(key, b64, mime, prompt, env) {
  const custom = String(env?.GROQ_VISION_MODEL || "").trim();
  const models = custom
    ? [custom, ...GROQ_VISION_MODELS.filter((m) => m !== custom)]
    : GROQ_VISION_MODELS.slice();
  const dataUrl = "data:" + (mime === "image/jpg" ? "image/jpeg" : mime) + ";base64," + b64;
  let lastError;
  for (const model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          max_tokens: 8192,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } }
              ]
            }
          ]
        })
      });
      const data = await readProviderJson(response, "groq");
      const text = extractChatText(data?.choices?.[0]?.message);
      if (!text) throw providerError("groq", 502, "Groq không đọc được chữ trong ảnh.");
      return { text, model };
    } catch (e) {
      lastError = e;
      if (!isFallbackError(e.status, e.message) && !isModelUnavailable(e.message)) throw e;
    }
  }
  throw lastError || providerError("groq", 502, "Groq Vision không trả về kết quả.");
}

async function ocrWithOpenRouter(key, b64, mime, prompt, env) {
  const models = openRouterOcrModels(env);
  const dataUrl = "data:" + (mime === "image/jpg" ? "image/jpeg" : mime) + ";base64," + b64;
  let lastError;
  for (const model of models) {
    try {
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
          max_tokens: 8192,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } }
              ]
            }
          ]
        })
      });
      const data = await readProviderJson(response, "openrouter");
      const text = extractChatText(data?.choices?.[0]?.message);
      if (!text) throw providerError("openrouter", 502, "OpenRouter không đọc được chữ trong ảnh.");
      return { text, model };
    } catch (e) {
      lastError = e;
      if (!isFallbackError(e.status, e.message) && !isModelUnavailable(e.message)) throw e;
    }
  }
  if (lastError && isRateLimited(lastError.status, lastError.message)) throw lastError;
  throw providerError(
    "openrouter",
    502,
    "Hết model OCR miễn phí tạm thời. Chờ vài giây rồi thử lại — không dùng model trả phí."
  );
}

function openRouterOcrModels(env) {
  const custom = String(env?.OPENROUTER_VISION_MODEL || "").trim();
  const out = [];
  if (isAllowedOpenRouterOcrModel(custom)) out.push(custom);
  OPENROUTER_VISION_FALLBACKS.forEach((m) => {
    if (!out.includes(m)) out.push(m);
  });
  return out;
}

function isAllowedOpenRouterOcrModel(model) {
  const m = String(model || "").trim();
  if (!m) return false;
  if (/llama-4-scout/i.test(m)) return false;
  return m === "openrouter/free" || m.endsWith(":free");
}

async function ttsSpeak(request, cors, env, providers) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return json({ error: "JSON không hợp lệ." }, 400, cors);
  }

  const text = String(body?.text || "").replace(/\u00A0/g, " ").trim();
  if (!text) return json({ error: "Nhập văn bản cần đọc." }, 400, cors);
  if (text.length < 2) return json({ error: "Văn bản quá ngắn." }, 400, cors);
  if (text.length > MAX_TTS_CHARS) {
    return json(
      { error: "Tối đa " + MAX_TTS_CHARS.toLocaleString("vi-VN") + " ký tự mỗi lần đọc." },
      413,
      cors
    );
  }

  const voice = normalizeTtsVoice(body?.voice);
  const style = normalizeChoice(body?.style, ["natural", "clear", "warm"], "natural");

  const providersToTry = [
    {
      name: "vi",
      run: () => ttsWithEdgeNeural(text, voice, style)
    },
    {
      name: "vi",
      run: () => ttsWithViNeural(text)
    }
  ];

  if (!providersToTry.length) {
    return json({ error: "Chưa cấu hình dịch vụ đọc thành tiếng." }, 503, cors);
  }

  let lastErr = "Không tạo được giọng đọc.";
  let lastStatus = 502;
  let lastRetry = 8;

  for (const provider of providersToTry) {
    try {
      const result = await provider.run();
      return json(
        {
          ok: true,
          audio: result.audio,
          mime: result.mime || "audio/wav",
          meta: {
            voice,
            style,
            chars: text.length,
            model: result.model,
            provider: provider.name
          }
        },
        200,
        cors
      );
    } catch (e) {
      lastErr = e.message || lastErr;
      lastStatus = e.status || 502;
      if (e.rateLimited) lastRetry = parseRetryAfterSec(lastErr, e.retryAfter);
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

  return json(
    { error: publicTtsError(lastErr), debug: String(lastErr || "").slice(0, 180) },
    publicErrorStatus(lastStatus),
    cors
  );
}

function publicTtsError(msg) {
  const t = String(msg || "").trim();
  if (/rate limit|hết hạn mức|tokens per minute/i.test(t)) {
    return t;
  }
  if (/openrouter|gemini|groq|playai|invalid argument|not found|unavailable/i.test(t)) {
    return "Không tạo được giọng đọc lúc này. Chờ vài giây rồi thử lại, hoặc dùng Nghe thử trên máy.";
  }
  return t || "Không tạo được giọng đọc.";
}

function normalizeTtsVoice(v) {
  const s = String(v || "").trim();
  const hit = GEMINI_TTS_VOICES.find((name) => name.toLowerCase() === s.toLowerCase());
  return hit || "Kore";
}

function geminiTtsModels(env) {
  const custom = String(env?.GEMINI_TTS_MODEL || "").trim();
  const list = [];
  if (custom && /tts/i.test(custom)) list.push(custom);
  GEMINI_TTS_MODELS.forEach((m) => {
    if (!list.includes(m)) list.push(m);
  });
  return list;
}

function ttsGeminiInput(text, style) {
  const tone =
    style === "clear" ? "clearly and steadily" : style === "warm" ? "warmly and kindly" : "naturally";
  return `Speak ${tone} in Vietnamese:\n${text}`;
}

function geminiTtsBody(text, voice, model) {
  return {
    model,
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } }
      }
    }
  };
}

function extractGeminiInlineAudio(data) {
  if (!data || typeof data !== "object") return null;
  const asInline = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    const nested = obj.inlineData || obj.inline_data;
    if (nested?.data) return nested;
    if (obj.data && typeof obj.data === "string") {
      return {
        data: obj.data,
        mimeType: obj.mimeType || obj.mime_type || obj.mime || "audio/L16;rate=24000"
      };
    }
    return null;
  };
  const buckets = [
    data.output_audio,
    data.outputAudio,
    data.audio,
    data.output?.audio,
    data.output?.output_audio
  ];
  if (Array.isArray(data.outputs)) {
    data.outputs.forEach((item) => {
      buckets.push(item, item?.audio, item?.output_audio, item?.outputAudio);
    });
  }
  for (const item of buckets) {
    const hit = asInline(item);
    if (hit) return hit;
  }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const hit = asInline(part);
    if (hit) return hit;
  }
  return null;
}

function parseAudioRate(mime) {
  const m = String(mime || "").match(/rate=(\d+)/i);
  const n = m ? Number(m[1]) : 24000;
  return Number.isFinite(n) && n >= 8000 ? n : 24000;
}

function b64ToBytes(b64) {
  const bin = atob(String(b64 || "").replace(/\s/g, ""));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function pcmToWav(pcm, sampleRate, numChannels, bitDepth) {
  const ch = numChannels || 1;
  const bits = bitDepth || 16;
  const blockAlign = ch * (bits / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcm.length;
  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, ch, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bits, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  new Uint8Array(buf).set(pcm, 44);
  return new Uint8Array(buf);
}

function audioPartToWavB64(inline) {
  const mime = String(inline?.mimeType || inline?.mime_type || "").toLowerCase();
  const raw = String(inline?.data || "").replace(/\s/g, "");
  if (!raw) throw providerError("gemini", 502, "Không nhận được dữ liệu âm thanh.");
  if (mime.includes("wav") || mime.includes("mpeg") || mime.includes("mp3")) {
    return { audio: raw, mime: mime.includes("mpeg") || mime.includes("mp3") ? "audio/mpeg" : "audio/wav" };
  }
  const pcm = b64ToBytes(raw);
  const wav = pcmToWav(pcm, parseAudioRate(mime));
  return { audio: uint8ToBase64(wav), mime: "audio/wav" };
}

function ttsShouldRetry(err) {
  const status = Number(err?.status) || 0;
  if (status === 401 || status === 403) return false;
  return true;
}

async function ttsWithGemini(key, text, voice, env) {
  const models = geminiTtsModels(env);
  const headers = {
    "x-goog-api-key": key,
    "Content-Type": "application/json"
  };
  let lastError;
  for (const model of models) {
    const attempts = [
      {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        body: geminiTtsBody(text, voice, model)
      }
    ];
    for (const attempt of attempts) {
      try {
        const response = await fetch(attempt.url, {
          method: "POST",
          headers,
          body: JSON.stringify(attempt.body)
        });
        const data = await readProviderJson(response, "gemini");
        const inline = extractGeminiInlineAudio(data);
        if (!inline?.data) throw providerError("gemini", 502, "Gemini không trả về âm thanh.");
        const wav = audioPartToWavB64(inline);
        return { audio: wav.audio, mime: wav.mime, model };
      } catch (e) {
        lastError = e;
        if (!ttsShouldRetry(e)) throw e;
      }
    }
  }
  throw lastError || providerError("gemini", 502, "Gemini TTS không trả về kết quả.");
}

function splitTtsChunks(text, max) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (!s) return [];
  if (s.length <= max) return [s];
  const parts = [];
  let rest = s;
  while (rest.length > max) {
    let cut = rest.lastIndexOf(" ", max);
    if (cut < Math.floor(max * 0.45)) cut = max;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

function splitEdgeTtsChunks(text, max) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (!s) return [];
  if (s.length <= max) return [s];
  const parts = [];
  let rest = s;
  const isBreak = (ch) => /[.!?;:\n…\u3002]/.test(ch);
  while (rest.length > max) {
    const window = rest.slice(0, max);
    let cut = -1;
    for (let i = window.length - 1; i >= Math.floor(max * 0.4); i--) {
      if (isBreak(window[i])) {
        cut = i + 1;
        break;
      }
    }
    if (cut < 0) cut = window.lastIndexOf(" ");
    if (cut < Math.floor(max * 0.4)) cut = max;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const idx = next++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  const n = Math.max(1, Math.min(limit, items.length));
  const runners = [];
  for (let i = 0; i < n; i++) runners.push(worker());
  await Promise.all(runners);
  return out;
}

async function readSpeechAudio(response, provider) {
  const ct = String(response.headers.get("Content-Type") || "").toLowerCase();
  if (!response.ok || ct.includes("application/json") || ct.includes("text/")) {
    await readProviderJson(response, provider);
    throw providerError(provider, response.status || 502, "TTS lỗi.");
  }
  const buf = new Uint8Array(await response.arrayBuffer());
  if (buf.byteLength < 64) throw providerError(provider, 502, "Không trả về âm thanh.");
  if (ct.includes("mpeg") || ct.includes("mp3")) {
    return { audio: uint8ToBase64(buf), mime: "audio/mpeg" };
  }
  if (ct.includes("wav")) {
    return { audio: uint8ToBase64(buf), mime: "audio/wav" };
  }
  const wav = pcmToWav(buf, parseAudioRate(ct));
  return { audio: uint8ToBase64(wav), mime: "audio/wav" };
}

async function ttsWithOpenRouterSpeech(key, text, voice, env) {
  const custom = String(env?.OPENROUTER_TTS_MODEL || "").trim();
  const models = custom
    ? [custom, ...OPENROUTER_TTS_MODELS.filter((m) => m !== custom)]
    : OPENROUTER_TTS_MODELS.slice();
  let lastError;
  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://onetool.vn",
          "X-Title": "OneTool"
        },
        body: JSON.stringify({
          model,
          input: text,
          voice,
          response_format: "mp3"
        })
      });
      const result = await readSpeechAudio(response, "openrouter");
      return { ...result, model };
    } catch (e) {
      lastError = e;
      if (!ttsShouldRetry(e)) throw e;
    }
  }
  throw lastError || providerError("openrouter", 502, "OpenRouter TTS không trả về kết quả.");
}

function escapeXml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function viVoicePreset(voice, style) {
  const base = VI_VOICE_PRESETS[voice] || VI_VOICE_PRESETS.Kore;
  let rate = parseInt(String(base.rate).replace("%", ""), 10) || 0;
  if (style === "clear") rate -= 8;
  if (style === "warm") rate -= 4;
  return {
    name: base.name,
    pitch: base.pitch,
    rate: (rate >= 0 ? "+" : "") + rate + "%"
  };
}

function uuid4() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
}

async function edgeSecMsGec() {
  const ticks = Math.floor(Date.now() / 1000) + 11644473600;
  const rounded = ticks - (ticks % 300);
  const windowsTicks = rounded * 10000000;
  const data = new TextEncoder().encode(String(windowsTicks) + EDGE_TTS_TOKEN);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function toUint8(data) {
  if (!data) return null;
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return null;
}

function extractEdgeAudio(bytes) {
  if (!bytes || bytes.byteLength < 4) return null;
  try {
    const headerLength = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt16(0);
    if (headerLength > 0 && bytes.byteLength > headerLength + 2) {
      const out = bytes.subarray(2 + headerLength);
      return out.byteLength ? out : null;
    }
  } catch (_) {}
  const needle = "Path:audio\r\n";
  const latin = new TextDecoder("latin1").decode(bytes);
  let at = latin.indexOf(needle);
  if (at === -1) at = latin.indexOf("Path: audio\r\n");
  if (at !== -1) {
    const skip = latin.startsWith("Path: audio", at) ? "Path: audio\r\n".length : needle.length;
    const out = bytes.subarray(at + skip);
    return out.byteLength ? out : null;
  }
  return null;
}

function genWsMessage(headers, body) {
  let h = "";
  for (const key of Object.keys(headers)) h += key + ": " + headers[key] + "\r\n";
  return h + "\r\n" + body;
}

async function messageToBuffer(data) {
  if (!data || typeof data === "string") return null;
  if (typeof Blob !== "undefined" && data instanceof Blob) return new Uint8Array(await data.arrayBuffer());
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  if (typeof data.arrayBuffer === "function") return new Uint8Array(await data.arrayBuffer());
  return toUint8(data);
}

function wsPathIs(text, name) {
  return new RegExp("Path:\\s*" + name, "i").test(String(text || ""));
}

function edgeWsHeaders() {
  const muid = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
    Cookie: "muid=" + muid + ";"
  };
}

function concatBytes(chunks) {
  const total = chunks.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const buf of chunks) {
    out.set(buf, off);
    off += buf.length;
  }
  return out;
}

function sanitizeTtsText(text) {
  return String(text || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function buildViSsml(text, preset) {
  return (
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="vi-VN">' +
    '<voice name="' +
    preset.name +
    '"><prosody pitch="' +
    preset.pitch +
    '" rate="' +
    preset.rate +
    '">' +
    escapeXml(text) +
    "</prosody></voice></speak>"
  );
}

async function ttsEdgeOneChunk(text, preset, gec) {
  const connId = uuid4();
  const url =
    "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=" +
    EDGE_TTS_TOKEN +
    "&Sec-MS-GEC=" +
    gec +
    "&Sec-MS-GEC-Version=" +
    encodeURIComponent(EDGE_TTS_GEC_VER) +
    "&ConnectionId=" +
    connId;
  const response = await fetch(url, {
    headers: Object.assign({ Upgrade: "websocket" }, edgeWsHeaders())
  });
  const ws = response.webSocket;
  if (!ws) throw providerError("tts", 502, "Không kết nối được giọng đọc.");

  const chunks = [];
  await new Promise((resolve, reject) => {
    let settled = false;
    let pending = Promise.resolve();
    const timer = setTimeout(() => finish(providerError("tts", 504, "Giọng đọc hết thời gian.")), 28000);
    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch (_) {}
      if (err) reject(err);
      else resolve();
    };
    const enqueue = (job) => {
      pending = pending.then(job).catch(() => {});
    };
    const onEnd = () => {
      pending.then(() => finish()).catch(() => finish());
    };
    ws.addEventListener("message", (event) => {
      const data = event.data;
      if (typeof data === "string") {
        if (wsPathIs(data, "turn.end")) onEnd();
        return;
      }
      enqueue(async () => {
        if (settled) return;
        const bytes = await messageToBuffer(data);
        const audio = extractEdgeAudio(bytes);
        if (audio && audio.byteLength) chunks.push(audio);
      });
    });
    ws.addEventListener("error", () => finish(providerError("tts", 502, "Không tạo được giọng đọc.")));
    ws.addEventListener("close", () => onEnd());
    const ts = new Date().toString();
    try {
      ws.accept();
      ws.send(
        genWsMessage(
          {
            "X-Timestamp": ts,
            "Content-Type": "application/json; charset=utf-8",
            Path: "speech.config"
          },
          '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}'
        )
      );
      ws.send(
        genWsMessage(
          {
            "X-RequestId": connId,
            "Content-Type": "application/ssml+xml",
            "X-Timestamp": ts,
            Path: "ssml"
          },
          buildViSsml(text, preset)
        )
      );
    } catch (e) {
      finish(providerError("tts", 502, e.message || "Không gửi được giọng đọc."));
    }
  });

  if (!chunks.length) throw providerError("tts", 502, "Không nhận được âm thanh.");
  const out = concatBytes(chunks);
  if (out.byteLength < 200) throw providerError("tts", 502, "Không nhận được âm thanh.");
  return out;
}

async function ttsWithEdgeNeural(text, voice, style) {
  const preset = viVoicePreset(voice, style);
  const clean = sanitizeTtsText(text);
  const parts = clean.length <= EDGE_TTS_CHUNK ? [clean] : splitEdgeTtsChunks(clean, EDGE_TTS_CHUNK);
  if (!parts.length) throw providerError("tts", 400, "Nhập văn bản cần đọc.");
  const gec = await edgeSecMsGec();

  async function one(part) {
    try {
      return await ttsEdgeOneChunk(part, preset, gec);
    } catch (_) {
      await sleep(350);
      return await ttsEdgeOneChunk(part, preset, await edgeSecMsGec());
    }
  }

  const buffers = [];
  for (const part of parts) {
    buffers.push(await one(part));
  }
  const out = concatBytes(buffers);
  if (out.byteLength < 200) throw providerError("tts", 502, "Không nhận được âm thanh.");
  return { audio: uint8ToBase64(out), mime: "audio/mpeg", model: preset.name };
}

async function ttsWithViNeural(text) {
  const chunks = splitTtsChunks(text, VI_TTS_CHUNK);
  if (!chunks.length) throw providerError("tts", 400, "Nhập văn bản cần đọc.");
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Referer: "https://translate.google.com/",
    Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8"
  };
  const buffers = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const urls = [
      "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=vi&q=" + encodeURIComponent(chunk),
      "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&total=" +
        chunks.length +
        "&idx=" +
        i +
        "&textlen=" +
        String(chunk.length) +
        "&tl=vi&q=" +
        encodeURIComponent(chunk)
    ];
    let saved = null;
    let lastStatus = 502;
    for (const url of urls) {
      const response = await fetch(url, { headers });
      lastStatus = response.status;
      const ct = String(response.headers.get("Content-Type") || "").toLowerCase();
      if (!response.ok || ct.includes("text/html") || ct.includes("application/json")) continue;
      const buf = new Uint8Array(await response.arrayBuffer());
      if (buf.byteLength < 200) continue;
      saved = buf;
      break;
    }
    if (!saved) throw providerError("tts", lastStatus, "Không tạo được giọng đọc tiếng Việt.");
    buffers.push(saved);
  }
  const total = buffers.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const buf of buffers) {
    out.set(buf, off);
    off += buf.length;
  }
  return { audio: uint8ToBase64(out), mime: "audio/mpeg", model: "vi" };
}

async function ttsWithGroq(key, text, voice, env) {
  const custom = String(env?.GROQ_TTS_MODEL || "").trim();
  const models = custom ? [custom, ...GROQ_TTS_MODELS.filter((m) => m !== custom)] : GROQ_TTS_MODELS.slice();
  const preferred = GROQ_TTS_VOICE_MAP[voice] || "hannah";
  let lastError;
  for (const model of models) {
    const voices = /orpheus/i.test(model)
      ? [preferred, preferred === "hannah" ? "austin" : "hannah"]
      : [voice === "Charon" || voice === "Puck" || voice === "Fenrir" || voice === "Orus" ? "Fritz-PlayAI" : "Celeste-PlayAI"];
    for (const groqVoice of voices) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Accept: "audio/wav"
          },
          body: JSON.stringify({
            model,
            voice: groqVoice,
            input: text,
            response_format: "wav"
          })
        });
        const ct = String(response.headers.get("Content-Type") || "").toLowerCase();
        if (!response.ok || ct.includes("application/json")) {
          await readProviderJson(response, "groq");
          throw providerError("groq", response.status || 502, "Groq TTS lỗi.");
        }
        const buf = new Uint8Array(await response.arrayBuffer());
        if (buf.byteLength < 64) throw providerError("groq", 502, "Groq TTS không trả về âm thanh.");
        return { audio: uint8ToBase64(buf), mime: "audio/wav", model };
      } catch (e) {
        lastError = e;
        if (!ttsShouldRetry(e)) throw e;
      }
    }
  }
  throw lastError || providerError("groq", 502, "Groq TTS không trả về kết quả.");
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

  const fileType = String(form.get("mime") || file.type || "").toLowerCase();
  if (/^image\/(jpeg|jpg|png|webp)$/.test(fileType)) {
    try {
      return runOcrPayload(await parseOcrForm(form), cors, env, providers);
    } catch (e) {
      return json({ error: e.message || "Không đọc được ảnh OCR." }, e.status || 400, cors);
    }
  }

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
