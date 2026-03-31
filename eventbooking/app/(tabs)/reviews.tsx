import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { getToken } from '@/utils/auth';
import { API_BASE } from '@/constants/api';

interface Reply {
  id: number;
  user_id: number;
  user: string;
  is_organizer: boolean;
  comment: string;
  created_at: string;
}

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  event_type: string | null;
  created_at: string;
  replies: Reply[];
}

interface Booking {
  id: number;
  event_type: string;
  status: string;
  date: string;
}

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<number[]>([]);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editReviewSubmitting, setEditReviewSubmitting] = useState(false);

  // Edit reply state
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [editReplySubmitting, setEditReplySubmitting] = useState(false);

  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    getToken('clientUserName').then(n => setCurrentUserName(n ?? ''));
    getToken('clientUserId').then(id => setCurrentUserId(id ? parseInt(id) : null));
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await getToken('clientToken');
      const [revRes, bookRes] = await Promise.all([
        fetch(`${API_BASE}/reviews/`),
        fetch(`${API_BASE}/bookings/my/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (revRes.ok) setReviews(await revRes.json());
      if (bookRes.ok) {
        const all: Booking[] = await bookRes.json();
        setConfirmedBookings(all.filter(b => b.status === 'confirmed'));
      }
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Please select a star rating'); return; }
    if (!selectedBooking) return;
    setSubmitting(true);
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/reviews/submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: selectedBooking.id, rating, comment }),
      });
      if (res.ok) {
        Alert.alert('Thank you! ⭐', 'Your review has been submitted.');
        setReviewedIds(prev => [...prev, selectedBooking.id]);
        setModalVisible(false); setRating(0); setComment(''); setSelectedBooking(null);
        loadData();
      } else {
        const d = await res.json();
        Alert.alert(d.message || 'Failed to submit review');
      }
    } catch { Alert.alert('Error submitting review'); }
    finally { setSubmitting(false); }
  };

  const handleReply = async (reviewId: number) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/reply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: replyText }),
      });
      if (res.ok) {
        setReplyingTo(null); setReplyText('');
        loadData();
      } else {
        const d = await res.json();
        Alert.alert(d.message || 'Failed to post reply');
      }
    } catch { Alert.alert('Error posting reply'); }
    finally { setReplySubmitting(false); }
  };

  const handleDeleteReply = (replyId: number) => {
    Alert.alert('Delete Reply', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const token = await getToken('clientToken');
          await fetch(`${API_BASE}/reviews/replies/${replyId}/delete/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          loadData();
        }
      }
    ]);
  };

  const handleDeleteReview = (reviewId: number) => {
    Alert.alert('Delete Review', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const token = await getToken('clientToken');
          await fetch(`${API_BASE}/reviews/${reviewId}/delete/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          loadData();
        }
      }
    ]);
  };

  const handleEditReview = async () => {
    if (editRating === 0 || editingReviewId === null) return;
    setEditReviewSubmitting(true);
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/reviews/${editingReviewId}/edit/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      if (res.ok) { setEditingReviewId(null); loadData(); }
      else { const d = await res.json(); Alert.alert(d.message || 'Failed to edit review'); }
    } catch { Alert.alert('Error editing review'); }
    finally { setEditReviewSubmitting(false); }
  };

  const handleEditReply = async (replyId: number) => {
    if (!editReplyText.trim()) return;
    setEditReplySubmitting(true);
    try {
      const token = await getToken('clientToken');
      const res = await fetch(`${API_BASE}/reviews/replies/${replyId}/edit/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: editReplyText }),
      });
      if (res.ok) { setEditingReplyId(null); loadData(); }
      else { const d = await res.json(); Alert.alert(d.message || 'Failed to edit reply'); }
    } catch { Alert.alert('Error editing reply'); }
    finally { setEditReplySubmitting(false); }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const today = new Date().toISOString().split('T')[0];
  const unreviewedBookings = confirmedBookings
    .filter(b => b.date <= today && !reviewedIds.includes(b.id));

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#eab308" />
        <Text style={s.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Average Rating Card */}
      <View style={s.avgCard}>
        <Text style={s.avgNumber}>{avgRating}</Text>
        <View>
          <View style={s.starsRow}>
            {[1,2,3,4,5].map(s2 => (
              <Text key={s2} style={[s.starLg, parseFloat(avgRating) >= s2 ? s.starActive : s.starInactive]}>★</Text>
            ))}
          </View>
          <Text style={s.reviewCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Write a Review */}
      {unreviewedBookings.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>⭐ Rate Your Experience</Text>
          <Text style={s.cardSub}>Select a confirmed booking to review</Text>
          {unreviewedBookings.map(b => (
            <TouchableOpacity
              key={b.id}
              style={s.bookingBtn}
              onPress={() => { setSelectedBooking(b); setModalVisible(true); }}
            >
              <Text style={s.bookingBtnText}>Review: {b.event_type} #{b.id}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Reviews List */}
      <Text style={s.sectionTitle}>All Reviews</Text>
      {reviews.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>No reviews yet. Be the first!</Text>
        </View>
      ) : (
        reviews.map(r => (
          <View key={r.id} style={s.reviewCard}>
            <View style={s.reviewHeader}>
              <View>
                <Text style={s.reviewUser}>{r.user}</Text>
              </View>
              <View style={s.reviewHeaderRight}>
                {editingReviewId !== r.id && (
                  <View style={s.starsRow}>
                    {[1,2,3,4,5].map(s2 => (
                      <Text key={s2} style={[s.starSm, r.rating >= s2 ? s.starActive : s.starInactive]}>★</Text>
                    ))}
                  </View>
                )}
                {currentUserName && r.user === currentUserName && editingReviewId !== r.id && (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity onPress={() => { setEditingReviewId(r.id); setEditRating(r.rating); setEditComment(r.comment); }}
                      style={s.editBtn}>
                      <Text style={s.editBtnText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteReview(r.id)}
                      style={s.deleteReviewBtn}>
                      <Text style={s.deleteReviewBtnText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Inline edit form for review */}
            {editingReviewId === r.id ? (
              <View style={s.editReviewBox}>
                <Text style={s.editLabel}>Edit Rating</Text>
                <View style={s.starsRow}>
                  {[1,2,3,4,5].map(s2 => (
                    <TouchableOpacity key={s2} onPress={() => setEditRating(s2)}>
                      <Text style={[s.starXl, editRating >= s2 ? s.starActive : s.starInactive]}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput style={[s.commentInput, { marginTop: 10 }]}
                  value={editComment} onChangeText={setEditComment}
                  placeholder="Edit your comment..." placeholderTextColor="#6b7280"
                  multiline numberOfLines={3}
                />
                <View style={s.editActions}>
                  <TouchableOpacity style={[s.saveBtn, (editReviewSubmitting || editRating === 0) && s.btnDisabled]}
                    onPress={handleEditReview} disabled={editReviewSubmitting || editRating === 0}>
                    <Text style={s.saveBtnText}>{editReviewSubmitting ? 'Saving...' : 'Save Changes'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.cancelEditBtn} onPress={() => setEditingReviewId(null)}>
                    <Text style={s.cancelEditText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {r.comment ? <Text style={s.reviewComment}>"{r.comment}"</Text> : null}
                <Text style={s.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</Text>
              </>
            )}

            {/* Replies */}
            {r.replies.length > 0 && (
              <View style={s.repliesContainer}>
                {r.replies.map(rp => (
                  <View key={rp.id} style={s.replyCard}>
                    <View style={s.replyHeader}>
                      <View style={s.replyUserRow}>
                        <Text style={s.replyUser}>{rp.user}</Text>
                        {rp.is_organizer && (
                          <View style={s.organizerBadge}>
                            <Text style={s.organizerBadgeText}>Organizer</Text>
                          </View>
                        )}
                      </View>
                      <View style={s.replyActions}>
                        {editingReplyId !== rp.id && currentUserId === rp.user_id && (
                          <TouchableOpacity onPress={() => { setEditingReplyId(rp.id); setEditReplyText(rp.comment); }}>
                            <Text style={s.editReplyBtn}>Edit</Text>
                          </TouchableOpacity>
                        )}
                        {currentUserId === rp.user_id && (
                          <TouchableOpacity onPress={() => handleDeleteReply(rp.id)}>
                            <Text style={s.deleteReply}>Delete</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {editingReplyId === rp.id ? (
                      <View style={s.replyInputRow}>
                        <TextInput style={s.replyInput} value={editReplyText}
                          onChangeText={setEditReplyText} placeholderTextColor="#6b7280"
                        />
                        <TouchableOpacity
                          style={[s.replyBtn, (!editReplyText.trim() || editReplySubmitting) && s.btnDisabled]}
                          onPress={() => handleEditReply(rp.id)}
                          disabled={!editReplyText.trim() || editReplySubmitting}>
                          <Text style={s.replyBtnText}>{editReplySubmitting ? '...' : 'Save'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.cancelReplyBtn} onPress={() => setEditingReplyId(null)}>
                          <Text style={s.cancelReplyText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={s.replyComment}>{rp.comment}</Text>
                    )}
                    <Text style={s.replyDate}>{new Date(rp.created_at).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Reply input */}
            {replyingTo === r.id ? (
              <View style={s.replyInputRow}>
                <TextInput
                  style={s.replyInput}
                  placeholder="Write a reply..."
                  placeholderTextColor="#6b7280"
                  value={replyText}
                  onChangeText={setReplyText}
                />
                <TouchableOpacity
                  style={[s.replyBtn, (!replyText.trim() || replySubmitting) && s.btnDisabled]}
                  onPress={() => handleReply(r.id)}
                  disabled={!replyText.trim() || replySubmitting}
                >
                  {replySubmitting
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={s.replyBtnText}>Send</Text>
                  }
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
      )}

      {/* Submit Review Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>⭐ Rate & Review</Text>
            {selectedBooking && (
              <Text style={s.modalSub}>{selectedBooking.event_type} #{selectedBooking.id}</Text>
            )}
            <View style={s.starSelector}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[s.starXl, rating >= star ? s.starActive : s.starInactive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={s.commentInput}
              placeholder="Share your experience (optional)..."
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity
              style={[s.submitBtn, (submitting || rating === 0) && s.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting || rating === 0}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitBtnText}>Submit Review</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => { setModalVisible(false); setRating(0); setComment(''); }}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030712' },
  loadingText: { marginTop: 12, color: '#9ca3af', fontSize: 14 },

  avgCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1f2937', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  avgNumber: { fontSize: 52, fontWeight: 'bold', color: '#eab308' },
  starsRow: { flexDirection: 'row', gap: 2 },
  starLg: { fontSize: 28 },
  starSm: { fontSize: 16 },
  starXl: { fontSize: 40 },
  starActive: { color: '#eab308' },
  starInactive: { color: '#4b5563' },
  reviewCount: { fontSize: 13, color: '#9ca3af', marginTop: 4 },

  card: { backgroundColor: '#1f2937', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#f3f4f6', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#9ca3af', marginBottom: 12 },
  bookingBtn: { backgroundColor: '#292524', borderWidth: 1, borderColor: '#78350f', borderRadius: 10, padding: 12, marginBottom: 8 },
  bookingBtnText: { color: '#fbbf24', fontWeight: '600', fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#d1d5db', marginBottom: 10 },
  emptyBox: { backgroundColor: '#1f2937', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  emptyText: { color: '#6b7280', fontSize: 15 },

  reviewCard: { backgroundColor: '#1f2937', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  reviewHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: { backgroundColor: '#1e3a5f', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  editBtnText: { fontSize: 11, color: '#93c5fd', fontWeight: '600' },
  deleteReviewBtn: { backgroundColor: '#3b1a1a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  deleteReviewBtnText: { fontSize: 11, color: '#f87171', fontWeight: '600' },
  editReviewBox: { backgroundColor: '#111827', borderRadius: 10, padding: 12, marginBottom: 8 },
  editLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  saveBtn: { flex: 1, backgroundColor: '#eab308', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelEditBtn: { flex: 1, backgroundColor: '#374151', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  cancelEditText: { color: '#d1d5db', fontWeight: '600', fontSize: 13 },
  replyActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  editReplyBtn: { fontSize: 11, color: '#38bdf8' },
  reviewUser: { fontSize: 15, fontWeight: '700', color: '#f3f4f6' },
  reviewEvent: { fontSize: 12, color: '#93c5fd', marginTop: 2 },
  reviewComment: { fontSize: 14, color: '#d1d5db', fontStyle: 'italic', marginBottom: 6 },
  reviewDate: { fontSize: 11, color: '#6b7280' },

  repliesContainer: { marginTop: 10, borderLeftWidth: 2, borderLeftColor: '#374151', paddingLeft: 12, gap: 8 },
  replyCard: { backgroundColor: '#111827', borderRadius: 10, padding: 10 },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  replyUserRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  replyUser: { fontSize: 13, fontWeight: '600', color: '#e5e7eb' },
  organizerBadge: { backgroundColor: '#1e3a5f', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  organizerBadgeText: { fontSize: 10, color: '#93c5fd', fontWeight: '600' },
  deleteReply: { fontSize: 11, color: '#f87171' },
  replyComment: { fontSize: 13, color: '#d1d5db' },
  replyDate: { fontSize: 10, color: '#6b7280', marginTop: 4 },

  replyToggle: { fontSize: 12, color: '#38bdf8', marginTop: 8 },
  replyInputRow: { flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center' },
  replyInput: { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#f3f4f6' },
  replyBtn: { backgroundColor: '#0284c7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  replyBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cancelReplyBtn: { backgroundColor: '#374151', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  cancelReplyText: { color: '#9ca3af', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1f2937', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: '#374151' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#f3f4f6', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  starSelector: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 20 },
  commentInput: { borderWidth: 1, borderColor: '#374151', backgroundColor: '#111827', borderRadius: 12, padding: 14, fontSize: 14, color: '#f3f4f6', textAlignVertical: 'top', marginBottom: 16, minHeight: 100 },
  submitBtn: { backgroundColor: '#eab308', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { backgroundColor: '#374151', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#d1d5db', fontWeight: '600', fontSize: 15 },
  btnDisabled: { backgroundColor: '#4b5563' },
});
