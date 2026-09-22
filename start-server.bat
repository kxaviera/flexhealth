@echo off
title Flex Health - API Server
cd /d "%~dp0server"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  Node.js is NOT installed.
  echo.
  echo  1. Download and install from: https://nodejs.org  ^(LTS version^)
  echo  2. Close this window, open a NEW terminal
  echo  3. Run this file again
  echo.
  echo  For now, use start-static.bat in the project folder ^(Python, no backend^).
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

if not exist .env (
  copy .env.example .env >nul
  echo Created server\.env from .env.example
)

echo.
echo  Flex Health API + Store
echo  Open: http://localhost:3000
echo  Admin: http://localhost:3000/admin.html
echo  Press Ctrl+C to stop
echo.
call npm start
