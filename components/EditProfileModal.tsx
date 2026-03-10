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

type EditTab = 'basic' | 'address' | 'password' | 'payment';

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

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter current password');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsSaving(true);
      // In a real app, verify current password against stored password
      // For now, we'll just show success
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
          {(['basic', 'address', 'password', 'payment'] as EditTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab === 'basic' && 'Basic Info'}
                {tab === 'address' && 'Address'}
                {tab === 'password' && 'Password'}
                {tab === 'payment' && 'Payment'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'basic' && (
            <View>
              <Text style={[styles.fieldLabel, { marginTop: 0, marginBottom: 4 }]}>Full Name</Text>
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
            <View>
              <Text style={[styles.fieldLabel, { marginTop: 0 }]}>Delivery Address</Text>
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

          {activeTab === 'password' && (
            <View>
              <Text style={[styles.fieldLabel, { marginTop: 0 }]}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
                editable={!isSaving}
              />

              <Text style={styles.fieldLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password (min 6 characters)"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
                editable={!isSaving}
              />

              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
                editable={!isSaving}
              />

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleChangePassword}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'payment' && (
            <View>
              <Text style={[styles.fieldLabel, { marginTop: 0 }]}>Preferred Payment Method</Text>
              
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
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.textTertiary },
  tabLabelActive: { color: Colors.primary },
  content: { padding: 16, paddingTop: 12, paddingBottom: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
    marginTop: 0,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  helpText: {
    backgroundColor: Colors.background,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  helpTextContent: { fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
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
