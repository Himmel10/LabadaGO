import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, PanResponder, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, CircleDot, X, AlertCircle, CheckCircle2 } from 'lucide-react-native';
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

function OrderCard({ order, onPress, onStatusPress }: { order: Order; onPress: () => void; onStatusPress?: () => void }) {
  const color = getStatusColor(order.status);
  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.85}>
      {/* Left Status Accent Bar */}
      <View style={[styles.orderAccentBar, { backgroundColor: color }]} />
      
      <View style={styles.orderContent}>
        {/* Header: Order ID and Status */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdSection}>
            <View style={[styles.orderIdBadge, { backgroundColor: color + '15' }]}>
              <Text style={[styles.orderId, { color }]}>#{order.id.slice(-6).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shopNameText} numberOfLines={1}>{order.shopName}</Text>
              <Text style={styles.serviceText} numberOfLines={1}>{order.serviceName}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.statusBadge, { backgroundColor: color + '15' }]}
            onPress={onStatusPress}
          >
            <CircleDot size={8} color={color} />
            <Text style={[styles.statusText, { color }]} numberOfLines={1}>{ORDER_STATUS_LABELS[order.status]}</Text>
          </TouchableOpacity>
        </View>

        {/* Middle: Rider info if available */}
        {order.riderName && (
          <View style={styles.riderSection}>
            <Text style={styles.riderLabel}>🚗</Text>
            <Text style={styles.riderName}>{order.riderName}</Text>
          </View>
        )}

        {/* Bottom: Date and Amount */}
        <View style={styles.orderFooter}>
          <View style={styles.dateSection}>
            <Clock size={13} color={Colors.textTertiary} />
            <Text style={styles.dateText}>{new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.amountBadge, { backgroundColor: color + '10' }]}>
            {order.totalAmount ? (
              <Text style={[styles.amountText, { color }]}>₱{order.totalAmount.toFixed(2)}</Text>
            ) : order.estimatedAmount ? (
              <Text style={[styles.estimatedText, { color }]}>~₱{order.estimatedAmount.toFixed(2)}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CustomerOrdersScreen() {
  const { user } = useAuth();
  const { getOrdersByCustomer } = useOrders();
  const router = useRouter();
  const [modalState, setModalState] = useState<'details' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalExpanded, setIsModalExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'active' | 'pickup' | 'delivery' | 'completed'>('active');

  // Drag gesture
  const modalYPos = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          modalYPos.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          // Collapse modal
          setIsModalExpanded(false);
          Animated.spring(modalYPos, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy < -50) {
          // Expand modal
          setIsModalExpanded(true);
          Animated.spring(modalYPos, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else {
          // Snap back
          Animated.spring(modalYPos, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const orders = useMemo(() => {
    if (!user) return [];
    return getOrdersByCustomer(user.id);
  }, [user, getOrdersByCustomer]);

  // Categorize orders by filter
  const activeOrders = orders.filter((o) => !['delivered', 'paid', 'completed', 'rated', 'cancelled', 'declined'].includes(o.status));
  const pickupOrders = orders.filter((o) => ['rider_assigned', 'picked_up', 'in_transit_to_shop'].includes(o.status));
  const deliveryOrders = orders.filter((o) => ['ready_for_delivery', 'out_for_delivery'].includes(o.status));
  const completedOrders = orders.filter((o) => ['delivered', 'paid', 'completed', 'rated', 'cancelled', 'declined'].includes(o.status));

  let filteredOrders = activeOrders;
  if (activeFilter === 'pickup') filteredOrders = pickupOrders;
  else if (activeFilter === 'delivery') filteredOrders = deliveryOrders;
  else if (activeFilter === 'completed') filteredOrders = completedOrders;

  const handleStatusPress = (order: Order) => {
    setSelectedOrder(order);
    setModalState('details');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>My Orders</Text>
      </SafeAreaView>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['active', 'pickup', 'delivery', 'completed'] as const).map((filter) => {
          const filterLabels = { active: 'Active', pickup: 'Pick-up', delivery: 'Delivery', completed: 'Completed' };
          const filterCounts = {
            active: activeOrders.length,
            pickup: pickupOrders.length,
            delivery: deliveryOrders.length,
            completed: completedOrders.length,
          };
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {filterLabels[filter]} ({filterCounts[filter]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onPress={() => router.push(`/order-detail?id=${order.id}` as any)}
              onStatusPress={() => handleStatusPress(order)}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Package size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'completed' 
                ? 'Completed orders will appear here' 
                : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} orders will appear here`}
            </Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={modalState === 'details' && selectedOrder !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalState(null);
          setIsModalExpanded(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent, 
              isModalExpanded && styles.modalContentExpanded,
              { transform: [{ translateY: modalYPos }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalDragHandle}>
              <View style={styles.dragHandleLine} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => {
              setModalState(null);
              setIsModalExpanded(false);
            }}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedOrder && (
                <View>
                  <View style={styles.modalDetailCard}>
                    <Text style={styles.modalSectionTitle}>Order Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKeyText}>Order ID</Text>
                      <Text style={styles.detailValueText}>#{selectedOrder.id.slice(-6).toUpperCase()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKeyText}>Shop</Text>
                      <Text style={styles.detailValueText}>{selectedOrder.shopName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKeyText}>Service</Text>
                      <Text style={styles.detailValueText}>{selectedOrder.serviceName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKeyText}>Date</Text>
                      <Text style={styles.detailValueText}>{new Date(selectedOrder.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  <View style={styles.modalDetailCard}>
                    <Text style={styles.modalSectionTitle}>Status Information</Text>
                    <View style={styles.statusRow}>
                      <CircleDot 
                        size={16} 
                        color={getStatusColor(selectedOrder.status)}
                        fill={getStatusColor(selectedOrder.status)}
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.detailKeyText}>Current Status</Text>
                        <Text style={[styles.detailValueText, { color: getStatusColor(selectedOrder.status) }]}>
                          {ORDER_STATUS_LABELS[selectedOrder.status]}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {selectedOrder.totalAmount && (
                    <View style={styles.modalDetailCard}>
                      <Text style={styles.modalSectionTitle}>Amount</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailKeyText}>Total Amount</Text>
                        <Text style={styles.amountValueText}>₱{selectedOrder.totalAmount.toFixed(2)}</Text>
                      </View>
                      {selectedOrder.paymentStatus && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailKeyText}>Payment Status</Text>
                          <Text style={[styles.detailValueText, { color: selectedOrder.paymentStatus === 'paid' ? Colors.success : Colors.error }]}>
                            {selectedOrder.paymentStatus}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {selectedOrder.riderName && (
                    <View style={styles.modalDetailCard}>
                      <Text style={styles.modalSectionTitle}>Rider Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailKeyText}>Rider Name</Text>
                        <Text style={styles.detailValueText}>{selectedOrder.riderName}</Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.modalActionBtn}
                    onPress={() => {
                      setModalState(null);
                      router.push(`/order-detail?id=${selectedOrder.id}` as any);
                    }}
                  >
                    <Text style={styles.modalActionBtnText}>View Full Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
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
    backgroundColor: Colors.white, 
    borderRadius: 14, 
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  orderAccentBar: {
    width: 5,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  orderContent: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  orderIdSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  orderIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  orderId: {
    fontSize: 11,
    fontWeight: '800' as const,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  shopNameText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  serviceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  riderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  riderLabel: {
    fontSize: 14,
  },
  riderName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500' as const,
  },
  amountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  estimatedText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { fontSize: 11, fontWeight: '600' as const },
  riderText: { fontSize: 12, color: Colors.rider, fontWeight: '500' as const, marginBottom: 6 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  orderMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' as const },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 0,
    paddingBottom: 0,
    gap: 0,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterTab: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  filterTabActive: {
    borderBottomColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
    textAlign: 'center' as const,
  },
  filterTabTextActive: {
    color: Colors.primary,
    fontWeight: '800' as const,
  },

  // Modal Styles
  modalOverlay: { 
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '50%',
    flexDirection: 'column' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContentExpanded: {
    minHeight: '95%',
  },
  modalDragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dragHandleLine: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  modalDetailCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailKeyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  detailValueText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '700' as const,
  },
  amountValueText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '800' as const,
  },
  modalActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalActionBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
