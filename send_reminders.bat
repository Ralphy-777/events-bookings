@echo off
cd /d "%~dp0backend"
python manage.py migrate
python manage.py send_event_reminders
