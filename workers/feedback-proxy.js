/**
 * Cloudflare Worker — góp ý lưu file JSON trên GitHub (không cần KV/Sheet).
 *
 * Secrets / vars trên Worker:
 *   GITHUB_TOKEN  (Secret)  — PAT quyền Contents: Read and write
 *   GITHUB_REPO   (Text)    — ví dụ: username/AITool
 *   GITHUB_BRANCH (Text, tuỳ chọn) — mặc định master
 */
const MAX_ITEMS = 80;
const MAX_NAME = 80;
const MAX_MESSAGE = 2000;
const FILE_PATH = "docs/data/feedback.json";

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === "GET") {
      try {
        const { items } = await readFile(env);
        return json({ ok: true, service: "onetool-feedback-file", items }, 200, cors);
      } catch (e) {
        return json({ ok: false, error: String(e.message || e), items: [] }, 500, cors);
      }
    }

    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors);
    }

    if (!originAllowed(request, env)) {
      return json({ error: "Origin không được phép." }, 403, cors);
    }

    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
      return json(
        {
          ok: false,
          error:
            "Chưa cấu hình. Settings → Variables: GITHUB_REPO=owner/repo (Text), GITHUB_TOKEN=PAT (Secret)."
        },
        500,
        cors
      );
    }

    let body;
    try {
      body = JSON.parse(await request.text());
    } catch (_) {
      return json({ ok: false, error: "JSON không hợp lệ." }, 400, cors);
    }

    if (String(body.website || "").trim()) {
      return json({ ok: true, saved: true }, 200, cors);
    }

    const name = String(body.name || "Ẩn danh").trim().slice(0, MAX_NAME);
    const message = String(body.message || "").trim().slice(0, MAX_MESSAGE);
    if (!name) return json({ ok: false, error: "Thiếu tên." }, 400, cors);
    if (message.length < 5) return json({ ok: false, error: "Nội dung quá ngắn." }, 400, cors);

    const item = {
      id: "fb-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      message,
      createdAt: new Date().toISOString()
    };

    try {
      const { items, sha } = await readFile(env);
      items.unshift(item);
      await writeFile(env, items.slice(0, MAX_ITEMS), sha);
      return json({ ok: true, id: item.id, emailSent: false, item }, 200, cors);
    } catch (e) {
      return json({ ok: false, error: String(e.message || e) }, 500, cors);
    }
  }
};

function repoParts(env) {
  const repo = String(env.GITHUB_REPO || "").trim();
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error("GITHUB_REPO phải dạng owner/ten-repo");
  return { owner, name, branch: String(env.GITHUB_BRANCH || "master").trim() || "master" };
}

async function github(env, path, init = {}) {
  const { owner, name } = repoParts(env);
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}/contents/${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "onetool-feedback",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {})
    }
  });
  return res;
}

async function readFile(env) {
  const { branch } = repoParts(env);
  const res = await github(env, `${FILE_PATH}?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return { items: [], sha: null };
  if (!res.ok) throw new Error("GitHub đọc file: HTTP " + res.status);
  const data = await res.json();
  let items = [];
  try {
    const text = atob(String(data.content || "").replace(/\n/g, ""));
    const parsed = JSON.parse(text);
    items = Array.isArray(parsed) ? parsed : parsed.items || [];
  } catch (_) {
    items = [];
  }
  return { items, sha: data.sha };
}

async function writeFile(env, items, sha) {
  const { branch } = repoParts(env);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(items, null, 2))));
  const payload = {
    message: "chore: góp ý mới",
    content,
    branch
  };
  if (sha) payload.sha = sha;
  const res = await github(env, FILE_PATH, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("GitHub ghi file: HTTP " + res.status + " " + t.slice(0, 180));
  }
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
  if (allowedList(env).some((o) => origin === o)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".github.io")) return true;
    if (host === "127.0.0.1" || host === "localhost") return true;
  } catch (_) {}
  return false;
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allow = origin && originAllowed(request, env) ? origin : allowedList(env)[0] || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}
