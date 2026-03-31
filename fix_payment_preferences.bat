@echo off
echo Applying payment preferences migration...
cd backend
python manage.py migrate
echo.
echo Migration complete! Please restart your servers.
echo Run: start.bat
pause
