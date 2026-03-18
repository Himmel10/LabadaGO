import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { MapPin, Star, ChevronRight, FileText, Shirt, Sparkles, Wind, BedDouble, Wrench, ShoppingBag, Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';
import { LaundryShop, LaundryService, PaymentMethod } from '@/types';
import { DELIVERY_FEE_BASE } from '@/mocks/data';
import DateTimePickerModal from '@/components/DateTimePickerModal';
import LocationPickerModal from '@/components/LocationPickerModal';
const ICON_MAP: Record<string, any> = {
  shirt: Shirt, sparkles: Sparkles, wind: Wind, 'bed-double': BedDouble,
};

const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: 'gcash', label: 'GCash' },
  { key: 'paymaya', label: 'PayMaya' },
  { key: 'card', label: 'Credit/Debit Card' },
  { key: 'cod', label: 'Cash on Delivery' },
];

type Step = 'shop' | 'service' | 'schedule' | 'confirm';

export default function BookLaundryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { getOpenShops } = useShops();
  const params = useLocalSearchParams();

  const [step, setStep] = useState<Step>('shop');
  const [selectedShop, setSelectedShop] = useState<LaundryShop | null>(null);
  const [selectedService, setSelectedService] = useState<LaundryService | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(user?.preferredPaymentMethod ?? 'gcash');
  const [notes, setNotes] = useState<string>('');
  const [pickupAddress, setPickupAddress] = useState<string>(user?.address ?? '');
  const [pickupStreet, setPickupStreet] = useState<string>('');
  const [pickupBarangay, setPickupBarangay] = useState<string>('');
  const [pickupMunicipality, setPickupMunicipality] = useState<string>('');
  const [pickupProvince, setPickupProvince] = useState<string>('');
  const [pickupLandmark, setPickupLandmark] = useState<string>('');
  const [pickupContactPerson, setPickupContactPerson] = useState<string>('');
  const [pickupContactNumber, setPickupContactNumber] = useState<string>('');
  const [pickupSchedule, setPickupSchedule] = useState<Date | null>(null);
  const [pickupCoordinates, setPickupCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const openShops = useMemo(() => getOpenShops(), [getOpenShops]);

  // Jump directly to schedule step if shop and service are pre-selected from shop detail page
  useEffect(() => {
    const shopId = params.shopId as string | undefined;
    const serviceId = params.serviceId as string | undefined;

    if (shopId && serviceId) {
      const shop = openShops.find(s => s.id === shopId);
      if (shop) {
        const service = shop.services?.find(srv => srv.id === serviceId);
        if (service) {
          setSelectedShop(shop);
          setSelectedService(service);
          setStep('schedule');
        }
      }
    }
  }, [params.shopId, params.serviceId, openShops]);

  const handleConfirmDateTime = (date: Date) => {
    setPickupSchedule(date);
  };

  const handleConfirmLocation = (data: {
    address: string;
    street: string;
    barangay: string;
    municipality: string;
    province: string;
    landmark: string;
    contactPerson: string;
    contactNumber: string;
    coords: { latitude: number; longitude: number };
  }) => {
    setPickupAddress(data.address);
    setPickupStreet(data.street);
    setPickupBarangay(data.barangay);
    setPickupMunicipality(data.municipality);
    setPickupProvince(data.province);
    setPickupLandmark(data.landmark);
    setPickupContactPerson(data.contactPerson);
    setPickupContactNumber(data.contactNumber);
    setPickupCoordinates(data.coords);
  };

  const formatPickupDateTime = (date: Date | null) => {
    if (!date) return 'Select date';
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
      Alert.alert('Error', 'Please select your pickup address');
      return;
    }
    if (!pickupSchedule) {
      Alert.alert('Error', 'Please select pickup date');
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
        pickupLatitude: pickupCoordinates?.latitude,
        pickupLongitude: pickupCoordinates?.longitude,
        pickupSchedule: pickupSchedule?.toISOString() || new Date().toISOString(),
        customerConfirmedPrice: false,
        estimatedAmount: DELIVERY_FEE_BASE,
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
                  const Icon = ICON_MAP[service.icon ?? ''] ?? Wrench;
                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.serviceCard}
                      onPress={() => handleSelectService(service)}
                      activeOpacity={0.8}
                    >
                      {service.photo ? (
                        <Image
                          source={{ uri: service.photo }}
                          style={styles.serviceImage}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.serviceIconWrap}>
                          <Icon size={22} color={Colors.primary} />
                        </View>
                      )}
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
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowLocationPicker(true)}
              activeOpacity={0.7}
            >
              <MapPin size={18} color={pickupAddress ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.pickerButtonText, !pickupAddress && styles.placeholderText]}>
                {pickupAddress || 'Tap to select pickup address'}
              </Text>
              <ChevronRight size={20} color={Colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDateTimePicker(true)}
              activeOpacity={0.7}
            >
              <Clock size={18} color={pickupSchedule ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.pickerButtonText, !pickupSchedule && styles.placeholderText]}>
                {formatPickupDateTime(pickupSchedule)}
              </Text>
              <ChevronRight size={20} color={Colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.deliveryFeeCard}>
              <Text style={styles.deliveryFeeTitle}>Delivery Fee</Text>
              <Text style={styles.deliveryFeeValue}>₱{DELIVERY_FEE_BASE}</Text>
              <Text style={styles.deliveryFeeNote}>
                Final total will be calculated after weighing at the shop. You will confirm the amount before payment.
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
              {pickupContactPerson && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Contact Person</Text>
                  <Text style={styles.summaryValue}>{pickupContactPerson}</Text>
                </View>
              )}
              {pickupContactNumber && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Contact Number</Text>
                  <Text style={styles.summaryValue}>{pickupContactNumber}</Text>
                </View>
              )}
              {pickupLandmark && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Landmark</Text>
                  <Text style={styles.summaryValue}>{pickupLandmark}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Schedule</Text>
                <Text style={styles.summaryValue}>{formatPickupDateTime(pickupSchedule)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={[styles.summaryValue, { color: Colors.primary, fontWeight: '800' as const }]}>₱{DELIVERY_FEE_BASE}</Text>
              </View>
              <Text style={styles.disclaimer}>
                The service cost will be calculated after weighing at the shop. You will review and confirm the exact total (service cost + ₱{DELIVERY_FEE_BASE} delivery fee) before payment.
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
                  <View style={styles.radioButton}>
                    {paymentMethod === pm.key && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={[styles.paymentLabel, paymentMethod === pm.key && styles.paymentLabelActive]}>{pm.label}</Text>
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

      <DateTimePickerModal
        visible={showDateTimePicker}
        selectedDate={pickupSchedule}
        onDateTimeSelected={handleConfirmDateTime}
        onClose={() => setShowDateTimePicker(false)}
      />

      <LocationPickerModal
        visible={showLocationPicker}
        selectedAddress={pickupAddress}
        selectedCoords={pickupCoordinates || undefined}
        selectedLandmark={pickupLandmark}
        selectedContactPerson={pickupContactPerson}
        selectedContactNumber={pickupContactNumber}
        onLocationSelected={handleConfirmLocation}
        onClose={() => setShowLocationPicker(false)}
      />
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
  serviceImage: { width: 48, height: 48, borderRadius: 14 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  serviceDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  servicePriceRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  servicePrice: { fontSize: 14, fontWeight: '800' as const, color: Colors.primary },
  serviceEta: { fontSize: 12, color: Colors.textTertiary },
  scheduleSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  inputGroup: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text, minHeight: 20 },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    marginBottom: 12,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textTertiary,
    fontWeight: '500' as const,
  },
  scheduleList: { display: 'none' },
  scheduleCard: { display: 'none' },
  scheduleCardActive: { display: 'none' },
  scheduleText: { display: 'none' },
  scheduleTextActive: { display: 'none' },
  deliveryFeeCard: {
    backgroundColor: Colors.primaryFaded,
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  deliveryFeeTitle: {
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '600' as const,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  deliveryFeeValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.primaryDark,
    marginBottom: 8,
  },
  deliveryFeeNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic' as const,
  },
  estimateCard: { display: 'none' },
  estimateTitle: { display: 'none' },
  estimateValue: { display: 'none' },
  estimateNote: { display: 'none' },
  estimateDisclaimer: { display: 'none' },
  confirmSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
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
  paymentIconContainer: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  paymentLabel: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  paymentLabelActive: { color: Colors.primaryDark },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backStepBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  backStepText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
