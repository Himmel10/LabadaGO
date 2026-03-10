import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Star, User, Store } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Review } from '@/types';

interface ReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  reviews: Review[];
  shopName: string;
  averageRating: number;
}

export default function ReviewsModal({
  visible,
  onClose,
  reviews,
  shopName,
  averageRating,
}: ReviewsModalProps) {
  const [filterRating, setFilterRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews;

    // Filter by rating
    if (filterRating > 0) {
      filtered = filtered.filter((r) => r.rating === filterRating);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }

    return sorted;
  }, [reviews, filterRating, sortBy]);

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      dist[r.rating as keyof typeof dist]++;
    });
    return dist;
  }, [reviews]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{shopName}</Text>
            <Text style={styles.headerSubtitle}>Reviews & Ratings</Text>
          </View>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Rating Overview */}
          <View style={styles.overviewSection}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingBigNum}>{averageRating}</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    color={Colors.accent}
                    fill={s <= Math.round(averageRating) ? Colors.accent : 'transparent'}
                  />
                ))}
              </View>
              <Text style={styles.ratingCount}>
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </Text>
            </View>

            {/* Rating Distribution */}
            <View style={styles.distributionBox}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={styles.distributionRow}
                  onPress={() => setFilterRating(filterRating === rating ? 0 : rating)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.distLabel}>{rating}★</Text>
                  <View style={styles.distBar}>
                    <View
                      style={[
                        styles.distBarFill,
                        {
                          width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`,
                          backgroundColor:
                            rating >= 4
                              ? Colors.success
                              : rating === 3
                              ? Colors.warning
                              : Colors.error,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.distCount}>
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filters & Sort */}
          <View style={styles.filtersSection}>
            <View style={styles.sortButtons}>
              {(['newest', 'oldest', 'highest', 'lowest'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortBtn,
                    sortBy === option && styles.sortBtnActive,
                  ]}
                  onPress={() => setSortBy(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sortBtnText,
                      sortBy === option && styles.sortBtnTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filterRating > 0 && (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => setFilterRating(0)}
                activeOpacity={0.7}
              >
                <X size={14} color={Colors.primary} />
                <Text style={styles.clearFilterText}>
                  Clear filter (showing {filterRating}★)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsSection}>
            {filteredAndSortedReviews.length > 0 ? (
              filteredAndSortedReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <User size={18} color={Colors.textTertiary} />
                    </View>
                    <View style={styles.reviewHeaderInfo}>
                      <Text style={styles.reviewName} numberOfLines={1}>
                        {review.customerName}
                      </Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            color={Colors.accent}
                            fill={
                              s <= review.rating ? Colors.accent : 'transparent'
                            }
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>

                  {review.reply && (
                    <View style={styles.replyBox}>
                      <View style={styles.replyHeader}>
                        <Store size={14} color={Colors.primary} />
                        <Text style={styles.replyFromText}>Shop Reply</Text>
                      </View>
                      <Text style={styles.replyComment}>{review.reply}</Text>
                      {review.repliedAt && (
                        <Text style={styles.replyDate}>
                          {new Date(review.repliedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <User size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No reviews found</Text>
                <Text style={styles.emptyText}>
                  {filterRating > 0
                    ? `No reviews with ${filterRating} stars`
                    : 'Be the first to review!'}
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },

  // Overview Section
  overviewSection: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 12,
    gap: 16,
  },
  ratingBig: {
    alignItems: 'center',
    gap: 8,
  },
  ratingBigNum: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  distributionBox: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distLabel: {
    width: 30,
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  distBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  distCount: {
    width: 30,
    textAlign: 'right' as const,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },

  // Filters Section
  filtersSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  sortBtnActive: {
    backgroundColor: Colors.primaryFaded,
    borderColor: Colors.primary,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  sortBtnTextActive: {
    color: Colors.primary,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.errorLight,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },

  // Reviews Section
  reviewsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },

  // Reply Box
  replyBox: {
    backgroundColor: Colors.primaryFaded,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyFromText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.primaryDark,
  },
  replyComment: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
  replyDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
});
