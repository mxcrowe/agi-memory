@echo off
echo ========================================
echo AGI Memory - System Status
echo ========================================
echo.

cd /d G:\Dev\local-memory-system

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo STATUS: Docker Desktop is NOT running
    echo.
    pause
    exit /b 1
)

echo Docker Desktop: RUNNING
echo.
echo Container Status:
echo ----------------------------------------
docker-compose ps
echo.
echo ========================================
echo.
pause
