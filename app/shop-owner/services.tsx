import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Wrench, Plus, Shirt, Sparkles, Wind, Zap, Flame, BedDouble, Trash2, X, Camera, ImageIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';

const ICON_MAP: Record<string, any> = {
  shirt: Shirt,
  sparkles: Sparkles,
  wind: Wind,
  zap: Zap,
  flame: Flame,
  'bed-double': BedDouble,
};

const ICON_OPTIONS = ['shirt', 'sparkles', 'wind', 'bed-double', 'zap', 'flame'];

export default function ShopServicesScreen() {
  const { user } = useAuth();
  const { getShopByOwner, addService, removeService, updateServicePhoto } = useShops();
  const shop = getShopByOwner(user?.id ?? '');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newHours, setNewHours] = useState<string>('24');
  const [newIcon, setNewIcon] = useState<string>('shirt');
  const [newPhoto, setNewPhoto] = useState<string>('');

  const handleDelete = (serviceId: string) => {
    if (!shop) return;
    Alert.alert('Delete Service', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeService(shop.id, serviceId) },
    ]);
  };

  const pickPhoto = async (): Promise<string | null> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
    } catch (e) {
      console.log('Image picker error:', e);
    }
    return null;
  };

  const handlePickNewPhoto = async () => {
    const uri = await pickPhoto();
    if (uri) setNewPhoto(uri);
  };

  const handleUpdateServicePhoto = async (serviceId: string) => {
    if (!shop) return;
    const uri = await pickPhoto();
    if (uri) {
      await updateServicePhoto(shop.id, serviceId, uri);
      Alert.alert('Success', 'Service photo updated');
    }
  };

  const handleAddService = async () => {
    if (!shop) return;
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert('Error', 'Please fill in service name and price');
      return;
    }
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    await addService(shop.id, {
      name: newName.trim(),
      description: newDesc.trim() || newName.trim(),
      pricePerKg: price,
      estimatedHours: parseInt(newHours) || 24,
      icon: newIcon,
      photo: newPhoto || undefined,
    });

    setShowAddModal(false);
    setNewName('');
    setNewDesc('');
    setNewPrice('');
    setNewHours('24');
    setNewIcon('shirt');
    setNewPhoto('');
    Alert.alert('Success', 'Service added successfully');
  };

  const services = shop?.services ?? [];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Services</Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.7} onPress={() => setShowAddModal(true)}>
            <Plus size={18} color={Colors.white} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {services.map((service) => {
          const Icon = ICON_MAP[service.icon] ?? Wrench;
          return (
            <View key={service.id} style={styles.serviceCard}>
              {service.photo ? (
                <TouchableOpacity onPress={() => handleUpdateServicePhoto(service.id)} activeOpacity={0.8}>
                  <Image source={{ uri: service.photo }} style={styles.servicePhoto} contentFit="cover" />
                  <View style={styles.photoOverlay}>
                    <Camera size={16} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addPhotoPlaceholder}
                  onPress={() => handleUpdateServicePhoto(service.id)}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={20} color={Colors.textTertiary} />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
              <View style={styles.serviceBody}>
                <View style={styles.serviceTop}>
                  <View style={styles.serviceIconWrap}>
                    <Icon size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDesc}>{service.description}</Text>
                  </View>
                </View>
                <View style={styles.serviceBottom}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>₱{service.pricePerKg}</Text>
                    <Text style={styles.priceUnit}>/kg</Text>
                  </View>
                  <Text style={styles.estimateText}>{service.estimatedHours}h turnaround</Text>
                  <View style={styles.serviceActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(service.id)} activeOpacity={0.7}>
                      <Trash2 size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        {services.length === 0 && (
          <View style={styles.empty}>
            <Wrench size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No services added yet</Text>
            <Text style={styles.emptySubtext}>{'Tap "Add" to create your first service'}</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Service</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Service Photo</Text>
              {newPhoto ? (
                <TouchableOpacity onPress={handlePickNewPhoto} activeOpacity={0.8}>
                  <Image source={{ uri: newPhoto }} style={styles.newPhotoPreview} contentFit="cover" />
                  <View style={styles.changePhotoOverlay}>
                    <Camera size={16} color={Colors.white} />
                    <Text style={styles.changePhotoText}>Change</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.pickPhotoBtn} onPress={handlePickNewPhoto} activeOpacity={0.7}>
                  <ImageIcon size={24} color={Colors.primary} />
                  <Text style={styles.pickPhotoText}>Upload Photo</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.fieldLabel}>Service Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Wash & Fold"
                placeholderTextColor={Colors.textTertiary}
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, { height: 60, textAlignVertical: 'top' as const, paddingTop: 12 }]}
                placeholder="Brief description"
                placeholderTextColor={Colors.textTertiary}
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
              />

              <Text style={styles.fieldLabel}>Price per kg (₱)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 45"
                placeholderTextColor={Colors.textTertiary}
                value={newPrice}
                onChangeText={setNewPrice}
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Estimated Hours</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 24"
                placeholderTextColor={Colors.textTertiary}
                value={newHours}
                onChangeText={setNewHours}
                keyboardType="number-pad"
              />

              <Text style={styles.fieldLabel}>Icon</Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((iconKey) => {
                  const IconComp = ICON_MAP[iconKey] ?? Wrench;
                  return (
                    <TouchableOpacity
                      key={iconKey}
                      style={[styles.iconOption, newIcon === iconKey && styles.iconOptionActive]}
                      onPress={() => setNewIcon(iconKey)}
                    >
                      <IconComp size={22} color={newIcon === iconKey ? Colors.primary : Colors.textTertiary} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleAddService} activeOpacity={0.85}>
                <Text style={styles.modalSubmitText}>Add Service</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { fontSize: 13, fontWeight: '700' as const, color: Colors.white },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  serviceCard: {
    backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden' as const, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  servicePhoto: { width: '100%', height: 160, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  photoOverlay: {
    position: 'absolute' as const, top: 10, right: 10, width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  addPhotoPlaceholder: {
    height: 80, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center',
    flexDirection: 'row', gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  addPhotoText: { fontSize: 13, color: Colors.textTertiary, fontWeight: '500' as const },
  serviceBody: { padding: 16 },
  serviceTop: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  serviceIconWrap: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 2 },
  serviceDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  serviceBottom: { flexDirection: 'row', alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  priceLabel: { fontSize: 20, fontWeight: '800' as const, color: Colors.primary },
  priceUnit: { fontSize: 13, color: Colors.textTertiary, marginLeft: 2 },
  estimateText: { fontSize: 12, color: Colors.textTertiary, marginLeft: 12, flex: 1 },
  serviceActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
  emptySubtext: { fontSize: 14, color: Colors.textTertiary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  fieldLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  modalInput: {
    backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, height: 48,
    fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  newPhotoPreview: { width: '100%', height: 140, borderRadius: 12, overflow: 'hidden' as const },
  changePhotoOverlay: {
    position: 'absolute' as const, bottom: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  changePhotoText: { fontSize: 12, color: Colors.white, fontWeight: '600' as const },
  pickPhotoBtn: {
    height: 80, backgroundColor: Colors.primaryFaded, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primary + '30', borderStyle: 'dashed' as const, flexDirection: 'row', gap: 8,
  },
  pickPhotoText: { fontSize: 14, color: Colors.primary, fontWeight: '600' as const },
  iconGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 4 },
  iconOption: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border,
  },
  iconOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  modalSubmitBtn: { backgroundColor: Colors.primary, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  modalSubmitText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
});
