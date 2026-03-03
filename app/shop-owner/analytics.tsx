import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PhilippinePeso,
  Package,
  Users,
  Star,
  Truck,
  AlertTriangle,
  Weight,
  BarChart3,
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  CheckCircle,
  Repeat,
  UserPlus,
  Crown,
  Activity,
  Ban,

} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { Colors } from '@/constants/colors';


type TimeRange = 'today' | 'week' | 'month' | 'all';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isInRange(orderDate: string, range: TimeRange): boolean {
  const now = new Date();
  const d = new Date(orderDate);
  switch (range) {
    case 'today':
      return d.toDateString() === now.toDateString();
    case 'week': {
      const weekStart = getWeekStart(now);
      return d >= weekStart && d <= now;
    }
    case 'month':
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    case 'all':
      return true;
  }
}

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { getShopByOwner, getReviewsByShop } = useShops();
  const [activeRange, setActiveRange] = useState<TimeRange>('month');

  const shop = getShopByOwner(user?.id ?? '');
  const shopReviews = useMemo(() => {
    if (!shop) return [];
    return getReviewsByShop(shop.id);
  }, [shop, getReviewsByShop]);

  const allShopOrders = useMemo(() => {
    if (!shop) return [];
    return orders.filter((o) => o.shopId === shop.id);
  }, [orders, shop]);

  const filteredOrders = useMemo(() => {
    return allShopOrders.filter((o) => isInRange(o.createdAt, activeRange));
  }, [allShopOrders, activeRange]);

  const paidOrders = useMemo(() => filteredOrders.filter((o) => o.isPaid), [filteredOrders]);
  const completedOrders = useMemo(() => filteredOrders.filter((o) => ['completed', 'rated'].includes(o.status)), [filteredOrders]);

  const totalRevenue = useMemo(() => paidOrders.reduce((s, o) => s + (o.shopEarnings ?? o.totalAmount ?? 0), 0), [paidOrders]);
  const serviceRevenue = useMemo(() => paidOrders.reduce((s, o) => s + (o.serviceCost ?? 0), 0), [paidOrders]);
  const deliveryIncome = useMemo(() => paidOrders.reduce((s, o) => s + (o.deliveryFee ?? 0), 0), [paidOrders]);
  const totalCommission = useMemo(() => paidOrders.reduce((s, o) => s + (o.platformCommission ?? 0), 0), [paidOrders]);
  const netEarnings = totalRevenue;

  const now = new Date();
  const prevMonthOrders = useMemo(() => {
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return allShopOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear();
    });
  }, [allShopOrders]);

  const prevMonthRevenue = prevMonthOrders.filter((o) => o.isPaid).reduce((s, o) => s + (o.shopEarnings ?? o.totalAmount ?? 0), 0);
  const revenueGrowth = prevMonthRevenue > 0 ? Math.round(((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;

  const dailyRevenue = useMemo(() => {
    const data: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayOrders = allShopOrders.filter((o) => {
        const od = new Date(o.createdAt);
        return od.toDateString() === d.toDateString() && o.isPaid;
      });
      data.push({
        label: DAY_NAMES[d.getDay()],
        value: dayOrders.reduce((s, o) => s + (o.shopEarnings ?? o.totalAmount ?? 0), 0),
      });
    }
    return data;
  }, [allShopOrders]);

  const monthlyRevenue = useMemo(() => {
    const data: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mOrders = allShopOrders.filter((o) => {
        const od = new Date(o.createdAt);
        return od.getMonth() === m.getMonth() && od.getFullYear() === m.getFullYear() && o.isPaid;
      });
      data.push({
        label: MONTHS[m.getMonth()],
        value: mOrders.reduce((s, o) => s + (o.shopEarnings ?? o.totalAmount ?? 0), 0),
      });
    }
    return data;
  }, [allShopOrders]);

  const ordersPerDay = useMemo(() => {
    const data: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = allShopOrders.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString()).length;
      data.push({ label: DAY_NAMES[d.getDay()], value: count });
    }
    return data;
  }, [allShopOrders]);

  const busiestDay = useMemo(() => {
    const counts: Record<string, number> = {};
    allShopOrders.forEach((o) => {
      const day = DAY_NAMES[new Date(o.createdAt).getDay()];
      counts[day] = (counts[day] || 0) + 1;
    });
    let best = '';
    let max = 0;
    Object.entries(counts).forEach(([day, count]) => {
      if (count > max) { best = day; max = count; }
    });
    return best || '—';
  }, [allShopOrders]);

  const servicePopularity = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      counts[o.serviceName] = (counts[o.serviceName] || 0) + 1;
    });
    const total = filteredOrders.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [filteredOrders]);

  const totalKgToday = useMemo(() => {
    return allShopOrders
      .filter((o) => new Date(o.createdAt).toDateString() === now.toDateString() && o.weight)
      .reduce((s, o) => s + (o.weight ?? 0), 0);
  }, [allShopOrders]);

  const totalKgWeek = useMemo(() => {
    const weekStart = getWeekStart(now);
    return allShopOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d >= weekStart && d <= now && o.weight;
      })
      .reduce((s, o) => s + (o.weight ?? 0), 0);
  }, [allShopOrders]);

  const avgKgPerOrder = useMemo(() => {
    const withWeight = allShopOrders.filter((o) => o.weight);
    return withWeight.length > 0 ? Math.round((withWeight.reduce((s, o) => s + (o.weight ?? 0), 0) / withWeight.length) * 10) / 10 : 0;
  }, [allShopOrders]);

  const uniqueCustomers = useMemo(() => {
    const ids = new Set(filteredOrders.map((o) => o.customerId));
    return ids.size;
  }, [filteredOrders]);

  const repeatCustomersPct = useMemo(() => {
    const counts: Record<string, number> = {};
    allShopOrders.forEach((o) => { counts[o.customerId] = (counts[o.customerId] || 0) + 1; });
    const total = Object.keys(counts).length || 1;
    const repeats = Object.values(counts).filter((c) => c > 1).length;
    return Math.round((repeats / total) * 100);
  }, [allShopOrders]);

  const newCustomersWeek = useMemo(() => {
    const weekStart = getWeekStart(now);
    const beforeIds = new Set(
      allShopOrders.filter((o) => new Date(o.createdAt) < weekStart).map((o) => o.customerId)
    );
    const weekIds = new Set(
      allShopOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= weekStart && d <= now;
      }).map((o) => o.customerId)
    );
    let count = 0;
    weekIds.forEach((id) => { if (!beforeIds.has(id)) count++; });
    return count;
  }, [allShopOrders]);

  const topCustomers = useMemo(() => {
    const counts: Record<string, { name: string; orders: number; spent: number }> = {};
    allShopOrders.forEach((o) => {
      if (!counts[o.customerId]) counts[o.customerId] = { name: o.customerName, orders: 0, spent: 0 };
      counts[o.customerId].orders++;
      if (o.isPaid) counts[o.customerId].spent += (o.totalAmount ?? 0);
    });
    return Object.values(counts).sort((a, b) => b.orders - a.orders).slice(0, 5);
  }, [allShopOrders]);

  const avgRating = useMemo(() => {
    if (shopReviews.length === 0) return 0;
    return Math.round((shopReviews.reduce((s, r) => s + r.rating, 0) / shopReviews.length) * 10) / 10;
  }, [shopReviews]);

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    shopReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist;
  }, [shopReviews]);

  const riderPerformance = useMemo(() => {
    const riders: Record<string, { name: string; completed: number; failed: number; totalTime: number }> = {};
    allShopOrders.forEach((o) => {
      if (!o.riderId || !o.riderName) return;
      if (!riders[o.riderId]) riders[o.riderId] = { name: o.riderName, completed: 0, failed: 0, totalTime: 0 };
      if (['completed', 'rated'].includes(o.status)) {
        riders[o.riderId].completed++;
      }
      if (['cancelled', 'declined'].includes(o.status)) {
        riders[o.riderId].failed++;
      }
    });
    return Object.values(riders).sort((a, b) => b.completed - a.completed).slice(0, 5);
  }, [allShopOrders]);

  const completionRate = useMemo(() => {
    const total = allShopOrders.length || 1;
    const completed = allShopOrders.filter((o) => ['completed', 'rated'].includes(o.status)).length;
    return Math.round((completed / total) * 100);
  }, [allShopOrders]);

  const rejectionRate = useMemo(() => {
    const total = allShopOrders.length || 1;
    const rejected = allShopOrders.filter((o) => ['cancelled', 'declined'].includes(o.status)).length;
    return Math.round((rejected / total) * 100);
  }, [allShopOrders]);

  const pendingPayouts = useMemo(() => {
    return allShopOrders
      .filter((o) => ['completed', 'rated'].includes(o.status) && o.isPaid)
      .reduce((s, o) => s + (o.shopEarnings ?? 0), 0);
  }, [allShopOrders]);

  const alerts = useMemo(() => {
    const list: { type: 'warning' | 'error' | 'info'; message: string }[] = [];
    if (avgRating > 0 && avgRating < 3.5) {
      list.push({ type: 'error', message: `Low rating alert: ${avgRating} average. Consider improving service quality.` });
    }
    if (rejectionRate > 20) {
      list.push({ type: 'warning', message: `High cancellation rate: ${rejectionRate}%. Review your order acceptance process.` });
    }
    const todayCount = allShopOrders.filter((o) => new Date(o.createdAt).toDateString() === now.toDateString()).length;
    if (todayCount > 20) {
      list.push({ type: 'warning', message: `Overcapacity warning: ${todayCount} orders today. Consider pausing bookings.` });
    }
    const delayed = allShopOrders.filter((o) => {
      if (['completed', 'rated', 'cancelled', 'declined'].includes(o.status)) return false;
      const hours = (now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60);
      return hours > 48;
    }).length;
    if (delayed > 0) {
      list.push({ type: 'error', message: `${delayed} order${delayed > 1 ? 's' : ''} delayed beyond 48 hours.` });
    }
    return list;
  }, [allShopOrders, avgRating, rejectionRate]);

  if (!shop) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <BarChart3 size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No shop found</Text>
        </View>
      </View>
    );
  }

  const maxDaily = Math.max(...dailyRevenue.map((d) => d.value), 1);
  const maxMonthly = Math.max(...monthlyRevenue.map((d) => d.value), 1);
  const maxOrdersDay = Math.max(...ordersPerDay.map((d) => d.value), 1);
  const maxRatingDist = Math.max(...ratingDistribution, 1);

  const serviceColors = ['#0891B2', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSub}>{shop.name}</Text>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.rangeRow}>
          {(['today', 'week', 'month', 'all'] as TimeRange[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeBtn, activeRange === r && styles.rangeBtnActive]}
              onPress={() => setActiveRange(r)}
            >
              <Text style={[styles.rangeBtnText, activeRange === r && styles.rangeBtnTextActive]}>
                {r === 'all' ? 'All Time' : r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            {alerts.map((a, i) => (
              <View key={i} style={[styles.alertCard, a.type === 'error' ? styles.alertError : a.type === 'warning' ? styles.alertWarning : styles.alertInfo]}>
                <AlertTriangle size={16} color={a.type === 'error' ? Colors.error : a.type === 'warning' ? Colors.accent : Colors.info} />
                <Text style={styles.alertText}>{a.message}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <PhilippinePeso size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Revenue Overview</Text>
          </View>

          <View style={styles.bigStatRow}>
            <View style={styles.bigStatCard}>
              <Text style={styles.bigStatLabel}>Net Earnings</Text>
              <Text style={styles.bigStatValue}>₱{netEarnings.toLocaleString()}</Text>
              {activeRange === 'month' && (
                <View style={styles.growthBadge}>
                  {revenueGrowth >= 0 ? (
                    <ArrowUpRight size={14} color={Colors.success} />
                  ) : (
                    <ArrowDownRight size={14} color={Colors.error} />
                  )}
                  <Text style={[styles.growthText, { color: revenueGrowth >= 0 ? Colors.success : Colors.error }]}>
                    {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% vs last month
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.miniStatsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>Service Revenue</Text>
              <Text style={styles.miniStatValue}>₱{serviceRevenue.toLocaleString()}</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>Delivery Income</Text>
              <Text style={styles.miniStatValue}>₱{deliveryIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>Commission</Text>
              <Text style={[styles.miniStatValue, { color: Colors.error }]}>-₱{totalCommission.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.chartTitle}>Daily Revenue (Last 7 Days)</Text>
          <View style={styles.chartWrap}>
            {dailyRevenue.map((item, i) => {
              const h = maxDaily > 0 ? (item.value / maxDaily) * 100 : 0;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barTopLabel}>{item.value > 0 ? `₱${item.value}` : ''}</Text>
                  <View style={[styles.bar, { height: Math.max(h, 3), backgroundColor: Colors.primary }]} />
                  <Text style={styles.barBottomLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.chartTitle}>Monthly Revenue (Last 6 Months)</Text>
          <View style={styles.chartWrap}>
            {monthlyRevenue.map((item, i) => {
              const h = maxMonthly > 0 ? (item.value / maxMonthly) * 100 : 0;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barTopLabel}>{item.value > 0 ? `₱${item.value}` : ''}</Text>
                  <View style={[styles.bar, { height: Math.max(h, 3), backgroundColor: Colors.primaryDark }]} />
                  <Text style={styles.barBottomLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={Colors.info} />
            <Text style={styles.sectionTitle}>Order Analytics</Text>
          </View>

          <View style={styles.statRow}>
            <View style={[styles.statBox, { borderLeftColor: Colors.primary }]}>
              <Text style={styles.statBoxValue}>{filteredOrders.length}</Text>
              <Text style={styles.statBoxLabel}>Total Orders</Text>
            </View>
            <View style={[styles.statBox, { borderLeftColor: Colors.success }]}>
              <Text style={styles.statBoxValue}>{completedOrders.length}</Text>
              <Text style={styles.statBoxLabel}>Completed</Text>
            </View>
            <View style={[styles.statBox, { borderLeftColor: Colors.accent }]}>
              <Text style={styles.statBoxValue}>{busiestDay}</Text>
              <Text style={styles.statBoxLabel}>Busiest Day</Text>
            </View>
          </View>

          <Text style={styles.chartTitle}>Orders Per Day (Last 7 Days)</Text>
          <View style={styles.chartWrap}>
            {ordersPerDay.map((item, i) => {
              const h = maxOrdersDay > 0 ? (item.value / maxOrdersDay) * 100 : 0;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barTopLabel}>{item.value > 0 ? item.value.toString() : ''}</Text>
                  <View style={[styles.bar, { height: Math.max(h, 3), backgroundColor: Colors.info }]} />
                  <Text style={styles.barBottomLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <PieChart size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Service Popularity</Text>
          </View>
          {servicePopularity.length === 0 ? (
            <Text style={styles.noDataText}>No order data available</Text>
          ) : (
            servicePopularity.map((s, i) => (
              <View key={i} style={styles.popularityRow}>
                <View style={[styles.popularityDot, { backgroundColor: serviceColors[i % serviceColors.length] }]} />
                <Text style={styles.popularityName}>{s.name}</Text>
                <View style={styles.popularityBarWrap}>
                  <View style={[styles.popularityBar, { width: `${s.pct}%`, backgroundColor: serviceColors[i % serviceColors.length] + '40' }]} />
                </View>
                <Text style={styles.popularityPct}>{s.pct}%</Text>
                <Text style={styles.popularityCount}>({s.count})</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Weight size={20} color={Colors.primaryDark} />
            <Text style={styles.sectionTitle}>Weight & Capacity</Text>
          </View>
          <View style={styles.capacityGrid}>
            <View style={styles.capacityCard}>
              <Text style={styles.capacityValue}>{totalKgToday.toFixed(1)}</Text>
              <Text style={styles.capacityUnit}>kg</Text>
              <Text style={styles.capacityLabel}>Processed Today</Text>
            </View>
            <View style={styles.capacityCard}>
              <Text style={styles.capacityValue}>{totalKgWeek.toFixed(1)}</Text>
              <Text style={styles.capacityUnit}>kg</Text>
              <Text style={styles.capacityLabel}>This Week</Text>
            </View>
            <View style={styles.capacityCard}>
              <Text style={styles.capacityValue}>{avgKgPerOrder}</Text>
              <Text style={styles.capacityUnit}>kg/order</Text>
              <Text style={styles.capacityLabel}>Average</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={Colors.success} />
            <Text style={styles.sectionTitle}>Customer Insights</Text>
          </View>
          <View style={styles.insightsGrid}>
            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: Colors.primaryFaded }]}>
                <Users size={18} color={Colors.primary} />
              </View>
              <Text style={styles.insightValue}>{uniqueCustomers}</Text>
              <Text style={styles.insightLabel}>Unique Customers</Text>
            </View>
            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: Colors.successLight }]}>
                <Repeat size={18} color={Colors.success} />
              </View>
              <Text style={styles.insightValue}>{repeatCustomersPct}%</Text>
              <Text style={styles.insightLabel}>Repeat Rate</Text>
            </View>
            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: Colors.infoLight }]}>
                <UserPlus size={18} color={Colors.info} />
              </View>
              <Text style={styles.insightValue}>{newCustomersWeek}</Text>
              <Text style={styles.insightLabel}>New This Week</Text>
            </View>
          </View>

          {topCustomers.length > 0 && (
            <View style={styles.topCustomersCard}>
              <View style={styles.topCustomersHeader}>
                <Crown size={16} color={Colors.accent} />
                <Text style={styles.topCustomersTitle}>Top Customers</Text>
              </View>
              {topCustomers.map((c, i) => (
                <View key={i} style={styles.topCustomerRow}>
                  <View style={styles.topCustomerRank}>
                    <Text style={styles.topCustomerRankText}>{i + 1}</Text>
                  </View>
                  <View style={styles.topCustomerInfo}>
                    <Text style={styles.topCustomerName}>{c.name}</Text>
                    <Text style={styles.topCustomerDetail}>{c.orders} orders</Text>
                  </View>
                  <Text style={styles.topCustomerSpent}>₱{c.spent.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Rating & Feedback</Text>
          </View>

          <View style={styles.ratingOverview}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingBigValue}>{avgRating || '—'}</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} color={s <= Math.round(avgRating) ? Colors.accent : Colors.borderLight} fill={s <= Math.round(avgRating) ? Colors.accent : 'transparent'} />
                ))}
              </View>
              <Text style={styles.ratingCount}>{shopReviews.length} reviews</Text>
            </View>

            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star - 1];
                const w = maxRatingDist > 0 ? (count / maxRatingDist) * 100 : 0;
                return (
                  <View key={star} style={styles.ratingBarRow}>
                    <Text style={styles.ratingBarLabel}>{star}</Text>
                    <View style={styles.ratingBarTrack}>
                      <View style={[styles.ratingBarFill, { width: `${w}%`, backgroundColor: star >= 4 ? Colors.success : star === 3 ? Colors.accent : Colors.error }]} />
                    </View>
                    <Text style={styles.ratingBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color={Colors.rider} />
            <Text style={styles.sectionTitle}>Rider Performance</Text>
          </View>
          {riderPerformance.length === 0 ? (
            <Text style={styles.noDataText}>No rider data available</Text>
          ) : (
            riderPerformance.map((r, i) => (
              <View key={i} style={styles.riderRow}>
                <View style={styles.riderAvatar}>
                  <Truck size={16} color={Colors.white} />
                </View>
                <View style={styles.riderInfo}>
                  <Text style={styles.riderName}>{r.name}</Text>
                  <View style={styles.riderStats}>
                    <View style={styles.riderStatItem}>
                      <CheckCircle size={12} color={Colors.success} />
                      <Text style={styles.riderStatText}>{r.completed} completed</Text>
                    </View>
                    {r.failed > 0 && (
                      <View style={styles.riderStatItem}>
                        <XCircle size={12} color={Colors.error} />
                        <Text style={styles.riderStatText}>{r.failed} failed</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.riderRate}>
                  {r.completed + r.failed > 0 ? Math.round((r.completed / (r.completed + r.failed)) * 100) : 0}%
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={Colors.primaryDark} />
            <Text style={styles.sectionTitle}>Operational Metrics</Text>
          </View>
          <View style={styles.opsGrid}>
            <View style={styles.opsCard}>
              <CheckCircle size={22} color={Colors.success} />
              <Text style={styles.opsValue}>{completionRate}%</Text>
              <Text style={styles.opsLabel}>Completion Rate</Text>
            </View>
            <View style={styles.opsCard}>
              <Ban size={22} color={Colors.error} />
              <Text style={styles.opsValue}>{rejectionRate}%</Text>
              <Text style={styles.opsLabel}>Rejection Rate</Text>
            </View>
            <View style={styles.opsCard}>
              <Package size={22} color={Colors.info} />
              <Text style={styles.opsValue}>{filteredOrders.length}</Text>
              <Text style={styles.opsLabel}>Total Orders</Text>
            </View>
            <View style={styles.opsCard}>
              <PhilippinePeso size={22} color={Colors.primary} />
              <Text style={styles.opsValue}>{paidOrders.length}</Text>
              <Text style={styles.opsLabel}>Paid Orders</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wallet size={20} color={Colors.success} />
            <Text style={styles.sectionTitle}>Financial Summary</Text>
          </View>

          <View style={styles.financeCard}>
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Total Earnings</Text>
              <Text style={[styles.financeValue, { color: Colors.success }]}>₱{netEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.financeDivider} />
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Pending Payouts</Text>
              <Text style={styles.financeValue}>₱{pendingPayouts.toLocaleString()}</Text>
            </View>
            <View style={styles.financeDivider} />
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Platform Commission</Text>
              <Text style={[styles.financeValue, { color: Colors.error }]}>-₱{totalCommission.toLocaleString()}</Text>
            </View>
            <View style={styles.financeDivider} />
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Delivery Fee Income</Text>
              <Text style={styles.financeValue}>₱{deliveryIncome.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.transactionHeader}>
            <PhilippinePeso size={16} color={Colors.textSecondary} />
            <Text style={styles.transactionTitle}>Recent Transactions</Text>
          </View>
          {paidOrders.slice(0, 5).map((o) => (
            <View key={o.id} style={styles.transactionRow}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionName}>{o.customerName}</Text>
                <Text style={styles.transactionSub}>{o.serviceName} — {new Date(o.updatedAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.transactionAmount}>+₱{(o.shopEarnings ?? o.totalAmount ?? 0).toLocaleString()}</Text>
            </View>
          ))}
          {paidOrders.length === 0 && <Text style={styles.noDataText}>No transactions yet</Text>}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerSafe: { backgroundColor: Colors.white, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerTitle: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingHorizontal: 20, paddingTop: 8 },
  headerSub: { fontSize: 14, color: Colors.textSecondary, paddingHorizontal: 20, marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  scroll: { flex: 1 },

  rangeRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  rangeBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.white, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  rangeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rangeBtnText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  rangeBtnTextActive: { color: Colors.white },

  alertsSection: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  alertError: { backgroundColor: Colors.errorLight, borderColor: Colors.error + '30' },
  alertWarning: { backgroundColor: Colors.warningLight, borderColor: Colors.accent + '30' },
  alertInfo: { backgroundColor: Colors.infoLight, borderColor: Colors.info + '30' },
  alertText: { fontSize: 13, color: Colors.text, flex: 1, fontWeight: '500' as const },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },

  bigStatRow: { marginBottom: 12 },
  bigStatCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.borderLight },
  bigStatLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' as const },
  bigStatValue: { fontSize: 32, fontWeight: '800' as const, color: Colors.text, marginTop: 4 },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  growthText: { fontSize: 13, fontWeight: '600' as const },

  miniStatsRow: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center' },
  miniStat: { flex: 1, alignItems: 'center' },
  miniStatLabel: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500' as const },
  miniStatValue: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, marginTop: 4 },
  miniStatDivider: { width: 1, height: 36, backgroundColor: Colors.borderLight },

  chartTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, marginBottom: 10, marginTop: 8 },
  chartWrap: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, paddingTop: 20,
    height: 170, borderWidth: 1, borderColor: Colors.borderLight,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barTopLabel: { fontSize: 9, color: Colors.textTertiary, marginBottom: 4, fontWeight: '600' as const },
  bar: { width: 24, borderRadius: 6, minHeight: 3 },
  barBottomLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 6, fontWeight: '500' as const },

  statRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.borderLight,
  },
  statBoxValue: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  statBoxLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  popularityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  popularityDot: { width: 10, height: 10, borderRadius: 5 },
  popularityName: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, width: 100 },
  popularityBarWrap: { flex: 1, height: 8, backgroundColor: Colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  popularityBar: { height: 8, borderRadius: 4 },
  popularityPct: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, width: 40, textAlign: 'right' as const },
  popularityCount: { fontSize: 12, color: Colors.textTertiary, width: 30 },

  capacityGrid: { flexDirection: 'row', gap: 10 },
  capacityCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  capacityValue: { fontSize: 26, fontWeight: '800' as const, color: Colors.text },
  capacityUnit: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500' as const },
  capacityLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' as const },

  insightsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  insightCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  insightIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  insightValue: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  insightLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' as const },

  topCustomersCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  topCustomersHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  topCustomersTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  topCustomerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  topCustomerRank: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  topCustomerRankText: { fontSize: 13, fontWeight: '700' as const, color: Colors.primary },
  topCustomerInfo: { flex: 1 },
  topCustomerName: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  topCustomerDetail: { fontSize: 12, color: Colors.textSecondary },
  topCustomerSpent: { fontSize: 14, fontWeight: '700' as const, color: Colors.success },

  ratingOverview: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.borderLight, gap: 20 },
  ratingBig: { alignItems: 'center', justifyContent: 'center', width: 90 },
  ratingBigValue: { fontSize: 36, fontWeight: '800' as const, color: Colors.text },
  ratingStars: { flexDirection: 'row', gap: 2, marginTop: 4 },
  ratingCount: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  ratingBars: { flex: 1, gap: 6, justifyContent: 'center' },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingBarLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary, width: 14, textAlign: 'center' as const },
  ratingBarTrack: { flex: 1, height: 8, backgroundColor: Colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  ratingBarFill: { height: 8, borderRadius: 4 },
  ratingBarCount: { fontSize: 12, color: Colors.textTertiary, width: 24, textAlign: 'right' as const },

  riderRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: 14,
    borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.borderLight,
  },
  riderAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.rider,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  riderStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  riderStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  riderStatText: { fontSize: 12, color: Colors.textSecondary },
  riderRate: { fontSize: 18, fontWeight: '800' as const, color: Colors.primary },

  opsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opsCard: {
    flexBasis: '47%', backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.borderLight,
  },
  opsValue: { fontSize: 24, fontWeight: '800' as const, color: Colors.text },
  opsLabel: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' as const },

  financeCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight, marginBottom: 16,
  },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  financeLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' as const },
  financeValue: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  financeDivider: { height: 1, backgroundColor: Colors.borderLight },

  transactionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  transactionTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  transactionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, padding: 14, borderRadius: 10, marginBottom: 6,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  transactionLeft: { flex: 1 },
  transactionName: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  transactionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  transactionAmount: { fontSize: 15, fontWeight: '700' as const, color: Colors.success },

  noDataText: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center' as const, paddingVertical: 20 },
});
