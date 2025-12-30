@echo off
echo ========================================
echo Nightly Backup of AGI Memory Database
echo ========================================
echo.

REM Change to project directory
cd /d G:\Dev\local-memory-system

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Desktop is not running - cannot backup.
    pause
    exit /b 0
)

echo Backing up AGI Memory database...

:: Create timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%_%datetime:~8,6%

:: Set backup path
set backupdir=G:\Dev\local-memory-system\backups
set backupfile=%backupdir%\agi_db_%timestamp%.dump

:: Ensure backup directory exists
if not exist "%backupdir%" mkdir "%backupdir%"

:: Run pg_dump inside the container
docker exec agi-memory-db pg_dump -U agi_user agi_db > "%backupfile%"

if %errorlevel%==0 (
    echo SUCCESS: Backup saved to %backupfile%
) else (
    echo FAILED: Backup encountered an error
)

echo.
echo ========================================
echo Backup Routine Completed
echo ========================================
echo.

pause
