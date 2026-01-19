@echo off
REM Production startup script for Windows
REM This script starts the Node.js backend server

echo Starting Correspondence Management System Backend...
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dist folder exists
if not exist "dist\server.js" (
    echo ERROR: Backend not built. Please run: npm run build
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found. Using default values.
    echo Please create .env file with production settings.
    echo.
)

REM Start the server
echo Starting server on port %PORT% (default: 3000)...
echo Press Ctrl+C to stop the server
echo.

node dist/server.js

pause

