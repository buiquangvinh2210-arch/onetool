$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding $false
function C([int[]]$codes) { -join ($codes | ForEach-Object { [char]$_ }) }
function Write-Utf8File([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

$EM   = C 0x2014
$DOT  = C 0xB7
$ELL  = C 0x2026
$GE   = C 0x2265
$base = "e:\AITool\docs"
$catalog = [System.IO.File]::ReadAllText("$base\assets\js\catalog.js", $utf8)

function Get-Meta([string]$slug) {
  $re = [regex]"`"$slug`":\s*\{\s*title:\s*`"([^`"]+)`",\s*desc:\s*`"([^`"]+)`""
  $m = $re.Match($catalog)
  if (-not $m.Success) { throw "Missing pageMeta for $slug" }
  return @{ title = $m.Groups[1].Value; desc = $m.Groups[2].Value }
}

$CongCuPDF  = "$(C 0x43,0xF4,0x6E,0x67,0x20,0x63,0x1EE5) $DOT PDF"
$CongCuAnh  = "$(C 0x43,0xF4,0x6E,0x67,0x20,0x63,0x1EE5) $DOT $(C 0x1EA2,0x6E,0x68)"
$CongCuConv = "$(C 0x43,0xF4,0x6E,0x67,0x20,0x63,0x1EE5) $DOT Converter"
$CachDung   = C 0x43,0xE1,0x63,0x68,0x20,0x64,0xF9,0x6E,0x67
$Buoc1      = C 0x42,0x1B0,0x1ED9,0x63,0x20,0x31
$Buoc2      = C 0x42,0x1B0,0x1ED9,0x63,0x20,0x32
$KetQua     = C 0x4B,0x1EBF,0x74,0x20,0x71,0x75,0x1EA3
$XuLyHint   = "$(C 0x58,0x1EED,0x20,0x6C,0xFD,0x20,0x74,0x72,0xEA,0x6E,0x20,0x74,0x72,0xEC,0x6E,0x68,0x20,0x64,0x75,0x79,0x1EC7,0x74) $EM $(C 0x66,0x69,0x6C,0x65,0x20,0x6B,0xF4,0x6E,0x67,0x20,0x72,0x1EDF,0x69,0x20,0x6D,0xE1,0x79,0x20,0x62,0x1EA1,0x6E,0x2E)"
$SaoChep    = C 0x53,0x61,0x6F,0x20,0x63,0x68,0xE9,0x70
$TaiFile    = C 0x54,0x1EA3,0x69,0x20,0x66,0x69,0x6C,0x65
$KeoThaPDF  = C 0x4B,0xE9,0x6F,0x20,0x74,0x68,0x1EA3,0x20,0x50,0x44,0x46
$HoacChonMay = "$(C 0x68,0x6F,0x1EB7,0x63) <button type=`"button`" class=`"link-btn`" id=`"browseBtn`">$(C 0x63,0x68,0x1ECD,0x6E,0x20,0x74,0x1EEB,0x20,0x6D,0xE1,0x79)</button>"
$ChonPDF    = C 0x43,0x68,0x1ECD,0x6E,0x20,0x50,0x44,0x46,0x2E
$ChonFile   = C 0x43,0x68,0x1ECD,0x6E,0x20,0x66,0x69,0x6C,0x65,0x2E
$Loi        = C 0x4C,0x1ED7,0x69
$TaiVe      = C 0x54,0x1EA3,0x69,0x20,0x76,0x1EC1
$MienPhi    = C 0x4D,0x69,0x1EC5,0x6E,0x20,0x70,0x68,0xED
$HeadCommon = @"
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/site.css" />
  <link rel="stylesheet" href="../assets/css/components.css" />
  <script>window.OT_BASE = "..";</script>
"@

function Head([hashtable]$meta, [string]$extraCss = "") {
  $css = if ($extraCss) { "`n  <link rel=`"stylesheet`" href=`"$extraCss`" />" } else { "" }
  return @"
<!DOCTYPE html>
<html lang="vi" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$($meta.title)</title>
  <meta name="description" content="$($meta.desc)" />
  <meta name="robots" content="index,follow" />
$HeadCommon$css
</head>
"@
}

function Tail([string]$scripts, [string]$inline = "") {
  return @"
<div id="site-footer"></div>
<script src="../assets/js/catalog.js"></script>
<script src="../assets/js/layout.js"></script>
<script src="../assets/js/core.js"></script>
<script src="../assets/js/site.js"></script>
$scripts
$inline
</body>
</html>
"@
}

function ResultPanel {
  return @"
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

# --- pdf-compress ---
$m = Get-Meta "pdf-compress"
Write-Utf8File "$base\cong-cu-pdf\pdf-compress.html" (Head $m + @"

<body>
<div id="site-header"></div>
<main role="main">
<section class="tool-workspace tool-workspace--doc">
  <div class="container">
    <header class="doc-hero">
      <div class="doc-hero-copy">
        <p class="eyebrow">$CongCuPDF</p>
        <h1>$(C 0x4E,0xE9,0x6E,0x20,0x50,0x44,0x46)</h1>
        <p class="lede">$(C 0x43,0x68,0x1ECD,0x6E,0x20,0x6D,0x1EE9,0x63,0x20,0x6E,0xE9,0x6E) $EM $(C 0x78,0x65,0x6D,0x20,0x25,0x20,0x0111,0xE3,0x20,0x67,0x69,0x1EA3,0x6D,0x20,0x72,0x1ED3,0x69,0x20,0x74,0x1EA3,0x69,0x20,0x76,0x1EC1,0x2E)</p>
        <div class="doc-pills"><span>3 $(C 0x6D,0x1EE9,0x63)</span><span>$(C 0x53,0x6F,0x20,0x73,0xE1,0x6E,0x68,0x20,0x64,0x75,0x6E,0x67,0x20,0x6C,0x01B0,0x1EE3,0x6E,0x67)</span></div>
      </div>
      <aside class="doc-hero-card"><h2>$CachDung</h2><ol><li><strong>1.</strong> Upload</li><li><strong>2.</strong> $(C 0x43,0x68,0x1ECD,0x6E,0x20,0x6D,0x1EE9,0x63)</li><li><strong>3.</strong> $TaiVe</li></ol></aside>
    </header>
    <div class="tool-workspace-grid">
      <div class="tool-panel">
        <div class="tool-panel-header"><h2>Input</h2><span class="tool-panel-badge">$Buoc1</span></div>
        <div class="tool-panel-body">
          <div class="upload-zone" id="uploadZone" role="button" tabindex="0">
            <input type="file" id="fileInput" accept="application/pdf,.pdf" hidden />
            <div class="upload-placeholder">
              <span class="upload-icon">PDF</span>
              <p><strong>$KeoThaPDF</strong></p>
              <p class="text-muted">$HoacChonMay</p>
            </div>
          </div>
          <div style="margin-top:1rem">
            <label class="chip" style="display:flex;gap:.5rem;padding:.75rem;margin-bottom:.5rem;cursor:pointer"><input type="radio" name="level" value="light"/> <span><strong>$(C 0x0CD,0x74,0x20,0x6E,0xE9,0x6E)</strong> $EM $(C 0x67,0x69,0x1EEF,0x20,0x63,0x68,0x69,0x20,0x74,0x69,0x1EBF,0x74,0x20,0x6E,0x68,0x1EA5,0x74)</span></label>
            <label class="chip chip--active" style="display:flex;gap:.5rem;padding:.75rem;margin-bottom:.5rem;cursor:pointer"><input type="radio" name="level" value="medium" checked/> <span><strong>$(C 0x4B,0x68,0x75,0x79,0x1EBF,0x6E,0x20,0x6E,0x67,0x68,0x1ECB)</strong> $EM $(C 0x63,0xE2,0x6E,0x20,0x62,0x1EB1,0x6E,0x67)</span></label>
            <label class="chip" style="display:flex;gap:.5rem;padding:.75rem;cursor:pointer"><input type="radio" name="level" value="strong"/> <span><strong>$(C 0x4E,0xE9,0x6E,0x20,0x6D,0x1EA1,0x6E,0x68)</strong> $EM $(C 0x66,0x69,0x6C,0x65,0x20,0x6E,0x68,0x1ECF,0x20,0x6E,0x68,0x1EA5,0x74)</span></label>
          </div>
          <button type="button" class="btn btn-primary btn-block" id="runBtn" style="margin-top:1rem">$(C 0x4E,0xE9,0x6E,0x20,0x50,0x44,0x46)</button>
          <p class="hint" style="margin-top:.75rem">$(C 0x4D,0x1EE9,0x63,0x20,0x6B,0x68,0x75,0x79,0x1EBF,0x6E,0x20,0x6E,0x67,0x68,0x1ECB,0x2F,0x6D,0x1EA1,0x6E,0x68,0x20,0x72,0x65,0x6E,0x64,0x65,0x72,0x20,0x74,0x72,0x61,0x6E,0x67,0x20,0x74,0x68,0xE0,0x6E,0x68,0x20,0x4A,0x50,0x45,0x47,0x20,0x28,0x63,0x68,0x1EEF,0x20,0x63,0xF3,0x20,0x74,0x68,0x1EC3,0x20,0x74,0x68,0xE0,0x6E,0x68,0x20,0x1EA3,0x6E,0x68,0x29,0x2E)</p>
        </div>
      </div>
$(ResultPanel)
    </div>
  </div>
</section>
</main>
"@ + (Tail '<script src="../assets/js/tools/pdf.js"></script>' @"
<script>
let file = null;
OT.bindUploadZone({ onFiles: f => { file = f[0]; } });
document.getElementById("runBtn").onclick = async () => {
  const btn = document.getElementById("runBtn");
  try {
    if (!file) throw new Error("$ChonPDF");
    const level = document.querySelector("input[name=level]:checked")?.value || "medium";
    OT.setBusy(btn, true, "$(C 0x0110,0x61,0x6E,0x67,0x20,0x6E,0xE9,0x6E)$ELL");
    OT.setProgress(12);
    OT.setStatus("$(C 0x0110,0x61,0x6E,0x67,0x20,0x6E,0xE9,0x6E) $EM $(C 0x63,0xF3,0x20,0x74,0x68,0x1EC3,0x20,0x6D,0x1EA5,0x74,0x20,0x76,0xE0,0x69,0x20,0x63,0x68,0x1EE5,0x63,0x20,0x67,0x69,0xE2,0x79)$ELL");
    const { bytes, meta } = await OTPdf.compress(file, level);
    const info = ``${meta.note}\n$(C 0x54,0x72,0x01B0,0x1ED9,0x63): ${OT.formatBytes(meta.beforeBytes)}\nSau: ${OT.formatBytes(meta.afterBytes)}\n$(C 0x47,0x69,0x1EA3,0x6D): ${meta.savedPercent}%``;
    OT.showResult({ bytes, fileName: OT.nameWithSuffix(file.name, "-compressed-" + meta.level, ".pdf"), contentType: "application/pdf", text: info });
    document.getElementById("preview").textContent = info;
  } catch (e) { OT.setStatus(e.message || "$Loi", "err"); }
  finally { OT.setBusy(btn, false); }
};
</script>
"@))
Write-Host "Fixed: pdf-compress.html"

Write-Host "Done batch 1"
