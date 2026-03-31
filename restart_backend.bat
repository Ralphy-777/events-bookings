@echo off
echo ========================================
echo   Quick Fix - Restarting Backend
echo ========================================
echo.

echo Step 1: Stopping any running Django servers...
taskkill /F /IM python.exe 2>nul
timeout /t 2 >nul
echo.

echo Step 2: Starting Django backend...
cd backend
start "Django Backend" cmd /k "python manage.py runserver"
echo.

echo ========================================
echo   Backend Restarted!
echo ========================================
echo.
echo The backend is now running on http://localhost:8000
echo.
echo Try your application again at http://localhost:3000
echo.
pause
