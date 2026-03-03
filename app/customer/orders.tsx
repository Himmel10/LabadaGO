import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, CircleDot } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';
import { ORDER_STATUS_LABELS } from '@/mocks/data';
import { Order } from '@/types';

function getStatusColor(status: string): string {
  if (['delivered', 'paid', 'completed', 'rated'].includes(status)) return Colors.success;
  if (['cancelled', 'declined'].includes(status)) return Colors.error;
  if (['processing'].includes(status)) return Colors.info;
  if (['awaiting_confirmation', 'booking_created'].includes(status)) return Colors.warning;
  return Colors.primary;
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const color = getStatusColor(order.status);
  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.orderTop}>
        <View style={styles.orderIdRow}>
          <Package size={16} color={Colors.primary} />
          <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: color + '18' }]}>
          <CircleDot size={10} color={color} />
          <Text style={[styles.statusPillText, { color }]}>{ORDER_STATUS_LABELS[order.status]}</Text>
        </View>
      </View>
      <Text style={styles.shopNameText}>{order.shopName}</Text>
      <Text style={styles.serviceText}>{order.serviceName}</Text>
      {order.riderName && (
        <Text style={styles.riderText}>Rider: {order.riderName}</Text>
      )}
      <View style={styles.orderBottom}>
        <View style={styles.orderMetaRow}>
          <Clock size={13} color={Colors.textTertiary} />
          <Text style={styles.dateText}>{new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>
        {order.totalAmount ? (
          <Text style={styles.amountText}>₱{order.totalAmount.toFixed(2)}</Text>
        ) : order.estimatedAmount ? (
          <Text style={styles.estimatedText}>~₱{order.estimatedAmount.toFixed(2)}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function CustomerOrdersScreen() {
  const { user } = useAuth();
  const { getOrdersByCustomer } = useOrders();
  const router = useRouter();

  const orders = useMemo(() => {
    if (!user) return [];
    return getOrdersByCustomer(user.id);
  }, [user, getOrdersByCustomer]);

  const activeOrders = orders.filter((o) => !['delivered', 'paid', 'completed', 'rated', 'cancelled', 'declined'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'paid', 'completed', 'rated', 'cancelled', 'declined'].includes(o.status));

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>My Orders</Text>
      </SafeAreaView>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeOrders.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Active</Text>
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} onPress={() => router.push(`/order-detail?id=${order.id}` as any)} />
            ))}
          </>
        )}
        {pastOrders.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Completed</Text>
            {pastOrders.map((order) => (
              <OrderCard key={order.id} order={order} onPress={() => router.push(`/order-detail?id=${order.id}` as any)} />
            ))}
          </>
        )}
        {orders.length === 0 && (
          <View style={styles.empty}>
            <Package size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Book laundry to place your first order</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingHorizontal: 20, paddingTop: 8 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 13, fontWeight: '600' as const, color: Colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginTop: 20, marginBottom: 10,
  },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderId: { fontSize: 13, fontWeight: '700' as const, color: Colors.textSecondary },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { fontSize: 11, fontWeight: '600' as const },
  shopNameText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  serviceText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  riderText: { fontSize: 12, color: Colors.rider, fontWeight: '500' as const, marginBottom: 6 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  orderMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: Colors.textTertiary },
  amountText: { fontSize: 16, fontWeight: '800' as const, color: Colors.primary },
  estimatedText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textTertiary },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' as const },
});
