@echo off
echo ========================================
echo        MSEC Connect - Quick Start
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Start the server in background
echo Starting MSEC Connect server...
start /B "MSEC Server" cmd /c "node server.js"

:: Wait a moment for server to start
echo Waiting for server to start...
timeout /t 3 /nobreak >nul

:: Check if server is running
echo Checking server status...
curl -s http://localhost:3000/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Server is running successfully!
) else (
    echo ⚠ Server may still be starting...
)

echo.
echo Opening website in your default browser...
echo.

:: Open the website in default browser
start "" "http://localhost:3000/index.html"

echo ========================================
echo   Website opened: http://localhost:3000
echo   Server running in background
echo ========================================
echo.
echo Press any key to keep this window open...
echo (You can close this window - server will keep running)
pause >nul
