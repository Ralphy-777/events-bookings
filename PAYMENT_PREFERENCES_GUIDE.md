# Payment Preferences Guide

## 🎯 Overview

Your SPDATA Event Management System now includes **Payment Preferences** - just like Google Play Store subscriptions! Set your preferred payment method once, and it will be automatically selected for all future bookings.

## ✨ Features

- **Save Payment Method**: Choose Cash, GCash, or Card as your default
- **Secure Card Storage**: Save your card number securely (only last 4 digits shown)
- **Auto-Selection**: Your preferred method is pre-selected when creating bookings
- **Easy Updates**: Change your payment preference anytime in Profile
- **Google Play Style**: Familiar interface like subscription payment settings

## 🚀 Setup (First Time Only)

Run this command to add payment preferences to your database:

```bash
add_payment_preferences.bat
```

## 📝 How to Use

### Set Your Payment Preference

1. **Go to Profile Page**
   - Login as client
   - Click "Profile" in navigation

2. **Choose Payment Method**
   - Select Cash, GCash, or Card
   - If Card: Enter your 16-digit card number
   - Click "Save Payment Preference"

3. **Done!**
   - Your preference is saved
   - Will be auto-selected for future bookings

### Update Payment Method

1. **Go to Profile Page**
2. **Select New Payment Method**
   - Choose different option
   - Update card if switching to Card
3. **Click "Save Payment Preference"**

### Create Booking with Saved Preference

1. **Go to Client Dashboard**
2. **Fill Booking Form**
   - Your saved payment method is pre-selected
   - You can still change it if needed
3. **Complete Booking**

## 💳 Payment Methods

### Cash
- Pay at venue
- No card needed
- Simple and direct

### GCash
- Mobile wallet payment
- Quick and convenient
- No card required

### Card (Credit/Debit)
- Save card for future use
- Only last 4 digits shown
- Secure storage
- Update anytime

## 🔒 Security

- Card numbers are securely stored
- Only last 4 digits displayed
- Can be updated or removed anytime
- No sensitive data exposed

## 📱 User Experience

**Similar to Google Play Store:**
- Set once, use everywhere
- Easy to update
- Clear visual feedback
- Saved card display (•••• •••• •••• 1234)

## 🎨 Profile Page Features

### Account Information
- View your name and email
- Quick reference

### Payment Preferences
- 💳 Visual payment method selector
- Radio buttons with descriptions
- Checkmark for selected method
- Card input for Card payment
- Saved card display

### Change Password
- 🔒 Secure password update
- Current password verification
- Confirmation required

## 🔄 Workflow

```
1. Set Preference (One Time)
   ↓
2. Create Booking (Auto-Selected)
   ↓
3. Confirm or Change
   ↓
4. Complete Payment
```

## ⚙️ Technical Details

### Database Fields
- `preferred_payment_method`: Cash/GCash/Card
- `saved_card_number`: 16-digit card (encrypted)

### API Endpoints
- `GET /api/user/profile/` - Get user profile
- `PUT /api/user/profile/payment-preference/` - Update preference

### Frontend Features
- Auto-load preference on dashboard
- Visual selection with checkmarks
- Masked card display
- Real-time validation

## 🎯 Benefits

1. **Faster Bookings**: No need to select payment every time
2. **Convenience**: Set once, use everywhere
3. **Flexibility**: Change anytime you want
4. **Security**: Card info safely stored
5. **User-Friendly**: Familiar Google Play style interface

## 📋 Example Usage

### First Time User
```
1. Register → Login
2. Go to Profile
3. Select "Card" payment
4. Enter card: 1234567812345678
5. Save preference
6. Create booking → Card auto-selected!
```

### Changing Preference
```
1. Go to Profile
2. Currently: Card (•••• 5678)
3. Select "GCash"
4. Save preference
5. Next booking → GCash auto-selected!
```

## 🆘 Troubleshooting

### Payment preference not saving
- Check internet connection
- Verify you're logged in
- Try refreshing the page

### Card number not accepted
- Must be exactly 16 digits
- Only numbers allowed
- No spaces or dashes

### Preference not auto-selected
- Refresh dashboard page
- Check Profile to verify saved
- Re-login if needed

## 🎉 You're All Set!

Your payment preferences are now configured! Enjoy faster bookings with your saved payment method.

**Quick Access:**
- Profile: http://localhost:3000/profile
- Dashboard: http://localhost:3000/client/dashboard

---

**Need Help?** Check the main README.md or QUICK_REFERENCE.md
