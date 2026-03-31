# Organizer Setup Guide

## What's New

✅ **Organizers have limited admin access** - Can only manage bookings, not users or superuser functions
✅ **Organizers cannot access client pages** - Automatic redirect if they try
✅ **Clients cannot access organizer pages** - Automatic redirect if they try
✅ **Separate admin panels** - Superadmin and Organizer admin

## Admin Panels

### Superuser Admin (Full Access)
- URL: http://localhost:8000/admin
- Access: Superuser only
- Can manage: Users, Bookings, All settings

### Organizer Admin (Limited Access)
- URL: http://localhost:8000/organizer-admin
- Access: Organizers with is_staff=True
- Can manage: View and approve/decline bookings only
- Cannot: Add/delete bookings, manage users

## Creating an Organizer

### Method 1: Via Superuser Admin
1. Go to http://localhost:8000/admin
2. Login as superuser
3. Click "Users" > "Add User"
4. Fill in:
   - Email: organizer@example.com
   - Username: organizer@example.com
   - Password: (choose password)
5. Click "Save and continue editing"
6. Check these boxes:
   - ✅ Is organizer
   - ✅ Is staff (required for admin access)
7. Click "Save"

### Method 2: Via Django Shell
```bash
cd backend
python manage.py shell
```

```python
from user.models import User

# Create organizer
organizer = User.objects.create_user(
    username='organizer@example.com',
    email='organizer@example.com',
    password='your_password',
    first_name='John',
    last_name='Organizer'
)
organizer.is_organizer = True
organizer.is_staff = True  # Required for admin access
organizer.save()

print("Organizer created!")
exit()
```

## Access Control

### Client Pages (Protected from Organizers)
- `/client/dashboard` - Clients only
- `/register` - New clients only
- Organizers redirected to `/organizer-dashboard`

### Organizer Pages (Protected from Clients)
- `/organizer-dashboard` - Organizers only
- `/organizer-admin` - Organizers with is_staff=True
- Clients redirected to `/client/dashboard`

### Public Pages
- `/signin` - Both can login
- `/` - Home page

## Login Flow

### Client Login
1. Go to http://localhost:3000/signin
2. Select "Client" tab
3. Enter email and password
4. Redirected to `/client/dashboard`
5. Token stored as `clientToken`

### Organizer Login
1. Go to http://localhost:3000/signin
2. Select "Organizer" tab
3. Enter email and password
4. Redirected to `/organizer-dashboard`
5. Token stored as `organizerToken`

## Organizer Capabilities

### Via Web Dashboard (http://localhost:3000/organizer-dashboard)
- View all bookings (pending, confirmed, declined)
- Approve bookings
- Decline bookings
- Real-time updates

### Via Admin Panel (http://localhost:8000/organizer-admin)
- View bookings list
- Filter by status, date, event type
- Search bookings
- Bulk approve/decline actions
- Cannot add or delete bookings

## Testing

### Test Organizer Cannot Access Client Pages
1. Login as organizer
2. Try to go to http://localhost:3000/client/dashboard
3. Should see alert: "Organizers cannot access client pages!"
4. Redirected to organizer dashboard

### Test Client Cannot Access Organizer Pages
1. Login as client
2. Try to go to http://localhost:3000/organizer-dashboard
3. Should see alert: "Clients cannot access organizer dashboard!"
4. Redirected to client dashboard

### Test Organizer Admin Access
1. Login as organizer at http://localhost:8000/organizer-admin
2. Should only see "Bookings" section
3. Cannot see "Users" or other admin sections
4. Can approve/decline bookings
5. Cannot add or delete bookings

## Permissions Summary

| Feature | Client | Organizer | Superuser |
|---------|--------|-----------|-----------|
| Create bookings | ✅ | ❌ | ✅ |
| View own bookings | ✅ | ❌ | ✅ |
| View all bookings | ❌ | ✅ | ✅ |
| Approve/decline bookings | ❌ | ✅ | ✅ |
| Access client dashboard | ✅ | ❌ | ✅ |
| Access organizer dashboard | ❌ | ✅ | ✅ |
| Access organizer admin | ❌ | ✅ | ✅ |
| Access superuser admin | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Add/delete bookings | ❌ | ❌ | ✅ |

## Quick Commands

### Create Superuser
```bash
cd backend
python manage.py createsuperuser
```

### Create Organizer (via shell)
```bash
cd backend
python manage.py shell
```
```python
from user.models import User
User.objects.create_user(
    username='org@test.com',
    email='org@test.com',
    password='password123',
    first_name='Organizer',
    last_name='Test',
    is_organizer=True,
    is_staff=True
).save()
```

### Check User Type
```bash
python manage.py shell
```
```python
from user.models import User
user = User.objects.get(email='test@example.com')
print(f"Is Organizer: {user.is_organizer}")
print(f"Is Staff: {user.is_staff}")
```

## Troubleshooting

### Organizer can't login to admin panel
- Make sure `is_staff = True`
- Check at http://localhost:8000/admin (superuser panel)
- Edit user and check "Staff status"

### Getting redirected when accessing pages
- Clear localStorage: `localStorage.clear()`
- Login again with correct account type

### Organizer sees "Permission denied"
- Make sure they're using http://localhost:8000/organizer-admin
- Not http://localhost:8000/admin (superuser only)
