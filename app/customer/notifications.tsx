import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Package, Tag, Info, Star, Truck, Store, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { Notification } from '@/types';

function getNotifIcon(type: Notification['type']) {
  switch (type) {
    case 'booking_created': return { icon: Package, color: Colors.primary, bg: Colors.primaryFaded };
    case 'booking_confirmed': return { icon: CheckCircle2, color: Colors.success, bg: Colors.successLight };
    case 'booking_declined': return { icon: Info, color: Colors.error, bg: Colors.errorLight };
    case 'rider_assigned': return { icon: Truck, color: Colors.rider, bg: Colors.riderLight };
    case 'picked_up': return { icon: Package, color: Colors.primary, bg: Colors.primaryFaded };
    case 'at_shop': return { icon: Store, color: Colors.shop, bg: Colors.shopLight };
    case 'weight_proof': return { icon: Package, color: Colors.warning, bg: Colors.warningLight };
    case 'price_confirmed': return { icon: CheckCircle2, color: Colors.success, bg: Colors.successLight };
    case 'payment_confirmed': return { icon: CreditCard, color: Colors.primary, bg: Colors.primaryFaded };
    case 'out_for_delivery': return { icon: Truck, color: Colors.info, bg: Colors.infoLight };
    case 'order_delivered': return { icon: CheckCircle2, color: Colors.success, bg: Colors.successLight };
    case 'order_completed': return { icon: Star, color: Colors.accent, bg: Colors.accentLight };
    case 'promotion': return { icon: Tag, color: Colors.accent, bg: Colors.accentLight };
    default: return { icon: Info, color: Colors.info, bg: Colors.infoLight };
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { getNotificationsByUser, markNotificationRead } = useOrders();
  const router = useRouter();

  const notifications = useMemo(() => {
    if (!user) return [];
    return getNotificationsByUser(user.id).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [user, getNotificationsByUser]);

  const handlePress = (notif: Notification) => {
    if (!notif.isRead) {
      markNotificationRead(notif.id);
    }
    if (notif.orderId) {
      router.push(`/order-detail?id=${notif.orderId}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>
      </SafeAreaView>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => {
          const { icon: Icon, color, bg } = getNotifIcon(notif.type);
          return (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifCard, !notif.isRead && styles.notifUnread]}
              activeOpacity={0.8}
              onPress={() => handlePress(notif)}
            >
              <View style={[styles.notifIconWrap, { backgroundColor: bg }]}>
                <Icon size={20} color={color} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTop}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{timeAgo(notif.createdAt)}</Text>
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
              </View>
              {!notif.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        })}
        {notifications.length === 0 && (
          <View style={styles.empty}>
            <Bell size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  backBtn: { padding: 6, backgroundColor: Colors.background, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.white,
    borderRadius: 14, padding: 14, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  notifUnread: { borderColor: Colors.primary + '30', backgroundColor: Colors.primaryFaded + '40' },
  notifIconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, flex: 1 },
  notifTime: { fontSize: 11, color: Colors.textTertiary, marginLeft: 8 },
  notifMessage: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
