import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { User, Phone, Mail, Star, ChevronRight, Settings, CircleHelp, Car, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

const VEHICLE_LABELS: Record<string, string> = {
  motorcycle: 'Motorcycle',
  bicycle: 'Bicycle',
  car: 'Car',
};

export default function RiderProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Profile</Text>
      </SafeAreaView>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}><User size={32} color={Colors.textTertiary} /></View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileRole}>Rider</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.ratingText}>{user?.rating ?? 4.8}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}><Mail size={18} color={Colors.textSecondary} /><Text style={styles.infoText}>{user?.email}</Text></View>
          <View style={styles.infoRow}><Phone size={18} color={Colors.textSecondary} /><Text style={styles.infoText}>{user?.phone}</Text></View>
          {user?.assignedShopName && (
            <View style={styles.infoRow}><MapPin size={18} color={Colors.textSecondary} /><Text style={styles.infoText}>{user.assignedShopName}</Text></View>
          )}
          {user?.vehicleType && (
            <View style={styles.infoRow}><Car size={18} color={Colors.textSecondary} /><Text style={styles.infoText}>{VEHICLE_LABELS[user.vehicleType] ?? user.vehicleType}{user.plateNumber ? ` • ${user.plateNumber}` : ''}</Text></View>
          )}
        </View>

        {[
          { icon: Settings, label: 'Settings', color: Colors.primary },
          { icon: CircleHelp, label: 'Help & Support', color: Colors.info },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}><Icon size={20} color={item.color} /></View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingHorizontal: 20, paddingTop: 8 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    marginTop: 16, padding: 20, borderRadius: 20, gap: 16, borderWidth: 1, borderColor: Colors.borderLight,
  },
  avatar: { width: 64, height: 64, borderRadius: 22 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 22, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  profileRole: { fontSize: 14, color: Colors.primary, fontWeight: '600' as const, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  infoSection: {
    backgroundColor: Colors.white, marginTop: 12, padding: 16, borderRadius: 16,
    gap: 14, borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, color: Colors.text },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: 16, borderRadius: 14, gap: 14, marginTop: 8, borderWidth: 1, borderColor: Colors.borderLight,
  },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, paddingVertical: 16, backgroundColor: Colors.errorLight, borderRadius: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '700' as const, color: Colors.error },
});
