# SPDATA Event Management System

## 🎉 What Was Fixed

Your event management system now has:

✅ **MySQL Database Integration** - All data saves to XAMPP MySQL database  
✅ **Working Login System** - Both client and organizer login work correctly  
✅ **Booking Creation** - Clients can create bookings that save to database  
✅ **Payment Integration** - Automatic pricing with multiple payment methods  
✅ **Payment Preferences** - 🆕 Save payment method like Google Play Store!  
✅ **Booking Modification** - Reschedule pending bookings (date/time)  
✅ **Availability Check** - Real-time room availability checking  
✅ **Error Handling** - Proper error messages and connection handling  
✅ **Data Persistence** - All bookings visible in Django admin and phpMyAdmin  

## 🚀 Quick Start

### First Time Setup (5 minutes)

1. **Run the installer:**
   ```bash
   INSTALL.bat
   ```
   Follow the on-screen instructions.

2. **Start the application:**
   ```bash
   start.bat
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:8000/admin

### Already Set Up?

Just run:
```bash
start.bat
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `INSTALL.bat` | **START HERE** - Interactive setup wizard |
| `start.bat` | Start both backend and frontend servers |
| `setup_payment_preferences.bat` | 🆕 Add payment preferences feature |
| `check_system.bat` | Verify your system is ready |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `QUICK_REFERENCE.md` | Common tasks and troubleshooting |
| `PAYMENT_PREFERENCES_GUIDE.md` | 🆕 Payment preferences feature guide |
| `FIXES_APPLIED.md` | Technical details of what was fixed |

## 🎯 How to Use

### Create a Client Account
1. Go to http://localhost:3000/register
2. Fill in your details
3. Click "Register"
4. You'll be automatically logged in

### Create a Booking
1. Login as client
2. Go to "Client Dashboard"
3. Fill in the booking form:
   - Select event type (Wedding, Birthday, etc.)
   - Add description
   - Set number of guests
   - Add at least 10 email addresses (comma-separated)
   - Select date
4. Click "Request Booking"
5. ✅ Redirected to payment page!
6. Select payment method and complete payment
7. View booking in "My Bookings"

### Reschedule a Booking
1. Go to "My Bookings"
2. Find a PENDING booking
3. Click "Reschedule" button
4. Change date and/or time
5. Click "Save"
6. ✅ Booking updated!

**Note:** You can only reschedule PENDING bookings. Once confirmed by organizer, bookings cannot be modified or cancelled.

### Approve Bookings (Organizer)
1. Login at http://localhost:3000/signin
2. Select "Organizer" tab
3. Use organizer credentials
4. View and approve/decline bookings

### View Data in Database

**Option 1 - Django Admin:**
- Go to http://localhost:8000/admin
- Login with superuser account
- Click "Bookings" to see all bookings
- Click "Users" to see all users

**Option 2 - phpMyAdmin:**
- Go to http://localhost/phpmyadmin
- Click "spdata_db" database
- Click "user_booking" table
- Click "Browse" to see all bookings

## 🔧 Troubleshooting

### "Connection Error" when creating booking

**Fix:**
1. Make sure Django server is running (port 8000)
2. Check browser console (F12) for errors
3. Verify you're logged in as a client

### Can't login

**Fix:**
1. Verify credentials are correct
2. For organizers: Check "Is organizer" is enabled in admin panel
3. Make sure Django server is running

### Database errors

**Fix:**
1. Start XAMPP MySQL
2. Verify database "spdata_db" exists
3. Run: `cd backend && python manage.py migrate`

## 📊 Database Structure

Your data is stored in MySQL database `spdata_db`:

**Tables:**
- `user_user` - All users (clients and organizers)
- `user_booking` - All bookings with status

**View data:**
- Django Admin: http://localhost:8000/admin
- phpMyAdmin: http://localhost/phpmyadmin

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/user/ |
| Django Admin | http://localhost:8000/admin |
| phpMyAdmin | http://localhost/phpmyadmin |

## 📝 Default Credentials

### MySQL (XAMPP)
- Username: `root`
- Password: *(empty)*
- Database: `spdata_db`

### Django Superuser
- Created during setup
- Use for admin panel access

### Organizer Account
- Create in admin panel
- Must check "Is organizer" checkbox

## 🛠️ Tech Stack

**Backend:**
- Django 5.0.1
- Django REST Framework
- JWT Authentication
- MySQL Database

**Frontend:**
- Next.js 14
- React
- TypeScript
- Tailwind CSS

## 📚 Documentation

- **SETUP_GUIDE.md** - Complete setup instructions with troubleshooting
- **QUICK_REFERENCE.md** - Quick commands and common tasks
- **FIXES_APPLIED.md** - Technical details of fixes
- **NEW_FEATURES_GUIDE.md** - 🆕 Payment & Reschedule features guide
- **PAYMENT_PREFERENCES_GUIDE.md** - 🆕 Save payment methods guide
- **PAYMENT_PREFERENCES_IMPLEMENTATION.md** - Technical implementation details

## 🎓 Features

### Client Features
- ✅ Register and login
- ✅ Check venue availability by date
- ✅ Create booking requests
- ✅ **Pay for bookings** with multiple payment methods
- ✅ **🆕 Save payment preferences** (Cash/GCash/Card)
- ✅ **Auto-select saved payment method** on bookings
- ✅ **Reschedule pending bookings** (date/time)
- ✅ View booking status and payment status
- ✅ Email invitations
- ✅ QR code generation for concerts
- ❌ Cannot modify confirmed bookings (protected)

### Organizer Features
- ✅ Login with organizer account
- ✅ View pending bookings
- ✅ Approve/decline bookings
- ✅ View all events
- ✅ See payment status for bookings

### Admin Features
- ✅ Full user management
- ✅ Full booking management
- ✅ Create organizer accounts
- ✅ View all data

## 🔐 Security

- Passwords are hashed (never stored in plain text)
- JWT token authentication
- CORS enabled for local development
- User permissions (client vs organizer)

## 📞 Need Help?

1. Check `QUICK_REFERENCE.md` for common tasks
2. Check `SETUP_GUIDE.md` for detailed instructions
3. Run `check_system.bat` to verify setup
4. Check console logs for error messages

## 🎉 You're All Set!

Your event management system is now fully functional with:
- ✅ Working login for clients and organizers
- ✅ Booking creation that saves to MySQL database
- ✅ **Payment system with automatic pricing**
- ✅ **🆕 Payment preferences (save payment method)**
- ✅ **Booking modification (reschedule date/time)**
- ✅ **Protection for confirmed bookings**
- ✅ Data visible in Django admin panel
- ✅ Data visible in phpMyAdmin
- ✅ Proper error handling
- ✅ Real-time availability checking

**Start using it now:**
```bash
setup_payment_preferences.bat  # First time only - adds payment preferences
start.bat
```

Then go to http://localhost:3000 and:
1. Login to your account
2. Go to Profile page
3. Set your payment preference
4. Create bookings faster! 🎊

**New Features:**
- 💳 **Payment Preferences** - Read `PAYMENT_PREFERENCES_GUIDE.md`
- 💰 **Payment & Reschedule** - Read `NEW_FEATURES_GUIDE.md`
"# event-booking" 
"# event-booking" 
