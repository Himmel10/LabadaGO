import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Package, Tag, Info, Truck, Store, CreditCard, CheckCircle2, MapPin, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { Notification } from '@/types';

function getNotifIcon(type: Notification['type']) {
  switch (type) {
    case 'new_delivery': return { icon: Truck, color: Colors.primary, bg: Colors.primaryFaded };
    case 'pickup_assigned': return { icon: Package, color: Colors.primary, bg: Colors.primaryFaded };
    case 'delivery_assigned': return { icon: MapPin, color: Colors.primary, bg: Colors.primaryFaded };
    case 'payment_confirmed': return { icon: CreditCard, color: Colors.success, bg: Colors.successLight };
    case 'delivery_completed': return { icon: CheckCircle2, color: Colors.success, bg: Colors.successLight };
    case 'delivery_issue': return { icon: AlertCircle, color: Colors.error, bg: Colors.errorLight };
    case 'order_cancelled': return { icon: Info, color: Colors.error, bg: Colors.errorLight };
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

export default function RiderNotificationsScreen() {
  const { user } = useAuth();
  const { getNotificationsByUser, markNotificationRead } = useOrders();
  const router = useRouter();

  const notifications = useMemo(() => {
    if (!user) return [];
    return getNotificationsByUser(user.id).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [user, getNotificationsByUser]);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleNotificationPress = (notification: Notification) => {
    markNotificationRead(notification.id);
    // Handle navigation based on notification type
    if (notification.orderId) {
      router.push(`/task-detail?id=${notification.orderId}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ flex: 1 }} />
          {unreadNotifications.length > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>You'll get notified about new deliveries and updates here</Text>
          </View>
        ) : (
          <>
            {unreadNotifications.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>New</Text>
                {unreadNotifications.map((notif) => {
                  const { icon: IconComponent, color, bg } = getNotifIcon(notif.type);
                  return (
                    <TouchableOpacity
                      key={notif.id}
                      style={[styles.notificationCard, styles.unreadCard]}
                      onPress={() => handleNotificationPress(notif)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.notifIcon, { backgroundColor: bg }]}>
                        <IconComponent size={20} color={color} />
                      </View>
                      <View style={styles.notifContent}>
                        <Text style={styles.notifTitle}>{notif.title}</Text>
                        <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
                        <Text style={styles.notifTime}>{timeAgo(notif.createdAt)}</Text>
                      </View>
                      {!notif.read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {notifications.filter((n) => n.read).length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Earlier</Text>
                {notifications.filter((n) => n.read).map((notif) => {
                  const { icon: IconComponent, color, bg } = getNotifIcon(notif.type);
                  return (
                    <TouchableOpacity
                      key={notif.id}
                      style={styles.notificationCard}
                      onPress={() => handleNotificationPress(notif)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.notifIcon, { backgroundColor: bg }]}>
                        <IconComponent size={20} color={color} />
                      </View>
                      <View style={styles.notifContent}>
                        <Text style={styles.notifTitle}>{notif.title}</Text>
                        <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
                        <Text style={styles.notifTime}>{timeAgo(notif.createdAt)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  backBtn: { padding: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.text, paddingTop: 8, flex: 1 },
  unreadBadge: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  unreadBadgeText: { fontSize: 12, fontWeight: '700' as const, color: Colors.white },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginTop: 20, marginBottom: 12 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
    marginBottom: 10,
  },
  unreadCard: { backgroundColor: Colors.primaryFaded, borderColor: Colors.primary },
  notifIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text, marginBottom: 4 },
  notifMessage: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  notifTime: { fontSize: 11, color: Colors.textTertiary },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginLeft: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' as const, maxWidth: '80%' },
});
