import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck, Bike, Wallet, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';

export default function RiderHistoryScreen() {
  const { user } = useAuth();
  const { orders } = useOrders();

  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.riderId === user?.id && ['delivered', 'paid', 'completed', 'rated'].includes(o.status));
  }, [orders, user]);

  const totalEarnings = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.riderEarnings ?? 0), 0);
  }, [completedOrders]);

  const todayEarnings = useMemo(() => {
    const today = new Date().toDateString();
    return completedOrders
      .filter((o) => new Date(o.updatedAt).toDateString() === today)
      .reduce((sum, o) => sum + (o.riderEarnings ?? 0), 0);
  }, [completedOrders]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Delivery History</Text>
      </SafeAreaView>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.earningsRow}>
          <View style={styles.earningsCard}>
            <Wallet size={20} color={Colors.primary} />
            <Text style={styles.earningsValue}>₱{totalEarnings}</Text>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
          </View>
          <View style={styles.earningsCard}>
            <TrendingUp size={20} color={Colors.success} />
            <Text style={styles.earningsValue}>₱{todayEarnings}</Text>
            <Text style={styles.earningsLabel}>Today</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{completedOrders.length} Completed Deliveries</Text>

        {completedOrders.map((order) => (
          <View key={order.id} style={styles.historyCard}>
            <View style={styles.cardLeft}>
              <View style={styles.iconWrap}>
                <CircleCheck size={20} color={Colors.success} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.orderName}>{order.shopName}</Text>
                <Text style={styles.orderCustomer}>To: {order.customerName}</Text>
                <Text style={styles.orderDate}>{new Date(order.deliveryDate ?? order.updatedAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              {order.riderEarnings ? (
                <Text style={styles.earningAmount}>+₱{order.riderEarnings}</Text>
              ) : (
                <Text style={styles.orderAmount}>₱{order.totalAmount ?? 0}</Text>
              )}
            </View>
          </View>
        ))}
        {completedOrders.length === 0 && (
          <View style={styles.empty}>
            <Bike size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No deliveries yet</Text>
            <Text style={styles.emptyText}>Completed deliveries will show here</Text>
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
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  earningsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  earningsCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 16, alignItems: 'center',
    gap: 6, borderWidth: 1, borderColor: Colors.borderLight,
  },
  earningsValue: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  earningsLabel: { fontSize: 12, color: Colors.textTertiary },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  historyCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, padding: 16, borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.successLight, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  orderName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  orderCustomer: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  orderDate: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: 16, fontWeight: '800' as const, color: Colors.primary },
  earningAmount: { fontSize: 16, fontWeight: '800' as const, color: Colors.success },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
