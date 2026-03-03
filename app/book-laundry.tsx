import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { MapPin, Star, ChevronRight, CheckCircle, FileText, Shirt, Sparkles, Wind, BedDouble, Wrench, ShoppingBag, Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';
import { LaundryShop, LaundryService, PaymentMethod } from '@/types';
import { DELIVERY_FEE_BASE } from '@/mocks/data';

const ICON_MAP: Record<string, any> = {
  shirt: Shirt, sparkles: Sparkles, wind: Wind, 'bed-double': BedDouble,
};

const PAYMENT_METHODS: { key: PaymentMethod; label: string; emoji: string }[] = [
  { key: 'gcash', label: 'GCash', emoji: '💚' },
  { key: 'paymaya', label: 'PayMaya', emoji: '💙' },
  { key: 'card', label: 'Credit/Debit Card', emoji: '💳' },
  { key: 'cod', label: 'Cash on Delivery', emoji: '💵' },
];

const PICKUP_TIMES = ['ASAP', 'Today 2:00 PM', 'Today 4:00 PM', 'Tomorrow 9:00 AM', 'Tomorrow 12:00 PM'];

type Step = 'shop' | 'service' | 'schedule' | 'confirm';

export default function BookLaundryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { getOpenShops } = useShops();

  const [step, setStep] = useState<Step>('shop');
  const [selectedShop, setSelectedShop] = useState<LaundryShop | null>(null);
  const [selectedService, setSelectedService] = useState<LaundryService | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState<string>(user?.address ?? '');
  const [pickupSchedule, setPickupSchedule] = useState<string>('ASAP');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const openShops = useMemo(() => getOpenShops(), [getOpenShops]);

  const estimatedPrice = selectedService ? `₱${(selectedService.pricePerKg * 3).toFixed(0)} - ₱${(selectedService.pricePerKg * 8).toFixed(0)}` : '';

  const handleSelectShop = (shop: LaundryShop) => {
    setSelectedShop(shop);
    setSelectedService(null);
    setStep('service');
  };

  const handleSelectService = (service: LaundryService) => {
    setSelectedService(service);
    setStep('schedule');
  };

  const handleConfirmBooking = async () => {
    if (!selectedShop || !selectedService || !user) return;
    if (!pickupAddress.trim()) {
      Alert.alert('Error', 'Please enter your pickup address');
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        customerId: user.id,
        customerName: user.name,
        shopId: selectedShop.id,
        shopName: selectedShop.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        pricePerKg: selectedService.pricePerKg,
        status: 'booking_created',
        paymentMethod,
        paymentStatus: 'pending',
        isPaid: false,
        pickupAddress: pickupAddress.trim(),
        deliveryAddress: pickupAddress.trim(),
        pickupDate: new Date().toISOString(),
        pickupSchedule,
        customerConfirmedPrice: false,
        estimatedAmount: selectedService.pricePerKg * 5,
        deliveryFee: DELIVERY_FEE_BASE,
        receiptGenerated: false,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Booking Created!',
        'Your booking has been sent to the shop. You will be notified once they accept it.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to place booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    if (step === 'shop') return 'Select a Shop';
    if (step === 'service') return 'Choose Service';
    if (step === 'schedule') return 'Schedule Pickup';
    return 'Confirm Booking';
  };

  const steps: Step[] = ['shop', 'service', 'schedule', 'confirm'];
  const currentIdx = steps.indexOf(step);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: getStepTitle() }} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.stepIndicator}>
          {steps.map((s, i) => (
            <View key={s} style={styles.stepRow}>
              <View style={[styles.stepDot, (currentIdx >= i) && styles.stepDotActive]}>
                <Text style={[styles.stepNum, (currentIdx >= i) && styles.stepNumActive]}>{i + 1}</Text>
              </View>
              {i < steps.length - 1 && <View style={[styles.stepLine, (currentIdx > i) && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        {step === 'shop' && (
          <View style={styles.listSection}>
            <Text style={styles.sectionSubtitle}>{openShops.length} shops available</Text>
            {openShops.length === 0 && (
              <View style={styles.emptyState}>
                <ShoppingBag size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No shops available</Text>
                <Text style={styles.emptySubtext}>Check back later</Text>
              </View>
            )}
            {openShops.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopCard}
                onPress={() => handleSelectShop(shop)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: shop.image }} style={styles.shopImage} contentFit="cover" />
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                  <View style={styles.shopMeta}>
                    <MapPin size={12} color={Colors.textTertiary} />
                    <Text style={styles.shopAddress} numberOfLines={1}>{shop.address}</Text>
                  </View>
                  <View style={styles.shopBottom}>
                    <Star size={13} color={Colors.accent} fill={Colors.accent} />
                    <Text style={styles.ratingText}>{shop.rating > 0 ? shop.rating : 'New'}</Text>
                    <Text style={styles.distanceText}>{shop.services.length} services</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'service' && selectedShop && (
          <View style={styles.listSection}>
            <TouchableOpacity style={styles.selectedShopBar} onPress={() => setStep('shop')}>
              <Text style={styles.selectedLabel}>Shop:</Text>
              <Text style={styles.selectedValue} numberOfLines={1}>{selectedShop.name}</Text>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>

            {selectedShop.services.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No services available</Text>
                <Text style={styles.emptySubtext}>This shop has not added any services yet</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionSubtitle}>Available services at {selectedShop.name}</Text>
                {selectedShop.services.map((service) => {
                  const Icon = ICON_MAP[service.icon] ?? Wrench;
                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.serviceCard}
                      onPress={() => handleSelectService(service)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.serviceIconWrap}>
                        <Icon size={22} color={Colors.primary} />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.serviceDesc}>{service.description}</Text>
                        <View style={styles.servicePriceRow}>
                          <Text style={styles.servicePrice}>₱{service.pricePerKg}/kg</Text>
                          <Text style={styles.serviceEta}>{service.estimatedHours}h turnaround</Text>
                        </View>
                      </View>
                      <ChevronRight size={18} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>
        )}

        {step === 'schedule' && selectedShop && selectedService && (
          <View style={styles.scheduleSection}>
            <TouchableOpacity style={styles.selectedShopBar} onPress={() => setStep('service')}>
              <Text style={styles.selectedLabel}>{selectedShop.name}</Text>
              <Text style={styles.selectedValue} numberOfLines={1}>{selectedService.name}</Text>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>PICKUP ADDRESS</Text>
            <View style={styles.inputGroup}>
              <MapPin size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your pickup address"
                placeholderTextColor={Colors.textTertiary}
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>

            <Text style={styles.sectionLabel}>PICKUP SCHEDULE</Text>
            <View style={styles.scheduleList}>
              {PICKUP_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.scheduleCard, pickupSchedule === time && styles.scheduleCardActive]}
                  onPress={() => setPickupSchedule(time)}
                  activeOpacity={0.7}
                >
                  <Clock size={16} color={pickupSchedule === time ? Colors.primary : Colors.textTertiary} />
                  <Text style={[styles.scheduleText, pickupSchedule === time && styles.scheduleTextActive]}>{time}</Text>
                  {pickupSchedule === time && <CheckCircle size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.estimateCard}>
              <Text style={styles.estimateTitle}>Estimated Price</Text>
              <Text style={styles.estimateValue}>{estimatedPrice}</Text>
              <Text style={styles.estimateNote}>+ ₱{DELIVERY_FEE_BASE} delivery fee</Text>
              <Text style={styles.estimateDisclaimer}>
                Final price will be determined after actual weighing at the shop. You will confirm before payment.
              </Text>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep('service')}>
                <Text style={styles.backStepText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => setStep('confirm')}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'confirm' && selectedShop && selectedService && (
          <View style={styles.confirmSection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shop</Text>
                <Text style={styles.summaryValue}>{selectedShop.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>{selectedService.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Rate</Text>
                <Text style={styles.summaryValue}>₱{selectedService.pricePerKg}/kg</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pickup</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>{pickupAddress || 'N/A'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Schedule</Text>
                <Text style={styles.summaryValue}>{pickupSchedule}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>₱{DELIVERY_FEE_BASE}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Est. Total</Text>
                <Text style={[styles.summaryValue, { color: Colors.primary, fontWeight: '800' as const }]}>{estimatedPrice}</Text>
              </View>
              <Text style={styles.disclaimer}>
                This is an estimated price only. The actual price will be calculated after weighing at the shop. You will review and confirm the exact amount before payment.
              </Text>
            </View>

            <Text style={styles.sectionLabel}>SPECIAL INSTRUCTIONS</Text>
            <View style={styles.inputGroup}>
              <FileText size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Any special requests? (optional)"
                placeholderTextColor={Colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            <Text style={styles.sectionLabel}>PREFERRED PAYMENT METHOD</Text>
            <View style={styles.paymentList}>
              {PAYMENT_METHODS.map((pm) => (
                <TouchableOpacity
                  key={pm.key}
                  style={[styles.paymentCard, paymentMethod === pm.key && styles.paymentCardActive]}
                  onPress={() => setPaymentMethod(pm.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.paymentEmoji}>{pm.emoji}</Text>
                  <Text style={[styles.paymentLabel, paymentMethod === pm.key && styles.paymentLabelActive]}>{pm.label}</Text>
                  {paymentMethod === pm.key && <CheckCircle size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep('schedule')}>
                <Text style={styles.backStepText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleConfirmBooking}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmBtnText}>{isSubmitting ? 'Booking...' : 'Book Laundry'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepNum: { fontSize: 14, fontWeight: '700' as const, color: Colors.textTertiary },
  stepNumActive: { color: Colors.white },
  stepLine: { width: 28, height: 2, backgroundColor: Colors.border },
  stepLineActive: { backgroundColor: Colors.primary },
  listSection: { gap: 10 },
  sectionSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 6 },
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
  emptySubtext: { fontSize: 14, color: Colors.textTertiary },
  selectedShopBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryFaded,
    padding: 14, borderRadius: 12, gap: 8, marginBottom: 6,
  },
  selectedLabel: { fontSize: 13, color: Colors.textSecondary },
  selectedValue: { fontSize: 14, fontWeight: '700' as const, color: Colors.primaryDark, flex: 1 },
  changeText: { fontSize: 13, color: Colors.primary, fontWeight: '600' as const },
  shopCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderLight,
  },
  shopImage: { width: 80, height: 80 },
  shopInfo: { flex: 1, padding: 12, gap: 4 },
  shopName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  shopMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shopAddress: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  shopBottom: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '600' as const, color: Colors.text },
  distanceText: { fontSize: 12, color: Colors.textTertiary, marginLeft: 8 },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: 16, borderRadius: 14, gap: 14, borderWidth: 1, borderColor: Colors.borderLight,
  },
  serviceIconWrap: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  serviceDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  servicePriceRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  servicePrice: { fontSize: 14, fontWeight: '800' as const, color: Colors.primary },
  serviceEta: { fontSize: 12, color: Colors.textTertiary },
  scheduleSection: {},
  sectionLabel: {
    fontSize: 12, fontWeight: '600' as const, color: Colors.textTertiary,
    letterSpacing: 0.5, marginBottom: 8, marginTop: 16,
  },
  inputGroup: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text, minHeight: 20 },
  scheduleList: { gap: 6 },
  scheduleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: 14, borderRadius: 12, gap: 12, borderWidth: 1.5, borderColor: Colors.border,
  },
  scheduleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded + '40' },
  scheduleText: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  scheduleTextActive: { color: Colors.primaryDark },
  estimateCard: {
    backgroundColor: Colors.primaryFaded, borderRadius: 16, padding: 18, marginTop: 16,
    borderWidth: 1, borderColor: Colors.primary + '20',
  },
  estimateTitle: { fontSize: 13, color: Colors.primaryDark, fontWeight: '600' as const, marginBottom: 4 },
  estimateValue: { fontSize: 24, fontWeight: '800' as const, color: Colors.primaryDark },
  estimateNote: { fontSize: 13, color: Colors.primary, marginTop: 4 },
  estimateDisclaimer: { fontSize: 12, color: Colors.textSecondary, marginTop: 8, lineHeight: 17, fontStyle: 'italic' as const },
  confirmSection: {},
  summaryCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight, marginBottom: 4,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, maxWidth: '60%' as any, textAlign: 'right' as const },
  disclaimer: { fontSize: 12, color: Colors.textTertiary, lineHeight: 18, marginTop: 12, fontStyle: 'italic' as const },
  paymentList: { gap: 8, marginBottom: 20 },
  paymentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: 14, borderRadius: 14, gap: 12, borderWidth: 1.5, borderColor: Colors.border,
  },
  paymentCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded + '40' },
  paymentEmoji: { fontSize: 20 },
  paymentLabel: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  paymentLabelActive: { color: Colors.primaryDark },
  btnRow: { flexDirection: 'row', gap: 10 },
  backStepBtn: {
    flex: 1, height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white,
  },
  backStepText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
  nextBtn: {
    flex: 2, backgroundColor: Colors.primary, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  nextBtnText: { fontSize: 17, fontWeight: '700' as const, color: Colors.white },
  confirmBtn: {
    flex: 2, backgroundColor: Colors.primary, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText: { fontSize: 17, fontWeight: '700' as const, color: Colors.white },
});
