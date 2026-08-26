$ErrorActionPreference = "Stop"
$files = @(
  "e:\AITool\docs\assets\css\skins.css",
  "e:\AITool\docs\assets\css\tool-chrome.css",
  "e:\AITool\docs\assets\css\chrome.css",
  "e:\AITool\docs\assets\css\readability.css",
  "e:\AITool\docs\assets\css\mobile.css",
  "e:\AITool\docs\assets\css\dark-tools.css"
)
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("/* OneTool shell bundle. Rebuild from sources. */")
[void]$sb.AppendLine("/* v=20260826q */")
foreach ($f in $files) {
  $name = Split-Path $f -Leaf
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("/* ===== $name ===== */")
  [void]$sb.AppendLine([System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8))
}
$dest = "e:\AITool\docs\assets\css\ot-shell.css"
[System.IO.File]::WriteAllText($dest, $sb.ToString(), (New-Object System.Text.UTF8Encoding $false))
Write-Output ("Wrote $dest bytes=" + (Get-Item $dest).Length)
