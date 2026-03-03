import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { User, Store, Bike, Shield, Users, CircleX, CircleCheck, Search } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { UserRole } from '@/types';

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: any }> = {
  customer: { label: 'Customer', color: Colors.primary, icon: User },
  shop_owner: { label: 'Shop Owner', color: Colors.shop, icon: Store },
  rider: { label: 'Rider', color: Colors.info, icon: Bike },
  admin: { label: 'Admin', color: Colors.warning, icon: Shield },
};

export default function AdminUsersScreen() {
  const { allUsers, suspendUser, activateUser } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const users = useMemo(() => {
    let list = filter === 'all' ? allUsers : allUsers.filter((u) => u.role === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  }, [allUsers, filter, searchQuery]);

  const handleSuspend = (userId: string, userName: string) => {
    Alert.alert('Suspend Account', `Suspend ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Suspend', style: 'destructive', onPress: () => suspendUser(userId) },
    ]);
  };

  const handleActivate = (userId: string, userName: string) => {
    Alert.alert('Activate Account', `Activate ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Activate', onPress: () => activateUser(userId) },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>All Users</Text>
        <View style={styles.searchWrap}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {['all', 'customer', 'shop_owner', 'rider', 'admin'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === 'all' ? 'All' : f === 'shop_owner' ? 'Shop Owner' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {users.map((userItem) => {
          const config = ROLE_CONFIG[userItem.role];
          const Icon = config.icon;
          return (
            <View key={userItem.id} style={[styles.userCard, userItem.isSuspended && styles.suspendedCard]}>
              <View style={styles.userLeft}>
                {userItem.avatar ? (
                  <Image source={{ uri: userItem.avatar }} style={styles.userAvatar} />
                ) : (
                  <View style={[styles.userAvatarPlaceholder, { backgroundColor: config.color + '15' }]}>
                    <Icon size={20} color={config.color} />
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userItem.name}</Text>
                  <Text style={styles.userEmail}>{userItem.email}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.roleBadge, { backgroundColor: config.color + '15' }]}>
                      <Text style={[styles.roleText, { color: config.color }]}>{config.label}</Text>
                    </View>
                    {userItem.isSuspended && (
                      <View style={[styles.roleBadge, { backgroundColor: Colors.errorLight }]}>
                        <Text style={[styles.roleText, { color: Colors.error }]}>Suspended</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {userItem.role !== 'admin' && (
                <View>
                  {userItem.isSuspended ? (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleActivate(userItem.id, userItem.name)}>
                      <CircleCheck size={18} color={Colors.success} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleSuspend(userItem.id, userItem.name)}>
                      <CircleX size={18} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
        {users.length === 0 && (
          <View style={styles.empty}>
            <Users size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No users found</Text>
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
  userCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, padding: 16, borderRadius: 16, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  suspendedCard: { opacity: 0.7, borderColor: Colors.error + '30' },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  userAvatar: { width: 48, height: 48, borderRadius: 16 },
  userAvatarPlaceholder: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '600' as const },
  actionBtn: { padding: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: Colors.textTertiary },
});
