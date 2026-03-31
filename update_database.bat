@echo off
echo ========================================
echo  Adding Payment Features to Database
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Please run this script from the SPDATA folder.
    pause
    exit /b 1
)

REM Navigate to backend
cd backend

REM Check if manage.py exists
if not exist "manage.py" (
    echo ERROR: manage.py not found!
    echo Please make sure you're in the correct directory.
    cd ..
    pause
    exit /b 1
)

echo Creating migrations...
python manage.py makemigrations user

echo.
echo Applying migrations...
python manage.py migrate

echo.
echo ========================================
echo  Payment features added successfully!
echo ========================================
echo.
echo New fields added to Booking model:
echo - payment_status (pending/paid)
echo - payment_method (Cash/GCash/Card/Bank Transfer)
echo - total_amount (5000 for Wedding/Birthday, 7000 for Conference/Corporate)
echo.

cd ..
pause
