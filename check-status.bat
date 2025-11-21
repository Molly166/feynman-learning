@echo off
chcp 65001 >nul
echo ========================================
echo Feynman Platform - Status Check
echo ========================================
echo.

echo Checking services:
echo.

echo 1. Backend Service (http://localhost:3000)...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend service is running
) else (
    echo [ERROR] Backend service is not running
    echo Please run: node index-simple.js
)

echo.
echo 2. Frontend Service (http://localhost:5173)...
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend service is running
) else (
    echo [ERROR] Frontend service is not running
    echo Please run: cd feynman-platform-frontend && npm run dev
)

echo.
echo 3. API Configuration:
echo - Backend route: /api/users/register
echo - Frontend request: /users/register
echo - Final URL: http://localhost:3000/api/users/register

echo.
echo ========================================
echo Status check completed
echo ========================================
echo.
echo If all services are running:
echo 1. Visit http://localhost:5173
echo 2. Try to register a new user
echo 3. Check browser console for any errors
echo.
pause














