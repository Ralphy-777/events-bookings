@echo off
echo ========================================
echo   SETUP EVENT TYPES
echo ========================================
echo.
echo This will create default event types in your database.
echo You can manage them later in Django Admin.
echo.
pause

cd backend
python setup_event_types.py

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Event types are now available in:
echo - Django Admin: http://localhost:8000/admin
echo - Look for "Event Types" section
echo.
echo You can now:
echo 1. Add new event types
echo 2. Edit prices and capacities
echo 3. Activate/deactivate event types
echo.
pause
