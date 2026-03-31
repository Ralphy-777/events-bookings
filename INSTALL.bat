@echo off
color 0A
echo.
echo ========================================
echo    SPDATA - Step by Step Setup
echo ========================================
echo.
echo This guide will help you set up the complete system.
echo Follow each step carefully.
echo.
pause

:STEP1
cls
echo ========================================
echo STEP 1: Check Prerequisites
echo ========================================
echo.
echo Required software:
echo [1] Python 3.8 or higher
echo [2] Node.js 16 or higher  
echo [3] XAMPP with MySQL
echo.
echo Checking...
echo.

python --version 2>nul
if %errorlevel% neq 0 (
    echo [X] Python NOT found
    echo     Download from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Python found
)

node --version 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js NOT found
    echo     Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Node.js found
)

tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %errorlevel% neq 0 (
    echo [X] MySQL NOT running
    echo     Please start XAMPP and start MySQL service
    echo.
    pause
    goto STEP1
) else (
    echo [OK] MySQL is running
)

echo.
echo All prerequisites met!
echo.
pause

:STEP2
cls
echo ========================================
echo STEP 2: Create MySQL Database
echo ========================================
echo.
echo Instructions:
echo 1. Open your web browser
echo 2. Go to: http://localhost/phpmyadmin
echo 3. Click on "SQL" tab at the top
echo 4. Open the file: backend\create_database.sql
echo 5. Copy all the SQL code
echo 6. Paste it in the SQL tab
echo 7. Click "Go" button
echo 8. You should see: "Database spdata_db created successfully!"
echo.
echo Press any key when you have completed this step...
pause >nul

:STEP3
cls
echo ========================================
echo STEP 3: Install Backend Dependencies
echo ========================================
echo.
echo Installing Python packages...
echo This may take a few minutes...
echo.

cd backend
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    echo.
    echo If mysqlclient failed to install:
    echo 1. Download wheel from: https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
    echo 2. Install with: pip install mysqlclient-X.X.X-cpXX-cpXX-win_amd64.whl
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Backend dependencies installed
echo.
pause

:STEP4
cls
echo ========================================
echo STEP 4: Initialize Database
echo ========================================
echo.
echo Creating database tables...
echo.

python manage.py makemigrations user
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create migrations
    pause
    exit /b 1
)

python manage.py migrate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to apply migrations
    echo.
    echo Make sure:
    echo - MySQL is running
    echo - Database spdata_db exists
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Database tables created
echo.
pause

:STEP5
cls
echo ========================================
echo STEP 5: Create Admin Account
echo ========================================
echo.
echo You will now create a superuser account.
echo This account will be used to access the admin panel.
echo.
echo Please enter the following information:
echo - Email (use as username)
echo - Password (will not be visible when typing)
echo.
pause

python manage.py createsuperuser

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to create superuser
    pause
    exit /b 1
)

echo.
echo [OK] Superuser created
echo.
pause

cd ..

:STEP6
cls
echo ========================================
echo STEP 6: Install Frontend Dependencies
echo ========================================
echo.
echo Installing Node.js packages...
echo This may take a few minutes...
echo.

cd frontend
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Frontend dependencies installed
echo.
pause

cd ..

:STEP7
cls
echo ========================================
echo STEP 7: Create Organizer Account
echo ========================================
echo.
echo Now you need to create an organizer account.
echo.
echo Instructions:
echo 1. We will start the Django server
echo 2. Open browser and go to: http://localhost:8000/admin
echo 3. Login with the superuser credentials you just created
echo 4. Click on "Users" in the left sidebar
echo 5. Click "ADD USER" button (top right)
echo 6. Fill in:
echo    - Email: organizer@test.com (or your choice)
echo    - Username: organizer@test.com (same as email)
echo    - Password: (choose a password)
echo 7. Click "SAVE AND CONTINUE EDITING"
echo 8. Scroll down to "Permissions" section
echo 9. Check the box "Is organizer"
echo 10. Click "SAVE" at the bottom
echo.
echo Press any key to start Django server...
pause >nul

cd backend
start "Django Server" cmd /k "python manage.py runserver"
echo.
echo Django server started in a new window.
echo.
echo Please complete the steps above to create an organizer account.
echo.
echo When done, close the Django server window and press any key here...
pause >nul

cd ..

:COMPLETE
cls
echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo Your SPDATA system is now ready to use!
echo.
echo ========================================
echo WHAT YOU HAVE NOW:
echo ========================================
echo.
echo [1] MySQL Database: spdata_db
echo     - View at: http://localhost/phpmyadmin
echo.
echo [2] Admin Account (Superuser)
echo     - Access at: http://localhost:8000/admin
echo     - Use to manage users and bookings
echo.
echo [3] Organizer Account
echo     - Login at: http://localhost:3000/signin
echo     - Select "Organizer" tab
echo     - Use to approve/decline bookings
echo.
echo ========================================
echo HOW TO START THE APPLICATION:
echo ========================================
echo.
echo Option 1 - Automatic (Recommended):
echo     Double-click: start.bat
echo.
echo Option 2 - Manual:
echo     Terminal 1: cd backend ^&^& python manage.py runserver
echo     Terminal 2: cd frontend ^&^& npm run dev
echo.
echo ========================================
echo URLS:
echo ========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo Admin:     http://localhost:8000/admin
echo phpMyAdmin: http://localhost/phpmyadmin
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Start the application (use start.bat)
echo 2. Go to http://localhost:3000
echo 3. Click "Register" to create a client account
echo 4. Login and create a test booking
echo 5. Login as organizer to approve the booking
echo 6. View data in admin panel or phpMyAdmin
echo.
echo ========================================
echo HELPFUL FILES:
echo ========================================
echo.
echo - SETUP_GUIDE.md - Detailed setup instructions
echo - QUICK_REFERENCE.md - Common tasks and commands
echo - FIXES_APPLIED.md - What was fixed in your code
echo.
echo ========================================
echo.
echo Press any key to exit...
pause >nul
