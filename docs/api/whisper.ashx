<%@ WebHandler Language="C#" Class="OneToolWhisperProxy" %>

using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Text;
using System.Web;

public class OneToolWhisperProxy : IHttpHandler
{
    public bool IsReusable { get { return true; } }

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
            WriteJson(res, 200, "{\"ok\":true,\"service\":\"onetool-groq-proxy-iis\"}");
            return;
        }

        if (!string.Equals(req.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase))
        {
            WriteJson(res, 405, "{\"error\":\"POST only\"}");
            return;
        }

        if (!OriginAllowed(req))
        {
            WriteJson(res, 403, "{\"error\":\"Origin not allowed.\"}");
            return;
        }

        var key = GetGroqKey();
        if (string.IsNullOrEmpty(key) || !key.StartsWith("gsk_", StringComparison.Ordinal))
        {
            WriteJson(res, 500, "{\"error\":\"Missing GROQ_API_KEY (api/web.secrets.config or .groq-key).\"}");
            return;
        }

        byte[] body;
        using (var ms = new MemoryStream())
        {
            req.InputStream.CopyTo(ms);
            body = ms.ToArray();
        }

        if (body == null || body.Length == 0)
        {
            WriteJson(res, 400, "{\"error\":\"Missing multipart body.\"}");
            return;
        }

        var contentType = req.ContentType;
        if (string.IsNullOrEmpty(contentType))
        {
            contentType = "application/octet-stream";
        }

        try
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            var upstream = (HttpWebRequest)WebRequest.Create("https://api.groq.com/openai/v1/audio/transcriptions");
            upstream.Method = "POST";
            upstream.ContentType = contentType;
            upstream.Timeout = 90000;
            upstream.ReadWriteTimeout = 90000;
            upstream.Headers["Authorization"] = "Bearer " + key;
            upstream.ContentLength = body.Length;

            using (var stream = upstream.GetRequestStream())
            {
                stream.Write(body, 0, body.Length);
            }

            using (var response = (HttpWebResponse)upstream.GetResponse())
            using (var rs = response.GetResponseStream())
            using (var reader = new StreamReader(rs, Encoding.UTF8))
            {
                var text = reader.ReadToEnd();
                res.StatusCode = (int)response.StatusCode;
                res.ContentType = string.IsNullOrEmpty(response.ContentType)
                    ? "application/json; charset=utf-8"
                    : response.ContentType;
                res.Write(text);
            }
        }
        catch (WebException ex)
        {
            var http = ex.Response as HttpWebResponse;
            if (http != null)
            {
                using (var rs = http.GetResponseStream())
                using (var reader = new StreamReader(rs ?? Stream.Null, Encoding.UTF8))
                {
                    var text = reader.ReadToEnd();
                    res.StatusCode = (int)http.StatusCode;
                    res.ContentType = "application/json; charset=utf-8";
                    res.Write(string.IsNullOrEmpty(text)
                        ? "{\"error\":\"" + JsonEscape(ex.Message) + "\"}"
                        : text);
                }
            }
            else
            {
                WriteJson(res, 502, "{\"error\":\"" + JsonEscape(ex.Message) + "\"}");
            }
        }
        catch (Exception ex)
        {
            WriteJson(res, 502, "{\"error\":\"" + JsonEscape(ex.Message) + "\"}");
        }
    }

    static string GetGroqKey()
    {
        var fromConfig = ConfigurationManager.AppSettings["GROQ_API_KEY"];
        if (!string.IsNullOrWhiteSpace(fromConfig) && fromConfig.Trim().StartsWith("gsk_", StringComparison.Ordinal))
        {
            return fromConfig.Trim();
        }

        var fromEnv = Environment.GetEnvironmentVariable("GROQ_API_KEY");
        if (!string.IsNullOrWhiteSpace(fromEnv) && fromEnv.Trim().StartsWith("gsk_", StringComparison.Ordinal))
        {
            return fromEnv.Trim();
        }

        try
        {
            var ctx = HttpContext.Current;
            if (ctx != null)
            {
                var candidates = new[]
                {
                    ctx.Server.MapPath("/.groq-key"),
                    ctx.Server.MapPath("~/.groq-key"),
                    Path.GetFullPath(Path.Combine(HttpRuntime.AppDomainAppPath, ".groq-key")),
                    Path.GetFullPath(Path.Combine(HttpRuntime.AppDomainAppPath, "..", ".groq-key"))
                };
                for (var i = 0; i < candidates.Length; i++)
                {
                    var path = candidates[i];
                    if (string.IsNullOrEmpty(path) || !File.Exists(path)) continue;
                    var raw = File.ReadAllText(path);
                    if (string.IsNullOrWhiteSpace(raw)) continue;
                    var line = raw.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)[0].Trim();
                    if (line.StartsWith("gsk_", StringComparison.Ordinal)) return line;
                }
            }
        }
        catch
        {
        }

        return null;
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
            res.AddHeader("Access-Control-Allow-Origin", "http://onetool.vn");
        }

        res.AddHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
        res.AddHeader("Access-Control-Allow-Headers", "Content-Type");
        res.AddHeader("Access-Control-Max-Age", "86400");
    }

    static bool OriginAllowed(HttpRequest req)
    {
        var origin = req.Headers["Origin"];
        if (string.IsNullOrEmpty(origin))
        {
            return true;
        }

        var allowed = new[]
        {
            "http://onetool.vn",
            "https://onetool.vn",
            "http://www.onetool.vn",
            "https://www.onetool.vn",
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        };

        for (var i = 0; i < allowed.Length; i++)
        {
            if (string.Equals(origin, allowed[i], StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        try
        {
            var u = new Uri(origin);
            if (string.Equals(u.Host, req.Url.Host, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }
        catch
        {
        }

        return false;
    }

    static void WriteJson(HttpResponse res, int status, string json)
    {
        res.StatusCode = status;
        res.ContentType = "application/json; charset=utf-8";
        res.Write(json);
    }

    static string JsonEscape(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", " ").Replace("\n", " ");
    }
}
