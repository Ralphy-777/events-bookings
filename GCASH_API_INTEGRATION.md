# 🔐 GCASH API INTEGRATION GUIDE

## ✅ What Was Created

Your system now has **GCASH API INTEGRATION** for real payments!

---

## 📦 Files Created

1. **backend/user/gcash_payment.py** - GCash payment handler
2. **backend/user/views.py** - Added GCash endpoints
3. **backend/user/urls.py** - Added GCash routes

---

## 🔧 SETUP REQUIRED

### Step 1: Get GCash API Credentials

1. Register at: https://open.alipay.com/
2. Create an application
3. Get your credentials:
   - App ID
   - Private Key (RSA)
   - Public Key (RSA)
   - Gateway URL

### Step 2: Add to Django Settings

Open `backend/backend/settings.py` and add:

```python
# GCash Payment Configuration
GCASH_APP_ID = 'your_app_id_here'
GCASH_PRIVATE_KEY = '''-----BEGIN PRIVATE KEY-----
your_private_key_here
-----END PRIVATE KEY-----'''
GCASH_PUBLIC_KEY = '''-----BEGIN PUBLIC KEY-----
your_public_key_here
-----END PUBLIC KEY-----'''
GCASH_GATEWAY_URL = 'https://open-na.alipay.com/gateway.do'
GCASH_NOTIFY_URL = 'http://your-domain.com/api/user/gcash/notify/'
GCASH_RETURN_URL = 'http://localhost:3000/payment-success'
```

### Step 3: Install Required Package

```bash
cd backend
pip install pycryptodome
```

---

## 🎯 API Endpoints

### 1. Initiate GCash Payment
**POST** `/api/user/gcash/initiate/`

**Request:**
```json
{
  "booking_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "payment_url": "https://gcash.com/payment/...",
  "order_no": "ORD12320240315123456"
}
```

### 2. Payment Notification (Webhook)
**POST** `/api/user/gcash/notify/`

This endpoint receives payment notifications from GCash.

---

## 🔄 Payment Flow

### For Cash Payment:
1. Client selects "Cash"
2. Booking created with status "pending"
3. Payment marked as "paid" immediately
4. Organizer approves booking

### For GCash Payment:
1. Client selects "GCash"
2. Booking created with status "pending"
3. **Frontend calls** `/api/user/gcash/initiate/`
4. **Backend returns** GCash payment URL
5. **Client redirected** to GCash payment page
6. **Client pays** via GCash app
7. **GCash sends** notification to `/api/user/gcash/notify/`
8. **Backend updates** payment status to "paid"
9. **Client redirected** back to success page

---

## 💻 Frontend Integration

### Update Payment Section:

```javascript
const handleGCashPayment = async (bookingId) => {
  try {
    const token = localStorage.getItem('clientToken');
    const response = await fetch('http://localhost:8000/api/user/gcash/initiate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ booking_id: bookingId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to GCash payment page
      window.location.href = data.payment_url;
    } else {
      alert('Payment initiation failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🔐 Security Features

✅ **RSA Signature** - All requests signed with private key
✅ **Signature Verification** - Notifications verified with public key
✅ **HTTPS Required** - Production must use HTTPS
✅ **Webhook Validation** - Only valid notifications processed
✅ **Order Tracking** - Unique order numbers for each transaction

---

## 📝 Testing

### Test Mode:
1. Use GCash sandbox credentials
2. Test payment flow
3. Verify webhook notifications
4. Check payment status updates

### Production:
1. Replace with production credentials
2. Update notify_url to your domain
3. Enable HTTPS
4. Test with real GCash account

---

## 🎨 Payment Status Flow

```
Booking Created
    ↓
Payment Method Selected
    ↓
[Cash] → Marked as Paid → Organizer Approves
    ↓
[GCash] → Initiate Payment → Redirect to GCash
    ↓
User Pays via GCash App
    ↓
GCash Sends Notification
    ↓
Backend Verifies & Updates Status
    ↓
Payment Marked as Paid
    ↓
Organizer Approves Booking
```

---

## 🔍 Troubleshooting

### Payment URL Not Generated:
- Check GCash credentials in settings
- Verify app_id is correct
- Check gateway URL

### Notification Not Received:
- Verify notify_url is accessible
- Check webhook URL in GCash dashboard
- Ensure HTTPS in production

### Signature Verification Failed:
- Check public key is correct
- Verify signature algorithm (RSA2)
- Check parameter encoding

---

## 📚 GCash API Documentation

**Official Docs**: https://miniprogram.gcash.com/docs/miniprogram_gcash/mpdev/v1_pay

**Key Methods:**
- `alipay.trade.create` - Create payment
- `alipay.trade.query` - Query payment status
- `alipay.trade.close` - Close payment

---

## ⚠️ Important Notes

1. **Sandbox First**: Test in sandbox before production
2. **HTTPS Required**: Production must use HTTPS
3. **Webhook URL**: Must be publicly accessible
4. **Private Key**: Keep secure, never commit to git
5. **Amount Format**: Use decimal with 2 places (e.g., "100.00")
6. **Currency**: PHP (Philippine Peso)

---

## 🎯 Next Steps

### 1. Get Credentials:
- Register at GCash developer portal
- Create application
- Get API credentials

### 2. Configure Settings:
- Add credentials to `settings.py`
- Set notify_url and return_url

### 3. Install Package:
```bash
pip install pycryptodome
```

### 4. Update Frontend:
- Add GCash payment button
- Implement redirect to payment URL
- Handle payment success/failure

### 5. Test:
- Test in sandbox mode
- Verify payment flow
- Check webhook notifications

---

## ✅ Ready to Use!

Your GCash integration is:
- ✅ Backend implemented
- ✅ API endpoints ready
- ✅ Webhook handler created
- ✅ Signature verification included

**Just add your GCash credentials and test!** 💳🎉
