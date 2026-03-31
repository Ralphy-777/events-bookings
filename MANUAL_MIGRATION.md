# Manual Database Migration

## If update_database.bat doesn't work, follow these steps:

### Step 1: Open Command Prompt
1. Press `Win + R`
2. Type `cmd`
3. Press Enter

### Step 2: Navigate to Backend Folder
```bash
cd d:\RV\SPDATA\backend
```

### Step 3: Create Migrations
```bash
python manage.py makemigrations user
```

You should see:
```
Migrations for 'user':
  user\migrations\0002_booking_payment_method.py
    - Add field payment_method to booking
```

### Step 4: Apply Migrations
```bash
python manage.py migrate
```

You should see:
```
Running migrations:
  Applying user.0002_booking_payment_method... OK
```

### Step 5: Verify
```bash
python manage.py showmigrations user
```

You should see checkmarks [X] next to all migrations.

### Step 6: Go Back to Main Folder
```bash
cd ..
```

### Step 7: Start Servers
```bash
start.bat
```

## Done!

Now test creating a booking with payment method selection.

## If You Get Errors

### Error: "No changes detected"
This means the field already exists. Skip to Step 7.

### Error: "Table already exists"
Run this:
```bash
python manage.py migrate --fake user
```

### Error: "python is not recognized"
Make sure Python is installed and added to PATH.

### Error: "No module named django"
Install requirements:
```bash
pip install -r requirements.txt
```

## Quick Test

After migration, test in Python shell:
```bash
python manage.py shell
```

Then type:
```python
from user.models import Booking
print(Booking._meta.get_field('payment_method'))
exit()
```

If no error, migration successful!
