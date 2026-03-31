@echo off
echo.
echo IMPORTANT: Make sure Django server is NOT running!
echo Close any Django/start.bat windows first.
echo.
pause
echo.
echo Running migrations...
cd backend && python manage.py makemigrations user && python manage.py migrate && cd ..
echo.
echo Done! Now run start.bat
pause
