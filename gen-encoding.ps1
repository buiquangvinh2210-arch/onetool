# Generator: reads UTF-8 source files and emits fix-all-encoding.ps1 with C() calls
# Run once with: powershell -NoProfile -File gen-encoding.ps1
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding $false

function Escape-ForPs([string]$s) {
  $parts = New-Object System.Collections.Generic.List[string]
  $i = 0
  while ($i -lt $s.Length) {
    $c = [int][char]$s[$i]
    if ($c -lt 128) {
      $j = $i
      while ($j -lt $s.Length -and [int][char]$s[$j] -lt 128) { $j++ }
      $chunk = $s.Substring($i, $j - $i)
      $chunk = $chunk -replace '\\', '\\' -replace "'", "''"
      [void]$parts.Add("'$chunk'")
      $i = $j
    } else {
      $j = $i
      while ($j -lt $s.Length -and [int][char]$s[$j] -ge 128) { $j++ }
      $bytes = $utf8.GetBytes($s.Substring($i, $j - $i))
      $codes = ($bytes | ForEach-Object { '0x{0:X2}' -f $_ }) -join ','
      [void]$parts.Add("(C $codes)")
      $i = $j
    }
  }
  if ($parts.Count -eq 0) { return "''" }
  if ($parts.Count -eq 1) { return $parts[0] }
  return ($parts -join ' + ')
}

# Read good reference + corrupted files; apply fixes via hashtable of regex replacements
# For now: read image-convert as structure reference, build content from embedded here

$header = @'
$utf8 = New-Object System.Text.UTF8Encoding $false
function C([int[]]$codes) { -join ($codes | ForEach-Object { [char]$_ }) }
function Write-Utf8File([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

'@

Write-Host "Use manual fix-all-encoding.ps1 instead"
