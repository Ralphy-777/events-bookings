# SPDATA System Flow Diagram

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                    http://localhost:3000                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                              │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │   Register  │  │    Login     │  │ Client Dashboard │       │
│  │   /register │  │   /signin    │  │ /client/dashboard│       │
│  └─────────────┘  └──────────────┘  └──────────────────┘       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │           localStorage (JWT Token)                   │        │
│  └─────────────────────────────────────────────────────┘        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API Calls (with JWT Token)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    DJANGO BACKEND                                │
│                 http://localhost:8000                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              API ENDPOINTS                            │       │
│  │                                                        │       │
│  │  POST /api/user/register/                            │       │
│  │  POST /api/user/login/                               │       │
│  │  GET  /api/user/client/check-availability/          │       │
│  │  POST /api/user/bookings/create/                     │       │
│  │  GET  /api/user/bookings/my/                         │       │
│  │  GET  /api/user/bookings/                            │       │
│  │  POST /api/user/bookings/<id>/status/               │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              DJANGO MODELS                            │       │
│  │                                                        │       │
│  │  - User (email, password, is_organizer)             │       │
│  │  - Booking (event_type, date, status, etc.)         │       │
│  └──────────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    MYSQL DATABASE                                │
│                 (XAMPP - localhost:3306)                         │
│                                                                   │
│  Database: spdata_db                                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  TABLE: user_user                                     │       │
│  │  ├─ id                                                │       │
│  │  ├─ email                                             │       │
│  │  ├─ password (hashed)                                 │       │
│  │  ├─ first_name                                        │       │
│  │  ├─ last_name                                         │       │
│  │  ├─ is_organizer                                      │       │
│  │  └─ ...                                               │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  TABLE: user_booking                                  │       │
│  │  ├─ id                                                │       │
│  │  ├─ user_id (FK to user_user)                        │       │
│  │  ├─ event_type                                        │       │
│  │  ├─ description                                       │       │
│  │  ├─ capacity                                          │       │
│  │  ├─ date                                              │       │
│  │  ├─ status (pending/confirmed/declined)              │       │
│  │  └─ ...                                               │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  View at: http://localhost/phpmyadmin                            │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 User Flow: Client Creates Booking

```
1. CLIENT REGISTRATION
   ┌──────────────┐
   │ User visits  │
   │ /register    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐      POST /api/user/register/
   │ Fills form   │────────────────────────────────┐
   │ - Name       │                                 │
   │ - Email      │                                 ▼
   │ - Password   │                        ┌────────────────┐
   └──────────────┘                        │ Django creates │
                                           │ user in MySQL  │
                                           └────────┬───────┘
                                                    │
                                                    ▼
                                           ┌────────────────┐
                                           │ Returns JWT    │
                                           │ token          │
                                           └────────┬───────┘
                                                    │
                                                    ▼
   ┌──────────────┐                        ┌────────────────┐
   │ Token saved  │◄───────────────────────│ Frontend saves │
   │ in browser   │                        │ to localStorage│
   └──────┬───────┘                        └────────────────┘
          │
          ▼
   ┌──────────────┐
   │ Redirected   │
   │ to home      │
   └──────────────┘

2. CLIENT LOGIN (if already registered)
   ┌──────────────┐
   │ User visits  │
   │ /signin      │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐      POST /api/user/login/
   │ Enters email │────────────────────────────────┐
   │ & password   │                                 │
   └──────────────┘                                 ▼
                                           ┌────────────────┐
                                           │ Django checks  │
                                           │ credentials    │
                                           └────────┬───────┘
                                                    │
                                                    ▼
                                           ┌────────────────┐
                                           │ Returns JWT    │
                                           │ + is_organizer │
                                           └────────┬───────┘
                                                    │
                                                    ▼
   ┌──────────────┐                        ┌────────────────┐
   │ Logged in    │◄───────────────────────│ Token saved    │
   └──────────────┘                        └────────────────┘

3. CREATE BOOKING
   ┌──────────────┐
   │ User visits  │
   │ /client/     │
   │ dashboard    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐      GET /api/user/client/check-availability/
   │ Selects date │────────────────────────────────┐
   └──────┬───────┘                                 │
          │                                         ▼
          │                                ┌────────────────┐
          │                                │ Django counts  │
          │                                │ bookings for   │
          │                                │ that date      │
          │                                └────────┬───────┘
          │                                         │
          │                                         ▼
          │                                ┌────────────────┐
          │                                │ Returns        │
          │                                │ available_rooms│
          │                                └────────┬───────┘
          │                                         │
          ▼                                         ▼
   ┌──────────────┐                        ┌────────────────┐
   │ Sees         │◄───────────────────────│ Shows: X/5     │
   │ availability │                        │ rooms available│
   └──────┬───────┘                        └────────────────┘
          │
          ▼
   ┌──────────────┐
   │ Fills form:  │
   │ - Event type │
   │ - Description│
   │ - Capacity   │
   │ - Emails     │
   │ - Date       │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐      POST /api/user/bookings/create/
   │ Clicks       │────────────────────────────────┐
   │ "Request     │                                 │
   │  Booking"    │                                 ▼
   └──────────────┘                        ┌────────────────┐
                                           │ Django         │
                                           │ validates:     │
                                           │ - Auth token   │
                                           │ - Date avail.  │
                                           │ - Capacity     │
                                           └────────┬───────┘
                                                    │
                                                    ▼
                                           ┌────────────────┐
                                           │ Creates booking│
                                           │ in MySQL       │
                                           │ status=pending │
                                           └────────┬───────┘
                                                    │
                                                    ▼
   ┌──────────────┐                        ┌────────────────┐
   │ Success!     │◄───────────────────────│ Returns        │
   │ Booking      │                        │ booking_id     │
   │ created      │                        └────────────────┘
   └──────────────┘

4. ORGANIZER APPROVES
   ┌──────────────┐
   │ Organizer    │
   │ logs in      │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐      GET /api/user/bookings/
   │ Views        │────────────────────────────────┐
   │ pending      │                                 │
   │ bookings     │                                 ▼
   └──────┬───────┘                        ┌────────────────┐
          │                                │ Django returns │
          │                                │ all bookings   │
          │                                │ from MySQL     │
          │                                └────────┬───────┘
          │                                         │
          ▼                                         ▼
   ┌──────────────┐                        ┌────────────────┐
   │ Sees list    │◄───────────────────────│ Filtered by    │
   │ of bookings  │                        │ status=pending │
   └──────┬───────┘                        └────────────────┘
          │
          ▼
   ┌──────────────┐      POST /api/user/bookings/<id>/status/
   │ Clicks       │────────────────────────────────┐
   │ "Approve"    │                                 │
   └──────────────┘                                 ▼
                                           ┌────────────────┐
                                           │ Django updates │
                                           │ booking.status │
                                           │ = 'confirmed'  │
                                           └────────┬───────┘
                                                    │
                                                    ▼
   ┌──────────────┐                        ┌────────────────┐
   │ Booking      │◄───────────────────────│ Saved to MySQL │
   │ approved!    │                        └────────────────┘
   └──────────────┘
```

