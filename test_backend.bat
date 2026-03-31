@echo off
echo ========================================
echo  Testing Backend API
echo ========================================
echo.

echo Checking if Django server is running...
curl -s http://localhost:8000/api/user/events/public/ > nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Django server is running on port 8000
) else (
    echo [ERROR] Django server is NOT running!
    echo Please run: start.bat
    pause
    exit /b 1
)

echo.
echo Testing API endpoints...
echo.

echo 1. Testing public events endpoint...
curl -s http://localhost:8000/api/user/events/public/
echo.
echo.

echo ========================================
echo  Test Complete
echo ========================================
echo.
echo If you see JSON data above, the backend is working correctly.
echo If you see HTML or errors, there's a problem with Django.
echo.
pause
