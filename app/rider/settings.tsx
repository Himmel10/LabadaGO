import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ToggleLeft, ToggleRight, Bell, MapPin, Package, Zap } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

export default function RiderSettingsScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState<boolean>(user?.isAvailable !== false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    newDelivery: true,
    pickupReminder: true,
    deliveryUpdate: true,
    paymentConfirmation: true,
  });

  // Navigation Settings
  const [navigation, setNavigation] = useState({
    gpsTracking: true,
    googleMaps: true,
    routeOptimization: false,
  });

  // Order Preferences
  const [orderPrefs, setOrderPrefs] = useState({
    autoAccept: false,
    manualAccept: true,
    maxDistance: 25, // km
  });

  const toggleAvailability = () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    updateUser({ isAvailable: newStatus });
    Alert.alert(
      newStatus ? 'You are now Available' : 'You are now Offline',
      newStatus ? 'You will receive new delivery tasks.' : 'You will not receive new tasks while offline.'
    );
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNavigation = (key: keyof typeof navigation) => {
    setNavigation(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOrderPref = (key: keyof typeof orderPrefs) => {
    if (key === 'autoAccept' && !orderPrefs.autoAccept) {
      setOrderPrefs(prev => ({ ...prev, autoAccept: true, manualAccept: false }));
    } else if (key === 'manualAccept' && !orderPrefs.manualAccept) {
      setOrderPrefs(prev => ({ ...prev, manualAccept: true, autoAccept: false }));
    }
  };

  const notificationOptions = [
    { key: 'newDelivery', label: 'New Delivery Assignment', desc: 'Get notified when you receive new orders' },
    { key: 'pickupReminder', label: 'Pickup Reminder', desc: 'Reminder before pickup time' },
    { key: 'deliveryUpdate', label: 'Delivery Update', desc: 'Status updates during delivery' },
    { key: 'paymentConfirmation', label: 'Payment Confirmation', desc: 'Confirmation when payment is received' },
  ];

  const navigationOptions = [
    { key: 'gpsTracking', label: 'GPS Location Tracking', desc: 'Enable real-time GPS tracking' },
    { key: 'googleMaps', label: 'Open in Google Maps', desc: 'Use Google Maps for navigation' },
    { key: 'routeOptimization', label: 'Route Optimization', desc: 'Optimize delivery route (beta)' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Availability Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Availability</Text>
          </View>
          <TouchableOpacity style={styles.settingCard} onPress={toggleAvailability} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: (isAvailable ? Colors.success : Colors.error) + '15' }]}>
                {isAvailable ? (
                  <ToggleRight size={20} color={Colors.success} />
                ) : (
                  <ToggleLeft size={20} color={Colors.error} />
                )}
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{isAvailable ? 'Available' : 'Offline'}</Text>
                <Text style={styles.settingDesc}>
                  {isAvailable ? 'Receiving delivery tasks' : 'Not receiving tasks'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isAvailable ? Colors.successLight : Colors.errorLight }]}>
              <Text style={[styles.statusText, { color: isAvailable ? Colors.success : Colors.error }]}>
                {isAvailable ? 'ON' : 'OFF'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
          </View>
          {notificationOptions.map((option) => (
            <View key={option.key} style={styles.preferenceCard}>
              <View style={styles.preferenceLeft}>
                <Text style={styles.preferenceLabel}>{option.label}</Text>
                <Text style={styles.preferenceDesc}>{option.desc}</Text>
              </View>
              <Switch
                value={notifications[option.key as keyof typeof notifications]}
                onValueChange={() => toggleNotification(option.key as keyof typeof notifications)}
                trackColor={{ false: Colors.border, true: Colors.successLight }}
                thumbColor={notifications[option.key as keyof typeof notifications] ? Colors.success : Colors.textTertiary}
              />
            </View>
          ))}
        </View>

        {/* Navigation Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Navigation & Map Settings</Text>
          </View>
          {navigationOptions.map((option) => (
            <View key={option.key} style={styles.preferenceCard}>
              <View style={styles.preferenceLeft}>
                <Text style={styles.preferenceLabel}>{option.label}</Text>
                <Text style={styles.preferenceDesc}>{option.desc}</Text>
              </View>
              <Switch
                value={navigation[option.key as keyof typeof navigation]}
                onValueChange={() => toggleNavigation(option.key as keyof typeof navigation)}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={navigation[option.key as keyof typeof navigation] ? Colors.primary : Colors.textTertiary}
              />
            </View>
          ))}
        </View>

        {/* Order Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Order Preferences</Text>
          </View>

          {/* Auto Accept vs Manual Accept */}
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceLeft}>
              <Text style={styles.preferenceLabel}>Order Acceptance</Text>
              <Text style={styles.preferenceDesc}>Choose how you accept orders</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.acceptCard, orderPrefs.autoAccept && styles.acceptCardActive]}
            onPress={() => toggleOrderPref('autoAccept')}
            activeOpacity={0.7}
          >
            <View style={styles.acceptRadio}>
              {orderPrefs.autoAccept && <View style={styles.acceptRadioInner} />}
            </View>
            <View style={styles.acceptInfo}>
              <Text style={styles.acceptLabel}>Auto Accept</Text>
              <Text style={styles.acceptDesc}>Automatically accept all orders within your settings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptCard, orderPrefs.manualAccept && styles.acceptCardActive]}
            onPress={() => toggleOrderPref('manualAccept')}
            activeOpacity={0.7}
          >
            <View style={styles.acceptRadio}>
              {orderPrefs.manualAccept && <View style={styles.acceptRadioInner} />}
            </View>
            <View style={styles.acceptInfo}>
              <Text style={styles.acceptLabel}>Manual Accept</Text>
              <Text style={styles.acceptDesc}>Review and manually accept each order</Text>
            </View>
          </TouchableOpacity>

          {/* Max Distance */}
          <View style={styles.preferenceCard}>
            <View style={styles.preferenceLeft}>
              <Text style={styles.preferenceLabel}>Maximum Delivery Distance</Text>
              <Text style={styles.preferenceDesc}>Orders up to {orderPrefs.maxDistance} km from your location</Text>
            </View>
          </View>

          <View style={styles.distanceContainer}>
            {[15, 20, 25, 30].map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[styles.distanceBtn, orderPrefs.maxDistance === distance && styles.distanceBtnActive]}
                activeOpacity={0.7}
                onPress={() => setOrderPrefs(prev => ({ ...prev, maxDistance: distance }))}
              >
                <Text style={[styles.distanceBtnText, orderPrefs.maxDistance === distance && styles.distanceBtnTextActive]}>
                  {distance}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  settingIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  settingDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' as const },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  preferenceLeft: { flex: 1, marginRight: 12 },
  preferenceLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  preferenceDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  acceptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  acceptCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  acceptRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.primary, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  acceptRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  acceptInfo: { flex: 1 },
  acceptLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  acceptDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  distanceContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  distanceBtn: { flex: 1, paddingVertical: 12, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  distanceBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  distanceBtnText: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  distanceBtnTextActive: { color: Colors.white },
});
