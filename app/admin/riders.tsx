import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bike, Plus, X, User, Mail, Phone, MapPin, Lock, Car, CircleUser, ChevronDown, Shield, CircleCheck, CircleX, Search } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useShops } from '@/contexts/ShopContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';

type VehicleType = 'motorcycle' | 'bicycle' | 'car';

const VEHICLE_LABELS: Record<VehicleType, string> = {
  motorcycle: 'Motorcycle',
  bicycle: 'Bicycle',
  car: 'Car',
};

export default function AdminRidersScreen() {
  const { allUsers, registerRider, suspendUser, activateUser } = useAuth();
  const { shops } = useShops();
  const { orders } = useOrders();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorcycle');
  const [plateNumber, setPlateNumber] = useState<string>('');
  const [showVehiclePicker, setShowVehiclePicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const riders = useMemo(() => {
    const riderList = allUsers.filter((u) => u.role === 'rider');
    if (!searchQuery.trim()) return riderList;
    const q = searchQuery.toLowerCase();
    return riderList.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }, [allUsers, searchQuery]);

  const getRiderStats = useCallback((riderId: string) => {
    const riderOrders = orders.filter((o) => o.riderId === riderId);
    const completed = riderOrders.filter((o) => ['delivered', 'completed', 'rated'].includes(o.status)).length;
    const earnings = riderOrders.reduce((sum, o) => sum + (o.riderEarnings ?? 0), 0);
    return { completed, earnings, total: riderOrders.length };
  }, [orders]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setPassword('');
    setVehicleType('motorcycle');
    setPlateNumber('');
  };

  const handleAddRider = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await registerRider({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        password: password.trim(),
        vehicleType,
        plateNumber: plateNumber.trim() || undefined,
      });
      Alert.alert('Success', `Rider "${name.trim()}" has been registered.`);
      resetForm();
      setShowAddModal(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to register rider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = (userId: string, userName: string) => {
    Alert.alert('Suspend Rider', `Are you sure you want to suspend ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Suspend', style: 'destructive', onPress: () => suspendUser(userId) },
    ]);
  };

  const handleActivate = (userId: string, userName: string) => {
    Alert.alert('Activate Rider', `Activate ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Activate', onPress: () => activateUser(userId) },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Riders</Text>
            <Text style={styles.subtitle}>{riders.length} registered rider{riders.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.7}>
            <Plus size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchWrap}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search riders..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {riders.map((rider) => {
          const stats = getRiderStats(rider.id);
          return (
            <View key={rider.id} style={[styles.riderCard, rider.isSuspended && styles.suspendedCard]}>
              <View style={styles.riderTop}>
                <View style={styles.riderInfo}>
                  <View style={[styles.avatarWrap, { backgroundColor: rider.isSuspended ? Colors.errorLight : Colors.primaryFaded }]}>
                    <CircleUser size={22} color={rider.isSuspended ? Colors.error : Colors.primary} />
                  </View>
                  <View style={styles.riderDetails}>
                    <Text style={styles.riderName}>{rider.name}</Text>
                    <Text style={styles.riderEmail}>{rider.email}</Text>
                  </View>
                </View>
                <View style={[styles.statusDot, { backgroundColor: rider.isSuspended ? Colors.error : rider.isAvailable ? Colors.success : Colors.textTertiary }]} />
              </View>

              <View style={styles.riderMeta}>
                {rider.vehicleType && (
                  <View style={styles.metaChip}>
                    <Car size={12} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{VEHICLE_LABELS[rider.vehicleType]}</Text>
                  </View>
                )}
                {rider.plateNumber && (
                  <View style={styles.metaChip}>
                    <Text style={styles.metaText}>{rider.plateNumber}</Text>
                  </View>
                )}
                <View style={[styles.metaChip, { backgroundColor: rider.isSuspended ? Colors.errorLight : rider.isAvailable ? Colors.successLight : Colors.background }]}>
                  <Text style={[styles.metaText, { color: rider.isSuspended ? Colors.error : rider.isAvailable ? Colors.success : Colors.textSecondary }]}>
                    {rider.isSuspended ? 'Suspended' : rider.isAvailable ? 'Available' : 'Offline'}
                  </Text>
                </View>
              </View>

              <View style={styles.riderStatsRow}>
                <View style={styles.riderStat}>
                  <Text style={styles.riderStatValue}>{stats.total}</Text>
                  <Text style={styles.riderStatLabel}>Orders</Text>
                </View>
                <View style={styles.riderStat}>
                  <Text style={styles.riderStatValue}>{stats.completed}</Text>
                  <Text style={styles.riderStatLabel}>Done</Text>
                </View>
                <View style={styles.riderStat}>
                  <Text style={[styles.riderStatValue, { color: Colors.success }]}>₱{stats.earnings}</Text>
                  <Text style={styles.riderStatLabel}>Earned</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                {rider.isSuspended ? (
                  <TouchableOpacity style={styles.activateBtn} onPress={() => handleActivate(rider.id, rider.name)} activeOpacity={0.7}>
                    <CircleCheck size={14} color={Colors.success} />
                    <Text style={[styles.actionText, { color: Colors.success }]}>Activate</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.suspendBtn} onPress={() => handleSuspend(rider.id, rider.name)} activeOpacity={0.7}>
                    <CircleX size={14} color={Colors.error} />
                    <Text style={[styles.actionText, { color: Colors.error }]}>Suspend</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {riders.length === 0 && (
          <View style={styles.empty}>
            <Bike size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No riders yet</Text>
            <Text style={styles.emptyText}>Tap + to add a new rider</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Rider</Text>
              <TouchableOpacity onPress={() => { resetForm(); setShowAddModal(false); }} style={styles.closeBtn}>
                <X size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.formSection}>Personal Information</Text>
              <InputRow icon={User} placeholder="Full Name *" value={name} onChangeText={setName} />
              <InputRow icon={Phone} placeholder="Contact Number *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <InputRow icon={Mail} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <InputRow icon={MapPin} placeholder="Address *" value={address} onChangeText={setAddress} />
              <InputRow icon={Lock} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />

              <Text style={styles.formSection}>Vehicle Details</Text>

              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowVehiclePicker(!showVehiclePicker)} activeOpacity={0.7}>
                <Car size={18} color={Colors.textSecondary} />
                <Text style={[styles.pickerText, vehicleType && { color: Colors.text }]}>
                  {VEHICLE_LABELS[vehicleType]}
                </Text>
                <ChevronDown size={18} color={Colors.textTertiary} />
              </TouchableOpacity>

              {showVehiclePicker && (
                <View style={styles.pickerOptions}>
                  {(['motorcycle', 'bicycle', 'car'] as VehicleType[]).map((v) => (
                    <TouchableOpacity key={v} style={[styles.pickerOption, vehicleType === v && styles.pickerOptionActive]} onPress={() => { setVehicleType(v); setShowVehiclePicker(false); }}>
                      <Text style={[styles.pickerOptionText, vehicleType === v && { color: Colors.primary, fontWeight: '700' as const }]}>{VEHICLE_LABELS[v]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <InputRow icon={Shield} placeholder="Plate Number (Optional)" value={plateNumber} onChangeText={setPlateNumber} />

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleAddRider}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>{isSubmitting ? 'Registering...' : 'Register Rider'}</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function InputRow({ icon: Icon, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry }: {
  icon: any;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Icon size={18} color={Colors.textSecondary} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, marginHorizontal: 20,
    marginTop: 12, borderRadius: 12, paddingHorizontal: 14, height: 44, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  riderCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  suspendedCard: { opacity: 0.7, borderColor: Colors.error + '30' },
  riderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  riderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  riderDetails: { flex: 1 },
  riderName: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  riderEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  riderShop: { fontSize: 12, color: Colors.primary, fontWeight: '600' as const, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  riderMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' as const },
  riderStatsRow: { flexDirection: 'row', marginTop: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12, gap: 10 },
  riderStat: { flex: 1, alignItems: 'center' },
  riderStatValue: { fontSize: 16, fontWeight: '800' as const, color: Colors.text },
  riderStatLabel: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  suspendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.errorLight, borderRadius: 10 },
  activateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.successLight, borderRadius: 10 },
  actionText: { fontSize: 12, fontWeight: '700' as const },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white },
  modalTitle: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  closeBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  modalScroll: { flex: 1 },
  modalContent: { paddingHorizontal: 20, paddingTop: 16 },
  formSection: { fontSize: 14, fontWeight: '700' as const, color: Colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginTop: 16, marginBottom: 10 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 14, paddingHorizontal: 16, height: 52, gap: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 10,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 14, paddingHorizontal: 16, height: 52, gap: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 10,
  },
  pickerText: { flex: 1, fontSize: 15, color: Colors.textTertiary },
  pickerOptions: { backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 10, overflow: 'hidden' },
  pickerOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  pickerOptionActive: { backgroundColor: Colors.primaryFaded },
  pickerOptionText: { fontSize: 15, color: Colors.text },
  pickerOptionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  noShopsText: { padding: 16, fontSize: 14, color: Colors.textTertiary, textAlign: 'center' as const },
  submitBtn: { backgroundColor: Colors.primary, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  submitBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
});
