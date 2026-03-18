import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star } from 'lucide-react-native';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';

export default function ReviewsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders, getOrdersByCustomer } = useOrders();
  const [forceUpdate, setForceUpdate] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setForceUpdate((prev) => prev + 1);
    }, [])
  );

  const userOrders = useMemo(() => {
    const filtered = user ? getOrdersByCustomer(user.id) : [];
    console.log('DEBUG: User orders for', user?.id, ':', filtered.map(o => ({
      id: o.id,
      status: o.status,
      shopRating: o.shopRating,
      shopReview: o.shopReview,
    })));
    return filtered;
  }, [user, orders, forceUpdate]);

  const reviewedOrders = useMemo(() => {
    const filtered = userOrders.filter((o) => o.status === 'rated' || (o.shopRating && o.shopRating > 0));
    console.log('DEBUG: Filtered reviewed orders:', filtered.length, filtered.map(o => ({
      id: o.id,
      reason: o.status === 'rated' ? 'status=rated' : 'hasRating',
    })));
    return filtered;
  }, [userOrders]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/customer/profile')} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Reviews</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reviewedOrders.length > 0 ? (
          <View style={styles.reviewsList}>
            {reviewedOrders.map((order) => (
              <View key={order.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.shopName}>{order.shopName}</Text>
                  <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        color={i < (order.shopRating || 0) ? Colors.accent : Colors.borderLight}
                        fill={i < (order.shopRating || 0) ? Colors.accent : 'none'}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{order.shopReview || 'No comment'}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reviews yet</Text>
            <Text style={styles.emptySubtext}>Reviews will appear here after you complete orders</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  reviewsList: { gap: 12, paddingBottom: 20 },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shopName: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, flex: 1 },
  ratingContainer: { flexDirection: 'row', gap: 4, paddingLeft: 8 },
  reviewComment: { fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: 8 },
  reviewDate: { fontSize: 12, color: Colors.textTertiary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.text, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: Colors.textTertiary },
});
