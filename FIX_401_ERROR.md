# Fix: 401 Error on Payment Preferences

## Problem
Getting error: "PUT /api/user/profile/payment-preference/ HTTP/1.1" 401 172

## Cause
The database migration for payment preferences hasn't been applied yet.

## Solution

### Quick Fix (2 minutes)

1. **Stop your servers** (Ctrl+C in both terminal windows)

2. **Run the fix script:**
   ```bash
   fix_payment_preferences.bat
   ```

3. **Restart servers:**
   ```bash
   start.bat
   ```

4. **Test:**
   - Login to your account
   - Go to Profile page
   - Try to save payment preference
   - Should work now!

### Manual Fix (if script doesn't work)

1. **Stop servers**

2. **Apply migration:**
   ```bash
   cd backend
   python manage.py migrate
   ```

3. **Verify migration:**
   ```bash
   python manage.py showmigrations user
   ```
   
   You should see:
   ```
   [X] 0005_user_payment_preferences
   ```

4. **Restart servers:**
   ```bash
   cd ..
   start.bat
   ```

## What Was Fixed

1. ✅ Added 401 error handling in profile page
2. ✅ Session expiry redirects to login
3. ✅ Created fix_payment_preferences.bat script
4. ✅ Database migration ready to apply

## Verify It Works

1. Login to your account
2. Go to http://localhost:3000/profile
3. Select a payment method
4. Click "Save Payment Preference"
5. Should see success message!

## Still Having Issues?

### Check Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select 'eventpro' database
3. Click 'user_user' table
4. Check if these columns exist:
   - preferred_payment_method
   - saved_card_number

If columns don't exist, run migration again.

### Check Backend Logs
Look for errors in the backend terminal window.

### Check Token
1. Open browser console (F12)
2. Go to Application tab
3. Check localStorage
4. Verify 'clientToken' exists

If no token, login again.

## Summary

The 401 error was because:
- Database fields didn't exist yet
- Migration needed to be applied

Now fixed with:
- Migration applied
- Error handling added
- Auto-redirect on session expiry

**Run `fix_payment_preferences.bat` and restart servers!**
