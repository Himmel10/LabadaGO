import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Store, MapPin, Phone, Mail, ChevronRight, Star, Camera, Edit3, X, Clock, MessageCircle, Settings, HelpCircle, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';
import { ImageUploadModal } from '@/components/ImageUploadModal';
import { uploadShopLogo } from '@/lib/imageUpload';

export default function ShopProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { getShopByOwner, updateShop, getReviewsByShop } = useShops();
  const router = useRouter();
  const shop = getShopByOwner(user?.id ?? '');
  const reviews = shop ? getReviewsByShop(shop.id) : [];

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editName, setEditName] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editOpenTime, setEditOpenTime] = useState<string>('');
  const [editCloseTime, setEditCloseTime] = useState<string>('');
  const [editIsOpen, setEditIsOpen] = useState<boolean>(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAccount();
            if (success) {
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
              router.replace('/');
            } else {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openEditModal = () => {
    if (!shop) return;
    setEditName(shop.name);
    setEditAddress(shop.address);
    setEditPhone(shop.phone);
    setEditDescription(shop.description);
    setEditOpenTime(shop.openTime);
    setEditCloseTime(shop.closeTime);
    setEditIsOpen(shop.isOpen);
    setShowEditModal(true);
  };

  const handleSaveShopInfo = async () => {
    if (!shop) return;
    if (!editName.trim() || !editAddress.trim()) {
      Alert.alert('Error', 'Shop name and address are required');
      return;
    }
    await updateShop(shop.id, {
      name: editName.trim(),
      address: editAddress.trim(),
      phone: editPhone.trim(),
      description: editDescription.trim(),
      openTime: editOpenTime.trim(),
      closeTime: editCloseTime.trim(),
      isOpen: editIsOpen,
    });
    setShowEditModal(false);
    Alert.alert('Success', 'Shop info updated successfully');
  };

  const handleChangeShopLogo = async (imageUri: string) => {
    if (!shop) return;
    
    try {
      setIsUploadingImage(true);
      const result = await uploadShopLogo(imageUri, shop.id);
      
      if (result.success && result.imageUrl) {
        await updateShop(shop.id, { image: result.imageUrl });
        Alert.alert('Success', 'Shop logo updated successfully');
        setShowImageUpload(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.log('Error:', error);
      Alert.alert('Error', 'Failed to upload shop logo');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const toggleShopOpen = async () => {
    if (!shop) return;
    await updateShop(shop.id, { isOpen: !shop.isOpen });
  };

  const recentReviews = reviews.slice(0, 3);
  const avgRating = shop?.rating ?? 0;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Profile</Text>
      </SafeAreaView>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={() => setShowImageUpload(true)} activeOpacity={0.8} style={styles.avatarContainer}>
            {shop?.image ? (
              <Image source={{ uri: shop.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}><Store size={32} color={Colors.textTertiary} /></View>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{shop?.name ?? 'Your Shop'}</Text>
            <Text style={styles.profileRole}>{user?.name ?? 'Shop Owner'}</Text>
            <TouchableOpacity
              style={[styles.statusToggle, { backgroundColor: shop?.isOpen ? Colors.successLight : Colors.errorLight }]}
              onPress={toggleShopOpen}
              activeOpacity={0.7}
            >
              <View style={[styles.statusDot, { backgroundColor: shop?.isOpen ? Colors.success : Colors.error }]} />
              <Text style={[styles.statusLabel, { color: shop?.isOpen ? Colors.success : Colors.error }]}>
                {shop?.isOpen ? 'Open' : 'Closed'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>



        <View style={styles.infoSection}>
          <View style={styles.infoRow}><Mail size={18} color={Colors.textSecondary} /><Text style={styles.infoText}>{user?.email ?? '—'}</Text></View>
          <View style={styles.infoRow}><Phone size={18} color={Colors.textSecondary} /><Text style={styles.infoText}>{shop?.phone ?? user?.phone ?? '—'}</Text></View>
          <View style={styles.infoRow}><MapPin size={18} color={Colors.textSecondary} /><Text style={styles.infoText}>{shop?.address ?? '—'}</Text></View>
          <View style={styles.infoRow}><Clock size={18} color={Colors.textSecondary} /><Text style={styles.infoText}>{shop ? `${shop.openTime} - ${shop.closeTime}` : '—'}</Text></View>
        </View>

        {recentReviews.length > 0 && (
          <View style={styles.recentReviewsSection}>
            <Text style={styles.sectionLabel}>Recent Reviews</Text>
            {recentReviews.map((rev) => (
              <View key={rev.id} style={styles.miniReviewCard}>
                <View style={styles.miniReviewTop}>
                  <Text style={styles.miniReviewName}>{rev.customerName}</Text>
                  <View style={styles.miniStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        color={s <= rev.rating ? Colors.accent : Colors.border}
                        fill={s <= rev.rating ? Colors.accent : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.miniReviewComment} numberOfLines={2}>{rev.comment}</Text>
                {rev.reply && (
                  <View style={styles.miniReplyBadge}>
                    <MessageCircle size={10} color={Colors.primary} />
                    <Text style={styles.miniReplyText}>Replied</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={openEditModal}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '15' }]}><Edit3 size={20} color={Colors.primary} /></View>
          <Text style={styles.menuLabel}>Edit Shop Info</Text>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => setShowImageUpload(true)}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '15' }]}><Camera size={20} color={Colors.primary} /></View>
          <Text style={styles.menuLabel}>Change Shop Logo</Text>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push('/shop-owner/reviews')}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.accent + '15' }]}><Star size={20} color={Colors.accent} /></View>
          <Text style={styles.menuLabel}>Reviews & Ratings</Text>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.textSecondary + '15' }]}><Settings size={20} color={Colors.textSecondary} /></View>
          <Text style={styles.menuLabel}>Settings</Text>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.shop + '15' }]}><Shield size={20} color={Colors.shop} /></View>
          <Text style={styles.menuLabel}>Privacy Policy</Text>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.info + '15' }]}><HelpCircle size={20} color={Colors.info} /></View>
          <Text style={styles.menuLabel}>Help & Support</Text>
          <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Shop Info</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Shop Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Shop name"
                placeholderTextColor={Colors.textTertiary}
              />

              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput
                style={styles.modalInput}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="Shop address"
                placeholderTextColor={Colors.textTertiary}
              />

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Contact number"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Describe your shop..."
                placeholderTextColor={Colors.textTertiary}
                multiline
              />

              <View style={styles.timeRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.fieldLabel}>Open Time</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editOpenTime}
                    onChangeText={setEditOpenTime}
                    placeholder="8:00 AM"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={styles.timeCol}>
                  <Text style={styles.fieldLabel}>Close Time</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editCloseTime}
                    onChangeText={setEditCloseTime}
                    placeholder="8:00 PM"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.toggleRow, { backgroundColor: editIsOpen ? Colors.successLight : Colors.errorLight }]}
                onPress={() => setEditIsOpen(!editIsOpen)}
                activeOpacity={0.7}
              >
                <View style={[styles.statusDot, { backgroundColor: editIsOpen ? Colors.success : Colors.error }]} />
                <Text style={[styles.toggleText, { color: editIsOpen ? Colors.success : Colors.error }]}>
                  Shop is {editIsOpen ? 'Open' : 'Closed'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveShopInfo} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ImageUploadModal
        visible={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelected={handleChangeShopLogo}
        isLoading={isUploadingImage}
        title="Change Shop Logo"
      />
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
  avatarContainer: { position: 'relative' as const },
  avatar: { width: 72, height: 72, borderRadius: 24 },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 24, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  cameraBadge: {
    position: 'absolute' as const, bottom: -2, right: -2, width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  profileRole: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' as const, marginTop: 2 },
  statusToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    alignSelf: 'flex-start' as const, marginTop: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '600' as const },
  ratingCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, padding: 16, borderRadius: 16, marginTop: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  ratingLeft: { gap: 4 },
  ratingBig: { fontSize: 32, fontWeight: '800' as const, color: Colors.text },
  starsRow: { flexDirection: 'row', gap: 3 },
  reviewCountText: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 14, fontWeight: '600' as const, color: Colors.primary },
  infoSection: {
    backgroundColor: Colors.white, marginTop: 10, padding: 16, borderRadius: 16,
    gap: 14, borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, color: Colors.text, flex: 1 },
  recentReviewsSection: { marginTop: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  miniReviewCard: {
    backgroundColor: Colors.white, padding: 12, borderRadius: 12, marginBottom: 6,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  miniReviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  miniReviewName: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  miniStarsRow: { flexDirection: 'row', gap: 2 },
  miniReviewComment: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  miniReplyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  miniReplyText: { fontSize: 11, color: Colors.primary, fontWeight: '600' as const },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: 16, borderRadius: 14, gap: 14, marginTop: 8, borderWidth: 1, borderColor: Colors.borderLight,
  },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12, paddingVertical: 16, backgroundColor: Colors.errorLight, borderRadius: 16,
  },
  deleteText: { fontSize: 16, fontWeight: '700' as const, color: Colors.error },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 8, paddingVertical: 16, backgroundColor: Colors.errorLight, borderRadius: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '700' as const, color: Colors.error },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  fieldLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  modalInput: {
    backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, height: 48,
    fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeCol: { flex: 1 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 12, marginTop: 16,
  },
  toggleText: { fontSize: 14, fontWeight: '600' as const },
  saveBtn: { backgroundColor: Colors.primary, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
});
