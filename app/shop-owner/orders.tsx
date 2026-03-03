import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, CheckCircle, X, Scale } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';
import { ORDER_STATUS_LABELS } from '@/mocks/data';
import { OrderStatus } from '@/types';

const SHOP_STATUS_ACTIONS: Record<string, { next: OrderStatus; label: string }[]> = {
  booking_created: [
    { next: 'scheduled', label: 'Accept' },
    { next: 'declined', label: 'Decline' },
  ],
  arrived_at_shop: [
    { next: 'weighed', label: 'Start Weighing' },
  ],
  confirmed: [
    { next: 'processing', label: 'Start Processing' },
  ],
  processing: [
    { next: 'ready_for_delivery', label: 'Mark Ready' },
  ],
};

export default function ShopOrdersScreen() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, updateOrder } = useOrders();
  const { getShopByOwner } = useShops();
  const [filter, setFilter] = useState<string>('all');
  const [weightInput, setWeightInput] = useState<string>('');
  const [weightOrderId, setWeightOrderId] = useState<string | null>(null);

  const shop = getShopByOwner(user?.id ?? '');
  const shopOrders = useMemo(() => {
    if (!shop) return [];
    const filtered = orders.filter((o) => o.shopId === shop.id);
    if (filter === 'all') return filtered;
    if (filter === 'new') return filtered.filter((o) => o.status === 'booking_created');
    if (filter === 'active') return filtered.filter((o) => !['completed', 'cancelled', 'declined', 'rated', 'booking_created'].includes(o.status));
    return filtered.filter((o) => ['completed', 'rated', 'cancelled', 'declined'].includes(o.status));
  }, [orders, shop, filter]);

  const handleAction = (orderId: string, nextStatus: OrderStatus) => {
    if (nextStatus === 'declined') {
      Alert.alert('Decline Order', 'Are you sure you want to decline this order?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Decline', style: 'destructive', onPress: () => updateOrderStatus(orderId, 'declined') },
      ]);
      return;
    }

    if (nextStatus === 'weighed') {
      setWeightOrderId(orderId);
      setWeightInput('');
      return;
    }

    const label = ORDER_STATUS_LABELS[nextStatus] ?? nextStatus;
    Alert.alert('Update Order', `Move to "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateOrderStatus(orderId, nextStatus) },
    ]);
  };

  const handleSubmitWeight = () => {
    if (!weightOrderId || !shop) return;
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    const order = orders.find((o) => o.id === weightOrderId);
    if (!order) return;

    const service = shop.services.find((s) => s.id === order.serviceId);
    const pricePerKg = service?.pricePerKg ?? order.pricePerKg ?? 45;
    const serviceCost = Math.round(weight * pricePerKg);
    const deliveryFee = order.deliveryFee ?? 30;
    const totalAmount = serviceCost + deliveryFee;

    updateOrder(weightOrderId, {
      weight,
      serviceCost,
      deliveryFee,
      totalAmount,
      weightPhoto: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop',
      status: 'awaiting_confirmation',
    });

    setWeightOrderId(null);
    setWeightInput('');
    Alert.alert('Weight Submitted', `Weight: ${weight} kg\nService: ₱${serviceCost}\nDelivery: ₱${deliveryFee}\nTotal: ₱${totalAmount}\n\nWaiting for customer confirmation.`);
  };

  const newCount = useMemo(() => {
    if (!shop) return 0;
    return orders.filter((o) => o.shopId === shop.id && o.status === 'booking_created').length;
  }, [orders, shop]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'All' },
            { key: 'new', label: `New${newCount > 0 ? ` (${newCount})` : ''}` },
            { key: 'active', label: 'Active' },
            { key: 'done', label: 'Done' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {shopOrders.map((order) => {
          const actions = SHOP_STATUS_ACTIONS[order.status] ?? [];
          const isWeighing = weightOrderId === order.id;
          const statusColor = order.status === 'booking_created' ? Colors.accent : Colors.primary;

          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
                  <Text style={[styles.statusTextLabel, { color: statusColor }]}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Text>
                </View>
              </View>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.serviceText}>{order.serviceName} • ₱{order.pricePerKg}/kg</Text>
              {order.weight && <Text style={styles.weightText}>Weight: {order.weight} kg • Total: ₱{order.totalAmount}</Text>}
              {order.pickupSchedule && <Text style={styles.scheduleText}>Pickup: {order.pickupSchedule}</Text>}

              {isWeighing && (
                <View style={styles.weightInputSection}>
                  <View style={styles.weightHeader}>
                    <Scale size={18} color={Colors.primary} />
                    <Text style={styles.weightLabel}>Enter actual weight (kg):</Text>
                  </View>
                  <View style={styles.weightInputRow}>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="e.g. 5.2"
                      placeholderTextColor={Colors.textTertiary}
                      value={weightInput}
                      onChangeText={setWeightInput}
                      keyboardType="decimal-pad"
                    />
                    <TouchableOpacity style={styles.weightSubmitBtn} onPress={handleSubmitWeight}>
                      <Text style={styles.weightSubmitText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weightCancelBtn} onPress={() => setWeightOrderId(null)}>
                      <Text style={styles.weightCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.orderBottom}>
                <Text style={styles.amountText}>
                  {order.totalAmount ? `₱${order.totalAmount}` : `Est. ₱${order.estimatedAmount ?? '—'}`}
                </Text>
                {!isWeighing && actions.length > 0 && (
                  <View style={styles.actionRow}>
                    {actions.map((action) => {
                      const isDecline = action.next === 'declined';
                      return (
                        <TouchableOpacity
                          key={action.next}
                          style={[styles.actionBtn, isDecline && styles.declineBtn]}
                          onPress={() => handleAction(order.id, action.next)}
                          activeOpacity={0.7}
                        >
                          {isDecline ? <X size={14} color={Colors.error} /> : <CheckCircle size={14} color={Colors.white} />}
                          <Text style={[styles.actionBtnText, isDecline && styles.declineBtnText]}>{action.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          );
        })}
        {shopOrders.length === 0 && (
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
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginTop: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 13, fontWeight: '700' as const, color: Colors.textSecondary },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusTextLabel: { fontSize: 11, fontWeight: '600' as const },
  customerName: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  serviceText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  weightText: { fontSize: 13, color: Colors.primary, fontWeight: '600' as const, marginBottom: 2 },
  scheduleText: { fontSize: 12, color: Colors.primary, fontWeight: '500' as const, marginBottom: 6 },
  weightInputSection: { backgroundColor: Colors.primaryFaded, borderRadius: 12, padding: 12, marginBottom: 10 },
  weightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  weightLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.primary },
  weightInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  weightInput: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 14,
    height: 44, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  weightSubmitBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, height: 44, borderRadius: 10, justifyContent: 'center' },
  weightSubmitText: { fontSize: 14, fontWeight: '700' as const, color: Colors.white },
  weightCancelBtn: { paddingHorizontal: 12, height: 44, justifyContent: 'center' },
  weightCancelText: { fontSize: 13, color: Colors.textSecondary },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  amountText: { fontSize: 18, fontWeight: '800' as const, color: Colors.primary },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700' as const, color: Colors.white },
  declineBtn: { backgroundColor: Colors.errorLight, borderWidth: 1, borderColor: Colors.error + '30' },
  declineBtnText: { color: Colors.error },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textTertiary },
});
