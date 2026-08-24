/**
 * OneTool — Gửi góp ý về Gmail (Google Apps Script)
 *
 * CÁCH CÀI (2 phút):
 * 1. Mở https://script.google.com/ với tài khoản onetools27@gmail.com
 * 2. New project → dán TOÀN BỘ file này → Save
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy Web app URL (dạng https://script.google.com/macros/s/XXXX/exec)
 * 5. Dán URL vào docs/assets/js/ot-config.js → feedbackWebhook
 * 6. Deploy lại site, gửi góp ý thử → kiểm tra inbox + Spam
 */

function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var name = String(data.name || "Ẩn danh").slice(0, 80);
    var email = String(data.email || "").slice(0, 120);
    var message = String(data.message || "").slice(0, 2000);
    var id = String(data.id || "");

    if (!message || message.length < 5) {
      return json_({ ok: false, error: "message too short" });
    }

    var to = "onetools27@gmail.com";
    var subject = "[OneTool] Góp ý từ " + name;
    var body =
      "Góp ý mới từ OneTool (onetool.vn)\n" +
      "----------------------------------\n" +
      "ID: " + id + "\n" +
      "Tên: " + name + "\n" +
      "Email: " + (email || "(không có)") + "\n\n" +
      "Nội dung:\n" + message;

    var opts = {
      to: to,
      subject: subject,
      body: body,
      name: "OneTool Feedback"
    };
    if (email && email.indexOf("@") > 0) {
      opts.replyTo = email;
    }

    MailApp.sendEmail(opts);
    return json_({ ok: true, emailed: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: "onetool-feedback-mail" });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
