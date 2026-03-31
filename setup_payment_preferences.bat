@echo off
color 0A
echo ========================================
echo   PAYMENT PREFERENCES SETUP
echo ========================================
echo.
echo This will add payment preferences to your system.
echo Similar to Google Play Store subscriptions!
echo.
echo Features:
echo  - Save preferred payment method
echo  - Auto-select on bookings
echo  - Secure card storage
echo  - Update anytime
echo.
pause
echo.

echo [1/2] Applying database migrations...
cd backend
python manage.py migrate
if errorlevel 1 (
    echo.
    echo ERROR: Migration failed!
    echo Make sure:
    echo  1. XAMPP MySQL is running
    echo  2. Database 'eventpro' exists
    echo  3. Backend dependencies are installed
    echo.
    pause
    exit /b 1
)

echo.
echo [2/2] Verifying setup...
python manage.py check
if errorlevel 1 (
    echo.
    echo WARNING: System check found issues
    echo.
)

cd ..

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Payment preferences are now available!
echo.
echo NEXT STEPS:
echo  1. Run: start.bat
echo  2. Login to your account
echo  3. Go to Profile page
echo  4. Set your payment preference
echo  5. Create bookings faster!
echo.
echo DOCUMENTATION:
echo  - PAYMENT_PREFERENCES_GUIDE.md
echo  - PAYMENT_PREFERENCES_IMPLEMENTATION.md
echo.
echo Your saved payment method will be:
echo  - Auto-selected when creating bookings
echo  - Changeable anytime in Profile
echo  - Securely stored
echo.
pause
