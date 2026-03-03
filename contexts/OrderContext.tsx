import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Order, OrderStatus, Notification, Complaint, DeliveryTask } from '@/types';
import { PLATFORM_COMMISSION_RATE, RIDER_COMMISSION_RATE } from '@/mocks/data';

const ORDERS_KEY = 'labadago_orders';
const NOTIFICATIONS_KEY = 'labadago_notifications';
const COMPLAINTS_KEY = 'labadago_complaints';

export const [OrderProvider, useOrders] = createContextHook(() => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;
  const complaintsRef = useRef(complaints);
  complaintsRef.current = complaints;

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [storedOrders, storedNotifs, storedComplaints] = await Promise.all([
        AsyncStorage.getItem(ORDERS_KEY),
        AsyncStorage.getItem(NOTIFICATIONS_KEY),
        AsyncStorage.getItem(COMPLAINTS_KEY),
      ]);
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      if (storedComplaints) setComplaints(JSON.parse(storedComplaints));
      console.log('Loaded orders:', storedOrders ? JSON.parse(storedOrders).length : 0);
    } catch (e) {
      console.log('Failed to load order data:', e);
    }
  };

  const saveOrders = useCallback(async (updated: Order[]) => {
    setOrders(updated);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  }, []);

  const saveNotifications = useCallback(async (updated: Notification[]) => {
    setNotifications(updated);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  }, []);

  const saveComplaints = useCallback(async (updated: Complaint[]) => {
    setComplaints(updated);
    await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
  }, []);

  const addNotification = useCallback(async (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...notificationsRef.current];
    await saveNotifications(updated);
    console.log('Added notification:', newNotif.title, 'for user:', newNotif.userId);
    return newNotif;
  }, [saveNotifications]);

  const markNotificationRead = useCallback(async (notifId: string) => {
    const updated = notificationsRef.current.map((n) =>
      n.id === notifId ? { ...n, isRead: true } : n
    );
    await saveNotifications(updated);
  }, [saveNotifications]);

  const createOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...ordersRef.current];
    await saveOrders(updated);
    console.log('Created order:', newOrder.id, 'for customer:', order.customerName);

    await addNotification({
      userId: order.customerId,
      title: 'Booking Created',
      message: `Your laundry booking at ${order.shopName} has been created. Waiting for shop confirmation.`,
      type: 'booking_created',
      orderId: newOrder.id,
    });

    return newOrder;
  }, [saveOrders, addNotification]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const currentOrders = ordersRef.current;
    const updated = currentOrders.map((o) =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    await saveOrders(updated);
    console.log('Updated order status:', orderId, '->', status);

    const order = currentOrders.find((o) => o.id === orderId);
    if (order) {
      const notifMap: Partial<Record<OrderStatus, { title: string; message: string; type: Notification['type']; userId: string }>> = {
        scheduled: {
          title: 'Booking Confirmed',
          message: `${order.shopName} has accepted your booking! A rider will be assigned soon.`,
          type: 'booking_confirmed',
          userId: order.customerId,
        },
        declined: {
          title: 'Booking Declined',
          message: `${order.shopName} has declined your booking. Please try another shop.`,
          type: 'booking_declined',
          userId: order.customerId,
        },
        rider_assigned: {
          title: 'Rider Assigned',
          message: `A rider has been assigned to pick up your laundry.`,
          type: 'rider_assigned',
          userId: order.customerId,
        },
        picked_up: {
          title: 'Laundry Picked Up',
          message: `Your laundry has been picked up and is on its way to ${order.shopName}.`,
          type: 'picked_up',
          userId: order.customerId,
        },
        arrived_at_shop: {
          title: 'Laundry at Shop',
          message: `Your laundry has arrived at ${order.shopName}.`,
          type: 'at_shop',
          userId: order.customerId,
        },
        out_for_delivery: {
          title: 'Out for Delivery',
          message: `Your laundry from ${order.shopName} is on its way!`,
          type: 'out_for_delivery',
          userId: order.customerId,
        },
        delivered: {
          title: 'Order Delivered',
          message: `Your order from ${order.shopName} has been delivered!`,
          type: 'order_delivered',
          userId: order.customerId,
        },
        completed: {
          title: 'Order Completed',
          message: `Your order from ${order.shopName} is complete. Rate your experience!`,
          type: 'order_completed',
          userId: order.customerId,
        },
      };

      const notifData = notifMap[status];
      if (notifData) {
        await addNotification({
          userId: notifData.userId,
          title: notifData.title,
          message: notifData.message,
          type: notifData.type,
          orderId: order.id,
        });
      }
    }
  }, [saveOrders, addNotification]);

  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    const currentOrders = ordersRef.current;
    const updated = currentOrders.map((o) =>
      o.id === orderId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    );
    await saveOrders(updated);
    console.log('Updated order:', orderId, Object.keys(updates));

    const order = currentOrders.find((o) => o.id === orderId);

    if (order && updates.weightPhoto && updates.weight && updates.totalAmount) {
      await addNotification({
        userId: order.customerId,
        title: 'Weight Proof Uploaded',
        message: `Your laundry weighs ${updates.weight} kg. Total: ₱${updates.totalAmount}. Please confirm the price.`,
        type: 'weight_proof',
        orderId: order.id,
      });
    }

    if (order && updates.customerConfirmedPrice === true) {
      await addNotification({
        userId: order.customerId,
        title: 'Price Confirmed',
        message: `You confirmed the total of ₱${updates.totalAmount ?? order.totalAmount}. Your laundry is now being processed.`,
        type: 'price_confirmed',
        orderId: order.id,
      });
    }

    if (order && updates.isPaid === true) {
      await addNotification({
        userId: order.customerId,
        title: 'Payment Confirmed',
        message: `Your payment of ₱${updates.totalAmount ?? order.totalAmount ?? 0} has been confirmed.`,
        type: 'payment_confirmed',
        orderId: order.id,
      });
    }
  }, [saveOrders, addNotification]);

  const completeOrderWithEarnings = useCallback(async (orderId: string) => {
    const currentOrders = ordersRef.current;
    const order = currentOrders.find((o) => o.id === orderId);
    if (!order || !order.totalAmount) return;

    const platformCommission = Math.round(order.totalAmount * PLATFORM_COMMISSION_RATE);
    const riderEarnings = Math.round((order.deliveryFee ?? 0) * (1 - RIDER_COMMISSION_RATE));
    const shopEarnings = order.totalAmount - platformCommission - (order.deliveryFee ?? 0) + Math.round((order.deliveryFee ?? 0) * RIDER_COMMISSION_RATE);

    const updated = currentOrders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'completed' as OrderStatus,
            platformCommission,
            riderEarnings,
            shopEarnings,
            receiptGenerated: true,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    await saveOrders(updated);
    console.log('Completed order with earnings:', orderId, { platformCommission, riderEarnings, shopEarnings });
  }, [saveOrders]);

  const addComplaint = useCallback(async (complaint: Omit<Complaint, 'id' | 'createdAt'>) => {
    const newComplaint: Complaint = {
      ...complaint,
      id: `cmp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newComplaint, ...complaintsRef.current];
    await saveComplaints(updated);
    console.log('Added complaint:', newComplaint.subject);
    return newComplaint;
  }, [saveComplaints]);

  const updateComplaintStatus = useCallback(async (complaintId: string, status: Complaint['status']) => {
    const updated = complaintsRef.current.map((c) =>
      c.id === complaintId ? { ...c, status } : c
    );
    await saveComplaints(updated);
  }, [saveComplaints]);

  const getOrdersByCustomer = useCallback((customerId: string) => {
    return orders.filter((o) => o.customerId === customerId);
  }, [orders]);

  const getOrdersByShop = useCallback((shopId: string) => {
    return orders.filter((o) => o.shopId === shopId);
  }, [orders]);

  const getOrdersByRider = useCallback((riderId: string) => {
    return orders.filter((o) => o.riderId === riderId);
  }, [orders]);

  const getNotificationsByUser = useCallback((userId: string) => {
    return notifications.filter((n) => n.userId === userId);
  }, [notifications]);

  const getUnreadCount = useCallback((userId: string) => {
    return notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }, [notifications]);

  const getTasksForRider = useCallback((riderId: string): DeliveryTask[] => {
    const results: DeliveryTask[] = [];
    for (const o of orders) {
      if (o.riderId !== riderId) continue;
      if (['completed', 'cancelled', 'declined', 'rated'].includes(o.status)) continue;

      const isPickup = ['rider_assigned', 'picked_up', 'in_transit_to_shop'].includes(o.status);
      const isDelivery = ['ready_for_delivery', 'out_for_delivery'].includes(o.status);
      if (!isPickup && !isDelivery) continue;

      results.push({
        id: `task_${o.id}`,
        orderId: o.id,
        riderId,
        type: isPickup ? 'pickup' : 'delivery',
        pickupAddress: isPickup ? o.pickupAddress : o.shopName,
        dropoffAddress: isPickup ? o.shopName : o.deliveryAddress,
        customerName: o.customerName,
        shopName: o.shopName,
        status: 'assigned',
        estimatedTime: '~20 min',
        weight: o.weight,
        totalAmount: o.totalAmount,
        createdAt: o.updatedAt,
      });
    }
    return results;
  }, [orders]);

  return {
    orders,
    notifications,
    complaints,
    createOrder,
    updateOrderStatus,
    updateOrder,
    completeOrderWithEarnings,
    getOrdersByCustomer,
    getOrdersByShop,
    getOrdersByRider,
    getNotificationsByUser,
    getUnreadCount,
    markNotificationRead,
    addNotification,
    addComplaint,
    updateComplaintStatus,
    getTasksForRider,
  };
});
