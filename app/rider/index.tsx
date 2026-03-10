import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bike, ArrowRight, Package, Clock, CircleCheck, TrendingUp, Target, Percent, Map, MessageCircle, Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useMessages } from '@/contexts/MessageContext';
import { Colors } from '@/constants/colors';

export default function RiderTasksScreen() {
  const { user } = useAuth();
  const { getTasksForRider, orders } = useOrders();
  const { getTotalUnread } = useMessages();
  const router = useRouter();

  const tasks = useMemo(() => {
    if (!user) return [];
    return getTasksForRider(user.id);
  }, [user, getTasksForRider]);

  // Calculate earnings and metrics
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

  const completedDeliveries = useMemo(() => {
    return riderOrders.filter((o) => ['delivered', 'paid', 'completed', 'rated'].includes(o.status)).length;
  }, [riderOrders]);

  const acceptedOrders = useMemo(() => {
    return riderOrders.filter((o) => o.status !== 'declined' && o.status !== 'cancelled').length;
  }, [riderOrders]);

  const cancelledOrders = useMemo(() => {
    return riderOrders.filter((o) => ['cancelled', 'declined'].includes(o.status)).length;
  }, [riderOrders]);

  const onTimeDeliveries = useMemo(() => {
    return riderOrders.filter((o) => ['delivered', 'completed', 'rated'].includes(o.status)).length;
  }, [riderOrders]);

  const acceptanceRate = useMemo(() => {
    if (riderOrders.length === 0) return 100;
    return Math.round((acceptedOrders / riderOrders.length) * 100);
  }, [riderOrders, acceptedOrders]);

  const cancellationRate = useMemo(() => {
    if (riderOrders.length === 0) return 0;
    return Math.round((cancelledOrders / riderOrders.length) * 100);
  }, [riderOrders, cancelledOrders]);

  const onTimeDeliveryRate = useMemo(() => {
    if (completedDeliveries === 0) return 100;
    return Math.round((onTimeDeliveries / completedDeliveries) * 100);
  }, [completedDeliveries, onTimeDeliveries]);

  const weeklyTarget = 10;
  const weeklyProgress = completedDeliveries;

  const bonus = totalEarnings > 1000 ? 500 : totalEarnings > 500 ? 200 : 0;

  const newRequests = tasks.length;

  const firstName = user?.name?.split(' ')[0] ?? 'Rider';
  const unreadCount = getTotalUnread(user?.id ?? '');



  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {firstName}!</Text>
            <Text style={styles.subtitle}>{tasks.length} active task{tasks.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.msgBtn}
              onPress={() => router.push('/rider/messages' as any)}
              activeOpacity={0.7}
            >
              <MessageCircle size={22} color={Colors.text} />
              {unreadCount > 0 && (
                <View style={styles.msgBadge}>
                  <Text style={styles.msgBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.msgBtn}
              onPress={() => router.push('/rider/notifications' as any)}
              activeOpacity={0.7}
            >
              <Bell size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {user?.assignedShopName && (
          <View style={styles.shopAssignment}>
            <Text style={styles.shopAssignLabel}>Assigned to</Text>
            <Text style={styles.shopAssignName}>{user.assignedShopName}</Text>
          </View>
        )}

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Package size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{newRequests}</Text>
            <Text style={styles.statLabel}>New Requests</Text>
          </View>
          <View style={styles.statCard}>
            <CircleCheck size={20} color={Colors.success} />
            <Text style={styles.statValue}>{completedDeliveries}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={Colors.accent} />
            <Text style={styles.statValue}>₱{todayEarnings}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

        {/* Live Tracking Button */}
        {tasks.length > 0 && (
          <TouchableOpacity
            style={styles.trackingBtn}
            onPress={() => router.push('/rider/tracking' as any)}
            activeOpacity={0.85}
          >
            <Map size={20} color={Colors.white} />
            <Text style={styles.trackingBtnText}>View Live Tracking</Text>
            <ArrowRight size={16} color={Colors.white} />
          </TouchableOpacity>
        )}

        {/* Earnings Section */}
        <Text style={styles.sectionTitle}>Earnings</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningCard}>
            <Text style={styles.earningLabel}>Total Earnings</Text>
            <Text style={styles.earningValue}>₱{totalEarnings}</Text>
          </View>
          <View style={styles.earningCard}>
            <Text style={styles.earningLabel}>Bonus</Text>
            <Text style={[styles.earningValue, { color: Colors.accent }]}>₱{bonus}</Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Percent size={16} color={Colors.primary} />
              <Text style={styles.metricLabel}>Acceptance</Text>
            </View>
            <Text style={styles.metricValue}>{acceptanceRate}%</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Percent size={16} color={Colors.error} />
              <Text style={styles.metricLabel}>Cancellation</Text>
            </View>
            <Text style={[styles.metricValue, { color: Colors.error }]}>{cancellationRate}%</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Clock size={16} color={Colors.success} />
              <Text style={styles.metricLabel}>On-time</Text>
            </View>
            <Text style={[styles.metricValue, { color: Colors.success }]}>{onTimeDeliveryRate}%</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Target size={16} color={Colors.accent} />
              <Text style={styles.metricLabel}>Weekly Target</Text>
            </View>
            <Text style={styles.metricValue}>{weeklyProgress}/{weeklyTarget}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Active Tasks</Text>

        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => router.push(`/task-detail?id=${task.orderId}` as any)}
            activeOpacity={0.8}
          >
            <View style={styles.taskHeader}>
              <View style={[styles.typeBadge, { backgroundColor: task.type === 'pickup' ? Colors.primaryFaded : Colors.successLight }]}>
                <Text style={[styles.typeText, { color: task.type === 'pickup' ? Colors.primary : Colors.success }]}>
                  {task.type === 'pickup' ? '📦 Pickup' : '🚚 Delivery'}
                </Text>
              </View>
              <View style={styles.etaRow}>
                <Clock size={13} color={Colors.textTertiary} />
                <Text style={styles.etaText}>{task.estimatedTime}</Text>
              </View>
            </View>

            <View style={styles.routeSection}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>From</Text>
                  <Text style={styles.routeAddress} numberOfLines={1}>{task.pickupAddress}</Text>
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>To</Text>
                  <Text style={styles.routeAddress} numberOfLines={1}>{task.dropoffAddress}</Text>
                </View>
              </View>
            </View>

            <View style={styles.taskFooter}>
              <Text style={styles.taskNames}>{task.customerName} • {task.shopName}</Text>
              <ArrowRight size={18} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))}

        {tasks.length === 0 && (
          <View style={styles.empty}>
            <Bike size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No active tasks</Text>
            <Text style={styles.emptyText}>
              {user?.isAvailable !== false ? 'New delivery tasks will appear here' : 'Go online to receive tasks'}
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  greeting: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  msgBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  msgBadge: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  msgBadgeText: { fontSize: 10, fontWeight: '700' as const, color: Colors.white },
  scroll: { flex: 1 },
  shopAssignment: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primaryFaded, marginHorizontal: 20, marginTop: 12, padding: 14, borderRadius: 12,
  },
  shopAssignLabel: { fontSize: 13, color: Colors.primaryDark, fontWeight: '500' as const },
  shopAssignName: { fontSize: 14, color: Colors.primaryDark, fontWeight: '700' as const },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, paddingTop: 16 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 14, alignItems: 'center',
    gap: 6, borderWidth: 1, borderColor: Colors.borderLight,
  },
  statValue: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500' as const },
  trackingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  trackingBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  earningsGrid: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16,
  },
  earningCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.borderLight,
  },
  earningLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' as const, marginBottom: 6 },
  earningValue: { fontSize: 18, fontWeight: '800' as const, color: Colors.text },
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginBottom: 20,
  },
  metricCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  metricLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' as const },
  metricValue: { fontSize: 18, fontWeight: '800' as const, color: Colors.text },
  taskCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginHorizontal: 20,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.borderLight,
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  typeText: { fontSize: 13, fontWeight: '700' as const },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  etaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' as const },
  routeSection: { marginBottom: 14 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500' as const },
  routeAddress: { fontSize: 14, color: Colors.text, fontWeight: '500' as const },
  routeLine: { width: 2, height: 20, backgroundColor: Colors.border, marginLeft: 5, marginVertical: 2 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  taskNames: { fontSize: 13, color: Colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' as const },
});
