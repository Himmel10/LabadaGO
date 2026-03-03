import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, TrendingUp, DollarSign, Calendar, ChevronRight, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';

interface Styles {
  container: ViewStyle;
  headerWrap: ViewStyle;
  title: TextStyle;
  scroll: ViewStyle;
  balanceCard: ViewStyle;
  balanceTop: ViewStyle;
  balanceLabel: TextStyle;
  balanceValue: TextStyle;
  walletIcon: ViewStyle;
  balanceDivider: ViewStyle;
  balanceNote: TextStyle;
  statsGrid: ViewStyle;
  statBox: ViewStyle;
  statIcon: ViewStyle;
  statLabel: TextStyle;
  statValue: TextStyle;
  sectionTitle: TextStyle;
  breakdownCard: ViewStyle;
  breakdownRow: ViewStyle;
  breakdownRowBorder: ViewStyle;
  breakdownLabel: TextStyle;
  breakdownValue: TextStyle;
  infoCard: ViewStyle;
  infoRow: ViewStyle;
  infoDot: ViewStyle;
  infoTitle: TextStyle;
  infoText: TextStyle;
  withdrawBtn: ViewStyle;
  withdrawBtnText: TextStyle;
  modalOverlay: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  modalBody: ViewStyle;
  modalFooter: ViewStyle;
  inputLabel: TextStyle;
  inputContainer: ViewStyle;
  currencySymbol: TextStyle;
  amountInput: TextStyle;
  availableText: TextStyle;
  textInput: ViewStyle;
  termsCard: ViewStyle;
  termsTitle: TextStyle;
  termsText: TextStyle;
  confirmWithdrawBtn: ViewStyle;
  confirmWithdrawBtnText: TextStyle;
  methodsGrid: ViewStyle;
  methodOption: ViewStyle;
  methodOptionActive: ViewStyle;
  methodOptionIcon: ViewStyle;
  methodOptionIconText: TextStyle;
  methodOptionText: TextStyle;
}

