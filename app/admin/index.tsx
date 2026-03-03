import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Store, Bike, Package, PhilippinePeso, TrendingUp, AlertCircle, ArrowRightFromLine, BarChart3, ShoppingBag, CircleCheck, CircleX, Star, Clock, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';

export default function AdminDashboardScreen() {
  const { orders, complaints } = useOrders();
  const { logout, allUsers } = useAuth();
  const { shops } = useShops();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const customers = allUsers.filter((u) => u.role === 'customer').length;
  const shopCount = shops.length;
  const riderCount = allUsers.filter((u) => u.role === 'rider').length;
  const activeRiders = allUsers.filter((u) => u.role === 'rider' && u.isAvailable === true).length;
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => !['delivered', 'paid', 'completed', 'rated', 'cancelled', 'declined'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => ['completed', 'rated'].includes(o.status)).length;
  const cancelledOrders = orders.filter((o) => ['cancelled', 'declined'].includes(o.status)).length;
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const totalRevenue = orders.filter((o) => o.isPaid).reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    return orders
      .filter((o) => o.isPaid && new Date(o.createdAt).getMonth() === now.getMonth() && new Date(o.createdAt).getFullYear() === now.getFullYear())
      .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
  }, [orders]);
  const openComplaints = complaints.filter((c) => c.status === 'open').length;

  const topShop = useMemo(() => {
    if (shops.length === 0) return null;
    const shopSales: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.isPaid) {
        shopSales[o.shopName] = (shopSales[o.shopName] ?? 0) + (o.totalAmount ?? 0);
      }
    });
    const entries = Object.entries(shopSales);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return { name: entries[0][0], sales: entries[0][1] };
  }, [orders, shops]);

  const platformCommission = useMemo(() => {
    return orders.filter((o) => o.platformCommission).reduce((sum, o) => sum + (o.platformCommission ?? 0), 0);
  }, [orders]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    const now = new Date();
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        counts[d.getDay()]++;
      }
    });
    const max = Math.max(...counts, 1);
    return days.map((day, i) => ({ day, count: counts[i], height: (counts[i] / max) * 100 }));
  }, [orders]);

  const stats = [
    { label: 'Customers', value: customers, icon: Users, color: Colors.primary, bg: Colors.primaryFaded },
    { label: 'Shops', value: shopCount, icon: Store, color: Colors.shop, bg: Colors.shopLight },
    { label: 'Riders', value: riderCount, icon: Bike, color: Colors.info, bg: Colors.infoLight },
    { label: 'Total Orders', value: totalOrders, icon: Package, color: Colors.warning, bg: Colors.warningLight },
    { label: 'Active Orders', value: activeOrders, icon: TrendingUp, color: Colors.accent, bg: Colors.accentLight },
    { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: PhilippinePeso, color: Colors.success, bg: Colors.successLight },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>LabadaGO System Overview</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} testID="admin-logout-btn">
            <ArrowRightFromLine size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {openComplaints > 0 && (
          <View style={styles.alertCard}>
            <AlertCircle size={20} color={Colors.error} />
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>{openComplaints} Open Complaint{openComplaints > 1 ? 's' : ''}</Text>
              <Text style={styles.alertText}>Requires your attention</Text>
            </View>
          </View>
        )}

        <View style={styles.statsGrid}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                  <Icon size={18} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Analytics</Text>
          <View style={styles.salesRow}>
            <View style={[styles.salesCard, { borderLeftColor: Colors.success }]}>
              <Text style={styles.salesLabel}>This Month</Text>
              <Text style={styles.salesValue}>₱{monthlyRevenue.toLocaleString()}</Text>
            </View>
            <View style={[styles.salesCard, { borderLeftColor: Colors.primary }]}>
              <Text style={styles.salesLabel}>Commission</Text>
              <Text style={styles.salesValue}>₱{platformCommission.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders This Week</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartRow}>
              {weeklyData.map((item, i) => (
                <View key={i} style={styles.chartBar}>
                  <View style={styles.barWrap}>
                    <View style={[styles.bar, { height: Math.max(item.height, 4), backgroundColor: item.count > 0 ? Colors.primary : Colors.border }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.day}</Text>
                  <Text style={styles.barCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <ShoppingBag size={16} color={Colors.info} />
              <Text style={styles.summaryValue}>{todayOrders}</Text>
              <Text style={styles.summaryLabel}>Today</Text>
            </View>
            <View style={styles.summaryCard}>
              <CircleCheck size={16} color={Colors.success} />
              <Text style={styles.summaryValue}>{completedOrders}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryCard}>
              <CircleX size={16} color={Colors.error} />
              <Text style={styles.summaryValue}>{cancelledOrders}</Text>
              <Text style={styles.summaryLabel}>Cancelled</Text>
            </View>
            <View style={styles.summaryCard}>
              <Clock size={16} color={Colors.warning} />
              <Text style={styles.summaryValue}>{activeOrders}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Performance</Text>
          {topShop ? (
            <View style={styles.topShopCard}>
              <View style={[styles.topBadge, { backgroundColor: Colors.accentLight }]}>
                <Star size={14} color={Colors.accent} fill={Colors.accent} />
                <Text style={styles.topBadgeText}>Top Shop</Text>
              </View>
              <Text style={styles.topShopName}>{topShop.name}</Text>
              <Text style={styles.topShopSales}>₱{topShop.sales.toLocaleString()} in sales</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No shop data yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rider Overview</Text>
          <View style={styles.riderOverviewRow}>
            <View style={styles.riderOverviewCard}>
              <Bike size={18} color={Colors.primary} />
              <Text style={styles.riderOverviewValue}>{riderCount}</Text>
              <Text style={styles.riderOverviewLabel}>Total</Text>
            </View>
            <View style={styles.riderOverviewCard}>
              <Zap size={18} color={Colors.success} />
              <Text style={styles.riderOverviewValue}>{activeRiders}</Text>
              <Text style={styles.riderOverviewLabel}>Active</Text>
            </View>
            <View style={styles.riderOverviewCard}>
              <BarChart3 size={18} color={Colors.info} />
              <Text style={styles.riderOverviewValue}>{orders.filter((o) => ['delivered', 'completed', 'rated'].includes(o.status) && o.riderId).length}</Text>
              <Text style={styles.riderOverviewLabel}>Deliveries</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {orders.length > 0 ? orders.slice(0, 5).map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderRow} onPress={() => router.push(`/order-detail?id=${order.id}` as any)} activeOpacity={0.7}>
              <View style={styles.orderLeft}>
                <Text style={styles.orderCustomer}>{order.customerName}</Text>
                <Text style={styles.orderShop}>{order.shopName}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>{order.totalAmount ? `₱${order.totalAmount}` : '—'}</Text>
                <View style={[styles.orderStatus, {
                  backgroundColor: ['delivered', 'paid', 'completed', 'rated'].includes(order.status) ? Colors.successLight : ['cancelled', 'declined'].includes(order.status) ? Colors.errorLight : Colors.infoLight
                }]}>
                  <Text style={[styles.orderStatusText, {
                    color: ['delivered', 'paid', 'completed', 'rated'].includes(order.status) ? Colors.success : ['cancelled', 'declined'].includes(order.status) ? Colors.error : Colors.info
                  }]}>
                    {order.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={styles.emptyText}>No orders in the system yet</Text>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.errorLight, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.errorLight,
    marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 14,
  },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.error },
  alertText: { fontSize: 12, color: Colors.error, opacity: 0.7, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  statCard: {
    flexBasis: '47%' as const, backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  salesRow: { flexDirection: 'row', gap: 10 },
  salesCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.borderLight,
  },
  salesLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  salesValue: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  chartCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.borderLight },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
  chartBar: { alignItems: 'center', flex: 1 },
  barWrap: { height: 100, justifyContent: 'flex-end' },
  bar: { width: 24, borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, color: Colors.textTertiary, marginTop: 6, fontWeight: '600' as const },
  barCount: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' as const },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12, alignItems: 'center',
    gap: 4, borderWidth: 1, borderColor: Colors.borderLight,
  },
  summaryValue: { fontSize: 18, fontWeight: '800' as const, color: Colors.text },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' as const },
  topShopCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  topBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  topBadgeText: { fontSize: 12, fontWeight: '700' as const, color: Colors.accent },
  topShopName: { fontSize: 17, fontWeight: '700' as const, color: Colors.text },
  topShopSales: { fontSize: 14, color: Colors.success, fontWeight: '600' as const, marginTop: 4 },
  riderOverviewRow: { flexDirection: 'row', gap: 10 },
  riderOverviewCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: 'center',
    gap: 6, borderWidth: 1, borderColor: Colors.borderLight,
  },
  riderOverviewValue: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  riderOverviewLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' as const },
  orderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, padding: 14, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  orderLeft: { flex: 1 },
  orderCustomer: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  orderShop: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  orderRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  orderStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  orderStatusText: { fontSize: 10, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  emptyText: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center' as const, paddingVertical: 20 },
});
