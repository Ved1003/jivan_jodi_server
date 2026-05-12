@echo off
REM ============================================
REM Jivan Jodi Server Management Script
REM ============================================

setlocal

REM Change to the Server directory
cd /d "%~dp0"

REM Check if PM2 is installed
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PM2 is not installed globally.
    echo.
    echo Please install PM2 globally first:
    echo   npm install -g pm2
    echo.
    pause
    exit /b 1
)

REM Parse command line argument
set COMMAND=%1

if "%COMMAND%"=="" (
    echo Usage: server-manager.bat [start^|stop^|restart^|reload^|status^|logs^|monit]
    echo.
    echo Commands:
    echo   start   - Start the server with PM2
    echo   stop    - Stop the server
    echo   restart - Restart the server
    echo   reload  - Zero-downtime reload
    echo   status  - Show server status
    echo   logs    - Show server logs
    echo   monit   - Open PM2 monitoring dashboard
    echo.
    pause
    exit /b 0
)

if /i "%COMMAND%"=="start" (
    echo Starting Jivan Jodi Server...
    call npm run pm2:start
    goto :end
)

if /i "%COMMAND%"=="stop" (
    echo Stopping Jivan Jodi Server...
    call npm run pm2:stop
    goto :end
)

if /i "%COMMAND%"=="restart" (
    echo Restarting Jivan Jodi Server...
    call npm run pm2:restart
    goto :end
)

if /i "%COMMAND%"=="reload" (
    echo Reloading Jivan Jodi Server (zero downtime)...
    call npm run pm2:reload
    goto :end
)

if /i "%COMMAND%"=="status" (
    call npm run pm2:status
    goto :end
)

if /i "%COMMAND%"=="logs" (
    call npm run pm2:logs
    goto :end
)

if /i "%COMMAND%"=="monit" (
    call npm run pm2:monit
    goto :end
)

echo [ERROR] Unknown command: %COMMAND%
echo.
echo Valid commands: start, stop, restart, reload, status, logs, monit
echo.

:end
endlocal
