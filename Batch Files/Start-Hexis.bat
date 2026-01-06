@echo off
echo ========================================
echo Starting Hexis System
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
echo Starting Hexis containers...
docker-compose --profile active up -d

echo.
echo Waiting for containers to be healthy...
timeout /t 10 /nobreak >nul

REM Enforce heartbeat config (edit values as desired)
set HB_PROVIDER=openrouter
set HB_MODEL=openai/gpt-4o-mini
set HB_ENDPOINT=
set HB_API_KEY_ENV=OPENROUTER_API_KEY

echo.
echo Ensuring llm.heartbeat config...
docker-compose exec -T db psql -U agi_user -d agi_db -c "SELECT set_config('llm.heartbeat', '{""provider"":""%HB_PROVIDER%"",""model"":""%HB_MODEL%"",""endpoint"":""%HB_ENDPOINT%"",""api_key_env"":""%HB_API_KEY_ENV%""}'::jsonb);"

REM Show container status
echo.
echo Container Status:
docker-compose ps

echo.
echo ========================================
echo Hexis System Started!
echo ========================================
echo.
echo Next steps:
echo 1. Open Claude Desktop (MCP will auto-connect)
echo 2. Optional: Open pgAdmin to view database
echo 3. Optional: Watch heartbeat logs with:
echo    docker-compose logs -f heartbeat_worker
echo.
echo Current API model: ChatGPT 4o-mini at OpenRouter
echo
echo.
pause
