(function () {
  "use strict";

  const proxy =
    (window.OT_CONFIG && window.OT_CONFIG.feedbackProxy) || "/api/feedback.ashx";
  const notifyEmail =
    (window.OT_CONFIG && window.OT_CONFIG.feedbackEmail) || "onetools27@gmail.com";
  const webhook =
    (window.OT_CONFIG && window.OT_CONFIG.feedbackWebhook) || "";

  const els = {
    form: document.getElementById("feedbackForm"),
    name: document.getElementById("fbName"),
    email: document.getElementById("fbEmail"),
    message: document.getElementById("fbMessage"),
    honey: document.getElementById("fbWebsite"),
    submit: document.getElementById("fbSubmit"),
    status: document.getElementById("fbStatus"),
    list: document.getElementById("fbList"),
    empty: document.getElementById("fbEmpty"),
    count: document.getElementById("fbCount")
  };

  if (!els.form) return;

  const LS_KEY = "ot_feedback_local";

  function setStatus(msg, kind) {
    if (!els.status) return;
    els.status.textContent = msg || "";
    els.status.className = "fb-status" + (kind ? " is-" + kind : "");
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  }

  function loadLocal() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveLocal(items) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, 50)));
    } catch (_) {}
  }

  function renderItems(items) {
    if (!els.list) return;
    const rows = Array.isArray(items) ? items : [];
    if (els.count) els.count.textContent = String(rows.length);
    if (!rows.length) {
      els.list.innerHTML = "";
      if (els.empty) {
        els.empty.hidden = false;
        els.empty.textContent = "Chưa có góp ý nào — hãy là người đầu tiên!";
      }
      return;
    }
    if (els.empty) els.empty.hidden = true;
    els.list.innerHTML = rows
      .map((it) => {
        const initial = (it.name || "?").trim().charAt(0).toUpperCase();
        return `<article class="fb-item">
          <div class="fb-avatar" aria-hidden="true">${esc(initial)}</div>
          <div class="fb-item-body">
            <header class="fb-item-head">
              <strong class="fb-item-name">${esc(it.name || "Ẩn danh")}</strong>
              <time datetime="${esc(it.createdAt || "")}">${esc(formatTime(it.createdAt))}</time>
            </header>
            <p class="fb-item-msg">${esc(it.message || "")}</p>
          </div>
        </article>`;
      })
      .join("");
  }

  async function loadComments() {
    try {
      const res = await fetch(proxy, { method: "GET", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.items) && data.items.length) {
          renderItems(data.items);
          return;
        }
      }
    } catch (_) {}
    renderItems(loadLocal());
  }

  async function sendViaWebhook(payload) {
    if (!webhook || /YOUR_|XXXX/i.test(webhook)) {
      throw new Error("Chưa cấu hình feedbackWebhook");
    }
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data && data.ok === false) throw new Error(data.error || "Webhook lỗi");
      return data;
    } catch (e) {
      if (e.message && !/JSON|Unexpected/.test(e.message)) throw e;
      if (res.ok || res.type === "opaqueredirect") return { ok: true };
      throw new Error("Webhook HTTP " + res.status);
    }
  }

  async function sendViaFormSubmit(payload) {
    const endpoint = "https://formsubmit.co/ajax/" + encodeURIComponent(notifyEmail);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email || "noreply@onetool.vn",
        message: payload.message,
        _subject: "[OneTool] Góp ý từ " + payload.name,
        _template: "table",
        _captcha: "false",
        id: payload.id || "",
        source: location.href
      })
    });
    const data = await res.json().catch(() => ({}));
    const msg = String(data.message || "");
    if (/Activation|Activate Form/i.test(msg) || data.success === "false" || data.success === false) {
      const err = new Error(msg || "Cần kích hoạt FormSubmit");
      err.needsActivation = true;
      throw err;
    }
    if (!res.ok) throw new Error(msg || data.error || "FormSubmit lỗi " + res.status);
    return data;
  }

  async function notifyEmailChannels(payload) {
    if (webhook && !/YOUR_|XXXX/i.test(webhook)) {
      await sendViaWebhook(payload);
      return { ok: true };
    }
    await sendViaFormSubmit(payload);
    return { ok: true };
  }

  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (els.name?.value || "").trim();
    const email = (els.email?.value || "").trim();
    const message = (els.message?.value || "").trim();
    const website = (els.honey?.value || "").trim();

    if (!name) {
      setStatus("Vui lòng nhập tên của bạn.", "err");
      els.name?.focus();
      return;
    }
    if (message.length < 5) {
      setStatus("Nội dung góp ý cần ít nhất 5 ký tự.", "err");
      els.message?.focus();
      return;
    }

    els.submit.disabled = true;
    setStatus("Đang gửi góp ý…", "");

    const localItem = {
      id: "local-" + Date.now().toString(36),
      name,
      message,
      createdAt: new Date().toISOString()
    };

    try {
      let data = { ok: false, emailSent: false };
      try {
        const res = await fetch(proxy, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ name, email, message, website })
        });
        if (res.ok) data = await res.json().catch(() => ({ ok: true }));
      } catch (_) {
        /* GitHub Pages: ashx không tồn tại — gửi mail phía client */
      }

      let mailNote = "";
      let mailKind = "ok";

      if (data.emailSent) {
        mailNote = " Đã gửi thông báo tới " + notifyEmail + ".";
      } else if (data.needsActivation) {
        mailNote =
          " Mở Gmail " + notifyEmail + " (cả Spam) → FormSubmit → Activate Form, rồi gửi lại.";
        mailKind = "err";
      } else {
        try {
          await notifyEmailChannels({ name, email, message, id: data.id || localItem.id });
          mailNote = " Đã gửi thông báo tới " + notifyEmail + ".";
        } catch (mailErr) {
          if (mailErr.needsActivation) {
            mailNote =
              " Mở Gmail " + notifyEmail + " (Spam) → mail FormSubmit → bấm Activate Form.";
            mailKind = "err";
          } else {
            mailNote =
              " Chưa gửi được email. Cấu hình feedbackWebhook (Google Apps Script) — xem workers/README.md. (" +
              (mailErr.message || "lỗi") +
              ")";
            mailKind = "err";
          }
        }
      }

      const local = loadLocal();
      local.unshift(localItem);
      saveLocal(local);

      setStatus("Cảm ơn bạn! Góp ý đã được ghi nhận." + mailNote, mailKind);
      els.form.reset();
      await loadComments();
      if (typeof showToast === "function") {
        showToast(mailKind === "ok" ? "Đã gửi góp ý!" : "Đã lưu — kiểm tra email", mailKind === "ok" ? "success" : "error");
      }
    } catch (err) {
      setStatus(err.message || "Lỗi gửi góp ý.", "err");
    } finally {
      els.submit.disabled = false;
    }
  });

  loadComments();
})();
