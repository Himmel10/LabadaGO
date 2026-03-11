import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { Colors } from '@/constants/colors';

type NotificationType = 'order' | 'message' | 'alert' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: React.ReactNode;
}

export default function ShopOwnerNotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders } = useOrders();

  const notifications: Notification[] = useMemo(() => {
    const list: Notification[] = [];

    // Sample notifications - in production, these would come from your database/socket
    const newOrders = orders.filter((o) => o.status === 'booking_created');
    newOrders.forEach((order) => {
      list.push({
        id: `order-${order.id}`,
        type: 'order',
        title: 'New Order',
        message: `${order.customerName} placed a new order for ${order.serviceName}`,
        timestamp: order.createdAt,
        read: false,
        icon: <AlertCircle size={20} color={Colors.accent} />,
      });
    });

    const completedOrders = orders.filter((o) => o.status === 'completed');
    completedOrders.forEach((order) => {
      list.push({
        id: `completed-${order.id}`,
        type: 'order',
        title: 'Order Completed',
        message: `Order #${order.id} from ${order.customerName} has been completed`,
        timestamp: order.updatedAt,
        read: true,
        icon: <CheckCircle size={20} color={Colors.success} />,
      });
    });

    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [orders]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return Colors.accentLight;
      case 'message':
        return Colors.infoLight;
      case 'alert':
        return Colors.errorLight;
      case 'system':
        return Colors.primaryFaded;
      default:
        return Colors.white;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadBadge}>{unreadCount} new</Text>
            )}
          </View>
        </View>
      </SafeAreaView>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptySubtitle}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.notificationItem,
                !item.read && styles.notificationUnread,
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getNotificationColor(item.type) },
                ]}
              >
                {item.icon}
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleDateString()} at{' '}
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              {!item.read && <View style={styles.readDot} />}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrap: { backgroundColor: Colors.white, paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  backBtn: { padding: 4 },
  pageTitle: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  unreadBadge: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    gap: 12,
  },
  notificationUnread: {
    backgroundColor: Colors.primaryFaded,
    borderColor: Colors.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  readDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
