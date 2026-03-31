# Manual GCash Payment Guide

## 🎉 What's New

Your event management system now supports **Manual GCash Payment**!

This is the RECOMMENDED method for projects and small businesses because:
- ✅ No API integration needed
- ✅ Works immediately
- ✅ Simple for customers
- ✅ Easy for you to verify

## 📱 How It Works

### For Customers:

1. **Create a booking** as usual
2. **Select GCash** as payment method
3. **See your GCash number** displayed: **09939261681**
4. **Send payment** via GCash app to that number
5. **Take a screenshot** of the payment confirmation
6. **Upload the screenshot** on the payment page
7. **Enter reference number** (optional)
8. **Wait for verification** - You'll be notified when approved!

### For You (Organizer):

1. **Receive GCash payment** on your phone (09939261681)
2. **Login to organizer dashboard**
3. **View pending bookings** with payment proofs
4. **Check the screenshot** uploaded by customer
5. **Verify payment** in your GCash app
6. **Approve or reject** the payment
7. **Booking confirmed** automatically after approval!

## 🚀 Setup Instructions

### Step 1: Run Setup Script

```bash
setup_gcash_manual.bat
```

This will:
- Create database migration for payment proof storage
- Install Pillow library for image handling
- Configure media file uploads

### Step 2: Start Your Application

```bash
start.bat
```

## 💡 Usage Examples

### Customer Flow:

1. Go to http://localhost:3000
2. Login as client
3. Create a booking
4. Select "GCash" payment
5. Click "Continue to Payment"
6. See instructions with your GCash number: 09939261681
7. Open GCash app → Send Money → 09939261681
8. Take screenshot of confirmation
9. Upload screenshot on website
10. Done! Wait for approval

### Organizer Flow:

1. Receive GCash payment notification on phone
2. Login to organizer dashboard
3. See booking with "Pending Verification" status
4. View payment proof screenshot
5. Verify in your GCash app
6. Click "Approve Payment"
7. Booking confirmed!

## 📊 Payment Status Flow

```
Customer creates booking → "pending"
Customer uploads proof → "pending_verification"
Organizer approves → "paid"
```

## 🎯 Your GCash Details

**Number:** 09939261681
**Name:** Liberato Villarojo

---

**Ready to accept payments?**

```bash
setup_gcash_manual.bat
start.bat
```
