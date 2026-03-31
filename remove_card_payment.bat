@echo off
echo ========================================
echo   REMOVING CARD PAYMENT OPTION
echo ========================================
echo.
echo This will remove card payment from:
echo - Frontend (already done)
echo - Database fields
echo.
pause

cd backend

echo.
echo [1/2] Creating migration...
python manage.py makemigrations

echo.
echo [2/2] Applying migration to database...
python manage.py migrate

echo.
echo ========================================
echo   CARD PAYMENT REMOVED!
echo ========================================
echo.
echo Changes:
echo - Removed saved_card_number field from User table
echo - Updated payment choices to Cash and GCash only
echo - Frontend already updated (no card option)
echo.
echo Restart your servers to apply changes:
echo 1. Stop servers (Ctrl+C)
echo 2. Run: start.bat
echo.
pause
