import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Package, MapPin, User, Store, Truck, CreditCard, CheckCircle, CircleDot, Star, Clock, Receipt, PhilippinePeso, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, PAYMENT_METHOD_LABELS } from '@/mocks/data';
import { PaymentMethod } from '@/types';
import TrackingMap from '@/components/TrackingMap';
import { GCashIcon, PayMayaIcon, CardIcon, CODIcon } from '@/components/PaymentIcons';

const PAYMENT_METHODS: { key: PaymentMethod; label: string; getIcon: () => React.ReactNode }[] = [
  { key: 'gcash', label: 'GCash', getIcon: () => <GCashIcon size={28} /> },
  { key: 'paymaya', label: 'PayMaya', getIcon: () => <PayMayaIcon size={28} /> },
  { key: 'card', label: 'Credit/Debit Card', getIcon: () => <CardIcon size={28} /> },
  { key: 'cod', label: 'Cash on Delivery', getIcon: () => <CODIcon size={28} /> },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { orders, updateOrder, updateOrderStatus, completeOrderWithEarnings } = useOrders();
  const { addReview } = useShops();

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

  const [shopReviewText, setShopReviewText] = useState<string>('');
  const [riderReviewText, setRiderReviewText] = useState<string>('');
  const [shopRating, setShopRating] = useState<number>(0);
  const [riderRating, setRiderRating] = useState<number>(0);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(order?.paymentMethod ?? 'gcash');

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Order Not Found' }} />
        <View style={styles.empty}><Text style={styles.emptyText}>Order not found</Text></View>
      </View>
    );
  }

  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const isTerminal = ['cancelled', 'declined'].includes(order.status);

  const handleConfirmPrice = () => {
    Alert.alert(
      'Confirm Price',
      `Your laundry weighs ${order.weight} kg.\nService: ₱${order.serviceCost}\nDelivery: ₱${order.deliveryFee}\nTotal: ₱${order.totalAmount}\n\nConfirm this amount?`,
      [
        { text: 'Cancel Order', style: 'destructive', onPress: () => {
          updateOrderStatus(order.id, 'cancelled');
          Alert.alert('Order Cancelled', 'Your order has been cancelled.');
        }},
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateOrder(order.id, {
              customerConfirmedPrice: true,
              status: 'confirmed',
            });
            Alert.alert('Price Confirmed', 'Your laundry is now being processed!');
          },
        },
      ]
    );
  };

  const handlePayment = () => {
    const method = PAYMENT_METHOD_LABELS[selectedPayment];
    Alert.alert(
      'Confirm & Pay',
      `Total: ₱${order.totalAmount}\nPayment: ${method}\n\nProceed with payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            updateOrder(order.id, {
              isPaid: true,
              paymentMethod: selectedPayment,
              paymentStatus: 'paid',
              status: 'paid',
            });
            Alert.alert('Payment Successful', 'Your payment has been confirmed!');
          },
        },
      ]
    );
  };

  const handleSubmitReview = async () => {
    if (shopRating === 0) {
      Alert.alert('Error', 'Please rate the laundry shop');
      return;
    }

    await updateOrder(order.id, {
      shopRating,
      shopReview: shopReviewText.trim() || undefined,
      riderRating: riderRating > 0 ? riderRating : undefined,
      riderReview: riderReviewText.trim() || undefined,
      status: 'rated',
    });

    await addReview({
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      shopId: order.shopId,
      rating: shopRating,
      comment: shopReviewText.trim() || `Rated ${shopRating} stars`,
    });

    await completeOrderWithEarnings(order.id);

    setShowReviewForm(false);
    Alert.alert('Thank you!', 'Your review has been submitted.');
  };

  const showTimeline = !isTerminal;
  const visibleStatuses = ORDER_STATUS_FLOW.slice(0, Math.max(currentStepIndex + 3, 6));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Order #${order.id.slice(-6).toUpperCase()}` }} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusCard, isTerminal && { backgroundColor: Colors.error }]}>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={styles.statusValue}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Text>
        </View>

        {['out_for_delivery', 'picked_up', 'in_transit_to_shop', 'ready_for_delivery'].includes(order.status) && order.riderName && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Live Tracking</Text>
            <TrackingMap
              riderLocation={
                order.riderName ? { latitude: 12.8797 + Math.random() * 0.01, longitude: 121.7740 + Math.random() * 0.01 } : undefined
              }
              customerLocation={order.pickupAddress ? { latitude: 12.8797, longitude: 121.7740 } : undefined}
              shopLocation={order.shopName ? { latitude: 12.8897, longitude: 121.7840 } : undefined}
              height={350}
              showUserLocation={true}
            />
          </View>
        )}

        {showTimeline && (
          <View style={styles.trackingSection}>
            <Text style={styles.sectionTitle}>Order Timeline</Text>
            <View style={styles.timeline}>
              {visibleStatuses.map((status, i) => {
                const isCompleted = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <View key={status} style={styles.timelineItem}>
                    <View style={styles.timelineDotCol}>
                      <View style={[
                        styles.timelineDot,
                        isCompleted && styles.timelineDotCompleted,
                        isCurrent && styles.timelineDotCurrent,
                      ]}>
                        {isCompleted && <CheckCircle size={14} color={Colors.white} />}
                        {isCurrent && <CircleDot size={14} color={Colors.white} />}
                      </View>
                      {i < visibleStatuses.length - 1 && (
                        <View style={[styles.timelineLine, isCompleted && styles.timelineLineCompleted]} />
                      )}
                    </View>
                    <Text style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelCompleted,
                      isCurrent && styles.timelineLabelCurrent,
                    ]}>
                      {ORDER_STATUS_LABELS[status]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {order.weightPhoto && (
          <View style={styles.proofSection}>
            <Text style={styles.sectionTitle}>Weight Proof</Text>
            <View style={styles.proofCard}>
              <Image source={{ uri: order.weightPhoto }} style={styles.proofImage} contentFit="cover" />
              <View style={styles.proofDetails}>
                <View style={styles.proofRow}>
                  <Text style={styles.proofLabel}>Weight</Text>
                  <Text style={styles.proofValue}>{order.weight ?? '—'} kg</Text>
                </View>
                <View style={styles.proofRow}>
                  <Text style={styles.proofLabel}>Service Cost</Text>
                  <Text style={styles.proofValue}>₱{order.serviceCost ?? '—'}</Text>
                </View>
                <View style={styles.proofRow}>
                  <Text style={styles.proofLabel}>Delivery Fee</Text>
                  <Text style={styles.proofValue}>₱{order.deliveryFee ?? '—'}</Text>
                </View>
                <View style={styles.proofRow}>
                  <Text style={styles.proofLabel}>Total</Text>
                  <Text style={styles.proofPrice}>₱{order.totalAmount ?? '—'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {order.status === 'awaiting_confirmation' && !order.customerConfirmedPrice && user?.role === 'customer' && (
          <View style={styles.confirmCard}>
            <Shield size={24} color={Colors.warning} />
            <Text style={styles.confirmTitle}>Price Confirmation Required</Text>
            <Text style={styles.confirmText}>
              Your laundry weighs {order.weight ?? '—'} kg.{'\n'}
              Service: ₱{order.serviceCost ?? '—'}{'\n'}
              Delivery: ₱{order.deliveryFee ?? '—'}{'\n'}
              Total: ₱{order.totalAmount ?? '—'}
            </Text>
            <TouchableOpacity style={styles.confirmPriceBtn} onPress={handleConfirmPrice} activeOpacity={0.85}>
              <CheckCircle size={20} color={Colors.white} />
              <Text style={styles.confirmPriceBtnText}>Confirm Price</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'delivered' && !order.isPaid && user?.role === 'customer' && (
          <View style={styles.paymentCard}>
            <PhilippinePeso size={24} color={Colors.primary} />
            <Text style={styles.paymentTitle}>Payment Required</Text>
            <Text style={styles.paymentSubtext}>
              Total: ₱{order.totalAmount}
            </Text>

            <Text style={styles.paymentSelectLabel}>Select Payment Method</Text>
            {PAYMENT_METHODS.map((pm) => (
              <TouchableOpacity
                key={pm.key}
                style={[styles.paymentOption, selectedPayment === pm.key && styles.paymentOptionActive]}
                onPress={() => setSelectedPayment(pm.key)}
              >
                <View style={styles.paymentIconContainer}>{pm.getIcon()}</View>
                <Text style={[styles.paymentLabel, selectedPayment === pm.key && { color: Colors.primaryDark }]}>{pm.label}</Text>
                {selectedPayment === pm.key && <CheckCircle size={16} color={Colors.primary} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.payBtn} onPress={handlePayment} activeOpacity={0.85}>
              <Text style={styles.payBtnText}>Confirm & Pay ₱{order.totalAmount}</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.paymentMethod === 'cod' && order.status === 'delivered' && order.isPaid && !order.shopRating && user?.role === 'customer' && (
          <View style={styles.codPaidBanner}>
            <CheckCircle size={20} color={Colors.success} />
            <Text style={styles.codPaidText}>Cash payment collected by rider</Text>
          </View>
        )}

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailCard}>
            <DetailRow icon={Store} label="Shop" value={order.shopName} />
            <DetailRow icon={Package} label="Service" value={order.serviceName} />
            <DetailRow icon={User} label="Customer" value={order.customerName} />
            {order.riderName && <DetailRow icon={Truck} label="Rider" value={order.riderName} />}
            <DetailRow icon={MapPin} label="Pickup" value={order.pickupAddress} />
            {order.pickupSchedule && <DetailRow icon={Clock} label="Schedule" value={order.pickupSchedule} />}
            {order.paymentMethod && <DetailRow icon={CreditCard} label="Payment" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />}
            {order.weight != null && <DetailRow icon={Package} label="Weight" value={`${order.weight} kg`} />}
          </View>
        </View>

        <View style={styles.priceSection}>
          {order.totalAmount ? (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service Cost</Text>
                <Text style={styles.priceValueSmall}>₱{(order.serviceCost ?? 0).toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery Fee</Text>
                <Text style={styles.priceValueSmall}>₱{(order.deliveryFee ?? 0).toFixed(2)}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₱{order.totalAmount.toFixed(2)}</Text>
              </View>
            </>
          ) : order.estimatedAmount ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Estimated Amount</Text>
              <Text style={styles.priceEstimate}>~₱{order.estimatedAmount.toFixed(2)}</Text>
            </View>
          ) : null}
          <View style={styles.paidRow}>
            <Text style={styles.paidLabel}>Payment Status</Text>
            <View style={[styles.paidBadge, { backgroundColor: order.isPaid ? Colors.successLight : Colors.warningLight }]}>
              <Text style={[styles.paidText, { color: order.isPaid ? Colors.success : Colors.warning }]}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </Text>
            </View>
          </View>
        </View>

        {order.receiptGenerated && (
          <View style={styles.receiptCard}>
            <Receipt size={20} color={Colors.primary} />
            <Text style={styles.receiptTitle}>Digital Receipt</Text>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Order ID</Text><Text style={styles.receiptValue}>#{order.id.slice(-6).toUpperCase()}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Shop</Text><Text style={styles.receiptValue}>{order.shopName}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Service</Text><Text style={styles.receiptValue}>{order.serviceName}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Weight</Text><Text style={styles.receiptValue}>{order.weight} kg</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Rate</Text><Text style={styles.receiptValue}>₱{order.pricePerKg}/kg</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Service Cost</Text><Text style={styles.receiptValue}>₱{order.serviceCost}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Delivery</Text><Text style={styles.receiptValue}>₱{order.deliveryFee}</Text></View>
            <View style={[styles.receiptRow, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, marginTop: 4 }]}>
              <Text style={[styles.receiptLabel, { fontWeight: '800' as const, color: Colors.text }]}>Total</Text>
              <Text style={[styles.receiptValue, { fontWeight: '800' as const, color: Colors.primary, fontSize: 18 }]}>₱{order.totalAmount}</Text>
            </View>
            {order.riderName && <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Rider</Text><Text style={styles.receiptValue}>{order.riderName}</Text></View>}
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Payment</Text><Text style={styles.receiptValue}>{PAYMENT_METHOD_LABELS[order.paymentMethod ?? 'cod']}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Date</Text><Text style={styles.receiptValue}>{new Date(order.createdAt).toLocaleDateString()}</Text></View>
          </View>
        )}

        {['delivered', 'paid', 'completed'].includes(order.status) && !order.shopRating && user?.role === 'customer' && !showReviewForm && (
          <TouchableOpacity style={styles.rateBtn} onPress={() => setShowReviewForm(true)} activeOpacity={0.85}>
            <Star size={20} color={Colors.white} />
            <Text style={styles.rateBtnText}>Rate & Review</Text>
          </TouchableOpacity>
        )}

        {showReviewForm && (
          <View style={styles.reviewForm}>
            <Text style={styles.reviewFormTitle}>Rate your experience</Text>

            <View style={styles.ratingSection}>
              <View style={styles.ratingHeader}>
                <Text style={styles.reviewSubtitle}>Laundry Shop</Text>
                {shopRating > 0 && (
                  <Text style={styles.ratingLabel}>
                    {shopRating === 5 ? '⭐ Excellent!' : shopRating === 4 ? '👍 Good' : shopRating === 3 ? '👌 Fair' : '😞 Poor'}
                  </Text>
                )}
              </View>
              <View style={styles.starsInput}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity 
                    key={s} 
                    onPress={() => setShopRating(s)} 
                    activeOpacity={0.6}
                    style={[
                      styles.starButton,
                      s <= shopRating && styles.starButtonSelected,
                    ]}
                  >
                    <Star 
                      size={40} 
                      color={s <= shopRating ? Colors.accent : Colors.borderLight} 
                      fill={s <= shopRating ? Colors.accent : 'transparent'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Share your feedback about the shop (optional)"
              placeholderTextColor={Colors.textTertiary}
              value={shopReviewText}
              onChangeText={setShopReviewText}
              multiline
              numberOfLines={3}
            />

            {order.riderName && (
              <View style={styles.ratingSection}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.reviewSubtitle}>Rider Service</Text>
                  {riderRating > 0 && (
                    <Text style={styles.ratingLabel}>
                      {riderRating === 5 ? '⭐ Excellent!' : riderRating === 4 ? '👍 Good' : riderRating === 3 ? '👌 Fair' : '😞 Poor'}
                    </Text>
                  )}
                </View>
                <View style={styles.starsInput}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity 
                      key={`r${s}`} 
                      onPress={() => setRiderRating(s)} 
                      activeOpacity={0.6}
                      style={[
                        styles.starButton,
                        s <= riderRating && styles.starButtonSelected,
                      ]}
                    >
                      <Star 
                        size={40} 
                        color={s <= riderRating ? Colors.rider : Colors.borderLight} 
                        fill={s <= riderRating ? Colors.rider : 'transparent'} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {order.riderName && (
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your feedback about the rider (optional)"
                placeholderTextColor={Colors.textTertiary}
                value={riderReviewText}
                onChangeText={setRiderReviewText}
                multiline
                numberOfLines={3}
              />
            )}

            <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview} activeOpacity={0.85}>
              <Star size={20} color={Colors.white} />
              <Text style={styles.submitReviewText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.shopRating != null && (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>Your Shop Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={24} color={Colors.accent} fill={s <= (order.shopRating ?? 0) ? Colors.accent : 'transparent'} />
              ))}
            </View>
            {order.shopReview && <Text style={styles.reviewText}>{order.shopReview}</Text>}

            {order.riderRating != null && (
              <>
                <Text style={[styles.ratingTitle, { marginTop: 16 }]}>Your Rider Rating</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={`r${s}`} size={24} color={Colors.rider} fill={s <= (order.riderRating ?? 0) ? Colors.rider : 'transparent'} />
                  ))}
                </View>
                {order.riderReview && <Text style={styles.reviewText}>{order.riderReview}</Text>}
              </>
            )}
          </View>
        )}

        {order.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Icon size={16} color={Colors.textTertiary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  statusCard: {
    backgroundColor: Colors.primary, borderRadius: 18, padding: 20, marginBottom: 20, alignItems: 'center',
  },
  statusLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' as const, marginBottom: 4 },
  statusValue: { fontSize: 20, fontWeight: '800' as const, color: Colors.white },
  mapSection: { marginBottom: 20 },
  trackingSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 14 },
  timeline: { paddingLeft: 4 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineDotCol: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  timelineDotCompleted: { backgroundColor: Colors.success },
  timelineDotCurrent: { backgroundColor: Colors.primary },
  timelineLine: { width: 2, height: 24, backgroundColor: Colors.border },
  timelineLineCompleted: { backgroundColor: Colors.success },
  timelineLabel: { fontSize: 14, color: Colors.textTertiary, marginLeft: 12, paddingTop: 2, paddingBottom: 10 },
  timelineLabelCompleted: { color: Colors.success, fontWeight: '500' as const },
  timelineLabelCurrent: { color: Colors.primary, fontWeight: '700' as const },
  proofSection: { marginBottom: 20 },
  proofCard: {
    backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  proofImage: { width: '100%', height: 180 },
  proofDetails: { padding: 16, gap: 8 },
  proofRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  proofLabel: { fontSize: 14, color: Colors.textSecondary },
  proofValue: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  proofPrice: { fontSize: 20, fontWeight: '800' as const, color: Colors.primary },
  confirmCard: {
    backgroundColor: Colors.warningLight, borderRadius: 16, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.warning + '30', alignItems: 'center', gap: 8,
  },
  confirmTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.warning },
  confirmText: { fontSize: 14, color: Colors.text, lineHeight: 22, textAlign: 'center' as const },
  confirmPriceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.success, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, marginTop: 4,
  },
  confirmPriceBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  paymentCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center', gap: 8,
  },
  paymentTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  paymentSubtext: { fontSize: 18, fontWeight: '800' as const, color: Colors.primary },
  paymentSelectLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary, marginTop: 8, marginBottom: 4, alignSelf: 'flex-start' as const },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10,
    backgroundColor: Colors.background, marginBottom: 6, borderWidth: 1, borderColor: Colors.border, width: '100%',
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded + '40' },
  paymentIconContainer: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  paymentLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  payBtn: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, marginTop: 8, width: '100%', alignItems: 'center' },
  payBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  codPaidBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.successLight,
    padding: 14, borderRadius: 12, marginBottom: 16,
  },
  codPaidText: { fontSize: 14, fontWeight: '600' as const, color: Colors.success },
  detailSection: { marginBottom: 16 },
  detailCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontSize: 13, color: Colors.textTertiary, width: 70 },
  detailValue: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  priceSection: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  priceLabel: { fontSize: 14, color: Colors.textSecondary },
  priceValueSmall: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  priceEstimate: { fontSize: 18, fontWeight: '700' as const, color: Colors.textTertiary },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  totalValue: { fontSize: 22, fontWeight: '800' as const, color: Colors.primary },
  paidRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  paidLabel: { fontSize: 14, color: Colors.textSecondary },
  paidBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  paidText: { fontSize: 12, fontWeight: '600' as const },
  receiptCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.borderLight, gap: 6,
  },
  receiptTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptLabel: { fontSize: 13, color: Colors.textSecondary },
  receiptValue: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  rateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, paddingVertical: 16, borderRadius: 16, marginBottom: 16,
  },
  rateBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  reviewForm: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  reviewFormTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, textAlign: 'center' as const, marginBottom: 16 },
  ratingSection: { marginBottom: 20, gap: 10 },
  ratingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewSubtitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary, textAlign: 'center' as const },
  ratingLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.primary, backgroundColor: Colors.primaryFaded, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  starsInput: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  starButton: { padding: 4 },
  starButtonSelected: { transform: [{ scale: 1.1 }] },
  reviewInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14,
    fontSize: 15, color: Colors.text, minHeight: 70, textAlignVertical: 'top' as const,
    marginBottom: 16,
  },
  submitReviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.accent, paddingVertical: 14, borderRadius: 12 },
  submitReviewText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  ratingCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  ratingTitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 8 },
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  reviewText: { fontSize: 14, color: Colors.text, textAlign: 'center' as const },
  notesCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  notesTitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 4 },
  notesText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: Colors.textTertiary },
});
