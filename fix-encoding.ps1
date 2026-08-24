# Fix HTML encoding — builds Vietnamese via char codes (ASCII-safe script)
$utf8 = New-Object System.Text.UTF8Encoding $false

function C([int[]]$codes) {
  return -join ($codes | ForEach-Object { [char]$_ })
}

function Write-Utf8File([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

$em = [char]0x2014  # —
$ell = [char]0x2026  # …
$middot = [char]0xB7  # ·

# --- pdf-merge.html ---
Write-Utf8File "e:\AITool\docs\cong-cu-pdf\pdf-merge.html" @"
<!DOCTYPE html>
<html lang="vi" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$(C 0x47,0x1ED9,0x70) PDF online $(C 0x6D,0x69,0x1EC5,0x6E) ph$(C 0xED) $em gh$(C 0xE9,0x1ED1)p nhi$(C 0x1EC1)u file th$(C 0xE0,0x6E)h m$(C 0x1ED9,t) | OneTool</title>
  <meta name="description" content="$(C 0x47,0x1ED9,0x70) nhi$(C 0x1EC1)u file PDF th$(C 0xE0,0x6E)h m$(C 0x1ED9,t) t$(C 0xE0,0x69) li$(C 0x1EC7)u, s$(C 0xE1,0x1EAD)p x$(C 0x1EBF)p th$(C 0x1EE9) t$(C 0x1EF1) r$(C 0x1ED3)i t$(C 0xE3,0x69) v$(C 0x1EC1). X$(C 0x1EED) l$(C 0xFD) tr$(C 0xEA,0x6E)h duy$(C 0x1EC7)t, kh$(C 0xF4,0x6E)g c$(C 0x1EA7)n $(C 0x111,0x103)ng k$(C 0xFD)." />
  <meta name="robots" content="index,follow" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/site.css" />
  <link rel="stylesheet" href="../assets/css/components.css" />
  <script>window.OT_BASE = "..";</script>
</head>
<body>
<div id="site-header"></div>
<main role="main">
<section class="tool-workspace tool-workspace--doc">
  <div class="container">
    <header class="doc-hero">
      <div class="doc-hero-copy">
        <p class="eyebrow">C$(C 0xF4,0x6E)ng c$(C 0x1EE5) $middot PDF</p>
        <h1>$(C 0x47,0x1ED9,0x70) PDF</h1>
        <p class="lede">Ch$(C 0x1ECD)n t$(C 0x1EEB) 2 file PDF tr$(C 0x1EDF) l$(C 0xEA,n) $em g$(C 0x1ED9)p theo th$(C 0x1EE9) t$(C 0x1EF1) $(C 0x111,0xE3) ch$(C 0x1ECD)n.</p>
        <div class="doc-pills"><span>Nhi$(C 0x1EC1)u file</span><span>Gi$(C 0x1EEF) ch$(C 0x1EA5,t) l$(C 0x1B0,0x1EE3,0x6E)g</span><span>Mi$(C 0x1EC5,n) ph$(C 0xED)</span></div>
      </div>
      <aside class="doc-hero-card"><h2>C$(C 0xE1,0x1EAF)ch d$(C 0xF9,0x6E)g</h2><ol><li><strong>1.</strong> Ch$(C 0x1ECD)n $(C 0x2265) 2 PDF</li><li><strong>2.</strong> B$(C 0x1EA5,m) $(C 0x47,0x1ED9,0x70)</li><li><strong>3.</strong> T$(C 0xE3,0x69) v$(C 0x1EC1)</li></ol></aside>
    </header>
    <div class="tool-workspace-grid">
      <div class="tool-panel">
        <div class="tool-panel-header"><h2>Input</h2><span class="tool-panel-badge">B$(C 0x1B0,0x1ED9,c) 1</span></div>
        <div class="tool-panel-body">
          <div class="upload-zone upload-zone--multi" id="uploadZone" data-kind="pdf" role="button" tabindex="0">
            <input type="file" id="fileInput" accept="application/pdf,.pdf" multiple hidden />
            <div class="upload-placeholder">
              <span class="upload-icon">PDF</span>
              <p><strong>K$(C 0xE9,o) th$(C 0x1EA3) PDF v$(C 0xE0,o) $(C 0x111,0xE2,y)</strong></p>
              <p class="text-muted">ho$(C 0x1EB7,c) <button type="button" class="link-btn" id="browseBtn">ch$(C 0x1ECD)n t$(C 0x1EEB) m$(C 0xE1,y)</button></p>
              <p class="hint">Ch$(C 0x1ECD)n nhi$(C 0x1EC1)u file $em c$(C 0xF3) th$(C 0x1EC3) th$(C 0xEA,m) t$(C 0x1EEB)ng file sau</p>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-block" id="runBtn">$(C 0x47,0x1ED9,0x70) PDF</button>
        </div>
      </div>
      <div class="tool-panel result-panel">
        <div class="tool-panel-header"><h2>K$(C 0x1EBF,t) qu$(C 0x1EA3)</h2><span class="tool-panel-badge">B$(C 0x1B0,0x1ED9,c) 2</span></div>
        <div class="tool-panel-body">
          <p id="status" class="hint">X$(C 0x1EED) l$(C 0xFD) tr$(C 0xEA,0x6E)h duy$(C 0x1EC7)t $em file kh$(C 0xF4,0x6E)g r$(C 0x1ED1)i m$(C 0xE1,y) b$(C 0x1EA1,n).</p>
          <div class="result-actions">
            <button type="button" class="btn btn-outline btn-sm" id="copyResultBtn" disabled>Sao ch$(C 0xE9,p)</button>
            <button type="button" class="btn btn-primary btn-sm" id="downloadResultBtn" disabled>T$(C 0xE3,0x69) file</button>
          </div>
          <pre id="preview" class="form-control" style="min-height:140px;white-space:pre-wrap"></pre>
        </div>
      </div>
    </div>
  </div>
</section>
</main>
<div id="site-footer"></div>
<script src="../assets/js/catalog.js"></script>
<script src="../assets/js/layout.js"></script>
<script src="../assets/js/core.js"></script>
<script src="../assets/js/site.js"></script>
<script src="../assets/js/tools/pdf.js"></script>
<script>
let files = [];
OT.bindUploadZone({
  multiple: true,
  sortable: true,
  addLabel: "+ Th$(C 0xEA,m) PDF",
  onFiles: (f) => { files = f; }
});
document.getElementById("runBtn").onclick = async () => {
  const btn = document.getElementById("runBtn");
  try {
    if (files.length < 2) throw new Error("C$(C 0x1EA7,n) $(C 0xED,t) nh$(C 0x1EA5,t) 2 PDF $em b$(C 0x1EA5,m) $(C 0xAB)+ Th$(C 0xEA,m) PDF$(C 0xBB) $(C 0x111,0x1EC3) ch$(C 0x1ECD)n th$(C 0xEA,m).");
    OT.setBusy(btn, true, "$(C 0x110,0xE0,0x6E)g g$(C 0x1ED9,p)$ell");
    OT.setProgress(18);
    OT.setStatus("$(C 0x110,0xE0,0x6E)g g$(C 0x1ED9,p) theo th$(C 0x1EE9) t$(C 0x1EF1) $(C 0x111,0xE3) ch$(C 0x1ECD)n$ell");
    const bytes = await OTPdf.merge(files);
    OT.setProgress(92);
    OT.showResult({ bytes, fileName: "merged.pdf", contentType: "application/pdf" });
  } catch (e) {
    OT.setStatus(e.message || "L$(C 0x1ED7,i)", "err");
  } finally {
    OT.setBusy(btn, false);
  }
};
</script>
</body>
</html>
"@

Write-Host "pdf-merge.html fixed"
