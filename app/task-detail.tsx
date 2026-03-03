import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Camera, CheckCircle, User, Store, Package, Truck } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Image } from 'expo-image';
import { DeliveryTask } from '@/types';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { orders, updateOrder, updateOrderStatus, getTasksForRider } = useOrders();


  const task = useMemo((): DeliveryTask | undefined => {
    if (!user) return undefined;
    const tasks = getTasksForRider(user.id);
    return tasks.find((t: DeliveryTask) => t.orderId === id);
  }, [user, id, getTasksForRider]);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [codCollected, setCodCollected] = useState<boolean>(false);

  if (!task) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Task Not Found' }} />
        <View style={styles.empty}><Text style={styles.emptyText}>Task not found or already completed</Text></View>
      </View>
    );
  }

  const order = orders.find((o) => o.id === task.orderId);
  const isPickup = task.type === 'pickup';
  const isCodDelivery = order?.paymentMethod === 'cod' && task.type === 'delivery';

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePickupComplete = () => {
    if (!order) return;

    Alert.alert('Mark Picked Up', 'Confirm you have picked up the laundry from the customer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          updateOrderStatus(order.id, 'picked_up');
          Alert.alert('Picked Up!', 'Now head to the laundry shop.', [
            { text: 'OK', onPress: () => {
              updateOrderStatus(order.id, 'in_transit_to_shop');
            }},
          ]);
        },
      },
    ]);
  };

  const handleArrivedAtShop = () => {
    if (!order) return;
    Alert.alert('Arrived at Shop', 'Confirm you have arrived at the laundry shop?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          updateOrderStatus(order.id, 'arrived_at_shop');
          Alert.alert('Arrived!', 'Hand over the laundry to the shop. The shop will weigh it.');
        },
      },
    ]);
  };

  const handleDeliveryComplete = () => {
    if (!photoUri) {
      Alert.alert('Photo Required', 'Please upload proof of delivery photo');
      return;
    }

    if (isCodDelivery && !codCollected) {
      Alert.alert('Collect Payment', 'Have you collected the cash payment from the customer?', [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Collected',
          onPress: () => {
            setCodCollected(true);
            completeDelivery(true);
          },
        },
      ]);
      return;
    }

    completeDelivery(false);
  };

  const completeDelivery = (markPaid: boolean) => {
    if (!order) return;
    Alert.alert('Complete Delivery', 'Mark this delivery as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          const updates: Record<string, any> = {
            deliveryPhoto: photoUri ?? undefined,
            status: 'delivered',
            deliveryDate: new Date().toISOString(),
          };
          if (markPaid) {
            updates.isPaid = true;
            updates.paymentStatus = 'paid';
            updates.status = 'paid';
          }
          updateOrder(order.id, updates);

          updateUser({ isAvailable: true });

          setIsCompleted(true);
          Alert.alert('Delivery Complete!', markPaid ? 'Payment collected and delivery confirmed.' : 'Delivery confirmed! You are now available for new tasks.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
      },
    ]);
  };

  const currentOrderStatus = order?.status ?? '';
  const showPickupAction = isPickup && ['rider_assigned'].includes(currentOrderStatus);
  const showArrivedAction = isPickup && ['picked_up', 'in_transit_to_shop'].includes(currentOrderStatus);
  const showDeliveryAction = !isPickup && ['ready_for_delivery', 'out_for_delivery'].includes(currentOrderStatus);

  const handleStartDelivery = () => {
    if (!order) return;
    updateOrderStatus(order.id, 'out_for_delivery');
    Alert.alert('On the Way!', 'Delivering laundry to the customer.');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: isPickup ? 'Pickup Task' : 'Delivery Task' }} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.typeBanner, { backgroundColor: isPickup ? Colors.primaryFaded : Colors.riderLight }]}>
          <Text style={styles.typeEmoji}>{isPickup ? '📦' : '🚚'}</Text>
          <View>
            <Text style={[styles.typeTitle, { color: isPickup ? Colors.primaryDark : Colors.rider }]}>
              {isPickup ? 'Pickup Task' : 'Delivery Task'}
            </Text>
            <Text style={styles.typeEta}>Estimated: {task.estimatedTime}</Text>
          </View>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>PICKUP</Text>
              <Text style={styles.routeAddress}>{task.pickupAddress}</Text>
            </View>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: Colors.rider }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>DROP-OFF</Text>
              <Text style={styles.routeAddress}>{task.dropoffAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <User size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{task.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Store size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Shop</Text>
            <Text style={styles.infoValue}>{task.shopName}</Text>
          </View>
          {order?.serviceName && (
            <View style={styles.infoRow}>
              <Package size={18} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{order.serviceName}</Text>
            </View>
          )}
          {order?.totalAmount && (
            <View style={styles.infoRow}>
              <Truck size={18} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>₱{order.totalAmount}</Text>
            </View>
          )}
        </View>

        {isPickup && (
          <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>Pickup Steps</Text>
            <View style={styles.stepCard}>
              <View style={[styles.stepIndicator, showPickupAction && styles.stepActive]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>Pick up laundry from customer</Text>
                {showPickupAction && (
                  <TouchableOpacity style={styles.stepActionBtn} onPress={handlePickupComplete} activeOpacity={0.85}>
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.stepActionText}>Mark Picked Up</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.stepCard}>
              <View style={[styles.stepIndicator, showArrivedAction && styles.stepActive]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>Deliver to laundry shop</Text>
                {showArrivedAction && (
                  <TouchableOpacity style={styles.stepActionBtn} onPress={handleArrivedAtShop} activeOpacity={0.85}>
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.stepActionText}>Arrived at Shop</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.stepCard}>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>Shop weighs laundry & uploads proof</Text>
              </View>
            </View>
          </View>
        )}

        {!isPickup && (
          <>
            {currentOrderStatus === 'ready_for_delivery' && (
              <TouchableOpacity style={styles.startDeliveryBtn} onPress={handleStartDelivery} activeOpacity={0.85}>
                <Truck size={20} color={Colors.white} />
                <Text style={styles.startDeliveryText}>Start Delivery</Text>
              </TouchableOpacity>
            )}

            {showDeliveryAction && currentOrderStatus === 'out_for_delivery' && (
              <>
                <Text style={styles.sectionTitle}>Proof of Delivery</Text>
                <Text style={styles.photoHint}>Upload a photo as proof of delivery</Text>

                {photoUri ? (
                  <View style={styles.photoPreview}>
                    <Image source={{ uri: photoUri }} style={styles.photoImage} contentFit="cover" />
                    <TouchableOpacity style={styles.retakeBtn} onPress={() => handleTakePhoto()}>
                      <Camera size={16} color={Colors.white} />
                      <Text style={styles.retakeBtnText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.photoBtn} onPress={() => handleTakePhoto()} activeOpacity={0.7}>
                    <Camera size={28} color={Colors.primary} />
                    <Text style={styles.photoBtnText}>Upload Photo</Text>
                  </TouchableOpacity>
                )}

                {isCodDelivery && (
                  <View style={styles.codBanner}>
                    <Text style={styles.codTitle}>💵 Cash on Delivery</Text>
                    <Text style={styles.codText}>Collect ₱{order?.totalAmount ?? 0} from the customer</Text>
                  </View>
                )}

                {!isCompleted && (
                  <TouchableOpacity style={styles.completeBtn} onPress={handleDeliveryComplete} activeOpacity={0.85}>
                    <CheckCircle size={20} color={Colors.white} />
                    <Text style={styles.completeBtnText}>Complete Delivery</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  typeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, marginBottom: 16,
  },
  typeEmoji: { fontSize: 36 },
  typeTitle: { fontSize: 18, fontWeight: '800' as const },
  typeEta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  routeCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  routeDot: { width: 14, height: 14, borderRadius: 7 },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 11, fontWeight: '600' as const, color: Colors.textTertiary, letterSpacing: 0.5 },
  routeAddress: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, marginTop: 2 },
  routeDivider: { width: 2, height: 24, backgroundColor: Colors.border, marginLeft: 6, marginVertical: 4 },
  infoSection: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, gap: 14, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 13, color: Colors.textTertiary, width: 70 },
  infoValue: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  stepsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  stepIndicator: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  stepActive: { backgroundColor: Colors.rider },
  stepNumber: { fontSize: 14, fontWeight: '700' as const, color: Colors.white },
  stepContent: { flex: 1, gap: 8 },
  stepText: { fontSize: 14, color: Colors.text, fontWeight: '500' as const },
  stepActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.rider, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignSelf: 'flex-start' as const,
  },
  stepActionText: { fontSize: 13, fontWeight: '700' as const, color: Colors.white },
  startDeliveryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.rider, height: 56, borderRadius: 16, marginBottom: 20,
  },
  startDeliveryText: { fontSize: 17, fontWeight: '700' as const, color: Colors.white },
  photoHint: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  photoBtn: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 30, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary + '30', borderStyle: 'dashed', gap: 8, marginBottom: 20,
  },
  photoBtnText: { fontSize: 15, fontWeight: '600' as const, color: Colors.primary },
  photoPreview: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  photoImage: { width: '100%', height: 200, borderRadius: 16 },
  retakeBtn: {
    position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center',
    gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  retakeBtnText: { fontSize: 13, fontWeight: '600' as const, color: Colors.white },
  codBanner: {
    backgroundColor: Colors.accentLight, borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.accent + '30',
  },
  codTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  codText: { fontSize: 14, color: Colors.textSecondary },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.rider, height: 56, borderRadius: 16,
  },
  completeBtnText: { fontSize: 17, fontWeight: '700' as const, color: Colors.white },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: Colors.textTertiary, textAlign: 'center' as const },
});
