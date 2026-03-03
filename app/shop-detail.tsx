import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { MapPin, Star, Clock, Phone, Shirt, Sparkles, Wind, BedDouble, Wrench, User } from 'lucide-react-native';
import { useShops } from '@/contexts/ShopContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';

const ICON_MAP: Record<string, any> = {
  shirt: Shirt, sparkles: Sparkles, wind: Wind, 'bed-double': BedDouble,
};

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shops, getReviewsByShop } = useShops();
  const { orders } = useOrders();

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
            const Icon = ICON_MAP[service.icon] ?? Wrench;
            return (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceIconWrap}>
                  <Icon size={22} color={Colors.primary} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                  <View style={styles.serviceMeta}>
                    <Text style={styles.servicePrice}>₱{service.pricePerKg}/kg</Text>
                    <Text style={styles.serviceEta}>{service.estimatedHours}h turnaround</Text>
                  </View>
                </View>
              </View>
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
            shopReviews.map((review) => (
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
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  serviceDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  serviceMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  servicePrice: { fontSize: 14, fontWeight: '800' as const, color: Colors.primary },
  serviceEta: { fontSize: 12, color: Colors.textTertiary },
  noServices: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center' as const, paddingVertical: 20 },
  ratingOverview: { marginBottom: 16 },
  ratingBig: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.borderLight },
  ratingBigNum: { fontSize: 40, fontWeight: '800' as const, color: Colors.text },
  ratingStars: { flexDirection: 'row', gap: 4, marginTop: 4 },
  ratingCount: { fontSize: 13, color: Colors.textSecondary, marginTop: 6 },
  reviewCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  reviewHeaderInfo: { flex: 1, marginLeft: 10 },
  reviewName: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  reviewStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewDate: { fontSize: 11, color: Colors.textTertiary },
  reviewComment: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  noReviews: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center' as const, paddingVertical: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: Colors.textTertiary },
});
