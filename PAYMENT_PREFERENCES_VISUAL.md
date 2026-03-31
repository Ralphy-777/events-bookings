# Payment Preferences - Visual Guide

## 🎨 What You'll See

### Profile Page - Payment Preferences Section

```
╔═══════════════════════════════════════════════════════════╗
║  💳 Payment Preferences                                   ║
║  Set your preferred payment method for bookings           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  💡 Your preferred payment method will be automatically   ║
║     selected when creating bookings, just like Google     ║
║     Play Store subscriptions.                             ║
║                                                           ║
║  Select Payment Method                                    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ ○ Cash                                          │    ║
║  │   Pay with cash at the venue                    │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ ○ GCash                                         │    ║
║  │   Pay using GCash mobile wallet                 │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ ● Card                                      ✓   │    ║
║  │   Pay with your card                            │    ║
║  │                                                 │    ║
║  │   Saved Card                                    │    ║
║  │   •••• •••• •••• 1234                          │    ║
║  │   Update your card below to change              │    ║
║  │                                                 │    ║
║  │   Update Card Number                            │    ║
║  │   [________________]                            │    ║
║  │   🔒 Your card information is securely stored   │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │         Save Payment Preference                 │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Dashboard - Auto-Selected Payment

```
╔═══════════════════════════════════════════════════════════╗
║  Create Event Booking                                     ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Event Type: [Wedding ▼]                                 ║
║  Description: [________________________]                  ║
║  Number of Guests: [50]                                   ║
║  Date: [2024-03-15]                                       ║
║  Time: [09:00 ▼]                                         ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │  Availability Status                            │    ║
║  │  Rooms Available: 3 / 5                         │    ║
║  │  Total Amount: ₱5,000                           │    ║
║  │                                                 │    ║
║  │  Select Payment Method                          │    ║
║  │                                                 │    ║
║  │  ○ Cash                                         │    ║
║  │  ○ GCash                                        │    ║
║  │  ● Card  ✓  (Your saved preference)            │    ║
║  │                                                 │    ║
║  │  Card Number: [Already saved]                   │    ║
║  │  •••• •••• •••• 1234                           │    ║
║  │                                                 │    ║
║  │  ┌───────────────────────────────────────┐     │    ║
║  │  │  Confirm Booking & Payment            │     │    ║
║  │  └───────────────────────────────────────┘     │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## 🎯 User Journey

### Step 1: First Visit to Profile
```
┌──────────────────────────────────┐
│  Welcome to Profile!             │
│                                  │
│  Set your payment preference:    │
│  ○ Cash                          │
│  ○ GCash                         │
│  ○ Card                          │
│                                  │
│  [Save Payment Preference]       │
└──────────────────────────────────┘
```

### Step 2: After Saving
```
┌──────────────────────────────────┐
│  ✓ Payment preference updated!   │
│                                  │
│  Your preference: Card           │
│  Saved card: •••• 1234          │
│                                  │
│  This will be auto-selected      │
│  when creating bookings.         │
└──────────────────────────────────┘
```

### Step 3: Creating Booking
```
┌──────────────────────────────────┐
│  Create Booking                  │
│                                  │
│  Payment Method:                 │
│  ● Card ✓ (Auto-selected!)      │
│                                  │
│  No need to enter card again!    │
│  Just click Confirm!             │
└──────────────────────────────────┘
```

### Step 4: Updating Preference
```
┌──────────────────────────────────┐
│  Change Payment Method           │
│                                  │
│  Current: Card (•••• 1234)      │
│                                  │
│  Select new:                     │
│  ○ Cash                          │
│  ● GCash ✓                       │
│  ○ Card                          │
│                                  │
│  [Save Payment Preference]       │
└──────────────────────────────────┘
```

## 🎨 Visual Elements

### Payment Method Cards

**Unselected:**
```
┌─────────────────────────────────┐
│ ○ Cash                          │
│   Pay with cash at the venue    │
└─────────────────────────────────┘
```

**Selected:**
```
┌═════════════════════════════════┐
║ ● Card                      ✓   ║
║   Pay with your card            ║
╚═════════════════════════════════╝
```

**With Card Info:**
```
┌═════════════════════════════════┐
║ ● Card                      ✓   ║
║   Pay with your card            ║
║                                 ║
║   Saved Card                    ║
║   •••• •••• •••• 1234          ║
║   Update your card below        ║
║                                 ║
║   Update Card Number            ║
║   [________________]            ║
║   🔒 Securely stored            ║
╚═════════════════════════════════╝
```

## 📱 Mobile View

```
┌─────────────────────┐
│  Payment Prefs      │
├─────────────────────┤
│                     │
│  ○ Cash             │
│    Pay at venue     │
│                     │
│  ○ GCash            │
│    Mobile wallet    │
│                     │
│  ● Card         ✓   │
│    Your card        │
│    •••• 1234       │
│                     │
│  [Save Preference]  │
│                     │
└─────────────────────┘
```

## 🎯 Color Scheme

- **Selected Border:** Sky Blue (#0ea5e9)
- **Unselected Border:** Gray (#e5e7eb)
- **Checkmark:** Sky Blue (#0ea5e9)
- **Save Button:** Green (#10b981)
- **Card Display:** White background
- **Icons:** Emoji style

## ✨ Animations

- **Hover:** Card lifts slightly
- **Select:** Border color changes
- **Save:** Button pulses
- **Success:** Checkmark appears

## 🎨 Typography

- **Headings:** Bold, 24px
- **Labels:** Semibold, 14px
- **Descriptions:** Regular, 12px
- **Card Numbers:** Monospace, 18px

## 📐 Layout

```
Profile Page Layout:
├── Navigation Bar
├── Account Information Card
├── Payment Preferences Card ⭐
│   ├── Header with icon
│   ├── Info banner
│   ├── Payment method selector
│   │   ├── Cash option
│   │   ├── GCash option
│   │   └── Card option
│   │       └── Card input (if selected)
│   └── Save button
└── Change Password Card
```

## 🎉 Success States

### After Saving
```
┌─────────────────────────────────┐
│  ✓ Payment preference updated!  │
│                                 │
│  Your new preference: GCash     │
│  This will be used for future   │
│  bookings automatically.        │
└─────────────────────────────────┘
```

### On Dashboard
```
┌─────────────────────────────────┐
│  Payment Method                 │
│  ● GCash ✓                      │
│  (Your saved preference)        │
│                                 │
│  Change in Profile if needed    │
└─────────────────────────────────┘
```

## 🔄 State Transitions

```
No Preference → Select Method → Save → Auto-Select
     ↓              ↓            ↓          ↓
  Default        Choose       Stored    Pre-filled
   Cash          Payment      in DB     on Booking
```

## 🎯 User Benefits Visualization

```
Before:
Dashboard → Select → Enter Card → Confirm
   (4 steps every time)

After:
Dashboard → Confirm
   (1 step!)
```

## 📊 Comparison

| Feature | Before | After |
|---------|--------|-------|
| Steps to book | 4 | 1 |
| Card entry | Every time | Once |
| Time to book | 2 minutes | 30 seconds |
| User effort | High | Low |

---

**This is what your users will experience! 🎨**
