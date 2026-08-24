# OneTool — proxy Groq Whisper (PowerShell)
# Key đọc từ: biến môi trường GROQ_API_KEY hoặc file docs/.groq-key
# Chạy: powershell -ExecutionPolicy Bypass -File local-whisper-proxy.ps1
param([int]$Port = 8787)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Net.Http

function Get-GroqKey {
  $fromEnv = [Environment]::GetEnvironmentVariable("GROQ_API_KEY", "Process")
  if (-not $fromEnv) { $fromEnv = [Environment]::GetEnvironmentVariable("GROQ_API_KEY", "User") }
  if ($fromEnv -and $fromEnv.StartsWith("gsk_")) { return $fromEnv.Trim() }

  $keyFile = Join-Path $PSScriptRoot ".groq-key"
  if (Test-Path $keyFile) {
    $line = (Get-Content -Path $keyFile -Raw -ErrorAction SilentlyContinue)
    if ($line) {
      $k = ($line -split "`r?`n" | Where-Object { $_.Trim() -ne "" -and -not $_.Trim().StartsWith("#") } | Select-Object -First 1)
      if ($k -and $k.Trim().StartsWith("gsk_")) { return $k.Trim() }
    }
  }
  return $null
}

$serverKey = Get-GroqKey
if (-not $serverKey) {
  Write-Host "========================================"
  Write-Host " THIEU GROQ KEY"
  Write-Host " Tao file docs/.groq-key (1 dong: gsk_...)"
  Write-Host " hoac set bien moi truong GROQ_API_KEY"
  Write-Host " Lay key: https://console.groq.com/keys"
  Write-Host "========================================"
  exit 1
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
try {
  $listener.Start()
} catch {
  Write-Host "Khong mo duoc port $Port. Thu: netstat -ano | findstr $Port"
  throw
}

Write-Host "========================================"
Write-Host " OneTool Groq proxy: http://127.0.0.1:$Port"
Write-Host " Key: da nap tu .groq-key / GROQ_API_KEY (khong can user dan)"
Write-Host " Giu cua so nay MO khi dung Audio -> Text"
Write-Host "========================================"

$client = [System.Net.Http.HttpClient]::new()

function Set-Cors([System.Net.HttpListenerResponse]$res) {
  $res.Headers.Add("Access-Control-Allow-Origin", "*")
  $res.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS")
  $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
}

function Write-Json($res, $status, $obj) {
  $bytes = [Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Compress -Depth 6))
  $res.StatusCode = $status
  $res.ContentType = "application/json; charset=utf-8"
  Set-Cors $res
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.OutputStream.Close()
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  try {
    Set-Cors $res

    if ($req.HttpMethod -eq "OPTIONS") {
      $res.StatusCode = 204
      $res.Close()
      continue
    }

    if ($req.HttpMethod -eq "GET") {
      Write-Json $res 200 @{ ok = $true; service = "onetool-groq-proxy-ps" }
      continue
    }

    if ($req.HttpMethod -ne "POST") {
      Write-Json $res 405 @{ error = "POST only" }
      continue
    }

    $ms = [IO.MemoryStream]::new()
    $req.InputStream.CopyTo($ms)
    $body = $ms.ToArray()
    $ct = $req.ContentType
    if (-not $ct) { $ct = "application/octet-stream" }

    $content = [System.Net.Http.ByteArrayContent]::new($body)
    $content.Headers.TryAddWithoutValidation("Content-Type", $ct) | Out-Null

    $msg = [System.Net.Http.HttpRequestMessage]::new(
      [System.Net.Http.HttpMethod]::Post,
      "https://api.groq.com/openai/v1/audio/transcriptions"
    )
    $msg.Headers.TryAddWithoutValidation("Authorization", "Bearer $serverKey") | Out-Null
    $msg.Content = $content

    $up = $client.SendAsync($msg).GetAwaiter().GetResult()
    $upBytes = $up.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
    $upCt = $up.Content.Headers.ContentType
    $res.StatusCode = [int]$up.StatusCode
    if ($upCt) { $res.ContentType = $upCt.ToString() } else { $res.ContentType = "application/json" }
    $res.OutputStream.Write($upBytes, 0, $upBytes.Length)
    $res.OutputStream.Close()
    Write-Host ("{0:HH:mm:ss} -> Groq {1} ({2} bytes)" -f (Get-Date), [int]$up.StatusCode, $upBytes.Length)
  } catch {
    try { Write-Json $res 502 @{ error = $_.Exception.Message } } catch {}
    Write-Host "ERR:" $_.Exception.Message
  }
}
