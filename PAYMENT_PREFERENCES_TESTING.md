# Payment Preferences - Testing Checklist

## ✅ Complete Testing Guide

### Prerequisites
- [ ] XAMPP MySQL is running
- [ ] Database 'eventpro' exists
- [ ] Backend and frontend dependencies installed

---

## 🚀 Setup Phase

### 1. Enable Feature
- [ ] Run `setup_payment_preferences.bat`
- [ ] Migration completes successfully
- [ ] No errors in console
- [ ] Database updated message appears

### 2. Start Application
- [ ] Run `start.bat`
- [ ] Backend starts on port 8000
- [ ] Frontend starts on port 3000
- [ ] No startup errors

---

## 👤 User Testing

### 3. Login
- [ ] Navigate to http://localhost:3000/signin
- [ ] Login with client credentials
- [ ] Successfully redirected to dashboard
- [ ] Token stored in localStorage

### 4. Access Profile Page
- [ ] Click "Profile" in navigation
- [ ] Profile page loads successfully
- [ ] Account information displays correctly
- [ ] Payment Preferences section visible
- [ ] Change Password section visible

---

## 💳 Payment Preferences Testing

### 5. Test Cash Selection
- [ ] Select "Cash" radio button
- [ ] Border turns sky blue
- [ ] Checkmark appears
- [ ] Click "Save Payment Preference"
- [ ] Success message appears
- [ ] Page doesn't reload

### 6. Test GCash Selection
- [ ] Select "GCash" radio button
- [ ] Previous selection deselected
- [ ] Border turns sky blue
- [ ] Checkmark appears
- [ ] Click "Save Payment Preference"
- [ ] Success message appears

### 7. Test Card Selection (Without Card)
- [ ] Select "Card" radio button
- [ ] Card input field appears
- [ ] Try to save without card number
- [ ] Error message appears
- [ ] Cannot save without card

### 8. Test Card Selection (With Card)
- [ ] Select "Card" radio button
- [ ] Enter 16-digit card: 1234567812345678
- [ ] Card number accepts only digits
- [ ] Maximum 16 digits enforced
- [ ] Click "Save Payment Preference"
- [ ] Success message appears
- [ ] Card number cleared from input
- [ ] Saved card displays as "•••• 5678"

### 9. Test Card Update
- [ ] Card already saved (•••• 5678 visible)
- [ ] Enter new card: 9876543210987654
- [ ] Click "Save Payment Preference"
- [ ] Success message appears
- [ ] Saved card updates to "•••• 7654"

### 10. Test Preference Persistence
- [ ] Refresh profile page
- [ ] Selected payment method still selected
- [ ] Saved card still displays
- [ ] No data loss

---

## 🎯 Dashboard Integration Testing

### 11. Test Auto-Selection
- [ ] Navigate to Client Dashboard
- [ ] Scroll to payment section
- [ ] Saved payment method is pre-selected
- [ ] Checkmark visible on saved method
- [ ] If Card: saved card displays

### 12. Test Override on Dashboard
- [ ] Saved method is Card
- [ ] Select different method (Cash)
- [ ] Can change without issue
- [ ] Booking uses selected method
- [ ] Profile preference unchanged

### 13. Test Booking with Saved Card
- [ ] Fill booking form completely
- [ ] Card is pre-selected
- [ ] Card number shows "•••• 7654"
- [ ] No need to re-enter card
- [ ] Click "Confirm Booking & Payment"
- [ ] Booking created successfully
- [ ] Payment processed with saved card

### 14. Test Booking with Cash
- [ ] Change preference to Cash in Profile
- [ ] Go to Dashboard
- [ ] Cash is pre-selected
- [ ] No card input visible
- [ ] Create booking successfully

### 15. Test Booking with GCash
- [ ] Change preference to GCash in Profile
- [ ] Go to Dashboard
- [ ] GCash is pre-selected
- [ ] No card input visible
- [ ] Create booking successfully

---

## 🔒 Security Testing

### 16. Test Card Storage
- [ ] Save card in profile
- [ ] Check browser localStorage
- [ ] Full card number NOT stored in frontend
- [ ] Only last 4 digits visible
- [ ] Full card stored in backend database

### 17. Test Authentication
- [ ] Logout
- [ ] Try to access /profile directly
- [ ] Redirected to login
- [ ] Login again
- [ ] Preferences still saved

### 18. Test Token Expiry
- [ ] Clear localStorage token
- [ ] Try to save preference
- [ ] Redirected to login
- [ ] No unauthorized access

---

## 🎨 UI/UX Testing

