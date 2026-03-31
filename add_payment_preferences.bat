@echo off
echo ========================================
echo  Adding Payment Preferences to Database
echo ========================================
echo.

cd backend

echo Applying database migrations...
python manage.py migrate

echo.
echo ========================================
echo  Payment preferences added successfully!
echo ========================================
echo.
echo You can now set your preferred payment method in Profile page.
echo.
pause
