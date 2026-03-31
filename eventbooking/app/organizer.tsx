import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getToken, removeToken, clearAllTokens } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

type Tab = 'pending' | 'confirmed' | 'declined' | 'reviews';

interface Booking {
  id: number; user: string; event_type: string;
  capacity: number; date: string; time: string; status: string;
}

interface Reply {
  id: number; user: string; is_organizer: boolean; comment: string; created_at: string;
}

interface ReviewItem {
  id: number; user: string; rating: number; comment: string;
  event_type: string | null; created_at: string; replies: Reply[];
}

const TAB_COLORS: Record<Tab, { border: string; text: string }> = {
  pending:   { border: '#d97706', text: '#92400e' },
  confirmed: { border: '#059669', text: '#065f46' },
  declined:  { border: '#64748b', text: '#334155' },
  reviews:   { border: '#eab308', text: '#713f12' },
};

export default function OrganizerScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const token = await getToken('organizerToken');
    const clientToken = await getToken('clientToken');
    if (clientToken) { Alert.alert('Clients cannot access organizer dashboard'); router.replace('/(tabs)'); return; }
    if (!token) { router.replace('/signin'); return; }
    try {
      const res = await fetch(`${API_BASE}/bookings/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { await removeToken('organizerToken'); router.replace('/signin'); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch { Alert.alert('Failed to load bookings'); }
    finally { setLoading(false); }
  }, []);

  const loadReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews/`);
      if (res.ok) setReviews(await res.json());
    } catch {}
  };

  useEffect(() => { fetchBookings(); loadReviews(); }, []);

  const handleStatus = async (id: number, status: string) => {
    const token = await getToken('organizerToken');
    if (!token) { router.replace('/signin'); return; }
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        Alert.alert(`Booking ${status} successfully!`);
        fetchBookings();
        if (status === 'confirmed') setActiveTab('confirmed');
        else if (status === 'declined') setActiveTab('declined');
      } else Alert.alert('Failed to update booking');
    } catch { Alert.alert('Connection error'); }
  };

  const handleReply = async (reviewId: number) => {
    if (!replyText.trim()) return;
    const token = await getToken('organizerToken');
    setReplySubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/reply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: replyText }),
      });
      if (res.ok) { setReplyingTo(null); setReplyText(''); loadReviews(); }
      else { const d = await res.json(); Alert.alert(d.message || 'Failed to reply'); }
    } catch { Alert.alert('Error posting reply'); }
    finally { setReplySubmitting(false); }
  };

  const handleDeleteReply = (replyId: number) => {
    Alert.alert('Delete Reply', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const token = await getToken('organizerToken');
        await fetch(`${API_BASE}/reviews/replies/${replyId}/delete/`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
        });
        loadReviews();
      }},
    ]);
  };

  const handleLogout = async () => {
    await clearAllTokens();
    router.replace('/signin');
  };

  const formatTime = (t: string) => {
    if (!t) return 'N/A';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (d: string) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search || b.event_type.toLowerCase().includes(q) || b.user.toLowerCase().includes(q) || b.date.includes(q);
    const matchType = !eventFilter || b.event_type === eventFilter;
    return matchSearch && matchType && b.status === activeTab;
  });

  const counts = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    declined: bookings.filter(b => b.status === 'declined').length,
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.date) >= today).length;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Organizer Dashboard</Text>
          <Text style={s.headerSub}>Manage bookings & events</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: 'Total', val: bookings.length, color: '#1f2937' },
            { label: 'Pending', val: counts.pending, color: '#d97706' },
            { label: 'Confirmed', val: counts.confirmed, color: '#059669' },
            { label: 'Upcoming', val: upcoming, color: '#2563eb' },
          ].map(stat => (
            <View key={stat.label} style={s.statCard}>
              <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Search — hide on reviews tab */}
        {activeTab !== 'reviews' && (
          <>
            <View style={s.searchBox}>
              <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                style={s.searchInput} value={search} onChangeText={setSearch}
                placeholder="Search event, client, date..." placeholderTextColor="#9ca3af"
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
              {['', 'Wedding', 'Birthday', 'Conference', 'Corporate Event', 'Concert'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[s.filterBtn, eventFilter === type && s.filterBtnActive]}
                  onPress={() => setEventFilter(type)}
                >
                  <Text style={[s.filterBtnText, eventFilter === type && s.filterBtnTextActive]}>
                    {type || 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={s.tabs}>
            {(['pending', 'confirmed', 'declined', 'reviews'] as Tab[]).map(tab => {
              const c = TAB_COLORS[tab];
              const label = tab === 'reviews'
                ? `⭐ Reviews (${reviews.length})`
                : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${counts[tab as keyof typeof counts] ?? 0})`;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[s.tab, activeTab === tab && { borderBottomColor: c.border, borderBottomWidth: 2 }]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[s.tabText, activeTab === tab && { color: c.text, fontWeight: '700' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Reviews Tab */}
        {activeTab === 'reviews' ? (
          reviews.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyText}>No reviews yet</Text></View>
          ) : (
            reviews.map(r => (
              <View key={r.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{r.user}</Text>
                    {r.event_type && <Text style={s.cardUser}>{r.event_type}</Text>}
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    {[1,2,3,4,5].map(s2 => (
                      <Text key={s2} style={{ fontSize: 16, color: r.rating >= s2 ? '#eab308' : '#d1d5db' }}>★</Text>
                    ))}
                  </View>
                </View>
                {r.comment ? <Text style={s.reviewComment}>"{r.comment}"</Text> : null}
                <Text style={s.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</Text>

                {/* Replies */}
                {r.replies?.length > 0 && (
                  <View style={s.repliesContainer}>
                    {r.replies.map(rp => (
                      <View key={rp.id} style={s.replyCard}>
                        <View style={s.replyHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={s.replyUser}>{rp.user}</Text>
                            {rp.is_organizer && (
                              <View style={s.orgBadge}>
                                <Text style={s.orgBadgeText}>Organizer</Text>
                              </View>
                            )}
                          </View>
                          <TouchableOpacity onPress={() => handleDeleteReply(rp.id)}>
                            <Text style={s.deleteText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={s.replyComment}>{rp.comment}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Reply input */}
                {replyingTo === r.id ? (
                  <View style={s.replyInputRow}>
                    <TextInput
                      style={s.replyInput}
                      value={replyText}
                      onChangeText={setReplyText}
                      placeholder="Write a reply..."
                      placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                      style={[s.replyBtn, (!replyText.trim() || replySubmitting) && { opacity: 0.5 }]}
                      onPress={() => handleReply(r.id)}
                      disabled={!replyText.trim() || replySubmitting}
                    >
                      <Text style={s.replyBtnText}>{replySubmitting ? '...' : 'Send'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.cancelReplyBtn} onPress={() => { setReplyingTo(null); setReplyText(''); }}>
                      <Text style={s.cancelReplyText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => { setReplyingTo(r.id); setReplyText(''); }}>
                    <Text style={s.replyToggle}>↩ Reply</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )
        ) : loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>No {activeTab} bookings</Text>
          </View>
        ) : (
          filtered.map(b => (
            <View key={b.id} style={s.card}>
              <View style={s.cardTop}>
                <View>
                  <Text style={s.cardTitle}>{b.event_type}</Text>
                  <Text style={s.cardUser}>{b.user}</Text>
                </View>
                <View style={s.guestBadge}>
                  <Text style={s.guestText}>{b.capacity} guests</Text>
                </View>
              </View>
              <View style={s.cardDetails}>
                <View style={s.detailRow}>
                  <Text style={s.detailIcon}>📅</Text>
                  <Text style={s.detailText}>{formatDate(b.date)}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailIcon}>⏰</Text>
                  <Text style={s.detailText}>{formatTime(b.time)}</Text>
                </View>
              </View>
              {activeTab === 'pending' && (
                <View style={s.cardActions}>
                  <TouchableOpacity style={s.acceptBtn} onPress={() => handleStatus(b.id, 'confirmed')}>
                    <Text style={s.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.declineBtn} onPress={() => handleStatus(b.id, 'declined')}>
                    <Text style={s.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  headerSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  logoutBtn: { backgroundColor: '#1f2937', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  statVal: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937' },
  filterRow: { marginBottom: 14 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  filterBtnText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  filterBtnTextActive: { color: '#fff' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  tab: { paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  cardUser: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  guestBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  guestText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  cardDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailIcon: { fontSize: 14 },
  detailText: { fontSize: 13, color: '#374151' },
  cardActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#059669', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  declineBtn: { flex: 1, backgroundColor: '#dc2626', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  declineBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  // Review styles
  reviewComment: { fontSize: 13, color: '#4b5563', fontStyle: 'italic', marginBottom: 4 },
  reviewDate: { fontSize: 11, color: '#9ca3af', marginBottom: 8 },
  repliesContainer: { borderLeftWidth: 2, borderLeftColor: '#e5e7eb', paddingLeft: 10, marginBottom: 8, gap: 6 },
  replyCard: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 8 },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  replyUser: { fontSize: 12, fontWeight: '600', color: '#374151' },
  orgBadge: { backgroundColor: '#e0e7ff', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  orgBadgeText: { fontSize: 9, color: '#4338ca', fontWeight: '700' },
  deleteText: { fontSize: 11, color: '#f87171' },
  replyComment: { fontSize: 12, color: '#4b5563' },
  replyToggle: { fontSize: 12, color: '#4f46e5', marginTop: 4 },
  replyInputRow: { flexDirection: 'row', gap: 6, marginTop: 6, alignItems: 'center' },
  replyInput: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 13, color: '#1f2937' },
  replyBtn: { backgroundColor: '#4f46e5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  replyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelReplyBtn: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  cancelReplyText: { color: '#6b7280', fontSize: 13 },
});
