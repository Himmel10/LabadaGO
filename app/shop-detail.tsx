import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MapPin, Star, Clock, Phone, Shirt, Sparkles, Wind, BedDouble, Wrench, User, ChevronRight, Send, X } from 'lucide-react-native';
import { useShops } from '@/contexts/ShopContext';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import ReviewsModal from '@/components/ReviewsModal';

const ICON_MAP: Record<string, any> = {
  shirt: Shirt, sparkles: Sparkles, wind: Wind, 'bed-double': BedDouble,
};

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { shops, getReviewsByShop, addReview } = useShops();
  const { orders } = useOrders();
  const { user } = useAuth();
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shop = shops.find((s) => s.id === id);

  const shopReviews = useMemo(() => {
    if (!id) return [];
    const fromContext = getReviewsByShop(id);
    const fromOrders = orders
      .filter((o) => o.shopId === id && o.shopRating != null && o.shopReview)
      .map((o) => ({
        id: `order_review_${o.id}`,
        orderId: o.id,
        customerId: o.customerId,
        customerName: o.customerName,
        shopId: o.shopId,
        rating: o.shopRating!,
        comment: o.shopReview!,
        createdAt: o.updatedAt,
      }));

    const allReviews = [...fromContext];
    fromOrders.forEach((or) => {
      if (!allReviews.find((r) => r.orderId === or.orderId)) {
        allReviews.push(or);
      }
    });
    return allReviews;
  }, [id, getReviewsByShop, orders]);

  const avgRating = useMemo(() => {
    if (shopReviews.length === 0) return shop?.rating ?? 0;
    const sum = shopReviews.reduce((a, r) => a + r.rating, 0);
    return Math.round((sum / shopReviews.length) * 10) / 10;
  }, [shopReviews, shop]);

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('Not Logged In', 'Please log in to leave a review');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }

    if (!id) return;

    setIsSubmitting(true);
    try {
      await addReview({
        orderId: undefined,
        customerId: user.id,
        customerName: user.name,
        shopId: id,
        rating,
        comment: reviewText.trim() || `Rated ${rating} stars`,
      });

      Alert.alert('Success', 'Thank you for your review!');
      setRating(0);
      setReviewText('');
      setShowReviewForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shop) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Shop Not Found' }} />
        <View style={styles.empty}><Text style={styles.emptyText}>Shop not found</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: shop.name }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: shop.image }} style={styles.coverImage} contentFit="cover" />

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.shopName}>{shop.name}</Text>
            <View style={[styles.openBadge, { backgroundColor: shop.isOpen ? Colors.successLight : Colors.errorLight }]}>
              <Text style={[styles.openText, { color: shop.isOpen ? Colors.success : Colors.error }]}>
                {shop.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{shop.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Star size={16} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.metaText}>{avgRating > 0 ? `${avgRating} (${shopReviews.length})` : 'New'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{shop.openTime} - {shop.closeTime}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{shop.address}</Text>
          </View>
          <View style={styles.infoCard}>
            <Phone size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{shop.phone}</Text>
          </View>

          <Text style={styles.sectionTitle}>Services & Pricing</Text>

          {shop.services.length > 0 ? shop.services.map((service) => {
            const Icon = ICON_MAP[service.icon ?? ''] ?? Wrench;
            return (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() =>
                  router.push({
                    pathname: '/book-laundry',
                    params: { shopId: id, serviceId: service.id },
                  } as any)
                }
                activeOpacity={0.7}
              >
                {service.photo ? (
                  <Image
                    source={{ uri: service.photo }}
                    style={styles.serviceImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.serviceIconWrap}>
                    <Icon size={22} color={Colors.primary} />
                  </View>
                )}
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                  <View style={styles.serviceMeta}>
                    <Text style={styles.servicePrice}>₱{service.pricePerKg}/kg</Text>
                    <Text style={styles.serviceEta}>{service.estimatedHours}h turnaround</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            );
          }) : (
            <Text style={styles.noServices}>No services listed yet</Text>
          )}

          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>

          <View style={styles.ratingOverview}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingBigNum}>{avgRating > 0 ? avgRating : '—'}</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} color={Colors.accent} fill={s <= Math.round(avgRating) ? Colors.accent : 'transparent'} />
                ))}
              </View>
              <Text style={styles.ratingCount}>{shopReviews.length} reviews</Text>
            </View>
          </View>

          {shopReviews.length > 0 ? (
            <>
              <View style={styles.reviewsPreview}>
                {shopReviews.slice(0, 2).map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <User size={16} color={Colors.textTertiary} />
                      </View>
                      <View style={styles.reviewHeaderInfo}>
                        <Text style={styles.reviewName}>{review.customerName}</Text>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} color={Colors.accent} fill={s <= review.rating ? Colors.accent : 'transparent'} />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.reviewComment} numberOfLines={2}>{review.comment}</Text>
                  </View>
                ))}
              </View>

              {shopReviews.length > 2 && (
                <TouchableOpacity
                  style={styles.viewAllReviewsBtn}
                  onPress={() => setShowReviewsModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllReviewsText}>View All {shopReviews.length} Reviews</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}

          {!showReviewForm && (
            <TouchableOpacity
              style={styles.leaveReviewBtn}
              onPress={() => setShowReviewForm(true)}
              activeOpacity={0.85}
            >
              <Star size={20} color={Colors.white} />
              <Text style={styles.leaveReviewBtnText}>Leave a Review</Text>
            </TouchableOpacity>
          )}

          {showReviewForm && (
            <View style={styles.reviewFormContainer}>
              <View style={styles.reviewFormHeader}>
                <Text style={styles.reviewFormTitle}>Share Your Experience</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowReviewForm(false);
                    setRating(0);
                    setReviewText('');
                  }}
                  activeOpacity={0.7}
                >
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.ratingSection}>
                <Text style={[styles.reviewSubtitle, { marginBottom: 12 }]}>Your Rating</Text>
                {rating > 0 && (
                  <Text style={styles.ratingFeedback}>
                    {rating === 5
                      ? '⭐ Excellent!'
                      : rating === 4
                      ? '👍 Good'
                      : rating === 3
                      ? '👌 Fair'
                      : rating === 2
                      ? '😐 Not great'
                      : '😞 Poor'}
                  </Text>
                )}
                <View style={styles.starsInput}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setRating(s)}
                      activeOpacity={0.6}
                      style={[styles.starButton, s <= rating && styles.starButtonSelected]}
                    >
                      <Star
                        size={40}
                        color={s <= rating ? Colors.accent : Colors.borderLight}
                        fill={s <= rating ? Colors.accent : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience (optional)"
                placeholderTextColor={Colors.textTertiary}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
                maxLength={500}
              />

              <Text style={styles.charCount}>{reviewText.length}/500</Text>

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleSubmitReview}
                activeOpacity={0.85}
                disabled={isSubmitting}
              >
                <Send size={18} color={Colors.white} />
                <Text style={styles.submitBtnText}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <ReviewsModal
        visible={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        reviews={shopReviews}
        shopName={shop.name}
        averageRating={avgRating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  coverImage: { width: '100%', height: 220 },
  content: { padding: 20 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  shopName: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, flex: 1 },
  openBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  openText: { fontSize: 12, fontWeight: '600' as const },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: Colors.text, fontWeight: '500' as const },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white,
    padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoText: { fontSize: 14, color: Colors.text, flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginTop: 20, marginBottom: 12 },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: 16, borderRadius: 16, marginBottom: 10, gap: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  serviceIconWrap: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
  },
  serviceImage: {
    width: 48, height: 48, borderRadius: 14,
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  serviceDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  serviceMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  servicePrice: { fontSize: 14, fontWeight: '800' as const, color: Colors.primary },
  serviceEta: { fontSize: 12, color: Colors.textTertiary },
  noServices: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center' as const, paddingVertical: 20 },
  ratingOverview: { marginBottom: 16 },
  ratingBig: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.borderLight },
  ratingBigNum: { fontSize: 40, fontWeight: '800' as const, color: Colors.primary },
  ratingStars: { flexDirection: 'row', gap: 4, marginTop: 4 },
  ratingCount: { fontSize: 13, color: Colors.textSecondary, marginTop: 6 },
  reviewsPreview: { marginBottom: 12, gap: 10 },
  reviewCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  reviewHeaderInfo: { flex: 1 },
  reviewName: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  reviewStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewDate: { fontSize: 11, color: Colors.textTertiary },
  reviewComment: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  viewAllReviewsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primaryFaded, borderRadius: 12, paddingVertical: 12, marginBottom: 16 },
  viewAllReviewsText: { fontSize: 14, fontWeight: '700' as const, color: Colors.primary },
  noReviews: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center' as const, paddingVertical: 20 },

  // Review Form Styles
  leaveReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  leaveReviewBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  reviewFormContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reviewFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  reviewFormTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  ratingSection: {
    marginBottom: 16,
  },
  reviewSubtitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  ratingFeedback: { fontSize: 16, fontWeight: '700' as const, color: Colors.accent, marginBottom: 12, textAlign: 'center' as const },
  starsInput: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  starButton: {
    padding: 4,
  },
  starButtonSelected: {
    transform: [{ scale: 1.1 }],
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top' as const,
    marginBottom: 8,
  },
  charCount: { fontSize: 11, color: Colors.textTertiary, textAlign: 'right' as const, marginBottom: 12 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: Colors.textTertiary },
});
