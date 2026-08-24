@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo  OneTool - Audio (web + Groq proxy)
echo ========================================
echo.
echo  Proxy: http://127.0.0.1:8787
echo  Web:   http://127.0.0.1:5500/docs/cong-cu/media/audio-to-text.html
echo  Key:   docs/.groq-key  (user KHONG dan key tren web)
echo.
echo  Giữ 2 cửa sổ PowerShell MỞ khi dùng.
echo ========================================
echo.

start "OneTool-Whisper-Proxy" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0local-whisper-proxy.ps1"
timeout /t 1 /nobreak >nul
start "OneTool-Web-5500" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0_static-server.ps1"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5500/docs/cong-cu/media/audio-to-text.html"
