@echo off
echo ========================================
echo  Setting Up Event Pricing System
echo ========================================
echo.

cd backend

echo [1/2] Applying database migrations...
python manage.py migrate

echo.
echo [2/2] Initializing default pricing...
python manage.py init_pricing

cd ..

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Event pricing system is now ready!
echo.
echo What was added:
echo  - Christening event type
echo  - Admin can adjust prices in Django Admin
echo  - Go to: http://localhost:8000/admin
echo  - Look for "Event pricings" section
echo.
echo Default Prices:
echo  - Wedding: P5,000
echo  - Birthday: P5,000
echo  - Christening: P5,000
echo  - Conference: P7,000
echo  - Corporate Event: P7,000
echo.
pause
