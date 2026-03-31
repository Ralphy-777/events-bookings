@echo off
echo Removing Concert event type from database...
cd /d "%~dp0backend"
python manage.py shell -c "from user.models import EventType; deleted, _ = EventType.objects.filter(event_type__icontains='concert').delete(); print(f'Deleted {deleted} Concert event type(s).')"
echo Done.
pause
