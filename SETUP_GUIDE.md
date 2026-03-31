# SPDATA Event Management System - Setup Guide

## Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- XAMPP with MySQL/MariaDB running
- Git (optional)

## Backend Setup (Django)

### Step 1: Start XAMPP MySQL
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Click **Admin** button next to MySQL to open phpMyAdmin

### Step 2: Create Database
1. In phpMyAdmin, click on **SQL** tab
2. Copy and paste the contents of `backend/create_database.sql`
3. Click **Go** to execute
4. You should see "Database spdata_db created successfully!"

### Step 3: Install Python Dependencies
Open Command Prompt in the `backend` folder and run:
```bash
cd d:\RV\SPDATA\backend
pip install -r requirements.txt
```

**Note:** If `mysqlclient` installation fails on Windows, try:
```bash
pip install wheel
pip install mysqlclient
```

If it still fails, download the wheel file from:
https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient

### Step 4: Run Setup Script
```bash
setup.bat
```

This will:
- Create database migrations
- Apply migrations to MySQL
- Prompt you to create a superuser (admin account)

**Important:** When creating superuser, remember the email and password!

### Step 5: Start Django Server
```bash
python manage.py runserver
```

The backend will be available at: http://localhost:8000

### Step 6: Create Organizer Account
1. Go to http://localhost:8000/admin
2. Login with your superuser credentials
3. Click on **Users**
4. Click **Add User** button
5. Fill in the form:
   - Email: organizer@example.com
   - Username: organizer@example.com
   - Password: (choose a password)
6. Click **Save and continue editing**
7. Scroll down and check the **Is organizer** checkbox
8. Click **Save**

Now you have an organizer account!

## Frontend Setup (Next.js)

### Step 1: Install Dependencies
Open a new Command Prompt in the `frontend` folder:
```bash
cd d:\RV\SPDATA\frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

## Testing the Application

### Test Client Login & Booking
1. Go to http://localhost:3000
2. Click **Sign In** or go to http://localhost:3000/signin
3. Select **Client** tab
4. Click **Register as Client**
5. Fill in registration form
6. After registration, you'll be logged in
7. Go to **Client Dashboard** at http://localhost:3000/client/dashboard
8. Fill in the booking form:
   - Select event type (Wedding, Birthday, etc.)
   - Add description
   - Set capacity (max 50 for Wedding/Birthday, 100 for others)
   - Add at least 10 comma-separated emails
   - Select a date
9. Click **Request Booking**
10. You should see "Booking request submitted successfully!"

### Test Organizer Login
1. Go to http://localhost:3000/signin
2. Select **Organizer** tab
3. Login with the organizer account you created
4. You'll be redirected to the organizer dashboard
5. You should see pending bookings that need approval

### View Data in Django Admin
1. Go to http://localhost:8000/admin
2. Login with superuser credentials
3. Click on **Bookings** to see all bookings
4. Click on **Users** to see all registered users
5. You can edit, approve, or delete bookings from here

### View Data in phpMyAdmin
1. Open XAMPP Control Panel
2. Click **Admin** next to MySQL
3. Click on **spdata_db** database on the left
4. You'll see tables:
   - `user_user` - All users (clients and organizers)
   - `user_booking` - All bookings
5. Click on any table and then **Browse** to see the data

## Troubleshooting

### Connection Error when Booking
**Problem:** "Connection error" when submitting booking

**Solution:**
1. Make sure Django server is running on http://localhost:8000
2. Check browser console (F12) for detailed error
3. Verify token is stored in localStorage
4. Make sure you're logged in as a client (not organizer)

### Login Not Working
**Problem:** "Invalid credentials" error

**Solution:**
1. Make sure Django server is running
2. Verify email and password are correct
3. For organizers, make sure `is_organizer` is checked in admin panel
4. Check Django console for error messages

### Database Connection Error
**Problem:** Django can't connect to MySQL

**Solution:**
1. Make sure XAMPP MySQL is running
2. Verify database name is `spdata_db`
3. Check MySQL username is `root` with empty password
4. If you changed MySQL password, update `backend/backend/settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'spdata_db',
           'USER': 'root',
           'PASSWORD': 'your_password_here',  # Add your password
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }
   ```

### mysqlclient Installation Failed
**Problem:** Can't install mysqlclient on Windows

**Solution:**
1. Download the appropriate wheel file from:
   https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
2. Choose based on your Python version (e.g., cp311 for Python 3.11)
3. Install with: `pip install mysqlclient-2.2.1-cp311-cp311-win_amd64.whl`

## API Endpoints

### Authentication
- POST `/api/user/register/` - Register new client
- POST `/api/user/login/` - Login (client or organizer)

### Bookings
- GET `/api/user/client/check-availability/?date=YYYY-MM-DD` - Check availability
- POST `/api/user/bookings/create/` - Create booking (client only)
- GET `/api/user/bookings/my/` - Get my bookings (authenticated)
- GET `/api/user/bookings/` - Get all bookings (organizer only)
- POST `/api/user/bookings/<id>/status/` - Update booking status (organizer only)

### Events
- GET `/api/user/events/public/` - Get public confirmed events

## Project Structure

```
SPDATA/
├── backend/
│   ├── backend/
│   │   ├── settings.py      # Django settings (database config)
│   │   └── urls.py          # Main URL routing
│   ├── user/
│   │   ├── models.py        # User and Booking models
│   │   ├── views.py         # API endpoints
│   │   ├── urls.py          # User app URLs
│   │   └── admin.py         # Admin panel config
│   ├── manage.py
│   ├── requirements.txt     # Python dependencies
│   ├── setup.bat           # Setup script
│   └── create_database.sql # Database creation script
└── frontend/
    ├── app/
    │   ├── client/
    │   │   └── dashboard/
    │   │       └── page.tsx  # Client booking page
    │   ├── client-login/
    │   │   └── page.tsx      # Client login
    │   ├── signin/
    │   │   └── page.tsx      # Unified login
    │   └── register/
    │       └── page.tsx      # Client registration
    ├── package.json
    └── next.config.ts
```

## Features

### Client Features
- Register and login
- Check venue availability by date
- Create booking requests with:
  - Event type (Wedding, Birthday, Conference, Corporate Event, Concert)
  - Description
  - Guest capacity (max 50 for Wedding/Birthday, 100 for others)
  - Date selection
  - Email invitations (minimum 10 required)
- View booking status
- Generate QR codes for concert tickets

### Organizer Features
- Login with organizer account
- View all pending bookings
- Approve or decline bookings
- View all confirmed events

### Admin Features
- Full CRUD operations on users and bookings
- Create organizer accounts
- View all data in Django admin panel
- Direct database access via phpMyAdmin

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all services are running (XAMPP MySQL, Django, Next.js)
3. Check console logs for detailed error messages
4. Make sure all dependencies are installed correctly
