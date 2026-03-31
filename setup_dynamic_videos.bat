@echo off
echo ========================================
echo   SETUP DYNAMIC VIDEOS
echo ========================================
echo.
echo This will create the Videos table in database.
echo Admins can then add/edit videos through Django Admin.
echo.
pause

cd backend

echo.
echo [1/2] Creating database migration...
python manage.py makemigrations

echo.
echo [2/2] Applying migration to database...
python manage.py migrate

echo.
echo ========================================
echo   VIDEOS TABLE CREATED!
echo ========================================
echo.
echo Now you can manage videos at:
echo http://localhost:8000/admin
echo.
echo Go to: Django Admin -^> Videos
echo.
echo Features:
echo - Add YouTube video URLs
echo - Set display order
echo - Categorize videos (Wedding, Birthday, etc.)
echo - Activate/Deactivate videos
echo - No coding required!
echo.
pause
