$utf8 = New-Object System.Text.UTF8Encoding $false
function C([int[]]$codes) { -join ($codes | ForEach-Object { [char]$_ }) }
$t = C 0x47,0x1ED9,0x70
[System.IO.File]::WriteAllText("e:\AITool\docs\_utf8test.txt", $t, $utf8)
$read = [System.IO.File]::ReadAllText("e:\AITool\docs\_utf8test.txt", $utf8)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($read)
($bytes | ForEach-Object { '{0:X2}' -f $_ }) -join ' '
