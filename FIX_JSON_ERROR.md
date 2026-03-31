# Fix for "Unexpected token '<', '<!DOCTYPE'... is not valid JSON" Error

## What This Error Means
This error occurs when the frontend expects JSON from the backend API, but receives HTML instead (usually an error page).

## Quick Fix Steps

### Step 1: Make Sure Django Backend is Running
```bash
# Open Command Prompt in backend folder
cd backend
python manage.py runserver
```

**Check:** You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Update Database with New Payment Fields
```bash
# Run this from the main SPDATA folder
update_database.bat
```

This will:
- Add `payment_status` field to Booking model
- Add `total_amount` field to Booking model
- Apply migrations to MySQL database

### Step 3: Verify MySQL is Running
1. Open XAMPP Control Panel
2. Make sure MySQL is started (green)
3. Click "Admin" to open phpMyAdmin
4. Check that database exists (should be `eventpro` or `spdata_db`)

### Step 4: Test the Backend API
```bash
# Run this to test if backend is working
test_backend.bat
```

If you see JSON data, backend is working!
If you see HTML or errors, continue to Step 5.

### Step 5: Check Database Connection
The error might be because Django can't connect to MySQL.

**Check settings.py:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'eventpro',  # or 'spdata_db'
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

**Make sure the database exists:**
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Check if `eventpro` database exists
3. If not, create it:
   ```sql
   CREATE DATABASE eventpro;
   ```

### Step 6: Run Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Step 7: Restart Everything
```bash
# Stop all servers (Ctrl+C in each terminal)
# Then run:
start.bat
```

## Common Causes

### 1. Backend Not Running
**Symptom:** Frontend can't connect to http://localhost:8000
**Fix:** Run `python manage.py runserver` in backend folder

### 2. Database Not Migrated
**Symptom:** Backend returns 500 error
**Fix:** Run `update_database.bat`

### 3. MySQL Not Running
**Symptom:** Backend can't connect to database
**Fix:** Start MySQL in XAMPP

### 4. Wrong Database Name
**Symptom:** Backend can't find database
**Fix:** Check settings.py and create database in phpMyAdmin

### 5. Missing Payment Fields
**Symptom:** Error when creating booking
**Fix:** Run `update_database.bat` to add new fields

## Verify Everything is Working

### Test 1: Backend API
Open browser: http://localhost:8000/api/user/events/public/
**Expected:** JSON array (even if empty: `[]`)
**If you see HTML:** Backend has an error

### Test 2: Frontend
Open browser: http://localhost:3000
**Expected:** Homepage loads
**If error:** Check console (F12)

### Test 3: Create Booking
1. Login as client
2. Create a booking
3. Should redirect to payment page
4. **If JSON error:** Backend is not returning correct response

## Still Having Issues?

### Check Django Console
Look at the terminal where Django is running. You should see:
```
[timestamp] "POST /api/user/bookings/create/ HTTP/1.1" 201 ...
```

If you see 500 or 404, there's an error.

### Check Browser Console
Press F12 in browser, go to Console tab.
Look for red errors. Common ones:
- `Failed to fetch` - Backend not running
- `Unexpected token '<'` - Backend returning HTML instead of JSON
- `401 Unauthorized` - Token expired, login again

### Check Network Tab
Press F12, go to Network tab, try creating a booking.
Click on the request to see:
- **Request URL:** Should be http://localhost:8000/api/user/bookings/create/
- **Status:** Should be 201 (Created)
- **Response:** Should be JSON like `{"booking_id": 1, "total_amount": 10000}`

If Response shows HTML, backend has an error.

## Manual Test

### Test Backend Directly
```bash
# In Command Prompt
curl -X POST http://localhost:8000/api/user/bookings/create/ ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"event_type\":\"Wedding\",\"capacity\":50,\"date\":\"2024-12-25\",\"time\":\"14:00\",\"description\":\"Test\"}"
```

Replace `YOUR_TOKEN_HERE` with actual token from localStorage.

**Expected Response:**
```json
{
  "message": "Booking created successfully",
  "booking_id": 1,
  "total_amount": 10000.00
}
```

## Summary

The error happens when:
1. Backend is not running → Start Django server
2. Database not migrated → Run update_database.bat
3. MySQL not running → Start in XAMPP
4. Backend has an error → Check Django console

**Most Common Fix:**
```bash
# 1. Update database
update_database.bat

# 2. Restart servers
start.bat
```

Then try creating a booking again!
