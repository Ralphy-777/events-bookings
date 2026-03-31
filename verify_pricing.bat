@echo off
echo ========================================
echo  Verifying Event Pricing in Database
echo ========================================
echo.

cd backend

echo Checking database...
python manage.py shell -c "from user.models import EventPricing; print('\nEvent Pricing Records:'); [print(f'{p.event_type}: P{p.price} ({p.max_capacity} guests)') for p in EventPricing.objects.all()]; print(f'\nTotal: {EventPricing.objects.count()} event types')"

cd ..

echo.
pause
