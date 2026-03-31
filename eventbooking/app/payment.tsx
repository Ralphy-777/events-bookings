import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

export default function PaymentScreen() {
  const router = useRouter();
  const { id: bookingId, amount } = useLocalSearchParams<{ id: string; amount: string }>();
  const [showUpload, setShowUpload] = useState(false);
  const [gcashRef, setGcashRef] = useState('');
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken('clientToken');
      if (!token) router.replace('/signin');
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setProofUri(result.assets[0].uri);
  };

  const handleUpload = async () => {
    if (!proofUri) { Alert.alert('Please select a payment screenshot'); return; }
    setProcessing(true);
    const token = await getToken('clientToken');
    const formData = new FormData();
    formData.append('gcash_reference', gcashRef);
    formData.append('payment_proof', { uri: proofUri, name: 'proof.jpg', type: 'image/jpeg' } as any);
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/upload-proof/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        Alert.alert('Payment proof uploaded! Awaiting organizer verification.');
        router.replace('/(tabs)/bookings');
      } else {
        const d = await res.json();
        Alert.alert(d.message || 'Upload failed');
      }
    } catch { Alert.alert('Upload error'); }
    finally { setProcessing(false); }
  };

  if (showUpload) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.title}>Upload Payment Proof</Text>

          <View style={s.gcashInfo}>
            <Text style={s.gcashInfoTitle}>📱 GCash Payment Instructions</Text>
            <Text style={s.gcashStep}>1. Send payment to:</Text>
            <Text style={s.gcashNumber}>09939261681</Text>
            <Text style={s.gcashName}>(Liberato Villarojo)</Text>
            <Text style={s.gcashStep}>2. Amount to Pay:</Text>
            <Text style={s.gcashAmount}>₱{parseFloat(amount || '0').toLocaleString()}</Text>
            <Text style={s.gcashStep}>3. Take a screenshot of the confirmation</Text>
            <Text style={s.gcashStep}>4. Upload the screenshot below</Text>
          </View>

          <Text style={s.label}>GCash Reference Number (Optional)</Text>
          <TextInput
            style={s.input} value={gcashRef} onChangeText={setGcashRef}
            placeholder="Enter reference number" placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity style={s.pickBtn} onPress={pickImage}>
            <Ionicons name="image" size={18} color="#0ea5e9" />
            <Text style={s.pickBtnText}>
              {proofUri ? '✓ Screenshot selected' : 'Select Payment Screenshot *'}
            </Text>
          </TouchableOpacity>

          <View style={s.notice}>
            <Text style={s.noticeText}>
              ⚠️ Your booking will be confirmed after the organizer verifies your payment.
            </Text>
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={[s.submitBtn, (processing || !proofUri) && s.submitBtnDisabled]}
              onPress={handleUpload} disabled={processing || !proofUri}
            >
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Submit Payment Proof</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.backBtn} onPress={() => setShowUpload(false)}>
              <Text style={s.backBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.title}>Complete Payment</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={s.homeBtn}>
            <Text style={s.homeBtnText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

        <View style={s.amountBox}>
          <Text style={s.amountLabel}>Total Amount to Pay</Text>
          <Text style={s.amountVal}>₱{parseFloat(amount || '0').toLocaleString()}</Text>
          <Text style={s.amountSub}>Booking ID: #{bookingId}</Text>
        </View>

        <Text style={s.label}>Payment Method</Text>
        <View style={s.methodBox}>
          <View style={s.radioActive2} />
          <Text style={s.methodText}>💳 GCash (Manual Payment)</Text>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>
            ℹ️ You will send payment manually via GCash app and upload proof of payment.
          </Text>
        </View>

        <View style={s.actions}>
          <TouchableOpacity style={s.submitBtn} onPress={() => setShowUpload(true)}>
            <Text style={s.submitBtnText}>Continue to Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.backBtn} onPress={() => router.push('/(tabs)/bookings')}>
            <Text style={s.backBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  homeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' },
  homeBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  amountBox: { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#86efac', borderRadius: 14, padding: 20, marginBottom: 20, alignItems: 'center' },
  amountLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  amountVal: { fontSize: 36, fontWeight: 'bold', color: '#16a34a' },
  amountSub: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  methodBox: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: '#0ea5e9', backgroundColor: '#f0f9ff', borderRadius: 12, padding: 14, marginBottom: 16 },
  radioActive2: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#0ea5e9' },
  methodText: { fontSize: 15, fontWeight: '500', color: '#1f2937' },
  infoBox: { backgroundColor: '#eff6ff', borderLeftWidth: 4, borderLeftColor: '#3b82f6', borderRadius: 10, padding: 12, marginBottom: 20 },
  infoText: { fontSize: 13, color: '#1e40af' },
  gcashInfo: { backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#bfdbfe', borderRadius: 14, padding: 16, marginBottom: 20 },
  gcashInfoTitle: { fontSize: 15, fontWeight: '700', color: '#1e40af', marginBottom: 12 },
  gcashStep: { fontSize: 13, color: '#1e40af', marginBottom: 4 },
  gcashNumber: { fontSize: 26, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 2 },
  gcashName: { fontSize: 12, color: '#3b82f6', marginBottom: 8 },
  gcashAmount: { fontSize: 30, fontWeight: 'bold', color: '#16a34a', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1f2937', marginBottom: 14 },
  pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#0ea5e9', borderRadius: 10, padding: 12, marginBottom: 16 },
  pickBtnText: { color: '#0ea5e9', fontWeight: '600', fontSize: 14 },
  notice: { backgroundColor: '#fffbeb', borderLeftWidth: 4, borderLeftColor: '#f59e0b', borderRadius: 10, padding: 12, marginBottom: 20 },
  noticeText: { fontSize: 13, color: '#92400e' },
  actions: { gap: 10 },
  submitBtn: { backgroundColor: '#0ea5e9', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#9ca3af' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backBtn: { borderWidth: 2, borderColor: '#d1d5db', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: '#374151', fontWeight: '700', fontSize: 15 },
});
