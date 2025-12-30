@echo off
echo ========================================
echo AGI Memory - Heartbeat Logs (Real-time)
echo ========================================
echo.
echo Watching Resonance think...
echo Press Ctrl+C to stop watching
echo.
echo ----------------------------------------
echo.

cd /d G:\Dev\local-memory-system
docker-compose logs -f heartbeat_worker
