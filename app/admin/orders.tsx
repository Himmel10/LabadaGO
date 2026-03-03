import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/mocks/data';

export default function AdminOrdersScreen() {
  const { orders } = useOrders();
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (filter === 'active') {
      list = list.filter((o) => !['delivered', 'paid', 'completed', 'rated', 'cancelled', 'declined'].includes(o.status));
    } else if (filter === 'completed') {
      list = list.filter((o) => ['completed', 'rated'].includes(o.status));
    } else if (filter === 'cancelled') {
      list = list.filter((o) => ['cancelled', 'declined'].includes(o.status));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((o) => o.customerName.toLowerCase().includes(q) || o.shopName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q));
    }
    return list;
  }, [orders, filter, searchQuery]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>All Orders</Text>
        <Text style={styles.subtitle}>{orders.length} total orders</Text>
        <View style={styles.searchWrap}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {['all', 'active', 'completed', 'cancelled'].map((f) => (
              <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filteredOrders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => router.push(`/order-detail?id=${order.id}` as any)} activeOpacity={0.7}>
            <View style={styles.orderTop}>
              <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.statusPill, {
                backgroundColor: ['delivered', 'paid', 'completed', 'rated'].includes(order.status) ? Colors.successLight :
                  ['cancelled', 'declined'].includes(order.status) ? Colors.errorLight : Colors.infoLight
              }]}>
                <Text style={[styles.statusText, {
                  color: ['delivered', 'paid', 'completed', 'rated'].includes(order.status) ? Colors.success :
                    ['cancelled', 'declined'].includes(order.status) ? Colors.error : Colors.info
                }]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>{order.customerName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Shop</Text>
                <Text style={styles.detailValue}>{order.shopName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Service</Text>
                <Text style={styles.detailValue}>{order.serviceName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment</Text>
                <Text style={styles.detailValue}>{order.paymentMethod ? PAYMENT_METHOD_LABELS[order.paymentMethod] : 'Not set'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.amountValue}>{order.totalAmount ? `₱${order.totalAmount}` : 'Pending'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {filteredOrders.length === 0 && (
          <View style={styles.empty}>
            <Package size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No orders found</Text>
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
  subtitle: { fontSize: 14, color: Colors.textSecondary, paddingHorizontal: 20, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, marginHorizontal: 20,
    marginTop: 12, borderRadius: 12, paddingHorizontal: 14, height: 44, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  filterScroll: { marginTop: 12 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' as const },
  orderDetails: { gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: Colors.textTertiary },
  detailValue: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  amountValue: { fontSize: 15, fontWeight: '800' as const, color: Colors.primary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textTertiary },
});
