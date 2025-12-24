@echo off
echo ========================================
echo Shutting Down AGI Memory System
echo ========================================
echo.

REM Change to project directory
cd /d G:\Dev\local-memory-system

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Desktop is not running - nothing to stop.
    pause
    exit /b 0
)

echo Stopping all AGI Memory containers...
docker-compose down

echo.
echo ========================================
echo AGI Memory System Stopped
echo ========================================
echo.
echo All containers have been stopped and removed.
echo Data is preserved in Docker volumes.
echo.
echo NOTE: This does NOT stop Docker Desktop itself.
echo If you want to stop Docker Desktop, close it manually.
echo.
echo To restart the system tomorrow:
echo - Run start-agi-memory.bat from your desktop
echo.
pause
