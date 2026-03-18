import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Modal, PanResponder, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Search, MapPin, Star, Clock, ChevronRight, MessageCircle, Bell, ShoppingBag, Package, CheckCircle2, Heart, ArrowRight, Gift, AlertCircle, X, Tag, Truck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useShops } from '@/contexts/ShopContext';
import { useMessages } from '@/contexts/MessageContext';
import { Colors } from '@/constants/colors';

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const { getOrdersByCustomer } = useOrders();
  const { shops } = useShops();
  const { getTotalUnread } = useMessages();
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [modalState, setModalState] = useState<'payment' | 'completed' | 'discount' | 'pickup' | null>(null);
  const [isModalExpanded, setIsModalExpanded] = useState(false);
  const [nearbyScrollPos, setNearbyScrollPos] = useState(0);
  const [popularScrollPos, setPopularScrollPos] = useState(0);
  
  // Drag gesture
  const modalYPos = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          modalYPos.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          // Collapse modal
          setIsModalExpanded(false);
          Animated.spring(modalYPos, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy < -50) {
          // Expand modal
          setIsModalExpanded(true);
          Animated.spring(modalYPos, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else {
          // Snap back
          Animated.spring(modalYPos, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const unreadCount = getTotalUnread(user?.id ?? '');

  const filteredShops = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const activeOrders = user ? getOrdersByCustomer(user.id).filter((o) => !['delivered', 'paid', 'completed', 'rated', 'cancelled', 'declined'].includes(o.status)) : [];
  const completedOrders = user ? getOrdersByCustomer(user.id).filter((o) => o.status === 'completed' || o.status === 'rated') : [];
  const pendingPayments = user ? getOrdersByCustomer(user.id).filter((o) => o.paymentStatus === 'pending' || o.paymentStatus === 'awaiting') : [];
  
  const mainActiveOrder = activeOrders.length > 0 ? activeOrders[0] : null;
  
  // Separate nearby shops (high rated) and popular shops (sorted by rating, only high rated)
  const highRatedShops = filteredShops.filter((s) => (s.rating || 0) >= 3.5);
  const nearbyShops = highRatedShops.slice(0, 3);
  const popularShops = [...highRatedShops].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!, {firstName}!</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.primary} />
              <Text style={styles.locationText}>{user?.address ?? 'Set your location'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.msgBtn}
              onPress={() => router.push('/customer/messages')}
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
              onPress={() => router.push('/customer/notifications')}
              activeOpacity={0.7}
            >
              <Bell size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search laundry shops..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Active Order Card */}
        {mainActiveOrder ? (
          <TouchableOpacity 
            style={styles.activeOrderCard}
            onPress={() => router.push(`/order-detail?id=${mainActiveOrder.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={styles.activeOrderHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Package size={24} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeOrderTitle}>Your Laundry is Being Processed</Text>
                  <Text style={styles.activeOrderStatus}>{mainActiveOrder.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>
            </View>
            <View style={styles.activeOrderDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Shop:</Text>
                <Text style={styles.detailValue}>{mainActiveOrder.shopName}</Text>
              </View>
              {mainActiveOrder.riderName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rider:</Text>
                  <Text style={styles.detailValue}>{mainActiveOrder.riderName}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Service:</Text>
                <Text style={styles.detailValue}>{mainActiveOrder.serviceName}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.trackBtn}
              onPress={() => router.push(`/order-detail?id=${mainActiveOrder.id}` as any)}
            >
              <Text style={styles.trackBtnText}>Track Order</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <View style={styles.noActiveOrderCard}>
            <Package size={40} color={Colors.textTertiary} />
            <Text style={styles.noActiveOrderText}>No active orders yet</Text>
            <Text style={styles.noActiveOrderSubtext}>Book your laundry now!</Text>
          </View>
        )}

        {/* Weight Proof Alert Section */}
        {mainActiveOrder && mainActiveOrder.weightPhoto && (
          <View style={styles.weightProofCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={20} color={Colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.proofTitle}>Weight Proof Uploaded</Text>
                {mainActiveOrder.weight && (
                  <Text style={styles.proofDetails}>Weight: {mainActiveOrder.weight} kg</Text>
                )}
              </View>
            </View>
            {mainActiveOrder.totalAmount && (
              <Text style={styles.proofAmount}>Total: ₱{mainActiveOrder.totalAmount}</Text>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={styles.proofBtn}>
                <ShoppingBag size={16} color={Colors.primary} />
                <Text style={styles.proofBtnText}>View Proof</Text>
              </TouchableOpacity>
              {!mainActiveOrder.customerConfirmedPrice && (
                <TouchableOpacity style={[styles.proofBtn, { backgroundColor: Colors.primary }]}>
                  <CheckCircle2 size={16} color={Colors.white} />
                  <Text style={[styles.proofBtnText, { color: Colors.white }]}>Confirm & Pay</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Book Laundry Button - Enhanced */}
        {/* Removed - now showing nearby and popular shops */}

        {/* Quick Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <TouchableOpacity 
              style={styles.summaryCard}
              onPress={() => router.push('/customer/orders' as any)}
              activeOpacity={0.7}
            >
              <Package size={20} color={Colors.primary} />
              <Text style={styles.summaryValue}>{activeOrders.length}</Text>
              <Text style={styles.summaryLabel}>Active Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.summaryCard}
              onPress={() => setModalState('payment')}
              activeOpacity={0.7}
            >
              <AlertCircle size={20} color={Colors.error} />
              <Text style={styles.summaryValue}>{pendingPayments.length}</Text>
              <Text style={styles.summaryLabel}>Pending Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.summaryCard}
              onPress={() => setModalState('completed')}
              activeOpacity={0.7}
            >
              <CheckCircle2 size={20} color={Colors.success} />
              <Text style={styles.summaryValue}>{completedOrders.length}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promotions Section (Optional) */}
        <View style={styles.promotionsSection}>
          <TouchableOpacity 
            style={styles.promoCard}
            onPress={() => setModalState('discount')}
            activeOpacity={0.7}
          >
            <Gift size={28} color={Colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>10% Off This Week</Text>
              <Text style={styles.promoSubtitle}>New customers only</Text>
            </View>
            <ChevronRight size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.promoCard}
            onPress={() => setModalState('pickup')}
            activeOpacity={0.7}
          >
            <Truck size={28} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>Free Pickup</Text>
              <Text style={styles.promoSubtitle}>For orders above ₱500</Text>
            </View>
            <ChevronRight size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Nearby Shops Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Shops</Text>
        </View>

        {filteredShops.length === 0 && (
          <View style={styles.emptyShops}>
            <Text style={styles.emptyText}>No laundry shops available yet.</Text>
            <Text style={styles.emptySubtext}>Check back soon!</Text>
          </View>
        )}

        {highRatedShops.length > 0 && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              scrollEventThrottle={16}
              onScroll={(e) => setNearbyScrollPos(e.nativeEvent.contentOffset.x)}
            >
              {nearbyShops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.carouselCard}
                  onPress={() => router.push(`/shop-detail?id=${shop.id}` as any)}
                  activeOpacity={0.8}
                  testID={`shop-${shop.id}`}
                >
                  <Image source={{ uri: shop.image }} style={styles.carouselImage} contentFit="cover" />
                  <View style={styles.carouselInfo}>
                    <Text style={styles.carouselShopName} numberOfLines={1}>{shop.name}</Text>
                    <View style={styles.carouselMeta}>
                      <Star size={12} color={Colors.accent} fill={Colors.accent} />
                      <Text style={styles.carouselRating}>{shop.rating > 0 ? shop.rating : 'New'}</Text>
                    </View>
                    <View style={[styles.carouselStatusBadge, { backgroundColor: shop.isOpen ? Colors.successLight : Colors.errorLight }]}>
                      <Text style={[styles.carouselStatusText, { color: shop.isOpen ? Colors.success : Colors.error }]}>
                        {shop.isOpen ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {highRatedShops.length > 3 && (
              <View style={styles.scrollIndicator}>
                <View style={[styles.dot, nearbyScrollPos > 50 && styles.dotActive]} />
                <View style={[styles.dot, nearbyScrollPos > 150 && styles.dotActive]} />
                <View style={[styles.dot, nearbyScrollPos > 250 && styles.dotActive]} />
              </View>
            )}
          </>
        )}

        {highRatedShops.length > 3 && (
          <TouchableOpacity 
            style={styles.viewAllBtn}
            onPress={() => router.push('/customer/orders' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All Shops</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}

        {/* Popular Shops Section */}
        {highRatedShops.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Shops</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              scrollEventThrottle={16}
              onScroll={(e) => setPopularScrollPos(e.nativeEvent.contentOffset.x)}
            >
              {popularShops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.carouselCard}
                  onPress={() => router.push(`/shop-detail?id=${shop.id}` as any)}
                  activeOpacity={0.8}
                  testID={`popular-shop-${shop.id}`}
                >
                  <Image source={{ uri: shop.image }} style={styles.carouselImage} contentFit="cover" />
                  <View style={styles.carouselInfo}>
                    <Text style={styles.carouselShopName} numberOfLines={1}>{shop.name}</Text>
                    <View style={styles.carouselMeta}>
                      <Star size={12} color={Colors.accent} fill={Colors.accent} />
                      <Text style={styles.carouselRating}>{shop.rating > 0 ? shop.rating : 'New'}</Text>
                    </View>
                    <View style={[styles.carouselStatusBadge, { backgroundColor: shop.isOpen ? Colors.successLight : Colors.errorLight }]}>
                      <Text style={[styles.carouselStatusText, { color: shop.isOpen ? Colors.success : Colors.error }]}>
                        {shop.isOpen ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {highRatedShops.length > 3 && (
              <View style={styles.scrollIndicator}>
                <View style={[styles.dot, popularScrollPos > 50 && styles.dotActive]} />
                <View style={[styles.dot, popularScrollPos > 150 && styles.dotActive]} />
                <View style={[styles.dot, popularScrollPos > 250 && styles.dotActive]} />
              </View>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Pending Payment Modal */}
      <Modal
        visible={modalState === 'payment'}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalState(null);
          setIsModalExpanded(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent, 
              isModalExpanded && styles.modalContentExpanded,
              { transform: [{ translateY: modalYPos }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View 
              style={styles.modalDragHandle}
            >
              <View style={styles.dragHandleLine} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pending Payments</Text>
              <TouchableOpacity onPress={() => {
              setModalState(null);
              setIsModalExpanded(false);
            }} activeOpacity={0.7} style={styles.modalCloseBtn}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {pendingPayments.length === 0 ? (
                <View style={styles.emptyModal}>
                  <CheckCircle2 size={40} color={Colors.success} />
                  <Text style={styles.emptyModalText}>No pending payments</Text>
                  <Text style={styles.emptyModalSubtext}>All payments up to date!</Text>
                </View>
              ) : (
                pendingPayments.map((order) => (
                  <TouchableOpacity 
                    key={order.id}
                    style={styles.modalOrderCard}
                    onPress={() => router.push(`/order-detail?id=${order.id}` as any)}
                  >
                    <View style={styles.modalOrderHeader}>
                      <View>
                        <Text style={styles.modalOrderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.modalOrderShop}>{order.shopName}</Text>
                      </View>
                      <Text style={styles.modalOrderAmount}>₱{order.totalAmount?.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.modalOrderService}>{order.serviceName}</Text>
                    <View style={styles.modalOrderFooter}>
                      <Text style={styles.modalOrderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                      <TouchableOpacity style={styles.payNowBtn}>
                        <Text style={styles.payNowText}>Pay Now</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Completed Orders Modal */}
      <Modal
        visible={modalState === 'completed'}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalState(null);
          setIsModalExpanded(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              isModalExpanded && styles.modalContentExpanded,
              { transform: [{ translateY: modalYPos }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalDragHandle}>
              <View style={styles.dragHandleLine} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Completed Orders</Text>
              <TouchableOpacity onPress={() => {
                setModalState(null);
                setIsModalExpanded(false);
              }} activeOpacity={0.7} style={styles.modalCloseBtn}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {completedOrders.length === 0 ? (
                <View style={styles.emptyModal}>
                  <Package size={40} color={Colors.textTertiary} />
                  <Text style={styles.emptyModalText}>No completed orders</Text>
                  <Text style={styles.emptyModalSubtext}>Book laundry to get started!</Text>
                </View>
              ) : (
                completedOrders.map((order) => (
                  <TouchableOpacity 
                    key={order.id}
                    style={styles.modalOrderCard}
                    onPress={() => router.push(`/order-detail?id=${order.id}` as any)}
                  >
                    <View style={styles.modalOrderHeader}>
                      <View>
                        <Text style={styles.modalOrderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.modalOrderShop}>{order.shopName}</Text>
                      </View>
                      <Text style={[styles.modalOrderAmount, { color: Colors.success }]}>₱{order.totalAmount?.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.modalOrderService}>{order.serviceName}</Text>
                    <View style={styles.modalOrderFooter}>
                      <Text style={styles.modalOrderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                      <View style={[styles.payNowBtn, { backgroundColor: Colors.successLight }]}>
                        <Text style={[styles.payNowText, { color: Colors.success }]}>Completed</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* 10% Discount Promo Modal */}
      <Modal
        visible={modalState === 'discount'}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalState(null);
          setIsModalExpanded(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              isModalExpanded && styles.modalContentExpanded,
              { transform: [{ translateY: modalYPos }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalDragHandle}>
              <View style={styles.dragHandleLine} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>10% Off This Week</Text>
              <TouchableOpacity onPress={() => {
                setModalState(null);
                setIsModalExpanded(false);
              }} activeOpacity={0.7} style={styles.modalCloseBtn}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.promoModalContent}>
                <View style={[styles.promoIcon, { backgroundColor: Colors.accentLight }]}>
                  <Gift size={48} color={Colors.accent} />
                </View>
                <Text style={styles.promoModalTitle}>10% Discount</Text>
                <Text style={styles.promoModalPrice}>Save up to ₱100</Text>
                
                <View style={styles.promoDetailsCard}>
                  <Text style={styles.promoDetailsTitle}>Offer Details</Text>
                  <Text style={styles.promoDetailItem}>✓ Valid for new customers only</Text>
                  <Text style={styles.promoDetailItem}>✓ Applies to all services</Text>
                  <Text style={styles.promoDetailItem}>✓ Minimum order: ₱500</Text>
                  <Text style={styles.promoDetailItem}>✓ Valid until end of week</Text>
                </View>

                <View style={styles.promoTermsCard}>
                  <Text style={styles.promoTermsTitle}>Terms & Conditions</Text>
                  <Text style={styles.promoTermsText}>
                    This offer is valid for new customers only. Discount is applied automatically at checkout. Cannot be combined with other offers. Valid for one-time use per account.
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.promoActionBtn}
                  onPress={() => {
                    setModalState(null);
                    setIsModalExpanded(false);
                    router.push('/customer/book' as any);
                  }}
                >
                  <Text style={styles.promoActionBtnText}>Book Now & Get Discount</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Free Pickup Promo Modal */}
      <Modal
        visible={modalState === 'pickup'}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalState(null);
          setIsModalExpanded(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              isModalExpanded && styles.modalContentExpanded,
              { transform: [{ translateY: modalYPos }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalDragHandle}>
              <View style={styles.dragHandleLine} />
            </View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Free Pickup</Text>
              <TouchableOpacity onPress={() => {
                setModalState(null);
                setIsModalExpanded(false);
              }} activeOpacity={0.7} style={styles.modalCloseBtn}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.promoModalContent}>
                <View style={[styles.promoIcon, { backgroundColor: Colors.successLight }]}>
                  <Truck size={48} color={Colors.success} />
                </View>
                <Text style={styles.promoModalTitle}>Free Pickup Service</Text>
                <Text style={styles.promoModalPrice}>No delivery charges</Text>
                
                <View style={styles.promoDetailsCard}>
                  <Text style={styles.promoDetailsTitle}>Offer Details</Text>
                  <Text style={styles.promoDetailItem}>✓ Minimum order: ₱500</Text>
                  <Text style={styles.promoDetailItem}>✓ Free pickup & delivery</Text>
                  <Text style={styles.promoDetailItem}>✓ Valid for all customers</Text>
                  <Text style={styles.promoDetailItem}>✓ Save up to ₱100 on delivery</Text>
                </View>

                <View style={styles.promoTermsCard}>
                  <Text style={styles.promoTermsTitle}>Terms & Conditions</Text>
                  <Text style={styles.promoTermsText}>
                    Free pickup service is available for orders above ₱500. Pickup is within Metro Manila only. Schedule your pickup during checkout. Valid for all customers.
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[styles.promoActionBtn, { backgroundColor: Colors.success }]}
                  onPress={() => {
                    setModalState(null);
                    setIsModalExpanded(false);
                    router.push('/customer/book' as any);
                  }}
                >
                  <Text style={styles.promoActionBtnText}>Book with Free Pickup</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeTop: { backgroundColor: Colors.white, paddingBottom: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8,
  },
  greeting: { fontSize: 22, fontWeight: '800' as const, color: Colors.text, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: Colors.textSecondary },
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
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background,
    marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, height: 48, gap: 10, marginTop: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  scroll: { flex: 1 },

  // Active Order Card
  activeOrderCard: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 2, borderColor: Colors.primary, padding: 16, gap: 12,
  },
  activeOrderHeader: { flexDirection: 'row', alignItems: 'center' },
  activeOrderTitle: { fontSize: 16, fontWeight: '800' as const, color: Colors.primary, marginBottom: 2 },
  activeOrderStatus: { fontSize: 12, color: Colors.textSecondary, textTransform: 'capitalize' as const },
  activeOrderDetails: { gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' as const },
  detailValue: { fontSize: 12, color: Colors.text, fontWeight: '700' as const },
  trackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primaryFaded, paddingVertical: 10, borderRadius: 10 },
  trackBtnText: { fontSize: 13, fontWeight: '700' as const, color: Colors.primary },

  // No Active Order
  noActiveOrderCard: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: Colors.white, borderRadius: 16,
    padding: 20, alignItems: 'center', gap: 8,
  },
  noActiveOrderText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  noActiveOrderSubtext: { fontSize: 13, color: Colors.textSecondary },

  // Weight Proof Card
  weightProofCard: {
    marginHorizontal: 20, 
    marginTop: 12, 
    backgroundColor: Colors.white, 
    borderRadius: 14,
    padding: 14, 
    gap: 6,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  proofTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  proofDetails: { fontSize: 12, color: Colors.textSecondary },
  proofAmount: { fontSize: 15, fontWeight: '800' as const, color: Colors.accent, marginTop: 4 },
  proofBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.accentLight, paddingVertical: 8, borderRadius: 8 },
  proofBtnText: { fontSize: 12, fontWeight: '700' as const, color: Colors.primary },

  // Book Banner
  bookBanner: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: Colors.primary, borderRadius: 20,
    padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bookContent: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  bookTextWrap: { flex: 1 },
  bookTitle: { fontSize: 18, fontWeight: '800' as const, color: Colors.white },
  bookSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  // View All Button
  viewAllBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, 
    marginHorizontal: 20, marginTop: 12, marginBottom: 20, 
    backgroundColor: Colors.primaryFaded, borderRadius: 12, padding: 12 
  },
  viewAllText: { fontSize: 14, fontWeight: '700' as const, color: Colors.primary },

  // Summary Cards
  summarySection: { paddingHorizontal: 20, marginTop: 18 },
  summaryGrid: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.borderLight },
  summaryValue: { fontSize: 18, fontWeight: '800' as const, color: Colors.primary },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' as const },

  // Promotions
  promotionsSection: { paddingHorizontal: 20, marginTop: 18, gap: 8 },
  promoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.borderLight, gap: 10 },
  promoTitle: { fontSize: 13, fontWeight: '700' as const, color: Colors.text },
  promoSubtitle: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 24, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  shopCount: { fontSize: 13, color: Colors.textTertiary },
  emptyShops: { alignItems: 'center', paddingTop: 40, paddingBottom: 20, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary },
  emptySubtext: { fontSize: 14, color: Colors.textTertiary, marginTop: 4 },
  shopList: { paddingHorizontal: 20, gap: 12 },
  shopCard: {
    backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  shopImage: { width: '100%', height: 140 },
  shopInfo: { padding: 14, gap: 6 },
  shopNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopName: { fontSize: 16, fontWeight: '700' as const, color: Colors.text, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' as const },
  shopMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shopAddress: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  shopBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '700' as const, color: Colors.text },
  reviewCount: { fontSize: 12, color: Colors.textTertiary },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  distanceText: { fontSize: 13, color: Colors.textSecondary },
  favoriteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },

  // Order History Link
  orderHistoryLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 20, backgroundColor: Colors.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.borderLight },
  orderHistoryText: { flex: 1, fontSize: 14, fontWeight: '700' as const, color: Colors.text },

  // Carousel Styles
  carouselContainer: { paddingHorizontal: 20, marginBottom: 8 },
  carouselCard: {
    width: 165, backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.borderLight, marginRight: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 4, 
    elevation: 3,
  },
  carouselImage: { width: '100%', height: 130 },
  carouselInfo: { padding: 12, gap: 6 },
  carouselShopName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  carouselMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  carouselRating: { fontSize: 13, fontWeight: '700' as const, color: Colors.text },
  carouselStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  carouselStatusText: { fontSize: 10, fontWeight: '600' as const },
  
  // Scroll Indicators
  scrollIndicator: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 6, 
    paddingVertical: 14,
    marginBottom: 8,
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: Colors.borderLight,
    opacity: 0.6,
  },
  dotActive: { 
    backgroundColor: Colors.primary,
    opacity: 1,
    width: 10,
  },

  // Modal Styles
  modalOverlay: { 
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '50%',
    flexDirection: 'column' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContentExpanded: {
    minHeight: '95%',
  },
  modalDragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dragHandleLine: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalCloseBtn: {
    padding: 10,
    marginRight: -10,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  emptyModal: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyModalText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptyModalSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalOrderCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalOrderId: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  modalOrderShop: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 2,
  },
  modalOrderAmount: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  modalOrderService: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  modalOrderDate: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  payNowBtn: {
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payNowText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  promoModalContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  promoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  promoModalTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  promoModalPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginBottom: 20,
  },
  promoDetailsCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  promoDetailsTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  promoDetailItem: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  promoTermsCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  promoTermsTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  promoTermsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  promoActionBtn: {
    width: '90%',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoActionBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
