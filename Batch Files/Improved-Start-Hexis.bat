@echo off
setlocal enabledelayedexpansion

:: ==========================================================
:: Phase IV Tuning: Set Defaults
:: ==========================================================
set "HB_MIN=60"
set "MX_SEC=660"

echo --------------------------------------------------------
echo AGI Memory System - Phase IV Startup
echo --------------------------------------------------------

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

:: Prompt for Heartbeat (default 60 mins)
set /p "INPUT_HB=Desired heartbeat interval [default %HB_MIN% minutes]: "
if not "!INPUT_HB!"=="" set "HB_MIN=!INPUT_HB!"

:: Prompt for MX Worker (default 660 seconds)
set /p "INPUT_MX=Desired subconscious maintenance interval [default %MX_SEC% seconds]: "
if not "!INPUT_MX!"=="" set "MX_SEC=!INPUT_MX!"

echo.
echo Target Intervals: Heartbeat [%HB_MIN% min] | Subconscious [%MX_SEC% sec]
echo --------------------------------------------------------

:: ==========================================================
:: Standard Orchestration - Start all containers with active profile
:: ==========================================================
echo Starting Docker containers...
docker-compose --profile active up -d

echo Waiting for Database readiness...
timeout /t 15 /nobreak > nul

:: ==========================================================
:: SQL Injection: Apply Intervals to DB
:: ==========================================================
echo Applying Phase IV configuration to heartbeat_config...

:: Heartbeat Interval (Minutes)
docker compose exec -T db psql -U agi_user -d agi_db -c "INSERT INTO heartbeat_config (key, value) VALUES ('heartbeat_interval_minutes', '%HB_MIN%') ON CONFLICT (key) DO UPDATE SET value = '%HB_MIN%';"

:: Subconscious/Maintenance Interval (Seconds)
docker compose exec -T db psql -U agi_user -d agi_db -c "INSERT INTO maintenance_config (key, value) VALUES ('maintenance_interval_seconds', '%MX_SEC%') ON CONFLICT (key) DO UPDATE SET value = '%MX_SEC%';"

REM Show container status
echo.
echo Container Status:
docker-compose ps

echo.
echo [SUCCESS] AGI Memory System Started!

echo -------------------------------------------------------------------------------
echo 1. Launch Claude Desktop to connect the Homunculus.  (MCP will auto-connect)
echo 2. Optional: Open pgAdmin to view database
echo 3. Optional: Watch heartbeat logs with:  docker-compose logs -f heartbeat_worker
echo.
echo --------------------------------------------------------------------------------
pause