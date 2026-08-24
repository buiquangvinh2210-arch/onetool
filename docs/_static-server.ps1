$root = "e:\AITool"
$port = 5500
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")
try { $listener.Start() } catch { Write-Host $_; exit 1 }
Write-Host "OneTool static: http://127.0.0.1:$port/docs/cong-cu/media/audio-to-text.html"
$mime = @{
  ".html"="text/html; charset=utf-8"; ".js"="application/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".json"="application/json"; ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".ico"="image/x-icon";
  ".woff2"="font/woff2"; ".map"="application/json"; ".mjs"="application/javascript; charset=utf-8"; ".md"="text/markdown; charset=utf-8"
}
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $full = [IO.Path]::GetFullPath((Join-Path $root ($rel -replace "/", [IO.Path]::DirectorySeparatorChar)))
    if (-not $full.StartsWith([IO.Path]::GetFullPath($root))) { $res.StatusCode = 403; $res.Close(); continue }
    if ((Test-Path $full -PathType Container)) { $full = Join-Path $full "index.html" }
    if (-not (Test-Path $full -PathType Leaf)) { $res.StatusCode = 404; $bytes = [Text.Encoding]::UTF8.GetBytes("404 $rel"); $res.OutputStream.Write($bytes,0,$bytes.Length); $res.Close(); continue }
    $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
    $res.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" })
    $data = [IO.File]::ReadAllBytes($full)
    $res.ContentLength64 = $data.Length
    $res.OutputStream.Write($data, 0, $data.Length)
    $res.Close()
  } catch {
    try { $res.StatusCode = 500; $res.Close() } catch {}
  }
}