@echo off
echo ========================================
echo  Checking Payment Records
echo ========================================
echo.

cd backend

python manage.py shell << EOF
from user.models import Payment, Booking
print('\n=== PAYMENT RECORDS ===')
payments = Payment.objects.all()
if payments.exists():
    for p in payments:
        print(f'\nReference: {p.reference_number}')
        print(f'Client: {p.client_name}')
        print(f'Event: {p.event_name}')
        print(f'Method: {p.payment_method}')
        print(f'Amount: P{p.amount}')
        print(f'Date: {p.created_at.strftime("%Y-%m-%d %H:%M")}')
        print('-' * 40)
    print(f'\nTotal Payments: {payments.count()}')
else:
    print('No payment records yet.')
    print('\nPayments are created automatically when:')
    print('1. A client creates a booking')
    print('2. Payment info is saved immediately')
    print('3. Check after creating a booking!')

print('\n=== BOOKING RECORDS ===')
bookings = Booking.objects.all()
print(f'Total Bookings: {bookings.count()}')
for b in bookings:
    print(f'- {b.event_type} on {b.date} ({b.status})')
EOF

cd ..

echo.
echo ========================================
echo  How Payment Works:
echo ========================================
echo.
echo 1. Client creates booking
echo 2. Payment record saved AUTOMATICALLY
echo 3. Payment appears in database immediately
echo 4. Organizer confirms booking (status only)
echo 5. Payment already in database!
echo.
echo To view payments:
echo  - phpMyAdmin: http://localhost/phpmyadmin
echo  - Database: eventpro
echo  - Table: user_payment
echo.
echo  - Django Admin: http://localhost:8000/admin
echo  - Click: Payments
echo.
pause
