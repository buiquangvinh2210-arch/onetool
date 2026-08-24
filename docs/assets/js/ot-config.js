/* Public config — KHÔNG để API key ở đây.
   IIS: /api/whisper.ashx (key trong api/web.secrets.config hoặc .groq-key)
   Góp ý mail: ưu tiên Google Apps Script (feedbackWebhook), xem api/feedback-mail.gs
*/
window.OT_CONFIG = {
  whisperProxy: "/api/whisper.ashx",
  feedbackProxy: "/api/feedback.ashx",
  feedbackEmail: "onetools27@gmail.com",
  /* Dán URL Web app sau khi Deploy file api/feedback-mail.gs trên script.google.com */
  feedbackWebhook: ""
};
