# FIX: "makemigrations is not a valid port number" Error

## The Problem
Django server is running, so it can't run migrations.

## The Solution (3 Steps)

### Step 1: STOP Django Server
- Close all Command Prompt windows
- Or press `Ctrl+C` in the Django server window
- Make sure NO Django server is running

### Step 2: Run Migration
**Option A - Use the new script:**
```bash
migrate.bat
```

**Option B - Manual commands:**
```bash
cd backend
python manage.py makemigrations user
python manage.py migrate
cd ..
```

### Step 3: Start Servers
```bash
start.bat
```

## That's It!

Now test creating a booking.

## Why This Happens
- Django locks the database when running
- Can't modify database structure while server is running
- Must stop server → migrate → restart server

## Quick Check
If you see this error, it means Django is running:
```
"makemigrations" is not a valid port number
```

Solution: **Stop Django first!**

## Files to Use
1. `migrate.bat` - New simple migration script
2. `start.bat` - Start servers after migration
3. `MANUAL_MIGRATION.md` - Detailed manual steps

Choose whichever works for you!
