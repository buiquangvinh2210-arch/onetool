@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo  OneTool — Deploy Cloudflare Worker
echo ========================================
echo.

set "NODEDIR=%TEMP%\node-v22.14.0-win-x64"
set "NODE=%NODEDIR%\node.exe"
set "NPM=%NODEDIR%\npm.cmd"

if not exist "%NODE%" (
  echo [1/5] Tai Node.js portable...
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$z=Join-Path $env:TEMP 'node-v22.14.0-win-x64.zip';" ^
    "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-win-x64.zip' -OutFile $z -UseBasicParsing;" ^
    "Expand-Archive -Path $z -DestinationPath $env:TEMP -Force"
)

set "PATH=%NODEDIR%;%PATH%"
echo Node: 
"%NODE%" -v
echo.

echo [2/5] Cai wrangler...
"%NPM%" install wrangler --no-fund --no-audit
if errorlevel 1 (
  echo LOI npm install
  pause
  exit /b 1
)

echo.
echo [3/5] Dang nhap Cloudflare — se mo trinh duyet...
call "%CD%\node_modules\.bin\wrangler.cmd" login
if errorlevel 1 (
  echo LOI login
  pause
  exit /b 1
)

echo.
echo [4/5] Deploy worker...
call "%CD%\node_modules\.bin\wrangler.cmd" deploy
if errorlevel 1 (
  echo LOI deploy
  pause
  exit /b 1
)

echo.
echo [5/5] Dat secret GROQ_API_KEY...
echo Dan key gsk_... roi Enter:
call "%CD%\node_modules\.bin\wrangler.cmd" secret put GROQ_API_KEY

echo.
echo ========================================
echo  XONG. Copy URL workers.dev o tren
echo  Dan vao docs\assets\js\ot-config.js:
echo    whisperCloud: "https://onetool-whisper.XXXX.workers.dev"
echo  Roi commit + push GitHub.
echo ========================================
pause
