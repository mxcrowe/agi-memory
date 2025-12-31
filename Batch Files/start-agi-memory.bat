@echo off
echo ========================================
echo Starting AGI Memory System
echo ========================================
echo.

REM Change to project directory
cd /d G:\Dev\local-memory-system

REM Check if Docker Desktop is running
echo Checking Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop is not running!
    echo Please start Docker Desktop first, then run this script again.
    pause
    exit /b 1
)

echo Docker Desktop is running.
echo.

REM Start all containers with active profile
echo Starting AGI Memory containers...
docker-compose --profile active up -d

echo.
echo Waiting for containers to be healthy...
timeout /t 10 /nobreak >nul

REM Show container status
echo.
echo Container Status:
docker-compose ps

echo.
echo ========================================
echo AGI Memory System Started!
echo ========================================
echo.
echo Next steps:
echo 1. Open Claude Desktop (MCP will auto-connect)
echo 2. Optional: Open pgAdmin to view database
echo 3. Optional: Watch heartbeat logs with:
echo    docker-compose logs -f heartbeat_worker
echo.
echo Current API model: Claude 4 Sonnet
echo 
echo.
pause
