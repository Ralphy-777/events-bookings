@echo off
echo ========================================
echo SPDATA System Check
echo ========================================
echo.

set errors=0

echo [1/6] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    python --version
    echo [OK] Python is installed
) else (
    echo [ERROR] Python is not installed or not in PATH
    set /a errors+=1
)
echo.

echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    node --version
    echo [OK] Node.js is installed
) else (
    echo [ERROR] Node.js is not installed or not in PATH
    set /a errors+=1
)
echo.

echo [3/6] Checking if MySQL is running...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %errorlevel% equ 0 (
    echo [OK] MySQL is running
) else (
    echo [ERROR] MySQL is not running - Start XAMPP MySQL
    set /a errors+=1
)
echo.

echo [4/6] Checking backend dependencies...
if exist "backend\requirements.txt" (
    echo [OK] requirements.txt found
    pip show django >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Django is installed
    ) else (
        echo [WARNING] Django not installed - Run: pip install -r requirements.txt
        set /a errors+=1
    )
) else (
    echo [ERROR] requirements.txt not found
    set /a errors+=1
)
echo.

echo [5/6] Checking frontend dependencies...
if exist "frontend\package.json" (
    echo [OK] package.json found
    if exist "frontend\node_modules" (
        echo [OK] node_modules exists
    ) else (
        echo [WARNING] node_modules not found - Run: npm install
        set /a errors+=1
    )
) else (
    echo [ERROR] package.json not found
    set /a errors+=1
)
echo.

echo [6/6] Checking database...
if exist "backend\db.sqlite3" (
    echo [INFO] SQLite database found (will be replaced by MySQL)
)
echo Checking MySQL connection...
cd backend
python -c "import django; import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings'); django.setup(); from django.db import connection; connection.ensure_connection(); print('[OK] MySQL connection successful')" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Database connection works
) else (
    echo [WARNING] Cannot connect to database
    echo Make sure:
    echo - XAMPP MySQL is running
    echo - Database 'spdata_db' exists
    echo - Run create_database.sql in phpMyAdmin
)
cd ..
echo.

echo ========================================
echo System Check Complete
echo ========================================
echo.

if %errors% equ 0 (
    echo [SUCCESS] All checks passed!
    echo.
    echo You can now:
    echo 1. Run init_database.bat to set up database
    echo 2. Run start.bat to start the application
) else (
    echo [WARNING] %errors% issue(s) found
    echo Please fix the errors above before proceeding
)
echo.
pause
