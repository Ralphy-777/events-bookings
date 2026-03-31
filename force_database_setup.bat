@echo off
echo ========================================
echo  FORCE DATABASE SETUP
echo ========================================
echo.

cd backend

echo Step 1: Deleting old migrations...
del /Q user\migrations\0006_eventpricing.py 2>nul

echo.
echo Step 2: Creating fresh migrations...
python manage.py makemigrations user

echo.
echo Step 3: Applying ALL migrations...
python manage.py migrate --run-syncdb

echo.
echo Step 4: Verifying tables exist...
python manage.py dbshell < ..\check_tables.sql

echo.
echo Step 5: Adding Event Pricing data...
python manage.py shell -c "from user.models import EventPricing; EventPricing.objects.all().delete(); EventPricing.objects.create(event_type='Wedding', price=5000, max_capacity=50); EventPricing.objects.create(event_type='Birthday', price=5000, max_capacity=50); EventPricing.objects.create(event_type='Christening', price=5000, max_capacity=50); EventPricing.objects.create(event_type='Conference', price=7000, max_capacity=100); EventPricing.objects.create(event_type='Corporate Event', price=7000, max_capacity=100); print('Event Pricing Added!'); [print(f'{p.event_type}: P{p.price}') for p in EventPricing.objects.all()]"

echo.
echo Step 6: Testing - Create a test booking to verify payment saves...
python manage.py shell -c "from user.models import User, Booking, Payment; import uuid; from datetime import date, time; user = User.objects.filter(is_organizer=False).first(); if user: booking = Booking.objects.create(user=user, event_type='Wedding', description='Test', capacity=50, date=date.today(), time=time(10, 0), payment_method='Cash', payment_status='paid', total_amount=5000); ref = f'PAY-{uuid.uuid4().hex[:12].upper()}'; payment = Payment.objects.create(booking=booking, event_id=booking.id, event_name='Wedding', client_name=f'{user.first_name} {user.last_name}', payment_method='Cash', reference_number=ref, amount=5000); print(f'TEST BOOKING CREATED: ID {booking.id}'); print(f'TEST PAYMENT CREATED: {ref}'); print('Payment saved successfully!'); else: print('No client user found. Create a client account first.')"

cd ..

echo.
echo ========================================
echo  COMPLETE!
echo ========================================
echo.
echo Now check your database:
echo  1. phpMyAdmin: http://localhost/phpmyadmin
echo  2. Database: eventpro
echo  3. Tables: user_payment, user_eventpricing
echo.
echo Create a real booking now to test!
echo.
pause
