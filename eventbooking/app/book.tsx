import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { getToken, removeToken } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

const MAX_ROOMS = 5;
const VENUE = "Ralphy's Venue, Basak San Nicolas Villa Kalubihan Cebu City 6000";

const TIME_SLOTS = [
  { label: '09:00 AM – 2:00 PM (5 hrs)', value: '09:00', group: 'Morning' },
  { label: '10:00 AM – 2:00 PM (4 hrs)', value: '10:00', group: 'Morning' },
  { label: '11:00 AM – 2:00 PM (3 hrs)', value: '11:00', group: 'Morning' },
  { label: '05:00 PM – 10:00 PM (5 hrs)', value: '17:00', group: 'Evening' },
  { label: '06:00 PM – 10:00 PM (4 hrs)', value: '18:00', group: 'Evening' },
  { label: '07:00 PM – 10:00 PM (3 hrs)', value: '19:00', group: 'Evening' },
];

// Format Date → "YYYY-MM-DD"
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Format Date → "Month Day, Year" for display label
function toDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface EventType {
  id: number; event_type: string; price: number;
  max_capacity: number; people_per_table: number; description: string;
}

export default function BookScreen() {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedET, setSelectedET] = useState<EventType | null>(null);
  const [description, setDescription] = useState('');
  const [guests, setGuests] = useState('');
  const [date, setDate] = useState('');                    // "YYYY-MM-DD" sent to API
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [eventDetails, setEventDetails] = useState<Record<string, string>>({});
  const [sessionType, setSessionType] = useState<'half' | 'whole'>('half');
  const [availableRooms, setAvailableRooms] = useState<number | null>(null);
  const [loadingET, setLoadingET] = useState(true);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken('clientToken');
      if (!token) { router.replace('/signin'); return; }
      const orgToken = await getToken('organizerToken');
      if (orgToken) { Alert.alert('Organizers cannot access this page'); router.replace('/organizer'); return; }
      loadEventTypes();
    })();
  }, []);

  useEffect(() => {
    if (!selectedET || !guests || !date) { setAvailableRooms(null); return; }
    checkAvailability();
  }, [selectedET, guests, date]);

  const loadEventTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/event-types/`);
      if (res.ok) setEventTypes(await res.json());
    } catch {} finally { setLoadingET(false); }
  };

  const checkAvailability = async () => {
    setCheckingAvail(true);
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/client/check-availability/?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { await removeToken('clientToken'); router.replace('/signin'); return; }
      if (res.ok) { const d = await res.json(); setAvailableRooms(d.available_rooms); }
    } catch {} finally { setCheckingAvail(false); }
  };

  const onDateChange = (event: DateTimePickerEvent, picked?: Date) => {
    // On Android the picker closes itself; on iOS we close manually
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed') { setShowDatePicker(false); return; }
    if (picked) {
      setSelectedDate(picked);
      setDate(toDateString(picked));
    }
  };

  const handleSubmit = async () => {
    if (!selectedET || !description || !guests || !date || (!wholeDay && !time) || !paymentMethod) {
      Alert.alert('Please fill in all required fields'); return;
    }
    if (description.length < 10) { Alert.alert('Description must be at least 10 characters'); return; }
    setSubmitting(true);
    const token = await getToken('clientToken');
    if (!token) { router.replace('/signin'); return; }
    try {
      const res = await fetch(`${API_BASE}/bookings/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          event_type: selectedET.event_type, description,
          capacity: parseInt(guests), date,
          time: wholeDay ? '09:00' : time,
          whole_day: wholeDay,
          invited_emails: '', payment_method: paymentMethod,
          event_details: eventDetails,
        }),
      });
      if (res.status === 401) { await removeToken('clientToken'); router.replace('/signin'); return; }
      if (!res.ok) { const e = await res.json(); Alert.alert(e.message || 'Failed to create booking'); return; }
      const data = await res.json();
      if (paymentMethod === 'GCash') {
        router.push(`/payment?id=${data.booking_id}&amount=${data.total_amount}`);
      } else {
        Alert.alert('Booking created!', `Reference: ${data.reference_number}`);
        router.push('/(tabs)/bookings');
      }
    } catch { Alert.alert('Connection error'); }
    finally { setSubmitting(false); }
  };

  const tablesNeeded = selectedET && parseInt(guests) > 0
    ? Math.ceil(parseInt(guests) / selectedET.people_per_table) : 0;
  const wholeDay = sessionType === 'whole';
  const displayPrice = selectedET
    ? wholeDay ? selectedET.price * 2 * 0.8 : selectedET.price
    : 0;
  const occupancy = availableRooms !== null
    ? ((MAX_ROOMS - availableRooms) / MAX_ROOMS * 100).toFixed(0) : '0';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Venue */}
      <View style={s.venueCard}>
        <Ionicons name="location" size={16} color="#0ea5e9" />
        <Text style={s.venueText}>{VENUE}</Text>
      </View>

      {/* Notice */}
      <View style={s.notice}>
        <Text style={s.noticeTitle}>⚠️ Important Notice</Text>
        <Text style={s.noticeText}>• Morning session: 9:00 AM – 2:00 PM (latest start 11:00 AM)</Text>
        <Text style={s.noticeText}>• Evening session: 5:00 PM – 10:00 PM (latest start 7:00 PM)</Text>
        <Text style={s.noticeText}>• Morning events must conclude by 2:00 PM</Text>
        <Text style={s.noticeText}>• Evening events must conclude by 10:00 PM</Text>
      </View>

      <View style={s.form}>
        <Text style={s.formTitle}>Create Event Booking</Text>

        {/* Event Type */}
        <Text style={s.label}>Event Type *</Text>
        {loadingET ? (
          <View style={s.skeletonInput} />
        ) : eventTypes.length === 0 ? (
          <View style={s.errorBox}>
            <Text style={s.errorBoxText}>No event types available. Please contact support.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {eventTypes.map(et => (
              <TouchableOpacity
                key={et.id}
                style={[s.etBtn, selectedET?.id === et.id && s.etBtnActive]}
                onPress={() => { setSelectedET(et); setGuests(''); setEventDetails({}); }}
              >
                <Text style={[s.etBtnText, selectedET?.id === et.id && s.etBtnTextActive]}>
                  {et.event_type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {selectedET && (
          <View style={s.packageInfo}>
            <Text style={s.packageTitle}>Package Information</Text>
            <View style={s.packageGrid}>
              <View style={s.packageItem}>
                <Text style={s.packageLabel}>Price</Text>
                <Text style={s.packageVal}>₱{Number(selectedET.price).toLocaleString()}</Text>
              </View>
              <View style={s.packageItem}>
                <Text style={s.packageLabel}>Max Capacity</Text>
                <Text style={s.packageVal}>{selectedET.max_capacity} people</Text>
              </View>
              <View style={s.packageItem}>
                <Text style={s.packageLabel}>Per Table</Text>
                <Text style={s.packageVal}>{selectedET.people_per_table} people/table</Text>
              </View>
              {tablesNeeded > 0 && (
                <View style={s.packageItem}>
                  <Text style={s.packageLabel}>Tables Required</Text>
                  <Text style={[s.packageVal, { color: '#2563eb' }]}>
                    {tablesNeeded} table{tablesNeeded !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {!!selectedET.description && (
                <View style={[s.packageItem, { width: '100%' }]}>
                  <Text style={s.packageLabel}>Description</Text>
                  <Text style={s.packageDescVal}>{selectedET.description}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Event-specific details */}
        {selectedET && (() => {
          const et = selectedET.event_type.toLowerCase();
          const fields: { key: string; label: string; placeholder: string }[] =
            et.includes('birthday') ? [
              { key: 'celebrant_name', label: 'Celebrant Name *', placeholder: 'e.g. Ralph Villarojo' },
              { key: 'celebrant_age', label: 'Age *', placeholder: 'e.g. 18' },
            ] : et.includes('wedding') ? [
              { key: 'bride_name', label: "Bride's Name *", placeholder: 'e.g. Kassandra Mica' },
              { key: 'groom_name', label: "Groom's Name *", placeholder: 'e.g. Ralph Villarojo' },
            ] : et.includes('corporate') ? [
              { key: 'company_name', label: 'Company Name *', placeholder: 'e.g. Villarojo Corporation' },
              { key: 'event_title', label: 'Event Title *', placeholder: 'e.g. Annual General Meeting' },
            ] : et.includes('concert') ? [
              { key: 'artist_name', label: 'Artist / Band Name *', placeholder: 'e.g. Ralph Villarojo' },
              { key: 'genre', label: 'Genre *', placeholder: 'e.g. OPM, Jazz, Rock' },
            ] : [
              { key: 'honoree_name', label: 'Honoree / Guest of Honor *', placeholder: 'e.g. Kassandra Mica' },
              { key: 'occasion', label: 'Occasion *', placeholder: 'e.g. Graduation, Reunion' },
            ];
          return (
            <View style={s.detailsBox}>
              <Text style={s.detailsTitle}>🎉 {selectedET.event_type} Details</Text>
              {fields.map(f => (
                <View key={f.key}>
                  <Text style={s.label}>{f.label}</Text>
                  <TextInput
                    style={s.input}
                    value={eventDetails[f.key] || ''}
                    onChangeText={v => setEventDetails(prev => ({ ...prev, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor="#9ca3af"
                    keyboardType={f.key === 'celebrant_age' ? 'numeric' : 'default'}
                  />
                </View>
              ))}
            </View>
          );
        })()}

        {/* Description */}
        <Text style={s.label}>Event Description *</Text>
        <TextInput
          style={[s.input, s.textarea]} value={description} onChangeText={setDescription}
          placeholder="Please describe your event (theme, purpose, special requests, etc.)"
          placeholderTextColor="#9ca3af" multiline numberOfLines={4}
        />

        {/* Guests */}
        <Text style={s.label}>Number of Invited Guests *</Text>
        <TextInput
          style={s.input} value={guests}
          onChangeText={v => {
            const max = selectedET?.max_capacity || 500;
            const n = parseInt(v) || 0;
            if (n > max) { Alert.alert(`Maximum allowed guests is ${max}`); setGuests(String(max)); }
            else setGuests(v);
          }}
          keyboardType="numeric" placeholder="Enter number of guests"
          placeholderTextColor="#9ca3af"
        />

        {/* Session Type */}
        <Text style={s.label}>Session Type *</Text>
        <View style={{ marginBottom: 14 }}>
          {[
            { value: 'half', label: '½ Day Session', sub: 'Morning (9AM–2PM) or Evening (5PM–10PM)', badge: null },
            { value: 'whole', label: 'Whole Day Session', sub: '9:00 AM – 10:00 PM', badge: '20% OFF' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[s.sessionBtn, sessionType === opt.value && s.sessionBtnActive]}
              onPress={() => { setSessionType(opt.value as 'half' | 'whole'); setTime(''); }}
            >
              <View style={[s.radio, sessionType === opt.value && s.radioActive]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[s.sessionBtnText, sessionType === opt.value && s.sessionBtnTextActive]}>{opt.label}</Text>
                  {opt.badge && <View style={s.badge}><Text style={s.badgeText}>{opt.badge}</Text></View>}
                </View>
                <Text style={s.sessionSub}>{opt.sub}</Text>
                {selectedET && (
                  <Text style={s.sessionPrice}>
                    ₱{(opt.value === 'whole' ? selectedET.price * 2 * 0.8 : selectedET.price).toLocaleString()}
                    {opt.value === 'whole' && <Text style={s.sessionStrike}>  ₱{(selectedET.price * 2).toLocaleString()}</Text>}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date */}
        <View style={s.dateTimeRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Event Date *</Text>
            <TouchableOpacity style={s.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#6b7280" />
              <Text style={[s.dateBtnText, !date && s.dateBtnPlaceholder]}>
                {date ? toDisplayDate(selectedDate) : 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* iOS inline picker stays visible; Android shows modal on press */}
        {showDatePicker && (
          <View style={s.datePickerWrapper}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={new Date()}
              onChange={onDateChange}
              themeVariant="light"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={s.datePickerDone} onPress={() => setShowDatePicker(false)}>
                <Text style={s.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Time Slot — only shown for half day */}
        {!wholeDay && (
          <>
            <Text style={[s.label, { marginTop: 8 }]}>Time Slot *</Text>
        <View style={s.timeGroupSection}>
          <Text style={s.timeGroupLabel}>Morning (ends 2:00 PM)</Text>
          {TIME_SLOTS.filter(ts => ts.group === 'Morning').map(ts => (
            <TouchableOpacity
              key={ts.value}
              style={[s.timeSlot, time === ts.value && s.timeSlotActive]}
              onPress={() => setTime(ts.value)}
            >
              <View style={[s.timeRadio, time === ts.value && s.timeRadioActive]} />
              <Text style={[s.timeSlotText, time === ts.value && s.timeSlotTextActive]}>
                {ts.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[s.timeGroupLabel, { marginTop: 10 }]}>Evening (ends 10:00 PM)</Text>
          {TIME_SLOTS.filter(ts => ts.group === 'Evening').map(ts => (
            <TouchableOpacity
              key={ts.value}
              style={[s.timeSlot, time === ts.value && s.timeSlotActive]}
              onPress={() => setTime(ts.value)}
            >
              <View style={[s.timeRadio, time === ts.value && s.timeRadioActive]} />
              <Text style={[s.timeSlotText, time === ts.value && s.timeSlotTextActive]}>
                {ts.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={s.timeHint}>Morning sessions conclude by 2:00 PM • Evening sessions conclude by 10:00 PM</Text>
          </View>
          </>
        )}
        {wholeDay && (
          <View style={s.wholeDayBanner}>
            <Text style={s.wholeDayBannerText}>🌅 9:00 AM – 🌙 10:00 PM (Full Day Covered)</Text>
          </View>
        )}

        {/* Availability */}
        {checkingAvail && (
          <View style={s.availRow}>
            <ActivityIndicator color="#2563eb" size="small" />
            <Text style={s.availText}>Checking room availability...</Text>
          </View>
        )}

        {availableRooms !== null && !checkingAvail && (
          <View style={s.availCard}>
            <Text style={s.availTitle}>Availability & Payment</Text>

            <View style={s.availGrid}>
              <View style={s.availItem}>
                <Text style={s.availLabel}>Rooms Available</Text>
                <Text style={s.availVal}>{availableRooms} / {MAX_ROOMS}</Text>
              </View>
              <View style={s.availItem}>
                <Text style={s.availLabel}>Occupancy</Text>
                <Text style={[s.availVal, { color: '#b45309' }]}>{occupancy}%</Text>
              </View>
              <View style={s.availItem}>
                <Text style={s.availLabel}>Status</Text>
                <Text style={[s.availVal, { color: availableRooms > 0 ? '#059669' : '#dc2626', fontSize: 14 }]}>
                  {availableRooms === 0 ? 'Fully Booked' : availableRooms === 1 ? 'Almost Full' : 'Available'}
                </Text>
              </View>
            </View>

            {availableRooms > 0 && selectedET && (
              <>
                <View style={s.priceBox}>
                  <Text style={s.priceLabel}>Total Price</Text>
                  <Text style={s.priceVal}>₱{Number(displayPrice).toLocaleString()}</Text>
                  {wholeDay && <Text style={[s.priceSub, { textDecorationLine: 'line-through' }]}>₱{Number(selectedET.price * 2).toLocaleString()}</Text>}
                  <Text style={s.priceSub}>{selectedET.event_type} — {wholeDay ? 'Whole Day (20% off)' : 'Half Day'}</Text>
                </View>

                <Text style={s.label}>Payment Method *</Text>
                {['Cash', 'GCash'].map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[s.payBtn, paymentMethod === m && s.payBtnActive]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <View style={[s.radio, paymentMethod === m && s.radioActive]} />
                    <Text style={[s.payBtnText, paymentMethod === m && s.payBtnTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[s.submitBtn, (submitting || !paymentMethod) && s.submitBtnDisabled]}
                  onPress={handleSubmit} disabled={submitting || !paymentMethod}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.submitBtnText}>Confirm & Submit Booking</Text>
                  }
                </TouchableOpacity>
              </>
            )}

            {availableRooms === 0 && (
              <Text style={s.fullyBooked}>Sorry — no rooms available for the selected date.</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  content: { padding: 16, paddingBottom: 40 },

  venueCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  venueText: { flex: 1, fontSize: 13, color: '#374151' },

  notice: { backgroundColor: '#fffbeb', borderLeftWidth: 4, borderLeftColor: '#f59e0b', borderRadius: 10, padding: 14, marginBottom: 16 },
  noticeTitle: { fontWeight: '700', color: '#92400e', marginBottom: 6, fontSize: 14 },
  noticeText: { fontSize: 13, color: '#92400e', marginBottom: 2 },

  form: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },

  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1f2937', marginBottom: 14 },
  textarea: { height: 100, textAlignVertical: 'top' },

  skeletonInput: { height: 44, backgroundColor: '#f3f4f6', borderRadius: 10, marginBottom: 14 },
  errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorBoxText: { color: '#b91c1c', fontSize: 13 },

  etBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', marginRight: 8, backgroundColor: '#f9fafb' },
  etBtnActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  etBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  etBtnTextActive: { color: '#fff' },

  packageInfo: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 12, padding: 14, marginBottom: 14 },
  packageTitle: { fontSize: 13, fontWeight: '700', color: '#1e40af', marginBottom: 12 },
  packageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  packageItem: { width: '47%' },
  packageLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  packageVal: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  packageDescVal: { fontSize: 13, color: '#374151' },

  // Date picker
  dateTimeRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#fff',
  },
  dateBtnText: { fontSize: 14, color: '#1f2937', flex: 1 },
  dateBtnPlaceholder: { color: '#9ca3af' },
  datePickerWrapper: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: '#e5e7eb', marginBottom: 14, overflow: 'hidden',
  },
  datePickerDone: {
    alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  datePickerDoneText: { color: '#2563eb', fontWeight: '700', fontSize: 15 },

  sessionBtn: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10, backgroundColor: '#f9fafb' },
  sessionBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  sessionBtnText: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  sessionBtnTextActive: { color: '#15803d' },
  sessionSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sessionPrice: { fontSize: 14, fontWeight: '700', color: '#15803d', marginTop: 4 },
  sessionStrike: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  badge: { backgroundColor: '#16a34a', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  wholeDayBanner: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', borderRadius: 10, padding: 12, marginBottom: 14, alignItems: 'center' },
  wholeDayBannerText: { color: '#15803d', fontWeight: '600', fontSize: 14 },

  // Time slots
  timeGroupSection: { marginBottom: 14 },
  timeGroupLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  timeSlot: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 6, backgroundColor: '#f9fafb' },
  timeSlotActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  timeRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#d1d5db' },
  timeRadioActive: { borderColor: '#2563eb', backgroundColor: '#2563eb' },
  timeSlotText: { fontSize: 14, color: '#374151' },
  timeSlotTextActive: { color: '#2563eb', fontWeight: '600' },
  timeHint: { fontSize: 11, color: '#6b7280', marginTop: 6 },

  // Availability
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  availText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  availCard: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  availTitle: { fontSize: 17, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  availGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  availItem: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  availLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4, textAlign: 'center' },
  availVal: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },

  priceBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  priceLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  priceVal: { fontSize: 32, fontWeight: 'bold', color: '#059669' },
  priceSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  payBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginBottom: 10 },
  payBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db' },
  radioActive: { borderColor: '#2563eb', backgroundColor: '#2563eb' },
  payBtnText: { fontSize: 15, fontWeight: '500', color: '#1f2937' },
  payBtnTextActive: { color: '#1d4ed8', fontWeight: '700' },

  submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { backgroundColor: '#9ca3af' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fullyBooked: { textAlign: 'center', color: '#dc2626', fontWeight: '600', fontSize: 15, marginTop: 8 },
});
