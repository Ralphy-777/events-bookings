# QUICK FIX: "Unexpected token '<'" Error

## The Problem
Backend is returning HTML error page instead of JSON because the database doesn't have the new payment fields (`payment_status` and `total_amount`).

## The Solution (3 Steps)

### Step 1: Update Database
```bash
update_database.bat
```

This adds the missing payment fields to your database.

### Step 2: Restart Servers
```bash
start.bat
```

This restarts both Django and Next.js servers.

### Step 3: Test
1. Go to http://localhost:3000
2. Login as client
3. Create a booking
4. Should redirect to payment page ✅

## If Still Not Working

### Check 1: Is Django Running?
Open http://localhost:8000/api/user/events/public/
- **See JSON `[]`?** ✅ Backend working
- **See HTML error?** ❌ Backend has error

### Check 2: Is MySQL Running?
1. Open XAMPP
2. MySQL should be green/started
3. If not, click "Start"

### Check 3: Does Database Exist?
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Look for `eventpro` database
3. If missing, create it:
   ```sql
   CREATE DATABASE eventpro;
   ```

### Check 4: Run Migrations Manually
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Still Having Issues?

Read the detailed guide: `FIX_JSON_ERROR.md`

## What Changed?

We added 3 new features:
1. **Payment system** - Needs `payment_status` and `total_amount` fields
2. **Booking reschedule** - Allows changing date/time for pending bookings
3. **Complete confirmation page** - Fixed truncated file

All require database update!

## Summary

**Most Common Fix:**
```bash
update_database.bat
start.bat
```

That's it! 🎉
