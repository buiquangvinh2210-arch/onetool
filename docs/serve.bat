@echo off
cd /d "%~dp0"
echo.
echo  OneTool local server
echo  Mo trinh duyet: http://localhost:5500
echo.
npx --yes serve -p 5500
