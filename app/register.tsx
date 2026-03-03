import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, User, Mail, Phone, Lock, Store, MapPin, FileText } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';

type RoleOption = 'customer' | 'shop_owner';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerCustomer, registerShopOwner } = useAuth();
  const { addShop } = useShops();
  const [selectedRole, setSelectedRole] = useState<RoleOption>('customer');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [shopName, setShopName] = useState<string>('');
  const [shopAddress, setShopAddress] = useState<string>('');
  const [shopDescription, setShopDescription] = useState<string>('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedRole === 'customer' && !address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return;
    }

    if (selectedRole === 'shop_owner' && (!shopName.trim() || !shopAddress.trim())) {
      Alert.alert('Error', 'Please fill in shop name and address');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedRole === 'customer') {
        await registerCustomer({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          password: password.trim(),
        });
        router.replace('/customer' as any);
      } else {
        const newUser = await registerShopOwner({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          shopName: shopName.trim(),
          shopAddress: shopAddress.trim(),
          shopDescription: shopDescription.trim(),
          password: password.trim(),
        });

        await addShop({
          ownerId: newUser.id,
          name: shopName.trim(),
          description: shopDescription.trim() || 'Quality laundry services',
          address: shopAddress.trim(),
          phone: phone.trim(),
          image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=400&fit=crop',
          rating: 0,
          reviewCount: 0,
          isOpen: true,
          openTime: '7:00 AM',
          closeTime: '9:00 PM',
          services: [],
        });

        router.replace('/shop-owner' as any);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join LabadaGO today</Text>

          <Text style={styles.sectionLabel}>I want to register as</Text>
          <View style={styles.roles}>
            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'customer' && { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' }]}
              onPress={() => setSelectedRole('customer')}
              activeOpacity={0.7}
            >
              <User size={26} color={selectedRole === 'customer' ? Colors.primary : Colors.textTertiary} />
              <Text style={[styles.roleLabel, selectedRole === 'customer' && { color: Colors.primary }]}>Customer</Text>
              <Text style={styles.roleDesc}>Order laundry services</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'shop_owner' && { borderColor: Colors.shop, backgroundColor: Colors.shop + '10' }]}
              onPress={() => setSelectedRole('shop_owner')}
              activeOpacity={0.7}
            >
              <Store size={26} color={selectedRole === 'shop_owner' ? Colors.shop : Colors.textTertiary} />
              <Text style={[styles.roleLabel, selectedRole === 'shop_owner' && { color: Colors.shop }]}>Shop Owner</Text>
              <Text style={styles.roleDesc}>Manage your laundry shop</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <InputField icon={User} placeholder="Full Name" value={name} onChangeText={setName} />
            <InputField icon={Phone} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <InputField icon={Mail} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            {selectedRole === 'customer' && (
              <InputField icon={MapPin} placeholder="Address" value={address} onChangeText={setAddress} />
            )}

            {selectedRole === 'shop_owner' && (
              <>
                <InputField icon={Store} placeholder="Shop Name" value={shopName} onChangeText={setShopName} />
                <InputField icon={MapPin} placeholder="Shop Address" value={shopAddress} onChangeText={setShopAddress} />
                <InputField icon={FileText} placeholder="Description of Services" value={shopDescription} onChangeText={setShopDescription} multiline />
              </>
            )}

            <InputField icon={Lock} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, isLoading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.registerBtnText}>{isLoading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login' as any)}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({ icon: Icon, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry, multiline }: {
  icon: any;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={[styles.inputGroup, multiline && { height: 80, alignItems: 'flex-start', paddingTop: 16 }]}>
      <Icon size={20} color={Colors.textSecondary} />
      <TextInput
        style={[styles.input, multiline && { minHeight: 48 }]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  title: { fontSize: 30, fontWeight: '800' as const, color: Colors.text, marginTop: 24, marginBottom: 4 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 24 },
  sectionLabel: {
    fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary,
    marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: 0.5,
  },
  roles: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  roleCard: {
    flex: 1, padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, alignItems: 'center', gap: 6,
  },
  roleLabel: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  roleDesc: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center' as const },
  form: { gap: 12, marginBottom: 24 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: 14, paddingHorizontal: 16, height: 56, gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 16, color: Colors.text },
  registerBtn: {
    backgroundColor: Colors.primary, height: 56, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  registerBtnText: { fontSize: 17, fontWeight: '700' as const, color: Colors.white },
  loginLink: { alignItems: 'center' },
  loginText: { fontSize: 15, color: Colors.textSecondary },
  loginTextBold: { color: Colors.primary, fontWeight: '700' as const },
});
