# Quick Start: Payment Preferences

## 🚀 5-Minute Setup

### Step 1: Enable Feature (One Time)
```bash
setup_payment_preferences.bat
```

### Step 2: Start Application
```bash
start.bat
```

### Step 3: Set Your Preference
1. Login → Profile
2. Choose payment method
3. Save

### Step 4: Create Booking
- Your payment method is auto-selected!

## 💳 Payment Methods

### Cash
```
✓ Pay at venue
✓ No card needed
✓ Simple
```

### GCash
```
✓ Mobile wallet
✓ Quick payment
✓ No card needed
```

### Card
```
✓ Save card securely
✓ Auto-fill next time
✓ Update anytime
```

## 📱 Profile Page Layout

```
┌─────────────────────────────────┐
│  Account Information            │
│  • Name: John Doe               │
│  • Email: john@example.com      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  💳 Payment Preferences         │
│                                 │
│  ○ Cash                         │
│  ○ GCash                        │
│  ● Card ✓                       │
│    Card: •••• •••• •••• 1234    │
│    [Update Card Number]         │
│                                 │
│  [Save Payment Preference]      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🔒 Change Password             │
│  [Current Password]             │
│  [New Password]                 │
│  [Confirm Password]             │
│  [Change Password]              │
└─────────────────────────────────┘
```

## 🎯 Usage Flow

```
First Time:
Login → Profile → Select Payment → Save
         ↓
    Preference Saved!
         ↓
Dashboard → Create Booking → Auto-Selected ✓

Next Time:
Dashboard → Create Booking → Already Selected ✓
```

## ✨ Benefits

| Feature | Benefit |
|---------|---------|
| Save Once | Use everywhere |
| Auto-Select | Faster bookings |
| Update Anytime | Full control |
| Secure Storage | Card protected |
| Google Play Style | Familiar UI |

## 🔄 Change Preference

```
Profile → Select New Method → Save
```

That's it! Your new preference is active.

## 🆘 Quick Troubleshooting

**Not saving?**
- Check internet connection
- Verify you're logged in
- Refresh page

**Not auto-selecting?**
- Refresh dashboard
- Check Profile to verify
- Re-login if needed

**Card not accepted?**
- Must be 16 digits
- Numbers only
- No spaces

## 📞 Need More Help?

- Full Guide: `PAYMENT_PREFERENCES_GUIDE.md`
- Implementation: `PAYMENT_PREFERENCES_IMPLEMENTATION.md`
- Main README: `README.md`

## 🎉 You're Ready!

Your payment preferences are set up. Enjoy faster bookings!

**Quick Links:**
- Profile: http://localhost:3000/profile
- Dashboard: http://localhost:3000/client/dashboard
- My Bookings: http://localhost:3000/my-bookings
