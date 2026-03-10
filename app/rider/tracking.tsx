import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Package, Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';
import TrackingMap from '@/components/TrackingMap';
import { ORDER_STATUS_LABELS } from '@/mocks/data';

export default function RiderTrackingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders } = useOrders();

  const activeDeliveries = useMemo(() => {
    if (!user) return [];
    return orders.filter(
      (o) => o.riderId === user.id && ['out_for_delivery', 'picked_up', 'in_transit_to_shop', 'ready_for_delivery'].includes(o.status)
    );
  }, [user, orders]);

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    activeDeliveries.length > 0 ? activeDeliveries[0].id : null
  );

  const selectedDelivery = activeDeliveries.find((d) => d.id === selectedDeliveryId);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Live Tracking</Text>
      </SafeAreaView>

      {activeDeliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPin size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Active Deliveries</Text>
          <Text style={styles.emptyText}>You have no active deliveries to track</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {selectedDelivery && (
            <>
              <View style={styles.mapContainer}>
                <TrackingMap
                  riderLocation={{ latitude: 12.8797 + Math.random() * 0.01, longitude: 121.7740 + Math.random() * 0.01 }}
                  customerLocation={{ latitude: 12.8797, longitude: 121.7740 }}
                  shopLocation={{ latitude: 12.8897, longitude: 121.7840 }}
                  height={350}
                  showUserLocation={true}
                />
              </View>

              <View style={styles.deliveryCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Order #{selectedDelivery.id.slice(-6).toUpperCase()}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{ORDER_STATUS_LABELS[selectedDelivery.status]}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Package size={16} color={Colors.primary} />
                  <Text style={styles.detailLabel}>Service</Text>
                  <Text style={styles.detailValue}>{selectedDelivery.serviceName}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.primary} />
                  <Text style={styles.detailLabel}>Pickup</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{selectedDelivery.pickupAddress}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.success} />
                  <Text style={styles.detailLabel}>Delivery</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{selectedDelivery.deliveryAddress}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={16} color={Colors.warning} />
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>{selectedDelivery.customerName}</Text>
                </View>

                <View style={styles.revenueRow}>
                  <Text style={styles.revenueLabel}>Delivery Fee</Text>
                  <Text style={styles.revenueValue}>₱{(selectedDelivery.riderEarnings ?? 0).toFixed(2)}</Text>
                </View>
              </View>
            </>
          )}

          {activeDeliveries.length > 1 && (
            <View style={styles.deliveriesList}>
              <Text style={styles.listTitle}>Other Active Deliveries</Text>
              {activeDeliveries.map((delivery) => (
                <TouchableOpacity
                  key={delivery.id}
                  style={[
                    styles.deliveryItem,
                    selectedDeliveryId === delivery.id && styles.deliveryItemActive,
                  ]}
                  onPress={() => setSelectedDeliveryId(delivery.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.deliveryItemContent}>
                    <Text style={styles.deliveryItemId}>#{delivery.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.deliveryItemShop}>{delivery.shopName}</Text>
                  </View>
                  <View style={styles.deliveryItemStatus}>
                    <Text style={styles.deliveryItemStatusText}>{ORDER_STATUS_LABELS[delivery.status]}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700' as const, color: Colors.text },
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 16 },
  mapContainer: { marginBottom: 16, borderRadius: 14, overflow: 'hidden' },
  deliveryCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  statusBadge: {
    backgroundColor: Colors.primaryFaded,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600' as const, color: Colors.primary },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontSize: 13, color: Colors.textSecondary, width: 70 },
  detailValue: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  revenueLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  revenueValue: { fontSize: 18, fontWeight: '700' as const, color: Colors.success },
  deliveriesList: { marginBottom: 24 },
  listTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 10 },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deliveryItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  deliveryItemContent: { flex: 1, gap: 4 },
  deliveryItemId: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  deliveryItemShop: { fontSize: 12, color: Colors.textSecondary },
  deliveryItemStatus: {
    backgroundColor: Colors.warningLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  deliveryItemStatusText: { fontSize: 11, fontWeight: '600' as const, color: Colors.warning },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
