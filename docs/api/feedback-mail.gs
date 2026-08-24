/**
 * OneTool — Bảng góp ý công khai + email (Google Apps Script)
 *
 * CÁCH CÀI (~5 phút):
 * 1. https://script.google.com — đăng nhập onetools27@gmail.com
 * 2. New project → dán TOÀN BỘ file này → Save
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL: https://script.google.com/macros/s/XXXX/exec
 * 5. Dán vào docs/assets/js/ot-config.js → feedbackApi
 * 6. Push GitHub → mọi người thấy chung bảng góp ý
 */

var NOTIFY_TO = "onetools27@gmail.com";
var SHEET_NAME = "Feedback";
var PUBLIC_LIMIT = 50;

function doGet() {
  try {
    return json_({ ok: true, service: "onetool-feedback", items: listPublic_() });
  } catch (err) {
    return json_({ ok: false, error: String(err), items: [] });
  }
}

function doPost(e) {
  try {
    var data = parseBody_(e);
    var name = String(data.name || "Ẩn danh").slice(0, 80);
    var email = String(data.email || "").slice(0, 120);
    var message = String(data.message || "").slice(0, 2000);
    var website = String(data.website || "").trim();

    if (website) {
      return json_({ ok: true, saved: true });
    }
    if (!message || message.length < 5) {
      return json_({ ok: false, error: "message too short" });
    }

    var id = "fb-" + new Date().getTime().toString(36);
    var createdAt = new Date().toISOString();

    appendRow_(id, name, message, email, createdAt);
    sendMail_(name, email, message, id);

    return json_({
      ok: true,
      id: id,
      emailSent: true,
      item: { id: id, name: name, message: message, createdAt: createdAt }
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function parseBody_(e) {
  if (e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }
  return e.parameter || {};
}

function getSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID");
  var ss;
  if (!id) {
    ss = SpreadsheetApp.create("OneTool Feedback");
    id = ss.getId();
    props.setProperty("SHEET_ID", id);
    var sh = ss.getSheets()[0];
    sh.setName(SHEET_NAME);
    sh.appendRow(["id", "name", "message", "email", "createdAt"]);
  } else {
    ss = SpreadsheetApp.openById(id);
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["id", "name", "message", "email", "createdAt"]);
  }
  return sheet;
}

function appendRow_(id, name, message, email, createdAt) {
  getSheet_().appendRow([id, name, message, email, createdAt]);
}

function listPublic_() {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return [];

  var start = Math.max(2, last - PUBLIC_LIMIT + 1);
  var rows = sheet.getRange(start, 1, last - start + 1, 5).getValues();
  var items = [];
  for (var i = rows.length - 1; i >= 0; i--) {
    var r = rows[i];
    if (!r[2]) continue;
    items.push({
      id: String(r[0] || ""),
      name: String(r[1] || "Ẩn danh"),
      message: String(r[2] || ""),
      createdAt: r[4] ? new Date(r[4]).toISOString() : ""
    });
  }
  return items;
}

function sendMail_(name, email, message, id) {
  var body =
    "Góp ý mới từ OneTool (onetool.vn)\n" +
    "----------------------------------\n" +
    "ID: " + id + "\n" +
    "Tên: " + name + "\n" +
    "Email: " + (email || "(không có)") + "\n\n" +
    "Nội dung:\n" +
    message;

  var opts = {
    to: NOTIFY_TO,
    subject: "[OneTool] Góp ý từ " + name,
    body: body,
    name: "OneTool Feedback"
  };
  if (email && email.indexOf("@") > 0) {
    opts.replyTo = email;
  }
  MailApp.sendEmail(opts);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
