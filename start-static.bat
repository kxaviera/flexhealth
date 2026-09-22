@echo off
title Flex Health - Static Site
cd /d "%~dp0"
echo.
echo  Flex Health (static mode - no backend database)
echo  Open: http://localhost:8080
echo  Press Ctrl+C to stop
echo.
py -m http.server 8080
