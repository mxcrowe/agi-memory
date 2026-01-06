@echo off
setlocal EnableExtensions

echo ===========================================
echo Nightly Backup of AGI Memory Database
echo ===========================================
echo.

REM Change to project directory
cd /d G:\Dev\local-memory-system

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Desktop is not running - cannot backup.
    pause
    exit /b 1
)

REM ---- CONFIG (matches docker-compose defaults) ----
set "CONTAINER=agi_brain"
set "DB_NAME=agi_db"
set "DB_USER=agi_user"

REM Output folder on Windows host
set "BACKUPDIR=G:\Dev\local-memory-system\backups"
if not exist "%BACKUPDIR%" mkdir "%BACKUPDIR%"

REM Timestamp (PowerShell only — do NOT overwrite it)
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TIMESTAMP=%%I"

set "BACKUPFILE=%DB_NAME%_%TIMESTAMP%.dump"
set "HOSTPATH=%BACKUPDIR%\%BACKUPFILE%"

REM Temp path inside container
set "CTRPATH=/tmp/%BACKUPFILE%"

echo Backing up container=%CONTAINER% db=%DB_NAME% user=%DB_USER%
echo Output: %HOSTPATH%
echo.

REM Ensure container is running (must be running for docker exec / pg_dump)
docker exec %CONTAINER% true >nul 2>&1
if %errorlevel% neq 0 (
    echo FAILED: Cannot exec into container "%CONTAINER%".
    pause
    exit /b 1
)

REM Create dump inside container
docker exec %CONTAINER% sh -lc "pg_dump -U %DB_USER% -d %DB_NAME% -Fc --no-owner --no-acl -f %CTRPATH%"
if %errorlevel% neq 0 (
    echo FAILED: pg_dump inside container returned an error.
    pause
    exit /b 1
)

REM Copy dump to host
docker cp %CONTAINER%:%CTRPATH% "%HOSTPATH%"
if %errorlevel% neq 0 (
    echo FAILED: docker cp returned an error.
    pause
    exit /b 1
)

REM Cleanup temp file in container
docker exec %CONTAINER% sh -lc "rm -f %CTRPATH%" >nul 2>&1

echo SUCCESS: Backup saved to %HOSTPATH%
echo.
echo ========================================
echo Backup Routine Completed
echo ========================================
echo.
pause
