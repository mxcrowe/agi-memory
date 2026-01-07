@echo off
title Hexis Dashboard
color 0A

echo ============================================
echo           Starting Hexis Dashboard
echo ============================================
echo.

:: Change to the Dashboard directory
cd /d "G:\Dev\local-memory-system\Dashboard"

:: Open browser to localhost:3000 after a short delay (in background)
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: Start the development server
echo Starting Next.js development server...
echo Dashboard will open in browser automatically.
echo.
echo Press Ctrl+C to stop the server.
echo.
npm run dev
