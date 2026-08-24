/* Public config — KHÔNG để API key ở đây.

   GitHub Pages: bắt buộc điền whisperCloud (Cloudflare Worker).
   Xem workers/README.md

   IIS local: có thể để whisperCloud="" và dùng /api/whisper.ashx
*/
window.OT_CONFIG = {
  whisperCloud: "https://onetool-whisper.buiquangvinh2210.workers.dev",
  /* Fallback khi chạy IIS */
  whisperProxy: "/api/whisper.ashx",

  feedbackProxy: "/api/feedback.ashx",
  feedbackEmail: "onetools27@gmail.com",
  /* Google Apps Script — docs/api/feedback-mail.gs */
  feedbackWebhook: ""
};
