@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Deploy Cloudflare Worker: onetool-tiktok
echo.
where wrangler >nul 2>&1
if errorlevel 1 (
  echo Chua cai wrangler. Chay: npm install -g wrangler
  pause
  exit /b 1
)
wrangler deploy -c wrangler-tiktok.toml
echo.
echo Xong. Dan URL workers.dev vao docs\assets\js\ot-config.js ^(tiktokCloud^)
pause
