@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo  OneTool IIS — tao web.secrets.config
echo ========================================

if not exist "%~dp0.groq-key" (
  echo THIEU file .groq-key
  echo Tao docs\.groq-key voi 1 dong: gsk_...
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$k=((Get-Content -LiteralPath '%~dp0.groq-key' -Raw) -split '`r?`n' | Where-Object { $_.Trim() -ne '' -and -not $_.Trim().StartsWith('#') } | Select-Object -First 1).Trim();" ^
  "if (-not $k.StartsWith('gsk_')) { throw 'Key khong hop le' };" ^
  "$out='%~dp0api\web.secrets.config';" ^
  "$xml=@\"`r`n<?xml version=`\"1.0`\" encoding=`\"utf-8`\"?>`r`n<appSettings>`r`n  <add key=`\"GROQ_API_KEY`\" value=`\"$k`\" />`r`n</appSettings>`r`n\"@;" ^
  "[IO.File]::WriteAllText($out,$xml,(New-Object Text.UTF8Encoding $false));" ^
  "Write-Host 'OK:' $out"

if errorlevel 1 (
  echo LOI tao web.secrets.config
  pause
  exit /b 1
)

echo.
echo Xong. Tren IIS:
echo  1. Site path = thu muc docs
echo  2. App Pool .NET v4.0 Integrated
echo  3. Mo http://onetool.vn/api/whisper  — phai thay ok:true
echo.
pause