export default function RiderWalletScreen() {
  const { user, updateUser } = useAuth();
  const { orders } = useOrders();
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'credit_card' | 'debit_card'>('gcash');
  const [accountNumber, setAccountNumber] = useState<string>('');

  const riderOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter((o) => o.riderId === user.id);
  }, [user, orders]);

  const todayDate = new Date().toISOString().split('T')[0];
  const todayEarnings = useMemo(() => {
    return riderOrders
      .filter((o) => o.createdAt?.startsWith(todayDate) && o.riderEarnings)
      .reduce((sum, o) => sum + (o.riderEarnings ?? 0), 0);
  }, [riderOrders, todayDate]);

  const totalEarnings = useMemo(() => {
    return riderOrders
      .filter((o) => o.riderEarnings)
      .reduce((sum, o) => sum + (o.riderEarnings ?? 0), 0);
  }, [riderOrders]);

  const bonus = totalEarnings > 1000 ? 500 : totalEarnings > 500 ? 200 : 0;

  const walletBalance = (user?.wallet ?? 0) + bonus;

  const handleWithdraw = async () => {
    if (!withdrawAmount.trim() || !accountNumber.trim()) {
      Alert.alert('Error', 'Please enter amount and payment details');
      return;
    }
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (amount > walletBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }
    const methodLabels: Record<string, string> = {
      gcash: 'GCash',
      maya: 'Maya',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
    };
    Alert.alert('Success', `Withdrawal of ₱${amount} via ${methodLabels[paymentMethod]} is being processed.`, [
      {
        text: 'OK',
        onPress: async () => {
          const newWallet = (user?.wallet ?? 0) - amount;
          await updateUser({ wallet: newWallet });
          setWithdrawAmount('');
          setAccountNumber('');
          setShowWithdrawModal(false);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Wallet</Text>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Wallet Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>₱{walletBalance}</Text>
            </View>
            <View style={styles.walletIcon}>
              <Wallet size={32} color={Colors.primary} />
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <Text style={styles.balanceNote}>Ready to withdraw anytime</Text>
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdrawModal(true)} activeOpacity={0.85}>
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
          <ChevronRight size={20} color={Colors.white} />
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: Colors.successLight }]}>
              <TrendingUp size={20} color={Colors.success} />
            </View>
            <Text style={styles.statLabel}>Today's Earnings</Text>
            <Text style={styles.statValue}>₱{todayEarnings}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryFaded }]}>
              <DollarSign size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={styles.statValue}>₱{totalEarnings}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: Colors.accentLight }]}>
              <Calendar size={20} color={Colors.accent} />
            </View>
            <Text style={styles.statLabel}>Bonus</Text>
            <Text style={styles.statValue}>₱{bonus}</Text>
          </View>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionTitle}>Wallet Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Current Wallet</Text>
            <Text style={styles.breakdownValue}>₱{user?.wallet ?? 0}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownRowBorder]}>
            <Text style={styles.breakdownLabel}>Bonus Earned</Text>
            <Text style={[styles.breakdownValue, { color: Colors.accent }]}>+ ₱{bonus}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { fontWeight: '700' as const }]}>Total Available</Text>
            <Text style={[styles.breakdownValue, { fontWeight: '700' as const }]}>₱{walletBalance}</Text>
          </View>
        </View>

        {/* Earnings Info */}
        <Text style={styles.sectionTitle}>Earnings Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Base Delivery Fee</Text>
              <Text style={styles.infoText}>₱30 per delivery</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Performance Bonus</Text>
              <Text style={styles.infoText}>₱200+ when earnings exceed ₱500</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Excellence Bonus</Text>
              <Text style={styles.infoText}>₱500 when earnings exceed ₱1000</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent onRequestClose={() => setShowWithdrawModal(false)}>
        <SafeAreaView style={styles.modalOverlay} edges={['bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Withdraw</Text>
            <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <Text style={styles.inputLabel}>Withdrawal Amount</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₱</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.availableText}>Available: ₱{walletBalance}</Text>

            {/* Payment Method Selection */}
            <Text style={[styles.inputLabel, { marginTop: 24 }]}>Payment Method</Text>
            <View style={styles.methodsGrid}>
              <TouchableOpacity
                style={[styles.methodOption, paymentMethod === 'gcash' && styles.methodOptionActive]}
                onPress={() => setPaymentMethod('gcash')}
                activeOpacity={0.7}
              >
                <View style={[styles.methodOptionIcon, paymentMethod === 'gcash' && { backgroundColor: Colors.primary + '20' }]}>
                  <Text style={styles.methodOptionIconText}>₱</Text>
                </View>
                <Text style={[styles.methodOptionText, paymentMethod === 'gcash' && { color: Colors.primary, fontWeight: '700' as const }]}>GCash</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodOption, paymentMethod === 'maya' && styles.methodOptionActive]}
                onPress={() => setPaymentMethod('maya')}
                activeOpacity={0.7}
              >
                <View style={[styles.methodOptionIcon, paymentMethod === 'maya' && { backgroundColor: Colors.primary + '20' }]}>
                  <Text style={styles.methodOptionIconText}>M</Text>
                </View>
                <Text style={[styles.methodOptionText, paymentMethod === 'maya' && { color: Colors.primary, fontWeight: '700' as const }]}>Maya</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodOption, paymentMethod === 'credit_card' && styles.methodOptionActive]}
                onPress={() => setPaymentMethod('credit_card')}
                activeOpacity={0.7}
              >
                <View style={[styles.methodOptionIcon, paymentMethod === 'credit_card' && { backgroundColor: Colors.primary + '20' }]}>
                  <Text style={styles.methodOptionIconText}>🏦</Text>
                </View>
                <Text style={[styles.methodOptionText, paymentMethod === 'credit_card' && { color: Colors.primary, fontWeight: '700' as const }]}>Credit Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodOption, paymentMethod === 'debit_card' && styles.methodOptionActive]}
                onPress={() => setPaymentMethod('debit_card')}
                activeOpacity={0.7}
              >
                <View style={[styles.methodOptionIcon, paymentMethod === 'debit_card' && { backgroundColor: Colors.primary + '20' }]}>
                  <Text style={styles.methodOptionIconText}>💳</Text>
                </View>
                <Text style={[styles.methodOptionText, paymentMethod === 'debit_card' && { color: Colors.primary, fontWeight: '700' as const }]}>Debit Card</Text>
              </TouchableOpacity>
            </View>

            {/* Account/Card Number Input */}
            <Text style={[styles.inputLabel, { marginTop: 24 }]}>
              {paymentMethod === 'gcash' && 'GCash Number'}
              {paymentMethod === 'maya' && 'Maya Number'}
              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && 'Card Number'}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={
                paymentMethod === 'gcash' || paymentMethod === 'maya'
                  ? '09XXXXXXXXX'
                  : '1234 5678 9012 3456'
              }
              placeholderTextColor={Colors.textTertiary}
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType={paymentMethod === 'gcash' || paymentMethod === 'maya' ? 'phone-pad' : 'numeric'}
            />

            {/* Terms */}
            <View style={styles.termsCard}>
              <Text style={styles.termsTitle}>Important Notes</Text>
              <Text style={styles.termsText}>• Minimum withdrawal: ₱100</Text>
              <Text style={styles.termsText}>• Processing time: 1-5 minutes</Text>
              <Text style={styles.termsText}>• GCash charges may apply</Text>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Action Button at Bottom */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.confirmWithdrawBtn} onPress={handleWithdraw} activeOpacity={0.85}>
              <Text style={styles.confirmWithdrawBtnText}>Confirm Withdrawal</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingHorizontal: 20, paddingTop: 8 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  balanceCard: {
    backgroundColor: Colors.primary, borderRadius: 20, padding: 24, marginTop: 16,
    gap: 16,
  },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { fontSize: 14, color: Colors.white + '80', fontWeight: '500' as const },
  balanceValue: { fontSize: 32, fontWeight: '800' as const, color: Colors.white, marginTop: 4 },
  walletIcon: {
    width: 60, height: 60, borderRadius: 16, backgroundColor: Colors.white + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  balanceDivider: { height: 1, backgroundColor: Colors.white + '30' },
  balanceNote: { fontSize: 13, color: Colors.white + '80', fontWeight: '500' as const },
  statsGrid: {
    flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 20,
  },
  statBox: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center',
    alignItems: 'center', marginBottom: 8,
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' as const, textAlign: 'center' as const },
  statValue: { fontSize: 16, fontWeight: '800' as const, color: Colors.text, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginTop: 20, marginBottom: 12 },
  breakdownCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  breakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12,
  },
  breakdownRowBorder: {
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.borderLight,
  },
  breakdownLabel: { fontSize: 14, color: Colors.text, fontWeight: '600' as const },
  breakdownValue: { fontSize: 14, color: Colors.primary, fontWeight: '700' as const },
  infoCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight, gap: 14,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6 },
  infoTitle: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  infoText: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: Colors.primary, marginHorizontal: 20, marginTop: 16, paddingVertical: 16,
    borderRadius: 16,
  },
  withdrawBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white, flex: 1, textAlign: 'center' as const },
  modalOverlay: { flex: 1, backgroundColor: Colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  modalTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  modalBody: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  modalFooter: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  inputLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, paddingHorizontal: 12 },
  currencySymbol: { fontSize: 16, fontWeight: '700' as const, color: Colors.primary, marginRight: 6 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '700' as const, color: Colors.text, paddingVertical: 14 },
  availableText: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  textInput: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text },
  termsCard: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, marginBottom: 20 },
  termsTitle: { fontSize: 13, fontWeight: '600' as const, color: Colors.text, marginBottom: 8 },
  termsText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  confirmWithdrawBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', width: '100%' },
  confirmWithdrawBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  methodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  methodOption: { flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: 12, borderWidth: 2, borderColor: Colors.borderLight, padding: 12, alignItems: 'center', justifyContent: 'center' },
  methodOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  methodOptionIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  methodOptionIconText: { fontSize: 18, fontWeight: '700' as const },
  methodOptionText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary, textAlign: 'center' as const },
});
