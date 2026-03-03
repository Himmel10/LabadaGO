import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Star, MessageCircle, Send, User, Store as StoreIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';

export default function ShopReviewsScreen() {
  const { user } = useAuth();
  const { getShopByOwner, getReviewsByShop, replyToReview } = useShops();
  const shop = getShopByOwner(user?.id ?? '');
  const allReviews = useMemo(() => {
    return shop ? getReviewsByShop(shop.id) : [];
  }, [shop, getReviewsByShop]);

  const [filter, setFilter] = useState<string>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const filteredReviews = useMemo(() => {
    if (filter === 'all') return allReviews;
    if (filter === 'unreplied') return allReviews.filter((r) => !r.reply);
    const rating = parseInt(filter);
    return allReviews.filter((r) => r.rating === rating);
  }, [allReviews, filter]);

  const avgRating = shop?.rating ?? 0;
  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    allReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist;
  }, [allReviews]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }
    await replyToReview(reviewId, replyText.trim());
    setReplyingTo(null);
    setReplyText('');
    Alert.alert('Success', 'Reply posted');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Reviews</Text>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.bigRating}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  color={s <= Math.round(avgRating) ? Colors.accent : Colors.border}
                  fill={s <= Math.round(avgRating) ? Colors.accent : 'transparent'}
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>{allReviews.length} total</Text>
          </View>
          <View style={styles.summaryRight}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDist[rating - 1];
              const maxCount = Math.max(...ratingDist, 1);
              const width = (count / maxCount) * 100;
              return (
                <View key={rating} style={styles.distRow}>
                  <Text style={styles.distLabel}>{rating}</Text>
                  <Star size={10} color={Colors.accent} fill={Colors.accent} />
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: `${width}%` }]} />
                  </View>
                  <Text style={styles.distCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {[
            { key: 'all', label: 'All' },
            { key: 'unreplied', label: 'Unreplied' },
            { key: '5', label: '5★' },
            { key: '4', label: '4★' },
            { key: '3', label: '3★' },
            { key: '2', label: '2★' },
            { key: '1', label: '1★' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredReviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerInfo}>
                {review.customerAvatar ? (
                  <Image source={{ uri: review.customerAvatar }} style={styles.reviewerAvatar} />
                ) : (
                  <View style={styles.reviewerAvatarPlaceholder}>
                    <User size={16} color={Colors.textTertiary} />
                  </View>
                )}
                <View>
                  <Text style={styles.reviewerName}>{review.customerName}</Text>
                  <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
              </View>
              <View style={styles.ratingPill}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    color={s <= review.rating ? Colors.accent : Colors.border}
                    fill={s <= review.rating ? Colors.accent : 'transparent'}
                  />
                ))}
              </View>
            </View>

            <Text style={styles.reviewComment}>{review.comment}</Text>

            {review.reply ? (
              <View style={styles.replySection}>
                <View style={styles.replyHeader}>
                  <StoreIcon size={14} color={Colors.primary} />
                  <Text style={styles.replyOwnerLabel}>Your Reply</Text>
                  {review.repliedAt && (
                    <Text style={styles.replyDate}>{formatDate(review.repliedAt)}</Text>
                  )}
                </View>
                <Text style={styles.replyText}>{review.reply}</Text>
              </View>
            ) : replyingTo === review.id ? (
              <View style={styles.replyInputSection}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Write your reply..."
                  placeholderTextColor={Colors.textTertiary}
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                  autoFocus
                />
                <View style={styles.replyActions}>
                  <TouchableOpacity style={styles.cancelReplyBtn} onPress={() => { setReplyingTo(null); setReplyText(''); }}>
                    <Text style={styles.cancelReplyText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sendReplyBtn} onPress={() => handleReply(review.id)} activeOpacity={0.8}>
                    <Send size={14} color={Colors.white} />
                    <Text style={styles.sendReplyText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.replyBtn}
                onPress={() => { setReplyingTo(review.id); setReplyText(''); }}
                activeOpacity={0.7}
              >
                <MessageCircle size={14} color={Colors.primary} />
                <Text style={styles.replyBtnText}>Reply</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {filteredReviews.length === 0 && (
          <View style={styles.empty}>
            <Star size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No reviews found</Text>
            <Text style={styles.emptySubtext}>Reviews from customers will appear here</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingHorizontal: 20, paddingTop: 8 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  summaryCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginTop: 12,
    borderWidth: 1, borderColor: Colors.borderLight, gap: 20,
  },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  bigRating: { fontSize: 40, fontWeight: '800' as const, color: Colors.text },
  starsRow: { flexDirection: 'row', gap: 3, marginTop: 4 },
  totalReviews: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  summaryRight: { flex: 1, gap: 6, justifyContent: 'center' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary, width: 12 },
  distBarBg: { flex: 1, height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: 'hidden' as const },
  distBarFill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  distCount: { fontSize: 11, color: Colors.textTertiary, width: 20, textAlign: 'right' as const },
  filterScroll: { marginTop: 16 },
  filterContent: { gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.borderLight },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  reviewCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginTop: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 12 },
  reviewerAvatarPlaceholder: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  reviewerName: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  reviewDate: { fontSize: 11, color: Colors.textTertiary, marginTop: 1 },
  ratingPill: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  replySection: {
    backgroundColor: Colors.primaryFaded, borderRadius: 12, padding: 12, marginTop: 12,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  replyOwnerLabel: { fontSize: 12, fontWeight: '700' as const, color: Colors.primary, flex: 1 },
  replyDate: { fontSize: 11, color: Colors.textTertiary },
  replyText: { fontSize: 13, color: Colors.text, lineHeight: 18 },
  replyInputSection: { marginTop: 12, gap: 8 },
  replyInput: {
    backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12,
    fontSize: 14, color: Colors.text, minHeight: 60, borderWidth: 1, borderColor: Colors.border, textAlignVertical: 'top' as const,
  },
  replyActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelReplyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  cancelReplyText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' as const },
  sendReplyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  sendReplyText: { fontSize: 13, fontWeight: '700' as const, color: Colors.white },
  replyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    alignSelf: 'flex-start' as const, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: Colors.primary + '10', borderWidth: 1, borderColor: Colors.primary + '20',
  },
  replyBtnText: { fontSize: 13, fontWeight: '600' as const, color: Colors.primary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
  emptySubtext: { fontSize: 14, color: Colors.textTertiary },
});
