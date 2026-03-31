@echo off
echo ========================================
echo  COMPLETE DATABASE SETUP
echo ========================================
echo.

cd backend

echo [1/4] Checking database connection...
python manage.py check --database default
if errorlevel 1 (
    echo ERROR: Cannot connect to database!
    echo Make sure XAMPP MySQL is running.
    pause
    exit /b 1
)

echo.
echo [2/4] Creating all database tables...
python manage.py makemigrations
python manage.py migrate

echo.
echo [3/4] Adding Event Pricing data...
python manage.py shell << EOF
from user.models import EventPricing
EventPricing.objects.all().delete()
EventPricing.objects.create(event_type='Wedding', price=5000, max_capacity=50)
EventPricing.objects.create(event_type='Birthday', price=5000, max_capacity=50)
EventPricing.objects.create(event_type='Christening', price=5000, max_capacity=50)
EventPricing.objects.create(event_type='Conference', price=7000, max_capacity=100)
EventPricing.objects.create(event_type='Corporate Event', price=7000, max_capacity=100)
print('\n=== Event Pricing Added ===')
for p in EventPricing.objects.all():
    print(f'{p.event_type}: P{p.price} ({p.max_capacity} guests)')
EOF

echo.
echo [4/4] Verifying database tables...
python manage.py shell << EOF
from django.db import connection
cursor = connection.cursor()
cursor.execute("SHOW TABLES")
tables = cursor.fetchall()
print('\n=== Database Tables ===')
for table in tables:
    print(f'- {table[0]}')
    if 'eventpricing' in table[0].lower():
        cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
        count = cursor.fetchone()[0]
        print(f'  Records: {count}')
    if 'payment' in table[0].lower():
        cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
        count = cursor.fetchone()[0]
        print(f'  Records: {count}')
EOF

cd ..

echo.
echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo Database Tables Created:
echo  - user_eventpricing (5 event types)
echo  - user_payment (for payment records)
echo  - user_booking (for bookings)
echo  - user_user (for users)
echo.
echo Next Steps:
echo  1. Create a booking to test
echo  2. Check phpMyAdmin: http://localhost/phpmyadmin
echo  3. Select 'eventpro' database
echo  4. View tables: user_eventpricing, user_payment
echo.
echo To edit prices:
echo  - Go to: http://localhost:8000/admin
echo  - Click "Event pricings"
echo.
pause