### 19. Test Visual Feedback
- [ ] Hover over payment options
- [ ] Background changes on hover
- [ ] Selected option has blue border
- [ ] Checkmark visible on selected
- [ ] Icons display correctly

### 20. Test Responsive Design
- [ ] Resize browser window
- [ ] Layout adjusts properly
- [ ] All elements visible
- [ ] No horizontal scroll
- [ ] Mobile view works

### 21. Test Form Validation
- [ ] Try to save Card without number
- [ ] Error message appears
- [ ] Try card with less than 16 digits
- [ ] Error message appears
- [ ] Try card with letters
- [ ] Only digits accepted

---

## 🔄 Edge Cases

### 22. Test Multiple Updates
- [ ] Change preference 5 times rapidly
- [ ] All updates save correctly
- [ ] No race conditions
- [ ] Latest preference persists

### 23. Test Network Errors
- [ ] Stop backend server
- [ ] Try to save preference
- [ ] Error message appears
- [ ] Frontend doesn't crash
- [ ] Restart backend
- [ ] Can save again

### 24. Test Invalid Data
- [ ] Try to save empty payment method
- [ ] Backend rejects
- [ ] Try to save invalid card (17 digits)
- [ ] Frontend prevents
- [ ] Try special characters in card
- [ ] Frontend filters

---

## 📊 Database Testing

### 25. Test Database Storage
- [ ] Save preference in profile
- [ ] Open phpMyAdmin
- [ ] Navigate to eventpro database
- [ ] Open user_user table
- [ ] Find your user record
- [ ] Verify preferred_payment_method field
- [ ] Verify saved_card_number field

### 26. Test Database Updates
- [ ] Change preference multiple times
- [ ] Check database after each change
- [ ] Field updates correctly
- [ ] No duplicate records
- [ ] Data integrity maintained

---

## 🔧 API Testing

### 27. Test GET Profile Endpoint
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/user/profile/
```
- [ ] Returns user data
- [ ] Includes preferred_payment_method
- [ ] Includes saved_card_number (last 4)
- [ ] Status 200 OK

### 28. Test PUT Payment Preference Endpoint
```bash
curl -X PUT \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"payment_method":"Card","card_number":"1234567812345678"}' \
     http://localhost:8000/api/user/profile/payment-preference/
```
- [ ] Updates preference
- [ ] Returns success message
- [ ] Returns saved_card_last4
- [ ] Status 200 OK

---

## 🎓 Documentation Testing

### 29. Test Documentation Accuracy
- [ ] Follow PAYMENT_PREFERENCES_QUICKSTART.md
- [ ] All steps work as described
- [ ] No missing information
- [ ] Screenshots/diagrams accurate

### 30. Test Setup Scripts
- [ ] Run setup_payment_preferences.bat
- [ ] Completes without errors
- [ ] Database updated correctly
- [ ] Success message displays

---

## ✅ Final Verification

### 31. Complete User Flow
- [ ] Fresh login
- [ ] Set payment preference
- [ ] Create booking (auto-selected)
- [ ] Change preference
- [ ] Create another booking (new preference)
- [ ] All works seamlessly

### 32. Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] All features work in all browsers

### 33. Performance Testing
- [ ] Profile page loads quickly
- [ ] Preference saves instantly
- [ ] Dashboard loads with preference
- [ ] No lag or delays

---

## 📝 Test Results Summary

| Test Category | Total Tests | Passed | Failed |
|---------------|-------------|--------|--------|
| Setup | 2 | __ | __ |
| User Testing | 2 | __ | __ |
| Payment Prefs | 6 | __ | __ |
| Dashboard | 5 | __ | __ |
| Security | 3 | __ | __ |
| UI/UX | 3 | __ | __ |
| Edge Cases | 3 | __ | __ |
| Database | 2 | __ | __ |
| API | 2 | __ | __ |
| Documentation | 2 | __ | __ |
| Final | 3 | __ | __ |
| **TOTAL** | **33** | **__** | **__** |

---

## 🐛 Bug Report Template

If you find issues, document them:

```
Bug #: ___
Title: _______________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:


Actual Result:


Screenshots:


Environment:
- Browser: 
- OS: 
- Date: 
```

---

## ✅ Sign-Off

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Documentation accurate
- [ ] Ready for production

**Tested by:** _______________  
**Date:** _______________  
**Signature:** _______________

---

## 🎉 Congratulations!

If all tests pass, your Payment Preferences feature is fully functional and ready to use!

**Next Steps:**
1. Deploy to production (if applicable)
2. Train users on new feature
3. Monitor usage and feedback
4. Iterate based on user needs

**Enjoy faster bookings! 🚀**
