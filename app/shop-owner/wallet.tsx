import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, TrendingUp, Send, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  reference?: string;
}

export default function ShopOwnerWalletScreen() {
  const [balance, setBalance] = useState<number>(15450.50);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'credit',
      amount: 2500,
      description: 'Order #12345 Completed',
      date: '2026-03-11',
      reference: 'ORD-12345',
    },
    {
      id: '2',
      type: 'debit',
      amount: 500,
      description: 'Withdrawal to Bank Account',
      date: '2026-03-10',
      reference: 'WIT-001',
    },
    {
      id: '3',
      type: 'credit',
      amount: 1800,
      description: 'Order #12344 Completed',
      date: '2026-03-09',
      reference: 'ORD-12344',
    },
    {
      id: '4',
      type: 'debit',
      amount: 200,
      description: 'Service Fee',
      date: '2026-03-08',
      reference: 'FEE-001',
    },
  ]);

  const handleWithdraw = () => {
    Alert.alert('Withdraw Money', 'Enter amount to withdraw', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Withdraw',
        onPress: () => {
          Alert.alert('Success', 'Withdrawal request submitted. Amount will be transferred within 2-3 business days.');
        },
      },
    ]);
  };

  const handleTransfer = () => {
    Alert.alert('Transfer Money', 'Enter recipient and amount', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Transfer',
        onPress: () => {
          Alert.alert('Success', 'Money transferred successfully.');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Wallet</Text>
          <View style={styles.headerIcon}>
            <Wallet size={24} color={Colors.primary} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <CreditCard size={20} color={Colors.white} />
          </View>
          <Text style={styles.balanceAmount}>₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={styles.balanceDesc}>Total earnings from completed orders</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleWithdraw} activeOpacity={0.8}>
            <View style={styles.actionIconWrap}>
              <ArrowDownLeft size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleTransfer} activeOpacity={0.8}>
            <View style={styles.actionIconWrap}>
              <Send size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={18} color={Colors.success} />
              </View>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>₱8,500</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Wallet size={18} color={Colors.primary} />
              </View>
              <Text style={styles.statLabel}>Total Orders</Text>
              <Text style={styles.statValue}>24</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.type === 'credit' ? Colors.successLight : Colors.errorLight },
                  ]}
                >
                  {transaction.type === 'credit' ? (
                    <ArrowDownLeft size={16} color={Colors.success} />
                  ) : (
                    <ArrowUpRight size={16} color={Colors.error} />
                  )}
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'credit' ? Colors.success : Colors.error },
                ]}
              >
                {transaction.type === 'credit' ? '+' : '-'}₱{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  headerIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primaryFaded, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' as const },
  balanceAmount: { fontSize: 36, fontWeight: '800' as const, color: Colors.white, marginBottom: 4 },
  balanceDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  actionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 16, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.borderLight },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryFaded, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  statsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.borderLight },
  statIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  transactionSection: { marginBottom: 12 },
  transactionItem: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1, borderColor: Colors.borderLight },
  transactionLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  transactionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  transactionInfo: { flex: 1 },
  transactionDesc: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  transactionDate: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  transactionAmount: { fontSize: 14, fontWeight: '700' as const },
});
