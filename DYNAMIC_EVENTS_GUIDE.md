# DYNAMIC EVENT TYPES - QUICK GUIDE

## ✅ What's Done

Your system now has **DYNAMIC EVENT TYPES**!

### Changes Made:
1. ✅ Created `EventType` table in database
2. ✅ Added Event Types to Django Admin
3. ✅ Created API endpoint for event types
4. ✅ Updated frontend to load event types dynamically
5. ✅ Updated booking system to use dynamic pricing

## 🚀 Setup (One-Time)

Run this command:
```bash
setup_dynamic_events.bat
```

This will:
- Create the database table
- Add 5 default event types (Wedding, Birthday, Christening, Conference, Corporate Event)

## 📊 Database Table

**Table Name**: `user_eventtype`

**Fields**:
- `id` - Auto ID
- `event_type` - Event name (unique)
- `price` - Price in pesos
- `max_capacity` - Maximum people
- `people_per_table` - People per table
- `description` - Description
- `is_active` - Active/Inactive
- `created_at` - Created date
- `updated_at` - Updated date

## 🎯 How to Manage Event Types

### Access Admin Panel:
1. Go to: http://localhost:8000/admin
2. Login with superuser account
3. Click "Event Types"

### Add New Event Type:
1. Click "Add Event Type"
2. Fill in:
   - Event Type: "Concert"
   - Price: 15000
   - Max Capacity: 200
   - People Per Table: 10
   - Description: "Large concert events"
   - Is Active: ✓ (checked)
3. Click "Save"
4. **Done!** It will appear in booking form immediately

### Edit Event Type:
1. Click on the event type
2. Change price, capacity, etc.
3. Click "Save"
4. **Done!** Changes apply to new bookings

### Deactivate Event Type:
1. Click on the event type
2. Uncheck "Is Active"
3. Click "Save"
4. **Done!** It won't show in booking form

### Delete Event Type:
1. Select the event type
2. Click "Delete"
3. Confirm
4. **Warning**: Only delete if no bookings use it!

## 💡 Examples

### Example 1: Add "Seminar" Event
```
Event Type: Seminar
Price: 8000
Max Capacity: 80
People Per Table: 8
Description: Educational seminars and workshops
Is Active: ✓
```

### Example 2: Add "Concert" Event
```
Event Type: Concert
Price: 20000
Max Capacity: 300
People Per Table: 10
Description: Large concert and music events
Is Active: ✓
```

### Example 3: Seasonal Pricing
```
Event Type: Christmas Party
Price: 12000
Max Capacity: 100
People Per Table: 10
Description: Special Christmas package with decorations
Is Active: ✓
```

## 🔄 How It Works

1. **Admin adds event type** → Saved to database
2. **Client opens booking form** → Loads event types from database
3. **Client selects event** → Shows price and capacity
4. **Client creates booking** → Uses price from database

## ✨ Benefits

✅ **No Coding Required** - Manage everything in admin panel
✅ **Real-Time Updates** - Changes appear immediately
✅ **Flexible Pricing** - Change prices anytime
✅ **Unlimited Events** - Add as many as you want
✅ **Easy Management** - Simple admin interface

## 📝 Important Notes

1. **Event type names must be unique**
2. **Only active event types show in booking form**
3. **Changing price doesn't affect existing bookings**
4. **Clients see: "Event Name - ₱Price" in dropdown**
5. **Deactivated events are hidden, not deleted**

## 🎉 You're Ready!

Your system is now admin-friendly and ready to hand over to anyone!

**No coding knowledge needed to:**
- Add new event types
- Change prices
- Update capacities
- Manage availability

Just use the Django Admin panel at:
**http://localhost:8000/admin**
