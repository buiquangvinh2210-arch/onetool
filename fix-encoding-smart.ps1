$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding $false
function C([int[]]$codes) { -join ($codes | ForEach-Object { [char]$_ }) }
function W([string]$Path, [string]$Content) { [System.IO.File]::WriteAllText($Path, $Content, $utf8) }
function M([string]$slug) {
  $re = [regex]"`"$slug`":\s*\{\s*title:\s*`"([^`"]+)`",\s*desc:\s*`"([^`"]+)`""
  $m = $re.Match($script:catalog)
  if (-not $m.Success) { throw "No pageMeta: $slug" }
  @{ title = $m.Groups[1].Value; desc = $m.Groups[2].Value }
}

$base = "e:\AITool\docs"
$script:catalog = [System.IO.File]::ReadAllText("$base\assets\js\catalog.js", $utf8)
$ref = [System.IO.File]::ReadAllText("$base\cong-cu-pdf\pdf-merge.html", $utf8)

function Rx([string]$html, [string]$pattern) {
  if ($html -match $pattern) { return $matches[1] } else { throw "Pattern not found: $pattern" }
}

$EM = C 0x2014
$DOT = C 0xB7
$ELL = C 0x2026
$DEG = C 0xB0

$CongCuPDF  = Rx $ref '<p class="eyebrow">([^<]+)</p>'
$XuLyHint   = Rx $ref '<p id="status" class="hint">([^<]+)</p>'
$SaoChep    = Rx $ref 'id="copyResultBtn" disabled>([^<]+)</button>'
$TaiFile    = Rx $ref 'id="downloadResultBtn" disabled>([^<]+)</button>'
$Buoc1      = Rx $ref 'tool-panel-badge">([^<]+)</span></div>\s*<div class="tool-panel-body">\s*<div class="upload-zone upload-zone--multi'
$Buoc2      = Rx $ref 'result-panel">\s*<div class="tool-panel-header"><h2>[^<]+</h2><span class="tool-panel-badge">([^<]+)</span>'
$KetQua     = Rx $ref 'result-panel">\s*<div class="tool-panel-header"><h2>([^<]+)</h2>'
$CachDung   = Rx $ref '<aside class="doc-hero-card"><h2>([^<]+)</h2>'
$HoacChonMay = Rx $ref '<p class="text-muted">([\s\S]*?)</p>\s*<p class="hint">Ch'
$KeoThaPDF  = Rx $ref '<span class="upload-icon">PDF</span>\s*<p><strong>([^<]+)</strong></p>\s*<p class="text-muted">'
$ChonPDF    = C 0x43,0x68,0x1ECD,0x6E,0x20,0x50,0x44,0x46,0x2E
$ChonFile   = C 0x43,0x68,0x1ECD,0x6E,0x20,0x66,0x69,0x6C,0x65,0x2E
$Loi        = C 0x4C,0x1ED7,0x69
$TaiVe      = C 0x54,0x1EA3,0x69,0x20,0x76,0x1EC1
$MienPhi    = C 0x4D,0x69,0x1EC5,0x6E,0x20,0x70,0x68,0xED
$CongCuAnh  = "$(C 0x43,0xF4,0x6E,0x67,0x20,0x63,0x1EE5) $DOT $(C 0x1EA2,0x6E,0x68)"
$CongCuConv = "$(C 0x43,0xF4,0x6E,0x67,0x20,0x63,0x1EE5) $DOT Converter"

$HeadLinks = @"
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/site.css" />
  <link rel="stylesheet" href="../assets/css/components.css" />
"@

function DocHead($meta, [string]$extra = "") {
@"
<!DOCTYPE html>
<html lang="vi" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$($meta.title)</title>
  <meta name="description" content="$($meta.desc)" />
  <meta name="robots" content="index,follow" />
$HeadLinks$extra
  <script>window.OT_BASE = "..";</script>
</head>
<body>
<div id="site-header"></div>
<main role="main">
"@
}

function ResultHtml {
@"
      <div class="tool-panel result-panel">
        <div class="tool-panel-header"><h2>$KetQua</h2><span class="tool-panel-badge">$Buoc2</span></div>
        <div class="tool-panel-body">
          <p id="status" class="hint">$XuLyHint</p>
          <div class="result-actions">
            <button type="button" class="btn btn-outline btn-sm" id="copyResultBtn" disabled>$SaoChep</button>
            <button type="button" class="btn btn-primary btn-sm" id="downloadResultBtn" disabled>$TaiFile</button>
          </div>
          <pre id="preview" class="form-control" style="min-height:140px;white-space:pre-wrap"></pre>
        </div>
      </div>
"@
}

function Foot([string]$extraScripts, [string]$inline = "") {
@"
</main>
<div id="site-footer"></div>
<script src="../assets/js/catalog.js"></script>
<script src="../assets/js/layout.js"></script>
<script src="../assets/js/core.js"></script>
<script src="../assets/js/site.js"></script>
$extraScripts
$inline
</body>
</html>
"@
}

$fixed = @()

# pdf-compress
$m = M 'pdf-compress'
W "$base\cong-cu-pdf\pdf-compress.html" (DocHead $m + @"
<section class="tool-workspace tool-workspace--doc">
  <div class="container">
    <header class="doc-hero">
      <div class="doc-hero-copy">
        <p class="eyebrow">$CongCuPDF</p>
        <h1>$(C 0x4E,0xE9,0x6E,0x20,0x50,0x44,0x46)</h1>
        <p class="lede">$(C 0x43,0x68,0x1ECD,0x6E,0x20,0x6D,0x1EE9,0x63,0x20,0x6E,0xE9,0x6E) $EM $(C 0x78,0x65,0x6D,0x20,0x25,0x20,0x0111,0xE3,0x20,0x67,0x69,0x1EA3,0x6D,0x20,0x72,0x1ED3,0x69,0x20,0x74,0x1EA3,0x69,0x20,0x76,0x1EC1,0x2E)</p>
        <div class="doc-pills"><span>3 $(C 0x6D,0x1EE9,0x63)</span><span>$(C 0x53,0x6F,0x20,0x73,0xE1,0x6E,0x68,0x20,0x64,0x75,0x6E,0x67,0x20,0x6C,0x1B0,0x1EE3,0x6E,0x67)</span></div>
      </div>
      <aside class="doc-hero-card"><h2>$CachDung</h2><ol><li><strong>1.</strong> Upload</li><li><strong>2.</strong> $(C 0x43,0x68,0x1ECD,0x6E,0x20,0x6D,0x1EE9,0x63)</li><li><strong>3.</strong> $TaiVe</li></ol></aside>
    </header>
    <div class="tool-workspace-grid">
      <div class="tool-panel">
        <div class="tool-panel-header"><h2>Input</h2><span class="tool-panel-badge">$Buoc1</span></div>
        <div class="tool-panel-body">
          <div class="upload-zone" id="uploadZone" role="button" tabindex="0">
            <input type="file" id="fileInput" accept="application/pdf,.pdf" hidden />
            <div class="upload-placeholder"><span class="upload-icon">PDF</span><p><strong>$KeoThaPDF</strong></p><p class="text-muted">$HoacChonMay</p></div>
          </div>
          <div style="margin-top:1rem">
            <label class="chip" style="display:flex;gap:.5rem;padding:.75rem;margin-bottom:.5rem;cursor:pointer"><input type="radio" name="level" value="light"/> <span><strong>$(C 0xCD,0x74,0x20,0x6E,0xE9,0x6E)</strong> $EM $(C 0x67,0x69,0x1EEF,0x20,0x63,0x68,0x69,0x20,0x74,0x69,0x1EBF,0x74,0x20,0x6E,0x68,0x1EA5,0x74)</span></label>
            <label class="chip chip--active" style="display:flex;gap:.5rem;padding:.75rem;margin-bottom:.5rem;cursor:pointer"><input type="radio" name="level" value="medium" checked/> <span><strong>$(C 0x4B,0x68,0x75,0x79,0x1EBF,0x6E,0x20,0x6E,0x67,0x68,0x1ECB)</strong> $EM $(C 0x63,0xE2,0x6E,0x20,0x62,0x1EB1,0x6E,0x67)</span></label>
            <label class="chip" style="display:flex;gap:.5rem;padding:.75rem;cursor:pointer"><input type="radio" name="level" value="strong"/> <span><strong>$(C 0x4E,0xE9,0x6E,0x20,0x6D,0x1EA1,0x6E,0x68)</strong> $EM $(C 0x66,0x69,0x6C,0x65,0x20,0x6E,0x68,0x1ECF,0x20,0x6E,0x68,0x1EA5,0x74)</span></label>
          </div>
          <button type="button" class="btn btn-primary btn-block" id="runBtn" style="margin-top:1rem">$(C 0x4E,0xE9,0x6E,0x20,0x50,0x44,0x46)</button>
          <p class="hint" style="margin-top:.75rem">$(C 0x4D,0x1EE9,0x63,0x20,0x6B,0x68,0x75,0x79,0x1EBF,0x6E,0x20,0x6E,0x67,0x68,0x1ECB,0x2F,0x6D,0x1EA1,0x6E,0x68,0x20,0x72,0x65,0x6E,0x64,0x65,0x72,0x20,0x74,0x72,0x61,0x6E,0x67,0x20,0x74,0x68,0xE0,0x6E,0x68,0x20,0x4A,0x50,0x45,0x47,0x20,0x28,0x63,0x68,0x1EEF,0x20,0x63,0xF3,0x20,0x74,0x68,0x1EC3,0x20,0x74,0x68,0xE0,0x6E,0x68,0x20,0x1EA3,0x6E,0x68,0x29,0x2E)</p>
        </div>
      </div>
$(ResultHtml)
    </div>
  </div>
</section>
"@ + (Foot '<script src="../assets/js/tools/pdf.js"></script>' @'
<script>
let file = null;
OT.bindUploadZone({ onFiles: f => { file = f[0]; } });
document.getElementById("runBtn").onclick = async () => {
  const btn = document.getElementById("runBtn");
  try {
    if (!file) throw new Error("Chọn PDF.");
    const level = document.querySelector("input[name=level]:checked")?.value || "medium";
    OT.setBusy(btn, true, "Đang nén…");
    OT.setProgress(12);
    OT.setStatus("Đang nén — có thể mất vài chục giây…");
    const { bytes, meta } = await OTPdf.compress(file, level);
    const info = `${meta.note}\nTrước: ${OT.formatBytes(meta.beforeBytes)}\nSau: ${OT.formatBytes(meta.afterBytes)}\nGiảm: ${meta.savedPercent}%`;
    OT.showResult({ bytes, fileName: OT.nameWithSuffix(file.name, "-compressed-" + meta.level, ".pdf"), contentType: "application/pdf", text: info });
    document.getElementById("preview").textContent = info;
  } catch (e) { OT.setStatus(e.message || "Lỗi", "err"); }
  finally { OT.setBusy(btn, false); }
};
</script>
'@))
$fixed += 'pdf-compress.html'

Write-Host "Fixed: $($fixed -join ', ')"
