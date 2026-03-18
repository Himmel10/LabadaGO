import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { User } from '@/types';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updates: Partial<User>) => Promise<void>;
}

type EditTab = 'basic' | 'address' | 'payment';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  user,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<EditTab>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Basic Info
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editPhone, setEditPhone] = useState(user?.phone ?? '');
  const [editEmail, setEditEmail] = useState(user?.email ?? '');

  // Address
  const [editAddress, setEditAddress] = useState(user?.address ?? '');

  // Payment
  const [preferredPayment, setPreferredPayment] = useState<string>(user?.preferredPaymentMethod ?? 'gcash');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9\s\+\-\(\)]{7,}$/;
    return phoneRegex.test(phone);
  };

  const handleSaveBasicInfo = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (!validateEmail(editEmail)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    if (!validatePhone(editPhone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!editAddress.trim()) {
      Alert.alert('Error', 'Address cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({ address: editAddress.trim() });
      Alert.alert('Success', 'Address updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentMethod = async () => {
    try {
      setIsSaving(true);
      await onSave({ preferredPaymentMethod: preferredPayment as any });
      Alert.alert('Success', 'Payment method saved successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment method');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={onClose} disabled={isSaving}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
          {(['basic', 'address', 'payment'] as EditTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab === 'basic' && 'Basic Info'}
                {tab === 'address' && 'Address'}
                {tab === 'payment' && 'Payment'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'basic' && (
            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textTertiary}
                editable={!isSaving}
              />

              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                editable={!isSaving}
              />

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+63 912 345 6789"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
                editable={!isSaving}
              />

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSaveBasicInfo}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'address' && (
            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Delivery Address</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="Enter your complete delivery address"
                placeholderTextColor={Colors.textTertiary}
                multiline
                editable={!isSaving}
              />

              <View style={styles.helpText}>
                <Text style={styles.helpTextContent}>
                  💡 Include your complete address with city, postal code, and any landmarks for accurate delivery.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSaveAddress}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'payment' && (
            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Preferred Payment Method</Text>
              
              {['gcash', 'paymaya', 'card', 'cod'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentOption, preferredPayment === method && styles.paymentOptionActive]}
                  onPress={() => setPreferredPayment(method)}
                >
                  <View style={styles.radioButton}>
                    {preferredPayment === method && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.paymentText}>
                    {method === 'gcash' && 'GCash'}
                    {method === 'paymaya' && 'PayMaya'}
                    {method === 'card' && 'Credit/Debit Card'}
                    {method === 'cod' && 'Cash on Delivery'}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} 
                onPress={handleSavePaymentMethod}
                disabled={isSaving}
              >
                <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Confirm Payment Method'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  title: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  tabBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 0,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabLabel: { fontSize: 13, fontWeight: '500' as const, color: Colors.textTertiary },
  tabLabelActive: { color: Colors.primary, fontWeight: '800' as const },
  content: { padding: 0, paddingTop: 0, paddingBottom: 20 },
  contentContainer: { padding: 0, margin: 0, paddingTop: 0, flexGrow: 0 },
  formCard: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: Colors.white,
    marginTop: -2,
    borderRadius: 0,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 0,
    paddingTop: 0,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: '#D8E4E2',
  },
  helpText: {
    backgroundColor: '#F5FAF9',
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  helpTextContent: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 20,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D8E4E2',
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: '#F5FAF9' },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  paymentText: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
});
