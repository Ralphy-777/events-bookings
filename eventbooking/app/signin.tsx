import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

const LOCK_DURATION = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type ForgotStep = 'email' | 'code' | 'newpass';

export default function SignIn() {
  const router = useRouter();
  const [role, setRole] = useState<'organizer' | 'client'>('organizer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Forgot password state
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendCooldown = () => {
    setResendCooldown(60);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(resendTimerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    (async () => {
      const a = parseInt((await AsyncStorage.getItem('loginAttempts')) || '0');
      const l = parseInt((await AsyncStorage.getItem('lockUntil')) || '0');
      setAttempts(a);
      if (l > Date.now()) setLockUntil(l);
    })();
  }, []);

  useEffect(() => {
    if (!lockUntil) { setRemaining(''); return; }
    timerRef.current = setInterval(() => {
      const r = lockUntil - Date.now();
      if (r <= 0) {
        setLockUntil(null); setAttempts(0); setRemaining('');
        AsyncStorage.multiRemove(['lockUntil', 'loginAttempts']);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        const m = Math.floor(r / 60000);
        const s = Math.floor((r % 60000) / 1000);
        setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lockUntil]);

  const handleSubmit = async () => {
    if (lockUntil && lockUntil > Date.now()) {
      setError(`Account locked. Try again in ${remaining}`); return;
    }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        await AsyncStorage.multiRemove(['loginAttempts', 'lockUntil']);
        if (data.is_organizer) {
          await saveToken('organizerToken', data.access);
          router.replace('/organizer');
        } else {
          await saveToken('clientToken', data.access);
          // Store user's full name for review ownership checks
          try {
            const profileRes = await fetch(`${API_BASE}/profile/`, {
              headers: { Authorization: `Bearer ${data.access}` },
            });
            if (profileRes.ok) {
              const profile = await profileRes.json();
              await saveToken('clientUserName', `${profile.first_name} ${profile.last_name}`);
              await saveToken('clientUserId', String(profile.id ?? ''));
            }
          } catch {}
          router.replace('/(tabs)');
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        await AsyncStorage.setItem('loginAttempts', String(newAttempts));
        if (newAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCK_DURATION;
          setLockUntil(until);
          await AsyncStorage.setItem('lockUntil', String(until));
          setError('Too many failed attempts. Locked for 5 minutes.');
        } else {
          setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password handlers ──
  const openForgot = () => {
    setForgotEmail(email);
    setForgotCode(''); setNewPassword(''); setConfirmNewPassword('');
    setForgotError(''); setForgotMsg('');
    setForgotStep('email');
    setForgotVisible(true);
  };

  const closeForgot = () => {
    setForgotVisible(false);
    setForgotEmail(''); setForgotCode(''); setNewPassword(''); setConfirmNewPassword('');
    setForgotError(''); setForgotMsg('');
    setResendCooldown(0);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
  };

  const handleForgotSendCode = async () => {
    setForgotError(''); setForgotMsg(''); setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotMsg(data.message);
      setForgotStep('code');
      startResendCooldown();
    } catch {
      setForgotError('Connection error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResend = async () => {
    setForgotError(''); setForgotMsg(''); setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE}/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotMsg('A new reset code has been sent to your email.');
      setForgotCode('');
      startResendCooldown();
    } catch {
      setForgotError('Connection error');
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotVerifyCode = async () => {
    if (forgotCode.length !== 6) { setForgotError('Enter the 6-digit code'); return; }
    setForgotError(''); setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-reset-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setForgotStep('newpass');
      } else {
        setForgotError(data.message || 'Invalid code');
      }
    } catch {
      setForgotError('Connection error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async () => {
    setForgotError('');
    if (newPassword !== confirmNewPassword) { setForgotError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setForgotError('Password must be at least 6 characters'); return; }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg(data.message);
        setTimeout(closeForgot, 2000);
      } else {
        setForgotError(data.message || 'Reset failed');
      }
    } catch {
      setForgotError('Connection error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.title}>Sign In</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={s.homeBtn}>
            <Text style={s.homeBtnText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

        {/* Role toggle */}
        <View style={s.toggle}>
          {(['organizer', 'client'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[s.toggleBtn, role === r && (r === 'organizer' ? s.toggleOrg : s.toggleClient)]}
              onPress={() => setRole(r)}
            >
              <Text style={[s.toggleText, role === r && s.toggleTextActive]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.subtitle}>Sign In as {role === 'organizer' ? 'Organizer' : 'Client'}</Text>

        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input} value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />

        <View style={s.passwordRow}>
          <Text style={s.label}>Password</Text>
          <TouchableOpacity onPress={openForgot}>
            <Text style={s.forgotLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={s.input} value={password} onChangeText={setPassword}
          secureTextEntry placeholderTextColor="#9ca3af"
        />

        {!!error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity
          style={[s.btn, (loading || !!lockUntil) && s.btnDisabled]}
          onPress={handleSubmit} disabled={loading || !!lockUntil}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
        </TouchableOpacity>

        {role === 'client' && (
          <View style={s.registerSection}>
            <Text style={s.registerText}>Don't have an account?</Text>
            <TouchableOpacity style={s.registerBtn} onPress={() => router.push('/register')}>
              <Text style={s.registerBtnText}>Register as Client</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Forgot Password Modal ── */}
      <Modal visible={forgotVisible} transparent animationType="fade" onRequestClose={closeForgot}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>

            {forgotStep === 'email' && (
              <>
                <Text style={s.modalTitle}>Forgot Password</Text>
                <Text style={s.modalDesc}>Enter your email and we'll send you a reset code.</Text>
                <Text style={s.label}>Email</Text>
                <TextInput
                  style={s.input} value={forgotEmail} onChangeText={setForgotEmail}
                  keyboardType="email-address" autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
                {!!forgotError && <Text style={s.error}>{forgotError}</Text>}
                <TouchableOpacity
                  style={[s.btn, forgotLoading && s.btnDisabled]}
                  onPress={handleForgotSendCode} disabled={forgotLoading}
                >
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send Reset Code</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={closeForgot}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {forgotStep === 'code' && (
              <>
                <Text style={s.modalTitle}>Enter Reset Code</Text>
                <Text style={s.modalDesc}>{forgotMsg}</Text>
                <Text style={s.modalDesc}>Check your email: <Text style={s.boldText}>{forgotEmail}</Text></Text>
                <Text style={s.label}>6-Digit Code</Text>
                <TextInput
                  style={[s.input, s.codeInput]} value={forgotCode} onChangeText={setForgotCode}
                  keyboardType="number-pad" maxLength={6}
                  placeholderTextColor="#9ca3af" autoFocus
                />
                {!!forgotError && <Text style={s.error}>{forgotError}</Text>}
                {!!forgotMsg && <Text style={s.successText}>{forgotMsg}</Text>}
                <TouchableOpacity style={[s.btn, forgotLoading && s.btnDisabled]} onPress={handleForgotVerifyCode} disabled={forgotLoading}>
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Verify Code</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.resendBtn, (resendCooldown > 0 || resendLoading) && s.resendBtnDisabled]}
                  onPress={handleForgotResend}
                  disabled={resendCooldown > 0 || resendLoading}
                >
                  {resendLoading
                    ? <ActivityIndicator color="#2563eb" size="small" />
                    : <Text style={[s.resendText, resendCooldown > 0 && s.resendTextDisabled]}>
                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend"}
                      </Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setForgotStep('email')}>
                  <Text style={s.cancelText}>← Back</Text>
                </TouchableOpacity>
              </>
            )}

            {forgotStep === 'newpass' && (
              <>
                <Text style={s.modalTitle}>Set New Password</Text>
                <Text style={s.modalDesc}>Choose a new password for your account.</Text>
                <Text style={s.label}>New Password</Text>
                <TextInput
                  style={s.input} value={newPassword} onChangeText={setNewPassword}
                  secureTextEntry placeholderTextColor="#9ca3af"
                />
                <Text style={s.label}>Confirm Password</Text>
                <TextInput
                  style={s.input} value={confirmNewPassword} onChangeText={setConfirmNewPassword}
                  secureTextEntry placeholderTextColor="#9ca3af"}
                />
                {!!forgotError && <Text style={s.error}>{forgotError}</Text>}
                {!!forgotMsg && <Text style={s.successText}>{forgotMsg}</Text>}
                <TouchableOpacity
                  style={[s.btn, s.btnGreen, forgotLoading && s.btnDisabled]}
                  onPress={handleForgotReset} disabled={forgotLoading}
                >
                  {forgotLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Reset Password</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setForgotStep('code')}>
                  <Text style={s.cancelText}>← Back</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7BBDE8', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  homeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' },
  homeBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  toggle: { flexDirection: 'row', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f3f4f6' },
  toggleOrg: { backgroundColor: '#2563eb' },
  toggleClient: { backgroundColor: '#16a34a' },
  toggleText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  toggleTextActive: { color: '#fff' },
  subtitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#1f2937', marginBottom: 20 },
  passwordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  forgotLink: { fontSize: 12, color: '#2563eb', fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1f2937', marginBottom: 14 },
  codeInput: { fontSize: 24, textAlign: 'center', letterSpacing: 8, fontWeight: 'bold' },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 12 },
  successText: { color: '#16a34a', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  btnGreen: { backgroundColor: '#16a34a' },
  btnDisabled: { backgroundColor: '#9ca3af' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  registerSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16 },
  registerText: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 10 },
  registerBtn: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  registerBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 6 },
  modalDesc: { fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 20 },
  boldText: { fontWeight: '700', color: '#1f2937' },
  cancelText: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  resendBtn: { paddingVertical: 10, alignItems: 'center', marginBottom: 4 },
  resendBtnDisabled: { opacity: 0.5 },
  resendText: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  resendTextDisabled: { color: '#9ca3af' },
});
