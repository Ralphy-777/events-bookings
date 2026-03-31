import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

interface Notif {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = await getToken('clientToken');
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications);
        setUnread(data.unread_count);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async () => {
    const token = await getToken('clientToken');
    if (!token) return;
    await fetch(`${API_BASE}/notifications/read/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setUnread(0);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const clearAll = () => {
    Alert.alert('Clear Notifications', 'Remove all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive', onPress: async () => {
          const token = await getToken('clientToken');
          if (!token) return;
          await fetch(`${API_BASE}/notifications/clear/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotifs([]);
          setUnread(0);
        },
      },
    ]);
  };

  useEffect(() => {
    if (!loading && unread > 0) markRead();
  }, [loading]);

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.title}>Notifications</Text>
        {notifs.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={s.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifs.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-off-outline" size={56} color="#d1d5db" />
          <Text style={s.emptyText}>No notifications yet</Text>
          <Text style={s.emptySubText}>You'll be notified when your booking status changes</Text>
        </View>
      ) : (
        notifs.map(n => (
          <View key={n.id} style={[s.card, !n.is_read && s.cardUnread]}>
            <View style={s.cardRow}>
              <Ionicons
                name={n.is_read ? 'notifications-outline' : 'notifications'}
                size={20}
                color={n.is_read ? '#9ca3af' : '#0ea5e9'}
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[s.message, !n.is_read && s.messageUnread]}>{n.message}</Text>
                <Text style={s.time}>
                  {new Date(n.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  clearBtn: { fontSize: 13, color: '#ef4444', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#6b7280' },
  emptySubText: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardUnread: { backgroundColor: '#eff6ff', borderLeftWidth: 3, borderLeftColor: '#0ea5e9' },
  cardRow: { flexDirection: 'row', gap: 10 },
  message: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  messageUnread: { color: '#1f2937', fontWeight: '600' },
  time: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
});
