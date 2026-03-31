# SPDATA Quick Reference Guide

## Quick Start (After Initial Setup)

### Start Everything
```bash
# From project root
start.bat
```

### Or Start Manually

**Terminal 1 - Backend:**
```bash
cd d:\RV\SPDATA\backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd d:\RV\SPDATA\frontend
npm run dev
```

## First Time Setup

### 1. Create Database in MySQL
```bash
# Open XAMPP Control Panel
# Start MySQL
# Click Admin button
# Go to SQL tab
# Run the SQL from create_database.sql
```

### 2. Initialize Backend
```bash
cd d:\RV\SPDATA\backend
pip install -r requirements.txt
init_database.bat
```

### 3. Create Organizer Account
1. Go to http://localhost:8000/admin
2. Login with superuser
3. Users > Add User
4. Fill form and check "Is organizer"
5. Save

### 4. Install Frontend Dependencies
```bash
cd d:\RV\SPDATA\frontend
npm install
```

## Common Tasks

### View All Bookings in Database
**Option 1 - Django Admin:**
- http://localhost:8000/admin
- Login > Bookings

**Option 2 - phpMyAdmin:**
- Open XAMPP > MySQL Admin
- Select spdata_db
- Click user_booking table
- Click Browse

### Create Test Client Account
1. Go to http://localhost:3000/register
2. Fill in form
3. Submit
4. You'll be auto-logged in

### Create Test Booking
1. Login as client
2. Go to http://localhost:3000/client/dashboard
3. Fill form:
   - Event type: Wedding
   - Description: "Test wedding event"
   - Capacity: 50
   - Emails: test1@test.com, test2@test.com, ... (10 emails)
   - Date: Select future date
4. Click "Request Booking"

### Approve Booking (as Organizer)
1. Login as organizer at http://localhost:3000/signin
2. View pending bookings
3. Click on booking
4. Approve or decline

### Reset Database
```bash
cd d:\RV\SPDATA\backend
init_database.bat
```

## Troubleshooting

### "Connection Error" when booking
✓ Check Django is running on port 8000
✓ Check browser console (F12) for errors
✓ Verify you're logged in (check localStorage)

### Can't login
✓ Check credentials are correct
✓ For organizer: verify "Is organizer" is checked in admin
✓ Check Django console for errors

### Database errors
✓ XAMPP MySQL is running
✓ Database spdata_db exists
✓ Run: python manage.py migrate

### Frontend won't start
✓ Run: npm install
✓ Check port 3000 is not in use
✓ Delete .next folder and restart

## URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/user/
- **Django Admin:** http://localhost:8000/admin
- **phpMyAdmin:** http://localhost/phpmyadmin

## Default Credentials

### MySQL (XAMPP)
- Username: root
- Password: (empty)
- Database: spdata_db

### Django Superuser
- Created during setup
- Use for admin panel access

### Test Organizer
- Create manually in admin panel
- Email: organizer@test.com
- Password: (your choice)
- Must check "Is organizer" checkbox

## File Locations

### Backend
- Settings: `backend/backend/settings.py`
- Models: `backend/user/models.py`
- Views: `backend/user/views.py`
- URLs: `backend/user/urls.py`

### Frontend
- Client Dashboard: `frontend/app/client/dashboard/page.tsx`
- Login: `frontend/app/signin/page.tsx`
- Register: `frontend/app/register/page.tsx`

## Database Tables

- **user_user** - All users (clients and organizers)
- **user_booking** - All bookings
- **auth_group** - User groups
- **auth_permission** - Permissions

## API Endpoints

### Public
- POST `/api/user/register/` - Register client
- POST `/api/user/login/` - Login

### Authenticated
- GET `/api/user/client/check-availability/?date=YYYY-MM-DD`
- POST `/api/user/bookings/create/`
- GET `/api/user/bookings/my/`
- GET `/api/user/bookings/` (organizer only)
- POST `/api/user/bookings/<id>/status/` (organizer only)

## Tips

1. **Always start XAMPP MySQL first** before running Django
2. **Use Django admin** to quickly view/edit data
3. **Check browser console** (F12) for frontend errors
4. **Check terminal** for backend errors
5. **Use phpMyAdmin** to directly query database
6. **Backup database** before major changes

## Support Commands

### Check if MySQL is running
```bash
tasklist | find "mysqld"
```

### Check Django migrations
```bash
python manage.py showmigrations
```

### Create new migration
```bash
python manage.py makemigrations
python manage.py migrate
```

### Create superuser
```bash
python manage.py createsuperuser
```

### Clear all data (keep structure)
```bash
python manage.py flush
```
