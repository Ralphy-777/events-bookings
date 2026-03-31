import { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getToken, removeToken } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const token = await getToken('clientToken');
      if (!token) { router.replace('/signin'); return; }
      loadProfile();
    })();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/profile/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { await removeToken('clientToken'); router.replace('/signin'); return; }
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setAddress(data.address || '');
        setPaymentMethod(data.preferred_payment_method || 'Cash');
      }
    } catch {}
  };

  const handleUpdateInfo = async () => {
    if (!firstName.trim() || !lastName.trim()) { Alert.alert('First and last name are required'); return; }
    setUpdatingInfo(true);
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/profile/update/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, address }),
      });
      if (res.ok) { Alert.alert('Profile updated!'); setEditing(false); loadProfile(); }
      else { const d = await res.json(); Alert.alert(d.message || 'Failed to update'); }
    } catch { Alert.alert('Error updating profile'); }
    finally { setUpdatingInfo(false); }
  };

  const handleUpdatePayment = async () => {
    setUpdatingPayment(true);
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/profile/payment-preference/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_method: paymentMethod }),
      });
      if (res.ok) Alert.alert('Payment preference updated!');
      else { const d = await res.json(); Alert.alert(d.message || 'Failed to update'); }
    } catch { Alert.alert('Error updating payment preference'); }
    finally { setUpdatingPayment(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) { Alert.alert('Please fill in all fields'); return; }
    if (newPwd !== confirmPwd) { Alert.alert('New passwords do not match'); return; }
    if (newPwd.length < 6) { Alert.alert('Password must be at least 6 characters'); return; }
    setChangingPwd(true);
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/change-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
      });
      if (res.ok) {
        Alert.alert('Password changed successfully!');
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      } else { const d = await res.json(); Alert.alert(d.message || 'Failed to change password'); }
    } catch { Alert.alert('Error changing password'); }
    finally { setChangingPwd(false); }
  };

  const handleLogout = async () => {
    await removeToken('clientToken');
    setLoggingOut(true);
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.replace('/signin');
    });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Account Info */}
      {userInfo && (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Account Information</Text>
            <TouchableOpacity style={s.editBtn} onPress={() => setEditing(!editing)}>
              <Text style={s.editBtnText}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              {[
                { label: 'First Name', val: firstName, set: setFirstName },
                { label: 'Last Name', val: lastName, set: setLastName },
                { label: 'Address', val: address, set: setAddress },
              ].map(f => (
                <View key={f.label}>
                  <Text style={s.label}>{f.label}</Text>
                  <TextInput style={s.input} value={f.val} onChangeText={f.set} placeholderTextColor="#9ca3af" />
                </View>
              ))}
              <Text style={s.label}>Email (Cannot be changed)</Text>
              <TextInput style={[s.input, s.inputDisabled]} value={userInfo.email} editable={false} />
              <TouchableOpacity
                style={[s.btn, s.btnGreen, updatingInfo && s.btnDisabled]}
                onPress={handleUpdateInfo} disabled={updatingInfo}
              >
                {updatingInfo ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save Changes</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {[
                { label: 'Name', val: `${userInfo.first_name} ${userInfo.last_name}` },
                { label: 'Email', val: userInfo.email },
                { label: 'Address', val: userInfo.address || 'Not set' },
              ].map(row => (
                <View key={row.label} style={s.infoRow}>
                  <Text style={s.infoLabel}>{row.label}:</Text>
                  <Text style={s.infoVal}>{row.val}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Payment Preference */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardIcon}>💳</Text>
          <View>
            <Text style={s.cardTitle}>Payment Preferences</Text>
            <Text style={s.cardSub}>Set your preferred payment method</Text>
          </View>
        </View>

        {['Cash', 'GCash'].map(m => (
          <TouchableOpacity
            key={m}
            style={[s.payOption, paymentMethod === m && s.payOptionActive]}
            onPress={() => setPaymentMethod(m)}
          >
            <View style={[s.radio, paymentMethod === m && s.radioActive]} />
            <View style={{ flex: 1 }}>
              <Text style={s.payOptionTitle}>{m}</Text>
              <Text style={s.payOptionSub}>{m === 'Cash' ? 'Pay with cash at the venue' : 'Pay using GCash mobile wallet'}</Text>
            </View>
            {paymentMethod === m && <Text style={s.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[s.btn, s.btnGreen, updatingPayment && s.btnDisabled]}
          onPress={handleUpdatePayment} disabled={updatingPayment}
        >
          {updatingPayment ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save Payment Preference</Text>}
        </TouchableOpacity>
      </View>

      {/* Change Password */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardIcon}>🔒</Text>
          <View>
            <Text style={s.cardTitle}>Change Password</Text>
            <Text style={s.cardSub}>Update your account password</Text>
          </View>
        </View>

        {[
          { label: 'Current Password', val: currentPwd, set: setCurrentPwd },
          { label: 'New Password', val: newPwd, set: setNewPwd },
          { label: 'Confirm New Password', val: confirmPwd, set: setConfirmPwd },
        ].map(f => (
          <View key={f.label}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput
              style={s.input} value={f.val} onChangeText={f.set}
              secureTextEntry placeholderTextColor="#9ca3af"
              placeholder={`Enter ${f.label.toLowerCase()}`}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[s.btn, changingPwd && s.btnDisabled]}
          onPress={handleChangePassword} disabled={changingPwd}
        >
          {changingPwd ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Change Password</Text>}
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={[s.btn, s.btnRed]} onPress={handleLogout}>
        <Text style={s.btnText}>Logout</Text>
      </TouchableOpacity>

      {/* Logout overlay */}
      {loggingOut && (
        <Animated.View style={[s.overlay, { opacity: overlayOpacity }]} />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  cardSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  editBtn: { marginLeft: 'auto', backgroundColor: '#0ea5e9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1f2937', marginBottom: 14 },
  inputDisabled: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  infoVal: { fontSize: 14, color: '#1f2937', fontWeight: '600', flex: 1, textAlign: 'right' },
  payOption: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10 },
  payOptionActive: { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db' },
  radioActive: { borderColor: '#0ea5e9', backgroundColor: '#0ea5e9' },
  payOptionTitle: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  payOptionSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  checkmark: { color: '#0ea5e9', fontWeight: 'bold', fontSize: 16 },
  btn: { backgroundColor: '#0ea5e9', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  btnGreen: { backgroundColor: '#16a34a' },
  btnRed: { backgroundColor: '#dc2626' },
  btnDisabled: { backgroundColor: '#9ca3af' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff' },
});
