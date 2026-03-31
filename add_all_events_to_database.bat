@echo off
echo ========================================
echo  Adding Event Pricing to Database
echo ========================================
echo.

cd backend

echo Step 1: Creating database table...
python manage.py migrate

echo.
echo Step 2: Adding all 5 event types...
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings'); django.setup(); from user.models import EventPricing; EventPricing.objects.get_or_create(event_type='Wedding', defaults={'price': 5000, 'max_capacity': 50}); EventPricing.objects.get_or_create(event_type='Birthday', defaults={'price': 5000, 'max_capacity': 50}); EventPricing.objects.get_or_create(event_type='Christening', defaults={'price': 5000, 'max_capacity': 50}); EventPricing.objects.get_or_create(event_type='Conference', defaults={'price': 7000, 'max_capacity': 100}); EventPricing.objects.get_or_create(event_type='Corporate Event', defaults={'price': 7000, 'max_capacity': 100}); print('\n=== SUCCESS! All 5 events added ===\n'); [print(f'{p.event_type}: P{p.price} ({p.max_capacity} guests)') for p in EventPricing.objects.all().order_by('event_type')]"

cd ..

echo.
echo ========================================
echo  COMPLETE!
echo ========================================
echo.
echo All 5 event types are now in database:
echo  1. Wedding - P5,000 (50 guests)
echo  2. Birthday - P5,000 (50 guests)
echo  3. Christening - P5,000 (50 guests)
echo  4. Conference - P7,000 (100 guests)
echo  5. Corporate Event - P7,000 (100 guests)
echo.
echo To edit prices:
echo  1. Go to: http://localhost:8000/admin
echo  2. Click "Event pricings"
echo  3. Edit any price or capacity
echo  4. Click Save
echo.
echo To verify in phpMyAdmin:
echo  1. Go to: http://localhost/phpmyadmin
echo  2. Select "eventpro" database
echo  3. Click "user_eventpricing" table
echo  4. You'll see all 5 events!
echo.
pause
