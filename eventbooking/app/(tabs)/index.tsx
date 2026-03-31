import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { getToken, clearAllTokens } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

// Extract video ID from full embed or watch URL, then build iframe HTML
function toEmbedHtml(embedUrl: string): string {
  let videoId = '';
  if (embedUrl.includes('/embed/')) {
    videoId = embedUrl.split('/embed/')[1].split('?')[0];
  } else if (embedUrl.includes('watch?v=')) {
    videoId = embedUrl.split('watch?v=')[1].split('&')[0];
  } else if (embedUrl.includes('youtu.be/')) {
    videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
  } else {
    videoId = embedUrl;
  }
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&rel=0&playlist=${videoId}&origin=https://www.youtube.com`;
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;background:#000}iframe{width:100%;height:100%;border:none}</style></head><body><iframe src="${src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></body></html>`;
}

const VENUE = "Ralphy's Venue, Basak San Nicolas Villa Kalubihan Cebu City 6000";
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_ICONS: Record<string, string> = {
  Wedding: '💒', Birthday: '🎂', Corporate: '💼', Concert: '🎤', Other: '🎉',
};

interface Video {
  id: number; title: string; video_url: string;
  thumbnail_url: string; description: string; category: string; order: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingET, setLoadingET] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    checkAuth();
    loadEventTypes();
    loadVideos();
  }, []);

  const checkAuth = async () => {
    const clientToken = await getToken('clientToken');
    const orgToken = await getToken('organizerToken');
    setIsLoggedIn(!!clientToken || !!orgToken);
    setIsOrganizer(!!orgToken);
  };

  const loadEventTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/event-types/`);
      if (res.ok) setEventTypes(await res.json());
    } catch {} finally { setLoadingET(false); }
  };

  const loadVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/videos/`);
      if (res.ok) setVideos(await res.json());
    } catch {} finally { setLoadingVideos(false); }
  };

  const handleLogout = async () => {
    await clearAllTokens();
    setIsLoggedIn(false);
    setIsOrganizer(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* ── Navbar ── */}
      <View style={s.header}>
        <Text style={s.logo}>EventPro</Text>
        <View style={s.headerActions}>
          {isLoggedIn ? (
            <>
              {isOrganizer ? (
                <TouchableOpacity style={s.navBtn} onPress={() => router.push('/organizer')}>
                  <Text style={s.navBtnText}>Dashboard</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={s.navBtnGhost} onPress={() => router.push('/(tabs)/bookings')}>
                    <Text style={s.navBtnGhostText}>My Bookings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.navBtn} onPress={() => router.push('/book')}>
                    <Text style={s.navBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={s.navBtnGhost} onPress={handleLogout}>
                <Text style={s.navBtnGhostText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={s.navBtnGhost} onPress={() => router.push('/signin')}>
              <Text style={s.navBtnGhostText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Hero ── */}
      <View style={s.heroSection}>
        <View style={s.heroCard}>
          <Text style={s.heroTitle}>Create Unforgettable Events</Text>
          <Text style={s.heroSub}>
            Professional event management platform for organizers who demand excellence. Plan, manage, and execute flawless events.
          </Text>
          <View style={s.heroButtons}>
            <TouchableOpacity
              style={s.heroBtn}
              onPress={() => router.push(isLoggedIn ? '/book' : '/register')}
            >
              <Text style={s.heroBtnText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.heroBtn}
              onPress={() => router.push('/(tabs)/events')}
            >
              <Text style={s.heroBtnText}>View Events</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Event Types / Videos Section ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Our Event Types</Text>
        <Text style={s.sectionSub}>Explore our diverse range of event options</Text>

        <View style={s.carouselWrapper}>
          {loadingVideos ? (
            <View style={s.loadingBox}>
              <ActivityIndicator color="#0ea5e9" size="large" />
              <Text style={s.loadingText}>Loading videos...</Text>
            </View>
          ) : videos.length === 0 ? (
            // Fallback: show event type cards when no videos
            <>
              {loadingET ? (
                <ActivityIndicator color="#0ea5e9" style={{ marginVertical: 20 }} />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.etScroll}>
                  {eventTypes.map((et) => (
                    <View key={et.id} style={s.etCard}>
                      <Text style={s.etIcon}>{CATEGORY_ICONS[et.event_type] ?? '🎉'}</Text>
                      <Text style={s.etName}>{et.event_type}</Text>
                      <Text style={s.etPrice}>₱{Number(et.price).toLocaleString()}</Text>
                      <Text style={s.etCap}>Up to {et.max_capacity} guests</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={SCREEN_WIDTH - 32}
              decelerationRate="fast"
            >
              {videos.map((video) => (
                <View key={video.id} style={s.videoCard}>
                  {/* Card header: icon + title */}
                  <View style={s.videoCardHeader}>
                    <View style={s.videoIconBox}>
                      <Text style={s.videoIcon}>{CATEGORY_ICONS[video.category] ?? '🎉'}</Text>
                    </View>
                    <Text style={s.videoTitle} numberOfLines={1}>{video.title}</Text>
                  </View>

                  {/* Embedded video via WebView — full HTML iframe avoids Error 153 */}
                  <View style={s.videoFrame}>
                    <WebView
                      source={{ html: toEmbedHtml(video.video_url) }}
                      style={s.webview}
                      allowsFullscreenVideo
                      allowsInlineMediaPlayback
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled
                      domStorageEnabled
                      originWhitelist={['*']}
                    />
                  </View>

                  {/* Description */}
                  {!!video.description && (
                    <Text style={s.videoDesc} numberOfLines={2}>{video.description}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* ── Venue ── */}
      <View style={s.venueCard}>
        <Ionicons name="location" size={18} color="#0ea5e9" />
        <Text style={s.venueText}>{VENUE}</Text>
      </View>

      {/* ── Notice ── */}
      <View style={s.notice}>
        <Text style={s.noticeTitle}>⚠️ Session Times</Text>
        <Text style={s.noticeText}>• Morning: 9:00 AM – 2:00 PM (latest start 11:00 AM)</Text>
        <Text style={s.noticeText}>• Evening: 5:00 PM – 10:00 PM (latest start 7:00 PM)</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0f2fe' },
  content: { paddingBottom: 32 },

  // Navbar
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  headerActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  navBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  navBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  navBtnGhost: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  navBtnGhostText: { color: '#374151', fontWeight: '500', fontSize: 12 },

  // Hero
  heroSection: { paddingHorizontal: 16, paddingVertical: 24 },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 24, padding: 28,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 12 },
  heroSub: { fontSize: 14, color: '#4b5563', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  heroButtons: { flexDirection: 'row', gap: 12 },
  heroBtn: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  heroBtnText: { color: '#374151', fontWeight: '600', fontSize: 14 },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 26, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 16 },

  // Carousel wrapper
  carouselWrapper: {
    backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 20,
    padding: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },

  // Video card
  videoCard: {
    width: SCREEN_WIDTH - 56,
    backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 18,
    padding: 16, marginRight: 12,
  },
  videoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  videoIconBox: {
    width: 44, height: 44, backgroundColor: '#fff', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  videoIcon: { fontSize: 22 },
  videoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  videoFrame: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  webview: { flex: 1 },
  videoDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18 },

  // Fallback ET scroll
  etScroll: { marginBottom: 4 },
  etCard: {
    width: 140, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: 16,
    alignItems: 'center', marginRight: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  etIcon: { fontSize: 30, marginBottom: 8 },
  etName: { fontSize: 13, fontWeight: '700', color: '#1f2937', marginBottom: 4, textAlign: 'center' },
  etPrice: { fontSize: 14, fontWeight: 'bold', color: '#059669', marginBottom: 2 },
  etCap: { fontSize: 11, color: '#6b7280' },

  // Venue
  venueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  venueText: { flex: 1, fontSize: 13, color: '#374151' },

  // Notice
  notice: {
    marginHorizontal: 16, backgroundColor: '#fffbeb', borderLeftWidth: 4,
    borderLeftColor: '#f59e0b', borderRadius: 10, padding: 14,
  },
  noticeTitle: { fontWeight: '700', color: '#92400e', marginBottom: 6, fontSize: 14 },
  noticeText: { fontSize: 13, color: '#92400e', marginBottom: 2 },
});
