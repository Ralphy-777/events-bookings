import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal, Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getToken, removeToken } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#fef3c7', text: '#92400e' },
  confirmed: { bg: '#dcfce7', text: '#15803d' },
  declined:  { bg: '#fee2e2', text: '#991b1b' },
};

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Reschedule modal
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reschedulePickerDate, setReschedulePickerDate] = useState<Date>(new Date());
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);

  const onRescheduleDateChange = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === 'android') setShowReschedulePicker(false);
    if (event.type === 'dismissed') { setShowReschedulePicker(false); return; }
    if (picked) {
      setReschedulePickerDate(picked);
      const y = picked.getFullYear();
      const m = String(picked.getMonth() + 1).padStart(2, '0');
      const d = String(picked.getDate()).padStart(2, '0');
      setNewDate(`${y}-${m}-${d}`);
    }
  };

  const toDisplayDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // GCash upload modal
  const [uploadId, setUploadId] = useState<number | null>(null);
  const [gcashRef, setGcashRef] = useState('');
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Review modal
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState<number[]>([]);

  const fetchBookings = useCallback(async () => {
    const token = await getToken('clientToken');
    if (!token) { router.replace('/signin'); return; }
    try {
      const res = await fetch(`${API_BASE}/bookings/my/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { await removeToken('clientToken'); router.replace('/signin'); return; }
      if (res.ok) setBookings(await res.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id: number, status: string) => {
    if (status === 'confirmed') { Alert.alert('Cannot cancel confirmed bookings.'); return; }
    Alert.alert('Cancel Booking', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes', style: 'destructive', onPress: async () => {
          const token = await getToken('clientToken');
          const res = await fetch(`${API_BASE}/bookings/${id}/cancel/`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) { Alert.alert('Booking cancelled'); fetchBookings(); }
          else Alert.alert('Failed to cancel');
        },
      },
    ]);
  };

  const handleReschedule = async () => {
    if (!newDate && !newTime) { Alert.alert('Select a new date or time'); return; }
    const token = await getToken('clientToken');
    const res = await fetch(`${API_BASE}/bookings/${rescheduleId}/update/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: newDate || undefined, time: newTime || undefined }),
    });
    if (res.ok) {
      Alert.alert('Rescheduled successfully');
      setRescheduleId(null); setNewDate(''); setNewTime('');
      fetchBookings();
    } else Alert.alert('Failed to reschedule');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setProofUri(result.assets[0].uri);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) { Alert.alert('Please select a star rating'); return; }
    const token = await getToken('clientToken');
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/reviews/submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: reviewId, rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        Alert.alert('Thank you! ⭐', 'Your review has been submitted.');
        if (reviewId) setReviewedBookings(prev => [...prev, reviewId]);
        setReviewId(null); setReviewRating(0); setReviewComment('');
      } else {
        const d = await res.json();
        Alert.alert(d.message || 'Failed to submit review');
      }
    } catch { Alert.alert('Error submitting review'); }
    finally { setSubmittingReview(false); }
  };

  const handleUploadProof = async () => {
    if (!proofUri) { Alert.alert('Please select a screenshot'); return; }
    if (!gcashRef.trim()) { Alert.alert('GCash reference number is required'); return; }
    setUploading(true);
    const token = await getToken('clientToken');
    const formData = new FormData();
    formData.append('gcash_reference', gcashRef);
    formData.append('payment_proof', {
      uri: proofUri,
      name: 'proof.jpg',
      type: 'image/jpeg',
    } as any);
    try {
      const res = await fetch(`${API_BASE}/bookings/${uploadId}/upload-proof/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        Alert.alert('Proof uploaded! Awaiting organizer verification.');
        setUploadId(null); setGcashRef(''); setProofUri(null);
        fetchBookings();
      } else Alert.alert('Upload failed');
    } catch { Alert.alert('Upload error'); }
    finally { setUploading(false); }
  };

  const filtered = bookings.filter(b =>
    !search || b.event_type.toLowerCase().includes(search.toLowerCase())
  );

  const TIME_SLOTS = [
    { label: '09:00 AM – 2:00 PM (5 hrs)', value: '09:00', group: 'Morning' },
    { label: '10:00 AM – 2:00 PM (4 hrs)', value: '10:00', group: 'Morning' },
    { label: '11:00 AM – 2:00 PM (3 hrs)', value: '11:00', group: 'Morning' },
    { label: '05:00 PM – 10:00 PM (5 hrs)', value: '17:00', group: 'Evening' },
    { label: '06:00 PM – 10:00 PM (4 hrs)', value: '18:00', group: 'Evening' },
    { label: '07:00 PM – 10:00 PM (3 hrs)', value: '19:00', group: 'Evening' },
  ];

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>My Bookings</Text>

      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput} placeholder="Search bookings..."
          value={search} onChangeText={setSearch} placeholderTextColor="#9ca3af"
        />
      </View>

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📅</Text>
          <Text style={s.emptyText}>No bookings found</Text>
          <TouchableOpacity style={s.bookBtn} onPress={() => router.push('/book')}>
            <Text style={s.bookBtnText}>Create a Booking</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filtered.map((b) => {
          const sc = STATUS_COLORS[b.status] ?? { bg: '#f3f4f6', text: '#374151' };
          return (
            <View key={b.id} style={s.card}>
              <View style={s.cardTop}>
                <Text style={s.cardTitle}>{b.event_type}</Text>
                <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[s.statusText, { color: sc.text }]}>{b.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={s.cardSub}>Booking #{b.id}</Text>
              {b.description ? <Text style={s.cardDesc} numberOfLines={2}>{b.description}</Text> : null}

              <View style={s.detailGrid}>
                {[
                  { icon: 'calendar', label: 'Date', val: b.date },
                  { icon: 'time', label: 'Time', val: b.time },
                  { icon: 'people', label: 'Guests', val: `${b.capacity} people` },
                  { icon: 'card', label: 'Payment', val: b.payment_method || 'N/A' },
                  { icon: 'cash', label: 'Amount', val: `₱${Number(b.total_amount).toLocaleString()}` },
                  { icon: 'location', label: 'Venue', val: "Ralphy's Venue" },
                ].map((d) => (
                  <View key={d.label} style={s.detailItem}>
                    <Ionicons name={d.icon as any} size={14} color="#0ea5e9" />
                    <View>
                      <Text style={s.detailLabel}>{d.label}</Text>
                      <Text style={s.detailVal}>{d.val}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* GCash upload */}
              {b.payment_method === 'GCash' && b.payment_status === 'pending' && (
                <TouchableOpacity style={s.gcashBtn} onPress={() => { setUploadId(b.id); setGcashRef(''); setProofUri(null); }}>
                  <Text style={s.gcashBtnText}>📤 Upload GCash Payment Proof</Text>
                </TouchableOpacity>
              )}
              {b.payment_status === 'pending_verification' && (
                <View style={s.verifyBadge}>
                  <Text style={s.verifyText}>⏳ Awaiting organizer verification</Text>
                </View>
              )}

              {/* Rate & Review */}
              {b.status === 'confirmed' && !b.has_review && !reviewedBookings.includes(b.id) && (() => {
                const today = new Date().toISOString().split('T')[0];
                return b.date <= today ? (
                  <TouchableOpacity
                    style={s.reviewBtn}
                    onPress={() => { setReviewId(b.id); setReviewRating(0); setReviewComment(''); }}
                  >
                    <Text style={s.reviewBtnText}>⭐ Rate & Review This Event</Text>
                  </TouchableOpacity>
                ) : null;
              })()}
              {(b.has_review || reviewedBookings.includes(b.id)) && (
                <View style={s.reviewedBadge}>
                  <Text style={s.reviewedText}>✅ Review submitted — Thank you!</Text>
                </View>
              )}

              {/* Actions */}
              <View style={s.actions}>
                {b.status === 'pending' && (
                  <TouchableOpacity style={s.rescheduleBtn} onPress={() => {
                    setRescheduleId(b.id); setNewDate(b.date); setNewTime(b.time);
                  }}>
                    <Text style={s.rescheduleBtnText}>Reschedule</Text>
                  </TouchableOpacity>
                )}
                {(b.status === 'pending' || b.status === 'declined') && (
                  <TouchableOpacity style={s.cancelBtn} onPress={() => handleCancel(b.id, b.status)}>
                    <Text style={s.cancelBtnText}>{b.status === 'pending' ? 'Cancel' : 'Remove'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* Reschedule Modal */}
      <Modal visible={rescheduleId !== null} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalBox}>
            <Text style={s.modalTitle}>Reschedule Booking</Text>

            {/* Native date picker */}
            <Text style={s.modalLabel}>New Date</Text>
            <TouchableOpacity style={s.dateBtn} onPress={() => setShowReschedulePicker(true)}>
              <Text style={s.dateBtnText}>
                {newDate ? toDisplayDate(reschedulePickerDate) : 'Select new date'}
              </Text>
            </TouchableOpacity>
            {showReschedulePicker && (
              <View style={s.datePickerWrapper}>
                <DateTimePicker
                  value={reschedulePickerDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  onChange={onRescheduleDateChange}
                  themeVariant="light"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={s.datePickerDone} onPress={() => setShowReschedulePicker(false)}>
                    <Text style={s.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Grouped time slots */}
            <Text style={s.modalLabel}>New Time Slot</Text>
            <Text style={s.timeGroupLabel}>Morning (ends 2:00 PM)</Text>
            {TIME_SLOTS.filter(ts => ts.group === 'Morning').map((ts) => (
              <TouchableOpacity
                key={ts.value}
                style={[s.timeSlot, newTime === ts.value && s.timeSlotActive]}
                onPress={() => setNewTime(ts.value)}
              >
                <View style={[s.timeRadio, newTime === ts.value && s.timeRadioActive]} />
                <Text style={[s.timeSlotText, newTime === ts.value && s.timeSlotTextActive]}>
                  {ts.label}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={[s.timeGroupLabel, { marginTop: 8 }]}>Evening (ends 10:00 PM)</Text>
            {TIME_SLOTS.filter(ts => ts.group === 'Evening').map((ts) => (
              <TouchableOpacity
                key={ts.value}
                style={[s.timeSlot, newTime === ts.value && s.timeSlotActive]}
                onPress={() => setNewTime(ts.value)}
              >
                <View style={[s.timeRadio, newTime === ts.value && s.timeRadioActive]} />
                <Text style={[s.timeSlotText, newTime === ts.value && s.timeSlotTextActive]}>
                  {ts.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalSave} onPress={handleReschedule}>
                <Text style={s.modalSaveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalCancel} onPress={() => setRescheduleId(null)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal visible={reviewId !== null} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>⭐ Rate & Review</Text>
            <Text style={s.modalLabel}>Select your rating</Text>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Text style={{ fontSize: 38, color: reviewRating >= star ? '#eab308' : '#d1d5db' }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.modalLabel}>Comment (optional)</Text>
            <TextInput
              style={[s.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Share your experience..."
              placeholderTextColor="#9ca3af"
              multiline
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalSave, (submittingReview || reviewRating === 0) && { opacity: 0.5 }]}
                onPress={handleSubmitReview}
                disabled={submittingReview || reviewRating === 0}
              >
                <Text style={s.modalSaveText}>{submittingReview ? 'Submitting...' : 'Submit Review'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalCancel} onPress={() => setReviewId(null)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* GCash Upload Modal */}
      <Modal visible={uploadId !== null} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalBox}>
            <Text style={s.modalTitle}>Upload GCash Proof</Text>
            <View style={s.gcashInfo}>
              <Text style={s.gcashInfoText}>Send payment to:</Text>
              <Text style={s.gcashNumber}>09939261681</Text>
              <Text style={s.gcashName}>(Liberato Villarojo)</Text>
            </View>
            <Text style={s.modalLabel}>GCash Reference Number *</Text>
            <TextInput
              style={s.modalInput} value={gcashRef} onChangeText={setGcashRef}
              placeholder="Enter reference number" placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={s.pickImageBtn} onPress={pickImage}>
              <Ionicons name="image" size={18} color="#0ea5e9" />
              <Text style={s.pickImageText}>
                {proofUri ? '✓ Screenshot selected' : 'Select Payment Screenshot *'}
              </Text>
            </TouchableOpacity>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalSave, uploading && { opacity: 0.6 }]}
                onPress={handleUploadProof} disabled={uploading}
              >
                <Text style={s.modalSaveText}>{uploading ? 'Uploading...' : 'Submit Proof'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalCancel} onPress={() => setUploadId(null)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 14 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  bookBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  bookBtnText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardSub: { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#6b7280', marginBottom: 10, lineHeight: 18 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  detailItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, width: '47%',
  },
  detailLabel: { fontSize: 10, color: '#9ca3af' },
  detailVal: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  reviewBtn: {
    backgroundColor: '#fef9c3', borderRadius: 10, padding: 12,
    alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#fde68a',
  },
  reviewBtnText: { color: '#92400e', fontWeight: '700', fontSize: 14 },
  reviewedBadge: {
    backgroundColor: '#dcfce7', borderRadius: 10, padding: 10,
    alignItems: 'center', marginBottom: 10,
  },
  reviewedText: { color: '#15803d', fontWeight: '600', fontSize: 13 },
  gcashBtn: {
    backgroundColor: '#dcfce7', borderRadius: 10, padding: 12,
    alignItems: 'center', marginBottom: 10,
  },
  gcashBtnText: { color: '#15803d', fontWeight: '700', fontSize: 14 },
  verifyBadge: {
    backgroundColor: '#fef3c7', borderRadius: 10, padding: 10,
    alignItems: 'center', marginBottom: 10,
  },
  verifyText: { color: '#92400e', fontWeight: '600', fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  rescheduleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#eff6ff' },
  rescheduleBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff1f2' },
  cancelBtnText: { color: '#e11d48', fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  modalInput: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1f2937',
  },
  dateBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#f9fafb', marginBottom: 8 },
  dateBtnText: { fontSize: 14, color: '#1f2937' },
  datePickerWrapper: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8, overflow: 'hidden' },
  datePickerDone: { alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  datePickerDoneText: { color: '#2563eb', fontWeight: '700', fontSize: 15 },
  timeGroupLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  timeSlot: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 6, backgroundColor: '#f9fafb' },
  timeSlotActive: { borderColor: '#0ea5e9', backgroundColor: '#eff6ff' },
  timeRadio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#d1d5db' },
  timeRadioActive: { borderColor: '#0ea5e9', backgroundColor: '#0ea5e9' },
  timeSlotText: { fontSize: 13, color: '#374151' },
  timeSlotTextActive: { color: '#0ea5e9', fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalSave: { flex: 1, backgroundColor: '#0ea5e9', borderRadius: 10, padding: 12, alignItems: 'center' },
  modalSaveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalCancel: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 10, padding: 12, alignItems: 'center' },
  modalCancelText: { color: '#374151', fontWeight: '700', fontSize: 15 },
  gcashInfo: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 14, marginBottom: 10 },
  gcashInfoText: { fontSize: 13, color: '#1e40af', marginBottom: 4 },
  gcashNumber: { fontSize: 22, fontWeight: 'bold', color: '#1d4ed8' },
  gcashName: { fontSize: 12, color: '#3b82f6' },
  pickImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#0ea5e9', borderRadius: 10,
    padding: 12, marginTop: 10,
  },
  pickImageText: { color: '#0ea5e9', fontWeight: '600', fontSize: 14 },
});
