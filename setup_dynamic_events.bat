@echo off
echo ========================================
echo   SETUP DYNAMIC EVENT TYPES
echo ========================================
echo.
echo This will create the Event Types table and add default events.
echo.
pause

cd backend

echo.
echo [1/2] Creating database table...
python manage.py migrate

echo.
echo [2/2] Adding default event types...
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings'); django.setup(); from user.models import EventType; events = [{'event_type': 'Wedding', 'price': 5000, 'max_capacity': 50, 'people_per_table': 5, 'description': 'Perfect for wedding celebrations', 'is_active': True}, {'event_type': 'Birthday', 'price': 5000, 'max_capacity': 50, 'people_per_table': 5, 'description': 'Celebrate your special day', 'is_active': True}, {'event_type': 'Christening', 'price': 5000, 'max_capacity': 50, 'people_per_table': 5, 'description': 'Baptism and christening events', 'is_active': True}, {'event_type': 'Conference', 'price': 7000, 'max_capacity': 100, 'people_per_table': 10, 'description': 'Professional conference setup', 'is_active': True}, {'event_type': 'Corporate Event', 'price': 7000, 'max_capacity': 100, 'people_per_table': 10, 'description': 'Corporate meetings and events', 'is_active': True}]; result = [EventType.objects.get_or_create(event_type=e['event_type'], defaults=e) for e in events]; print('[+] Wedding'); print('[+] Birthday'); print('[+] Christening'); print('[+] Conference'); print('[+] Corporate Event')"

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Event Types are now in your database!
echo.
echo Manage them at: http://localhost:8000/admin
echo - Add new event types
echo - Edit prices and capacity
echo - Activate/deactivate events
echo.
echo No coding required!
echo.
pause
