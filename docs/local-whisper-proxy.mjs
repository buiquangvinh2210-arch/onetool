/**
 * Proxy local Groq Whisper — chạy trên máy, miễn phí, không cần Cloudflare.
 * Cách chạy: trong thư mục docs
 *   npx --yes node local-whisper-proxy.mjs
 * hoặc double-click serve-audio.bat
 */
import http from "node:http";

const PORT = Number(process.env.WHISPER_PROXY_PORT || 8787);
const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Groq-Key, Authorization",
  "Access-Control-Max-Age": "86400"
};

function send(res, status, body, extra = {}) {
  const headers = { ...cors, ...extra };
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    send(res, 200, JSON.stringify({ ok: true, service: "onetool-groq-proxy" }), {
      "Content-Type": "application/json"
    });
    return;
  }

  if (req.method !== "POST") {
    send(res, 405, JSON.stringify({ error: "POST only" }), { "Content-Type": "application/json" });
    return;
  }

  const key =
    req.headers["x-groq-key"] ||
    String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();

  if (!key || !String(key).startsWith("gsk_")) {
    send(
      res,
      401,
      JSON.stringify({ error: "Thiếu X-Groq-Key (gsk_...). Lấy tại console.groq.com/keys" }),
      { "Content-Type": "application/json" }
    );
    return;
  }

  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks);
    const contentType = req.headers["content-type"] || "application/octet-stream";

    const upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType
      },
      body: raw
    });

    const text = await upstream.text();
    send(res, upstream.status, text, {
      "Content-Type": upstream.headers.get("content-type") || "application/json"
    });
  } catch (e) {
    send(
      res,
      502,
      JSON.stringify({ error: e.message || "Proxy lỗi khi gọi Groq" }),
      { "Content-Type": "application/json" }
    );
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[OneTool] Groq proxy: http://127.0.0.1:${PORT}`);
  console.log("Giữ cửa sổ này mở. Trên trang Audio dán URL proxy vào ô Worker.");
});
