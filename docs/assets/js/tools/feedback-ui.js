(function () {
  "use strict";

  const notifyEmail =
    (window.OT_CONFIG && window.OT_CONFIG.feedbackEmail) || "onetools27@gmail.com";
  const proxy =
    (window.OT_CONFIG && window.OT_CONFIG.feedbackProxy) || "/api/feedback.ashx";

  const els = {
    form: document.getElementById("feedbackForm"),
    name: document.getElementById("fbName"),
    email: document.getElementById("fbEmail"),
    message: document.getElementById("fbMessage"),
    honey: document.getElementById("fbWebsite"),
    submit: document.getElementById("fbSubmit"),
    status: document.getElementById("fbStatus")
  };

  if (!els.form) return;

  function setStatus(msg, kind) {
    if (!els.status) return;
    els.status.textContent = msg || "";
    els.status.className = "fb-status" + (kind ? " is-" + kind : "");
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
        source: location.href
      })
    });
    const data = await res.json().catch(() => ({}));
    const msg = String(data.message || "");
    if (/Activation|Activate Form/i.test(msg) || data.success === "false" || data.success === false) {
      const err = new Error(
        "Mở Gmail " + notifyEmail + " (cả Spam) → mail FormSubmit → bấm Activate Form, rồi gửi lại."
      );
      err.needsActivation = true;
      throw err;
    }
    if (!res.ok) throw new Error(msg || data.error || "Không gửi được email.");
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
    if (website) return;

    els.submit.disabled = true;
    setStatus("Đang gửi…", "");

    try {
      try {
        const res = await fetch(proxy, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ name, email, message, website })
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.emailSent) {
            setStatus("Cảm ơn bạn! Đã gửi tới " + notifyEmail + ".", "ok");
            els.form.reset();
            if (typeof showToast === "function") showToast("Đã gửi góp ý!", "success");
            return;
          }
        }
      } catch (_) {}

      await sendViaFormSubmit({ name, email, message });
      setStatus("Cảm ơn bạn! Đã gửi tới " + notifyEmail + ".", "ok");
      els.form.reset();
      if (typeof showToast === "function") showToast("Đã gửi góp ý!", "success");
    } catch (err) {
      setStatus(err.message || "Lỗi gửi góp ý.", "err");
      if (typeof showToast === "function") showToast("Chưa gửi được", "error");
    } finally {
      els.submit.disabled = false;
    }
  });
})();
