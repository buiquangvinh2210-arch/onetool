<%@ WebHandler Language="C#" Class="OneToolFeedback" %>
<%@ Assembly Name="System.Web.Extensions, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" %>

using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Script.Serialization;

public class OneToolFeedback : IHttpHandler
{
    static readonly object FileLock = new object();
    const int MaxName = 80;
    const int MaxEmail = 120;
    const int MaxMessage = 2000;
    const int PublicLimit = 50;

    public bool IsReusable { get { return false; } }

    public void ProcessRequest(HttpContext context)
    {
        var req = context.Request;
        var res = context.Response;
        res.TrySkipIisCustomErrors = true;
        AddCors(res, req);

        if (string.Equals(req.HttpMethod, "OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            res.StatusCode = 204;
            res.End();
            return;
        }

        if (string.Equals(req.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
        {
            WritePublicList(res);
            return;
        }

        if (!string.Equals(req.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase))
        {
            WriteJson(res, 405, "{\"ok\":false,\"error\":\"POST only\"}");
            return;
        }

        if (!OriginAllowed(req))
        {
            WriteJson(res, 403, "{\"ok\":false,\"error\":\"Origin not allowed.\"}");
            return;
        }

        string raw;
        using (var reader = new StreamReader(req.InputStream, Encoding.UTF8))
        {
            raw = reader.ReadToEnd();
        }

        Dictionary<string, object> payload;
        try
        {
            payload = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(raw ?? "{}");
        }
        catch
        {
            WriteJson(res, 400, "{\"ok\":false,\"error\":\"JSON không hợp lệ.\"}");
            return;
        }

        // Honeypot — bots fill this; humans leave empty
        var honey = GetStr(payload, "website");
        if (!string.IsNullOrEmpty(honey))
        {
            WriteJson(res, 200, "{\"ok\":true,\"saved\":true}");
            return;
        }

        var name = Clean(GetStr(payload, "name"), MaxName);
        var email = Clean(GetStr(payload, "email"), MaxEmail);
        var message = Clean(GetStr(payload, "message"), MaxMessage);

        if (string.IsNullOrEmpty(name))
        {
            WriteJson(res, 400, "{\"ok\":false,\"error\":\"Vui lòng nhập tên.\"}");
            return;
        }
        if (string.IsNullOrEmpty(message) || message.Length < 5)
        {
            WriteJson(res, 400, "{\"ok\":false,\"error\":\"Nội dung góp ý quá ngắn.\"}");
            return;
        }
        if (!string.IsNullOrEmpty(email) && !IsLikelyEmail(email))
        {
            WriteJson(res, 400, "{\"ok\":false,\"error\":\"Email không hợp lệ.\"}");
            return;
        }

        var ip = req.UserHostAddress ?? "";
        if (IsRateLimited(context, ip))
        {
            WriteJson(res, 429, "{\"ok\":false,\"error\":\"Bạn gửi quá nhanh — thử lại sau vài phút.\"}");
            return;
        }

        var id = Guid.NewGuid().ToString("N").Substring(0, 12);
        var createdAt = DateTime.UtcNow.ToString("o");
        var entry = new Dictionary<string, object>
        {
            { "id", id },
            { "name", name },
            { "email", email ?? "" },
            { "message", message },
            { "createdAt", createdAt },
            { "ip", ip },
            { "ua", Truncate(req.UserAgent ?? "", 200) }
        };

        try
        {
            AppendEntry(context, entry);
        }
        catch (Exception ex)
        {
            WriteJson(res, 500, "{\"ok\":false,\"error\":\"Không lưu được góp ý: " + JsonEscape(ex.Message) + "\"}");
            return;
        }

        var emailSent = false;
        var emailError = "";
        var smtpReady = SmtpConfigured();
        var webhookReady = !string.IsNullOrEmpty(AppSetting("FEEDBACK_WEBHOOK", ""))
            && AppSetting("FEEDBACK_WEBHOOK", "").IndexOf("YOUR_", StringComparison.OrdinalIgnoreCase) < 0;
        try
        {
            if (smtpReady)
            {
                emailSent = SendMailSmtp(name, email, message, id, createdAt, ip);
            }
            else if (webhookReady)
            {
                emailSent = SendMailWebhook(name, email, message, id);
            }
            else
            {
                emailSent = SendMailFormSubmit(name, email, message, id);
            }
        }
        catch (Exception ex)
        {
            emailError = ex.Message;
            // Thử webhook nếu FormSubmit/SMTP lỗi
            if (!emailSent && webhookReady && !smtpReady)
            {
                try { emailSent = SendMailWebhook(name, email, message, id); emailError = ""; }
                catch (Exception ex2) { emailError = ex2.Message; }
            }
            else if (!emailSent && !smtpReady)
            {
                try { emailSent = SendMailFormSubmit(name, email, message, id); emailError = ""; }
                catch (Exception ex2) { emailError = ex2.Message; }
            }
        }

        var ser = new JavaScriptSerializer();
        var result = new Dictionary<string, object>
        {
            { "ok", true },
            { "saved", true },
            { "id", id },
            { "emailSent", emailSent },
            { "smtpConfigured", smtpReady }
        };
        if (!emailSent && !string.IsNullOrEmpty(emailError))
        {
            result["emailError"] = emailError;
            if (emailError.IndexOf("Activation", StringComparison.OrdinalIgnoreCase) >= 0
                || emailError.IndexOf("Activate Form", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                result["needsActivation"] = true;
            }
        }
        WriteJson(res, 200, ser.Serialize(result));
    }

    static void WritePublicList(HttpResponse res)
    {
        var list = new List<object>();
        try
        {
            var path = DataPath(HttpContext.Current);
            if (File.Exists(path))
            {
                var lines = File.ReadAllLines(path, Encoding.UTF8);
                for (var i = lines.Length - 1; i >= 0 && list.Count < PublicLimit; i--)
                {
                    var line = (lines[i] ?? "").Trim();
                    if (line.Length == 0) continue;
                    try
                    {
                        var row = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(line);
                        if (row == null) continue;
                        list.Add(new Dictionary<string, object>
                        {
                            { "id", GetStr(row, "id") },
                            { "name", GetStr(row, "name") },
                            { "message", GetStr(row, "message") },
                            { "createdAt", GetStr(row, "createdAt") }
                        });
                    }
                    catch
                    {
                    }
                }
            }
        }
        catch
        {
        }

        var ser = new JavaScriptSerializer();
        WriteJson(res, 200, ser.Serialize(new Dictionary<string, object>
        {
            { "ok", true },
            { "items", list }
        }));
    }

    static void AppendEntry(HttpContext context, Dictionary<string, object> entry)
    {
        var path = DataPath(context);
        var dir = Path.GetDirectoryName(path);
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

        var line = new JavaScriptSerializer().Serialize(entry);
        lock (FileLock)
        {
            File.AppendAllText(path, line + "\r\n", Encoding.UTF8);
        }
    }

    static string DataPath(HttpContext context)
    {
        var dir = context.Server.MapPath("~/App_Data");
        if (string.IsNullOrEmpty(dir))
        {
            dir = Path.Combine(HttpRuntime.AppDomainAppPath, "App_Data");
        }
        return Path.Combine(dir, "feedback.jsonl");
    }

    static bool SmtpConfigured()
    {
        var user = AppSetting("SMTP_USER", "");
        var pass = AppSetting("SMTP_PASS", "");
        if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass)) return false;
        if (pass.IndexOf("YOUR_", StringComparison.OrdinalIgnoreCase) >= 0) return false;
        if (pass.IndexOf("PLACEHOLDER", StringComparison.OrdinalIgnoreCase) >= 0) return false;
        return true;
    }

    static bool SendMailSmtp(string name, string email, string message, string id, string createdAt, string ip)
    {
        var to = AppSetting("FEEDBACK_TO", "onetools27@gmail.com");
        var smtpUser = AppSetting("SMTP_USER", "");
        var smtpPass = AppSetting("SMTP_PASS", "");
        var smtpHost = AppSetting("SMTP_HOST", "smtp.gmail.com");
        var smtpPort = 587;
        int.TryParse(AppSetting("SMTP_PORT", "587"), out smtpPort);
        var fromAddr = AppSetting("SMTP_FROM", string.IsNullOrEmpty(smtpUser) ? to : smtpUser);

        var body = new StringBuilder();
        body.AppendLine("Góp ý mới từ OneTool (onetool.vn)");
        body.AppendLine("----------------------------------");
        body.AppendLine("ID: " + id);
        body.AppendLine("Thời gian (UTC): " + createdAt);
        body.AppendLine("Tên: " + name);
        body.AppendLine("Email: " + (string.IsNullOrEmpty(email) ? "(không có)" : email));
        body.AppendLine("IP: " + ip);
        body.AppendLine();
        body.AppendLine("Nội dung:");
        body.AppendLine(message);

        using (var mail = new MailMessage())
        {
            mail.From = new MailAddress(fromAddr, "OneTool Feedback");
            mail.To.Add(to);
            if (!string.IsNullOrEmpty(email) && IsLikelyEmail(email))
            {
                try { mail.ReplyToList.Add(new MailAddress(email, name)); }
                catch { }
            }
            mail.Subject = "[OneTool] Góp ý từ " + name;
            mail.Body = body.ToString();
            mail.BodyEncoding = Encoding.UTF8;
            mail.SubjectEncoding = Encoding.UTF8;

            using (var smtp = new SmtpClient(smtpHost, smtpPort))
            {
                smtp.EnableSsl = true;
                smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new System.Net.NetworkCredential(smtpUser, smtpPass);
                smtp.Timeout = 20000;
                smtp.Send(mail);
            }
        }
        return true;
    }

    /// <summary>Gửi mail qua FormSubmit khi chưa cấu hình SMTP Gmail.</summary>
    static bool SendMailFormSubmit(string name, string email, string message, string id)
    {
        var to = AppSetting("FEEDBACK_TO", "onetools27@gmail.com");
        var url = "https://formsubmit.co/ajax/" + Uri.EscapeDataString(to);

        var payload = new Dictionary<string, object>
        {
            { "name", name },
            { "email", string.IsNullOrEmpty(email) ? "noreply@onetool.vn" : email },
            { "message", message },
            { "_subject", "[OneTool] Góp ý từ " + name },
            { "_template", "table" },
            { "_captcha", "false" },
            { "id", id },
            { "source", "https://onetool.vn/lien-he.html" }
        };
        var json = new JavaScriptSerializer().Serialize(payload);
        var bytes = Encoding.UTF8.GetBytes(json);

        System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
        var req = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(url);
        req.Method = "POST";
        req.ContentType = "application/json; charset=utf-8";
        req.Accept = "application/json";
        req.Timeout = 20000;
        req.UserAgent = "OneToolFeedback/1.0";
        // FormSubmit từ chối nếu thiếu Origin/Referer (localhost / gọi server thuần)
        req.Headers["Origin"] = "https://onetool.vn";
        req.Referer = "https://onetool.vn/lien-he.html";
        req.ContentLength = bytes.Length;
        using (var stream = req.GetRequestStream())
        {
            stream.Write(bytes, 0, bytes.Length);
        }

        using (var resp = (System.Net.HttpWebResponse)req.GetResponse())
        using (var rs = resp.GetResponseStream())
        using (var reader = new StreamReader(rs ?? Stream.Null, Encoding.UTF8))
        {
            var text = reader.ReadToEnd();
            // success:"false" + Activate Form = đã gửi mail kích hoạt, chưa gửi góp ý thật
            if (!string.IsNullOrEmpty(text) &&
                (text.IndexOf("Activation", StringComparison.OrdinalIgnoreCase) >= 0
                 || text.IndexOf("Activate Form", StringComparison.OrdinalIgnoreCase) >= 0
                 || text.IndexOf("\"success\":\"false\"", StringComparison.OrdinalIgnoreCase) >= 0
                 || text.IndexOf("\"success\":false", StringComparison.OrdinalIgnoreCase) >= 0))
            {
                throw new InvalidOperationException(text);
            }
            if ((int)resp.StatusCode >= 200 && (int)resp.StatusCode < 300)
            {
                return true;
            }
            throw new InvalidOperationException(string.IsNullOrEmpty(text) ? "FormSubmit HTTP " + (int)resp.StatusCode : text);
        }
    }

    static bool SendMailWebhook(string name, string email, string message, string id)
    {
        var webhook = AppSetting("FEEDBACK_WEBHOOK", "");
        if (string.IsNullOrEmpty(webhook) || webhook.IndexOf("YOUR_", StringComparison.OrdinalIgnoreCase) >= 0)
        {
            return false;
        }

        var payload = new Dictionary<string, object>
        {
            { "name", name },
            { "email", email ?? "" },
            { "message", message },
            { "id", id }
        };
        var json = new JavaScriptSerializer().Serialize(payload);
        var bytes = Encoding.UTF8.GetBytes(json);

        System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
        var req = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(webhook);
        req.Method = "POST";
        req.ContentType = "application/json; charset=utf-8";
        req.Timeout = 20000;
        req.ContentLength = bytes.Length;
        using (var stream = req.GetRequestStream())
        {
            stream.Write(bytes, 0, bytes.Length);
        }
        using (var resp = (System.Net.HttpWebResponse)req.GetResponse())
        using (var rs = resp.GetResponseStream())
        using (var reader = new StreamReader(rs ?? Stream.Null, Encoding.UTF8))
        {
            var text = reader.ReadToEnd();
            if ((int)resp.StatusCode >= 200 && (int)resp.StatusCode < 300)
            {
                if (!string.IsNullOrEmpty(text) && text.IndexOf("\"ok\":false", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    throw new InvalidOperationException(text);
                }
                return true;
            }
            throw new InvalidOperationException(string.IsNullOrEmpty(text) ? "Webhook HTTP " + (int)resp.StatusCode : text);
        }
    }

    static bool IsRateLimited(HttpContext context, string ip)
    {
        if (string.IsNullOrEmpty(ip)) return false;
        var key = "fb_rl_" + ip;
        var last = context.Cache[key] as DateTime?;
        if (last.HasValue && (DateTime.UtcNow - last.Value).TotalSeconds < 60)
        {
            return true;
        }
        context.Cache.Insert(key, DateTime.UtcNow, null, DateTime.UtcNow.AddMinutes(5), System.Web.Caching.Cache.NoSlidingExpiration);
        return false;
    }

    static string AppSetting(string key, string fallback)
    {
        var v = ConfigurationManager.AppSettings[key];
        return string.IsNullOrWhiteSpace(v) ? fallback : v.Trim();
    }

    static string GetStr(Dictionary<string, object> d, string key)
    {
        if (d == null || !d.ContainsKey(key) || d[key] == null) return "";
        return Convert.ToString(d[key]) ?? "";
    }

    static string Clean(string s, int max)
    {
        if (string.IsNullOrEmpty(s)) return "";
        s = Regex.Replace(s.Trim(), @"\s+", " ");
        if (s.Length > max) s = s.Substring(0, max);
        return s;
    }

    static string Truncate(string s, int max)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Length <= max ? s : s.Substring(0, max);
    }

    static bool IsLikelyEmail(string email)
    {
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }

    static void AddCors(HttpResponse res, HttpRequest req)
    {
        var origin = req.Headers["Origin"];
        if (string.IsNullOrEmpty(origin))
        {
            res.AddHeader("Access-Control-Allow-Origin", "*");
        }
        else if (OriginAllowed(req))
        {
            res.AddHeader("Access-Control-Allow-Origin", origin);
            res.AddHeader("Vary", "Origin");
        }
        else
        {
            res.AddHeader("Access-Control-Allow-Origin", "https://onetool.vn");
        }
        res.AddHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
        res.AddHeader("Access-Control-Allow-Headers", "Content-Type");
        res.AddHeader("Access-Control-Max-Age", "86400");
    }

    static bool OriginAllowed(HttpRequest req)
    {
        var origin = req.Headers["Origin"];
        if (string.IsNullOrEmpty(origin)) return true;
        origin = origin.Trim().ToLowerInvariant();
        return origin == "https://onetool.vn"
            || origin == "http://onetool.vn"
            || origin == "https://www.onetool.vn"
            || origin == "http://www.onetool.vn"
            || origin.StartsWith("http://localhost")
            || origin.StartsWith("https://localhost")
            || origin.StartsWith("http://127.0.0.1");
    }

    static void WriteJson(HttpResponse res, int code, string json)
    {
        res.StatusCode = code;
        res.ContentType = "application/json; charset=utf-8";
        res.Write(json);
    }

    static string JsonEscape(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "\\r").Replace("\n", "\\n");
    }
}
