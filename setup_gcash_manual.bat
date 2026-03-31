@echo off
echo ========================================
echo   Manual GCash Payment Setup
echo ========================================
echo.

echo Installing Pillow for image uploads...
cd backend
pip install Pillow
echo.

echo Creating database migration...
python manage.py makemigrations
echo.

echo Applying migration...
python manage.py migrate
echo.

cd ..

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Manual GCash payment is now enabled!
echo.
echo Features added:
echo - Upload payment proof (screenshot)
echo - GCash reference number tracking
echo - Organizer payment verification
echo.
echo Your GCash number: 09939261681
echo.
echo Next: Run start.bat to start your application
echo.
pause
