@echo off
echo ========================================
echo  Adding Event Pricing to Database
echo ========================================
echo.

cd backend

echo Applying migrations...
python manage.py migrate

echo.
echo Initializing pricing data...
python manage.py init_pricing

cd ..

echo.
echo ========================================
echo  SUCCESS!
echo ========================================
echo.
echo Event Pricing Table Added!
echo.
echo What's in the database:
echo  - Event Type (Wedding, Birthday, Christening, Conference, Corporate Event)
echo  - Price (editable by admin)
echo  - Max Capacity (editable by admin)
echo.
echo How to edit prices:
echo  1. Go to: http://localhost:8000/admin
echo  2. Login with admin credentials
echo  3. Click "Event pricings"
echo  4. Edit any price or capacity
echo  5. Click Save
echo.
echo Current Prices:
echo  - Wedding: P5,000 (50 guests)
echo  - Birthday: P5,000 (50 guests)
echo  - Christening: P5,000 (50 guests)
echo  - Conference: P7,000 (100 guests)
echo  - Corporate Event: P7,000 (100 guests)
echo.
pause
