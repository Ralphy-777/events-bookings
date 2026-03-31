import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '@/constants/api';

const EVENT_TYPES = ['Wedding', 'Birthday', 'Conference', 'Corporate Event'];

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, [filter]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(events); return; }
    const q = search.toLowerCase();
    setFiltered(events.filter(e =>
      e.event_type.toLowerCase().includes(q) ||
      e.user.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
    ));
  }, [search, events]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const url = filter
        ? `${API_BASE}/events/public/?type=${filter}&status=confirmed`
        : `${API_BASE}/events/public/?status=confirmed`;
      const res = await fetch(url);
      const data = await res.json();
      const confirmed = data.filter((e: any) => e.status === 'confirmed');
      setEvents(confirmed);
      setFiltered(confirmed);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Confirmed Public Events</Text>

      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search events..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
        {['', ...EVENT_TYPES].map((type) => (
          <TouchableOpacity
            key={type}
            style={[s.filterBtn, filter === type && s.filterBtnActive]}
            onPress={() => setFilter(type)}
          >
            <Text style={[s.filterBtnText, filter === type && s.filterBtnTextActive]}>
              {type || 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#0ea5e9" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🎉</Text>
          <Text style={s.emptyText}>No events found</Text>
        </View>
      ) : (
        filtered.map((event) => (
          <View key={event.id} style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.badge}>
                <Text style={s.badgeText}>{event.event_type}</Text>
              </View>
              <View style={s.confirmedBadge}>
                <Text style={s.confirmedText}>✅ Confirmed</Text>
              </View>
            </View>
            <Text style={s.cardHost}>Hosted by {event.user}</Text>
            {event.description ? (
              <Text style={s.cardDesc} numberOfLines={2}>{event.description}</Text>
            ) : null}
            <View style={s.cardDetails}>
              <View style={s.detailRow}>
                <Ionicons name="calendar" size={14} color="#0ea5e9" />
                <Text style={s.detailText}>{event.date}</Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="time" size={14} color="#0ea5e9" />
                <Text style={s.detailText}>{event.time}</Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="people" size={14} color="#0ea5e9" />
                <Text style={s.detailText}>{event.capacity} guests</Text>
              </View>
              <View style={s.detailRow}>
                <Ionicons name="location" size={14} color="#0ea5e9" />
                <Text style={s.detailText} numberOfLines={1}>
                  {event.location || "Ralphy's Venue, Cebu City"}
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 14, textAlign: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937' },
  filterRow: { marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', marginRight: 8,
  },
  filterBtnActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  filterBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  filterBtnTextActive: { color: '#fff' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6b7280' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badge: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#0369a1', fontSize: 12, fontWeight: '600' },
  confirmedBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  confirmedText: { color: '#15803d', fontSize: 12, fontWeight: '600' },
  cardHost: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6b7280', marginBottom: 10, lineHeight: 18 },
  cardDetails: { gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: '#374151', flex: 1 },
});
