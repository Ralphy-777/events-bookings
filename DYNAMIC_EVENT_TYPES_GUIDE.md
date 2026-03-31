# DYNAMIC EVENT TYPES GUIDE

## What Changed?

Your system now uses **DYNAMIC EVENT TYPES** instead of hardcoded values!

### Before (Hardcoded):
- Wedding, Birthday, Christening, Conference, Corporate Event were hardcoded in the code
- To add new event types, you needed to modify the code
- Not user-friendly for non-programmers

### After (Dynamic):
- Event types are stored in the database
- Admins can add/edit/delete event types through Django Admin
- No coding required!

## How to Setup

### Step 1: Run the setup script
```bash
setup_event_types.bat
```

This will create default event types in your database:
- Wedding (₱5,000, 50 people max)
- Birthday (₱5,000, 50 people max)
- Christening (₱5,000, 50 people max)
- Conference (₱7,000, 100 people max)
- Corporate Event (₱7,000, 100 people max)

### Step 2: Access Django Admin
1. Go to http://localhost:8000/admin
2. Login with your superuser account
3. Look for "Event Types" section

## Managing Event Types (Admin Panel)

### Add New Event Type
1. Go to Django Admin → Event Types
2. Click "Add Event Type"
3. Fill in:
   - **Event Type**: Name (e.g., "Concert", "Seminar")
   - **Price**: Amount in pesos (e.g., 10000)
   - **Max Capacity**: Maximum people (e.g., 200)
   - **People Per Table**: How many per table (e.g., 10)
   - **Description**: Optional description
   - **Is Active**: Check to make it available
4. Click "Save"

### Edit Event Type
1. Go to Django Admin → Event Types
2. Click on the event type you want to edit
3. Modify the fields
4. Click "Save"

### Deactivate Event Type
1. Go to Django Admin → Event Types
2. Click on the event type
3. Uncheck "Is Active"
4. Click "Save"

**Note**: Deactivated event types won't show in the booking form

### Delete Event Type
1. Go to Django Admin → Event Types
2. Select the event type
3. Click "Delete"
4. Confirm deletion

**Warning**: Only delete if no bookings use this event type!

## How It Works

### Database Table: `user_eventtype`

Fields:
- `id` - Auto-generated ID
- `event_type` - Name of the event (unique)
- `price` - Price in decimal format
- `max_capacity` - Maximum number of people
- `people_per_table` - People per table
- `description` - Optional description
- `is_active` - Whether it's available for booking
- `created_at` - When it was created
- `updated_at` - Last update time

### Frontend Integration

When clients create bookings:
1. System fetches active event types from database
2. Displays them in dropdown with prices
3. Shows capacity and table information
4. Calculates price automatically

### API Endpoint

**GET** `/api/user/event-types/`
- Returns all active event types
- No authentication required
- Used by booking form

## Examples

### Example 1: Add "Concert" Event Type
```
Event Type: Concert
Price: 15000
Max Capacity: 200
People Per Table: 10
Description: Large concert events with stage setup
Is Active: ✓
```

### Example 2: Add "Seminar" Event Type
```
Event Type: Seminar
Price: 8000
Max Capacity: 80
People Per Table: 8
Description: Educational seminars and workshops
Is Active: ✓
```

### Example 3: Seasonal Pricing
You can create multiple event types for different seasons:
```
Event Type: Summer Wedding
Price: 6000
Max Capacity: 50
People Per Table: 5
Description: Special summer package
Is Active: ✓
```

## Benefits

✅ **Admin-Friendly**: No coding required
✅ **Flexible**: Add/edit/remove event types anytime
✅ **Real-Time**: Changes reflect immediately
✅ **Professional**: Easy to manage pricing
✅ **Scalable**: Add unlimited event types

## Troubleshooting

### Event types not showing in booking form?
1. Check if event types exist in Django Admin
2. Make sure "Is Active" is checked
3. Refresh the booking page

### Can't add event type?
1. Make sure you're logged in as admin/superuser
2. Check if event type name already exists (must be unique)

### Price not updating?
1. Edit the event type in Django Admin
2. Change the price
3. Save
4. New bookings will use the new price

## Migration Info

**Migration File**: `user/migrations/0007_eventtype.py`
**Table Name**: `user_eventtype`
**Model Name**: `EventType`

## Admin Panel Features

- **List View**: See all event types with prices and capacity
- **Quick Edit**: Edit price, capacity, and status directly from list
- **Search**: Search by event type name
- **Filter**: Filter by active/inactive status
- **Bulk Actions**: Activate/deactivate multiple event types

## Important Notes

1. **Existing Bookings**: Changing event type prices won't affect existing bookings
2. **Deletion**: Be careful when deleting event types with existing bookings
3. **Unique Names**: Event type names must be unique
4. **Active Status**: Only active event types show in booking form
5. **Pricing**: Prices are in Philippine Pesos (₱)

## Need Help?

If you need to:
- Add custom fields to event types
- Change validation rules
- Modify pricing logic

Contact your developer or check the code in:
- Backend: `backend/user/models.py` (EventType model)
- Frontend: `frontend/app/client/dashboard/page.tsx`
- Admin: `backend/user/admin.py` (EventTypeAdmin)
