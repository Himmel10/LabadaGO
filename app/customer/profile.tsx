import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { User, MapPin, Phone, Mail, ChevronRight, Settings, HelpCircle, Star, Shield, Camera, Edit } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { ImageUploadModal } from '@/components/ImageUploadModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { uploadProfileImage } from '@/lib/imageUpload';

const MENU_ITEMS = [
  { icon: MapPin, label: 'My Addresses', color: Colors.primary },
  { icon: Star, label: 'My Reviews', color: Colors.accent },
  { icon: Settings, label: 'Settings', color: Colors.textSecondary },
  { icon: HelpCircle, label: 'Help & Support', color: Colors.info },
  { icon: Shield, label: 'Privacy Policy', color: Colors.shop },
];

export default function CustomerProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleImageSelected = async (imageUri: string) => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }
    
    try {
      setIsUploadingImage(true);
      console.log('Starting upload for user:', user.id, 'Role:', user.role);
      console.log('Image URI:', imageUri);
      
      const result = await uploadProfileImage(imageUri, user.id, user.role);
      console.log('Upload result:', result);
      
      if (result.success && result.imageUrl) {
        console.log('Upload successful, updating user with URL:', result.imageUrl);
        await updateUser({ avatar: result.imageUrl });
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Profile</Text>
      </SafeAreaView>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowImageUpload(true)}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={32} color={Colors.textTertiary} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Camera size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.profileRole}>Customer</Text>
          </View>
          <TouchableOpacity onPress={() => setShowEditProfile(true)} style={styles.editBtn}>
            <Edit size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.infoSection}
          onPress={() => setShowEditProfile(true)}
          activeOpacity={0.8}
        >
          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{user?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{user?.address ?? 'No address set'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  <Icon size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <ImageUploadModal
        visible={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelected={handleImageSelected}
        isLoading={isUploadingImage}
        title="Change Profile Picture"
      />

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={user}
        onSave={updateUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingHorizontal: 20, paddingTop: 8 },
  scroll: { flex: 1 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    marginHorizontal: 20, marginTop: 16, padding: 20, borderRadius: 20, gap: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  avatarContainer: { position: 'relative' as const },
  avatar: { width: 64, height: 64, borderRadius: 22 },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 22, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  profileRole: { fontSize: 14, color: Colors.primary, fontWeight: '600' as const, marginTop: 2 },
  changePhotoBtn: { marginTop: 8 },
  changePhotoBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' as const },
  editBtn: { padding: 8 },
  infoSection: {
    backgroundColor: Colors.white, marginHorizontal: 20, marginTop: 12, padding: 16,
    borderRadius: 16, gap: 14, borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, color: Colors.text },
  editFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  editFooterText: { fontSize: 12, color: Colors.primary, fontWeight: '600' as const },
  menuSection: {
    backgroundColor: Colors.white, marginHorizontal: 20, marginTop: 12,
    borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderLight,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 20, paddingVertical: 16,
    backgroundColor: Colors.errorLight, borderRadius: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '700' as const, color: Colors.error },
});
