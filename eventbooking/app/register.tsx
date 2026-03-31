import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { saveToken } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '',
    address: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<'form' | 'verify' | 'success'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [code, setCode] = useState('');

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCooldown = () => {
    setResendCooldown(60);
    timerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const [showDobPicker, setShowDobPicker] = useState(false);
  const [dobDate, setDobDate] = useState<Date>(new Date(2000, 0, 1));

  const onDobChange = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === 'android') setShowDobPicker(false);
    if (event.type === 'dismissed') { setShowDobPicker(false); return; }
    if (picked) {
      setDobDate(picked);
      const y = picked.getFullYear();
      const m = String(picked.getMonth() + 1).padStart(2, '0');
      const d = String(picked.getDate()).padStart(2, '0');
      set('date_of_birth', `${y}-${m}-${d}`);
    }
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name, last_name: form.last_name,
          date_of_birth: form.date_of_birth, address: form.address,
          email: form.email, password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.requires_verification) {
        setPendingEmail(form.email);
        setStep('verify');
        startCooldown();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code }),
      });
      const data = await res.json();
      if (res.ok && data.access) {
        await saveToken('clientToken', data.access);
        setStep('success');
        setTimeout(() => router.replace('/(tabs)'), 2500);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMsg(''); setError(''); setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE}/resend-verification-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      setResendMsg(data.message);
      setCode('');
      startCooldown();
    } catch {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setResendLoading(false);
    }
  };

  const fields: { key: string; label: string; placeholder: string; secure?: boolean; keyboard?: any }[] = [
    { key: 'first_name', label: 'First Name', placeholder: 'Enter first name' },
    { key: 'last_name', label: 'Last Name', placeholder: 'Enter last name' },
    { key: 'email', label: 'Email', placeholder: 'Enter email', keyboard: 'email-address' },
    { key: 'address', label: 'Address', placeholder: 'Enter address' },
    { key: 'password', label: 'Password', placeholder: 'Enter password', secure: true },
    { key: 'confirmPassword', label: 'Retype Password', placeholder: 'Confirm password', secure: true },
  ];

  if (step === 'success') {
    return (
      <View style={s.container}>
        <View style={[s.card, { alignItems: 'center', paddingVertical: 48 }]}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#16a34a', marginBottom: 8 }}>Registration Successful!</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 }}>
            Welcome! Your account has been created.{`\n`}Redirecting you to the home page...
          </Text>
          <ActivityIndicator color="#16a34a" size="large" style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  if (step === 'verify') {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.title}>Verify Your Email</Text>
          <Text style={s.verifyDesc}>
            We sent a 6-digit code to{'\n'}
            <Text style={s.verifyEmail}>{pendingEmail}</Text>
          </Text>

          <Text style={s.label}>Verification Code</Text>
          <TextInput
            style={[s.input, s.codeInput]}
            value={code}
            onChangeText={setCode}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          {!!error && <Text style={s.error}>{error}</Text>}
          {!!resendMsg && <Text style={s.successText}>{resendMsg}</Text>}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleVerify} disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Verify & Continue</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.resendBtn, (resendCooldown > 0 || resendLoading) && s.resendBtnDisabled]}
            onPress={handleResend}
            disabled={resendCooldown > 0 || resendLoading}
          >
            {resendLoading
              ? <ActivityIndicator color="#2563eb" size="small" />
              : <Text style={[s.resendText, resendCooldown > 0 && s.resendTextDisabled]}>
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend"}
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setStep('form'); setError(''); setCode(''); setResendMsg(''); }}>
            <Text style={s.backText}>← Back to registration</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.title}>Client Registration</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={s.homeBtn}>
            <Text style={s.homeBtnText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

        {/* First Name & Last Name */}
        {fields.slice(0, 2).map(f => (
          <View key={f.key}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput
              style={s.input}
              value={(form as any)[f.key]}
              onChangeText={v => set(f.key, v)}
              placeholder={f.placeholder}
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
            />
          </View>
        ))}

        {/* Date of Birth — native picker */}
        <Text style={s.label}>Date of Birth</Text>
        <TouchableOpacity style={s.dateBtn} onPress={() => setShowDobPicker(true)}>
          <Text style={[s.dateBtnText, !form.date_of_birth && s.dateBtnPlaceholder]}>
            {form.date_of_birth || 'Select date of birth'}
          </Text>
        </TouchableOpacity>
        {showDobPicker && (
          <View style={s.datePickerWrapper}>
            <DateTimePicker
              value={dobDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              maximumDate={new Date()}
              onChange={onDobChange}
              themeVariant="light"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={s.datePickerDone} onPress={() => setShowDobPicker(false)}>
                <Text style={s.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Remaining fields */}
        {fields.slice(2).map(f => (
          <View key={f.key}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput
              style={s.input}
              value={(form as any)[f.key]}
              onChangeText={v => set(f.key, v)}
              placeholder={f.placeholder}
              placeholderTextColor="#9ca3af"
              secureTextEntry={f.secure}
              keyboardType={f.keyboard || 'default'}
              autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'sentences'}
            />
          </View>
        ))}

        {!!error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={handleSubmit} disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Register</Text>}
        </TouchableOpacity>

        <Text style={s.signinText}>
          Already have an account?{' '}
          <Text style={s.signinLink} onPress={() => router.push('/signin')}>Sign In</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7BBDE8' },
  content: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  homeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' },
  homeBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1f2937', marginBottom: 14 },
  dateBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#f9fafb', marginBottom: 14 },
  dateBtnText: { fontSize: 14, color: '#1f2937' },
  dateBtnPlaceholder: { color: '#9ca3af' },
  datePickerWrapper: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 14, overflow: 'hidden' },
  datePickerDone: { alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  datePickerDoneText: { color: '#2563eb', fontWeight: '700', fontSize: 15 },
  codeInput: { fontSize: 24, textAlign: 'center', letterSpacing: 8, fontWeight: 'bold' },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 12 },
  btn: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  btnDisabled: { backgroundColor: '#9ca3af' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  signinText: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  signinLink: { color: '#2563eb', fontWeight: '600' },
  verifyDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  verifyEmail: { color: '#1f2937', fontWeight: '700' },
  backText: { fontSize: 13, color: '#2563eb', textAlign: 'center', marginTop: 8 },
  successText: { color: '#16a34a', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  resendBtn: { paddingVertical: 10, alignItems: 'center', marginBottom: 4 },
  resendBtnDisabled: { opacity: 0.5 },
  resendText: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  resendTextDisabled: { color: '#9ca3af' },
});