## 🗄️ Data Storage Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE                          │
└─────────────────────────────────────────────────────────────┘

When you create a booking:

Frontend (React)
    │
    │ 1. User fills form
    │
    ▼
localStorage
    │
    │ 2. JWT token retrieved
    │
    ▼
API Request
    │
    │ 3. POST with token + data
    │
    ▼
Django Backend
    │
    │ 4. Validates token
    │ 5. Validates data
    │ 6. Creates Booking object
    │
    ▼
MySQL Database (spdata_db)
    │
    │ 7. INSERT INTO user_booking
    │
    ▼
Data Saved! ✅

View your data:
    │
    ├─► Django Admin (http://localhost:8000/admin)
    │   └─► Bookings > View all bookings
    │
    └─► phpMyAdmin (http://localhost/phpmyadmin)
        └─► spdata_db > user_booking > Browse
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    JWT AUTHENTICATION                        │
└─────────────────────────────────────────────────────────────┘

Login Process:

1. User enters email + password
   │
   ▼
2. POST /api/user/login/
   │
   ▼
3. Django checks:
   - User exists?
   - Password correct?
   - Is organizer?
   │
   ▼
4. Generate JWT token
   │
   ▼
5. Return token to frontend
   │
   ▼
6. Frontend saves to localStorage
   │
   ▼
7. All future requests include:
   Header: Authorization: Bearer <token>

Protected Endpoints:
   │
   ├─► Check availability (requires token)
   ├─► Create booking (requires token + client role)
   ├─► View bookings (requires token + organizer role)
   └─► Update status (requires token + organizer role)
```

## 📊 Database Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────┘

user_user                          user_booking
┌──────────────────┐              ┌──────────────────┐
│ id (PK)          │              │ id (PK)          │
│ email            │              │ user_id (FK) ────┼──┐
│ password         │              │ event_type       │  │
│ first_name       │              │ description      │  │
│ last_name        │              │ capacity         │  │
│ is_organizer     │              │ date             │  │
│ is_staff         │              │ status           │  │
│ date_joined      │              │ created_at       │  │
└──────────────────┘              └──────────────────┘  │
         ▲                                               │
         │                                               │
         └───────────────────────────────────────────────┘
                    One-to-Many Relationship
         (One user can have many bookings)

Queries:
- Get all bookings for a user:
  SELECT * FROM user_booking WHERE user_id = ?

- Get user who created a booking:
  SELECT * FROM user_user 
  WHERE id = (SELECT user_id FROM user_booking WHERE id = ?)

- Count bookings for a date:
  SELECT COUNT(*) FROM user_booking WHERE date = ?
```

## 🎯 Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│                    IMPORTANT URLS                            │
└─────────────────────────────────────────────────────────────┘

Frontend:       http://localhost:3000
Backend:        http://localhost:8000
Admin Panel:    http://localhost:8000/admin
phpMyAdmin:     http://localhost/phpmyadmin

┌─────────────────────────────────────────────────────────────┐
│                    IMPORTANT FILES                           │
└─────────────────────────────────────────────────────────────┘

Start app:      start.bat
Install:        INSTALL.bat
Check system:   check_system.bat

Backend:        backend/user/views.py (API logic)
                backend/user/models.py (Database models)
                backend/backend/settings.py (Configuration)

Frontend:       frontend/app/client/dashboard/page.tsx
                frontend/app/signin/page.tsx
                frontend/app/register/page.tsx

┌─────────────────────────────────────────────────────────────┐
│                    DATABASE ACCESS                           │
└─────────────────────────────────────────────────────────────┘

Database:       spdata_db
Host:           localhost:3306
User:           root
Password:       (empty)

Tables:
- user_user      (All users)
- user_booking   (All bookings)
```

This visual guide shows exactly how your data flows from the browser to the database and back! 🎉
