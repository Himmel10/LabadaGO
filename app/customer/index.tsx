import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Search, MapPin, Star, Clock, ChevronRight, MessageCircle, Bell, ShoppingBag, Package, CheckCircle2, Zap, Heart, ArrowRight, Gift, AlertCircle, Wind, Square, Droplets, Flame, Cloud } from 'lucide-react-native';
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
  
  // Separate nearby shops and popular shops
  const nearbyShops = filteredShops.slice(0, 3);
  const popularShops = [...filteredShops].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
  
  // Service shortcuts
  const services = [
    { id: 1, name: 'Wash & Fold', icon: 'droplets' },
    { id: 2, name: 'Dry Only', icon: 'flame' },
    { id: 3, name: 'Comforter', icon: 'cloud' },
    { id: 4, name: 'Express', icon: 'zap' },
  ];

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'droplets': return <Droplets size={24} color={Colors.primary} />;
      case 'flame': return <Flame size={24} color={Colors.primary} />;
      case 'cloud': return <Cloud size={24} color={Colors.primary} />;
      case 'zap': return <Zap size={24} color={Colors.primary} />;
      default: return <Package size={24} color={Colors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}!</Text>
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
            <TouchableOpacity style={styles.trackBtn}>
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

        {/* Service Shortcuts */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Quick Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => router.push('/book-laundry' as any)}
                activeOpacity={0.7}
              >
                <View style={styles.serviceIconContainer}>
                  {getServiceIcon(service.icon)}
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Package size={20} color={Colors.primary} />
              <Text style={styles.summaryValue}>{activeOrders.length}</Text>
              <Text style={styles.summaryLabel}>Active Orders</Text>
            </View>
            <View style={styles.summaryCard}>
              <AlertCircle size={20} color={Colors.error} />
              <Text style={styles.summaryValue}>{pendingPayments.length}</Text>
              <Text style={styles.summaryLabel}>Pending Payment</Text>
            </View>
            <View style={styles.summaryCard}>
              <CheckCircle2 size={20} color={Colors.success} />
              <Text style={styles.summaryValue}>{completedOrders.length}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Promotions Section (Optional) */}
        <View style={styles.promotionsSection}>
          <View style={styles.promoCard}>
            <Gift size={28} color={Colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>10% Off This Week</Text>
              <Text style={styles.promoSubtitle}>New customers only</Text>
            </View>
            <ChevronRight size={20} color={Colors.text} />
          </View>
          <View style={styles.promoCard}>
            <ShoppingBag size={28} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>Free Pickup</Text>
              <Text style={styles.promoSubtitle}>For orders above ₱500</Text>
            </View>
            <ChevronRight size={20} color={Colors.text} />
          </View>
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

        <View style={styles.shopList}>
          {nearbyShops.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={styles.shopCard}
              onPress={() => router.push(`/shop-detail?id=${shop.id}` as any)}
              activeOpacity={0.8}
              testID={`shop-${shop.id}`}
            >
              <Image source={{ uri: shop.image }} style={styles.shopImage} contentFit="cover" />
              <View style={styles.shopInfo}>
                <View style={styles.shopNameRow}>
                  <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: shop.isOpen ? Colors.successLight : Colors.errorLight }]}>
                    <Text style={[styles.statusText, { color: shop.isOpen ? Colors.success : Colors.error }]}>
                      {shop.isOpen ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>
                <View style={styles.shopMeta}>
                  <MapPin size={13} color={Colors.textTertiary} />
                  <Text style={styles.shopAddress} numberOfLines={1}>{shop.address}</Text>
                </View>
                <View style={styles.shopBottom}>
                  <View style={styles.ratingRow}>
                    <Star size={14} color={Colors.accent} fill={Colors.accent} />
                    <Text style={styles.ratingText}>{shop.rating > 0 ? shop.rating : 'New'}</Text>
                    {shop.reviewCount > 0 && <Text style={styles.reviewCount}>({shop.reviewCount})</Text>}
                  </View>
                  <View style={styles.distanceRow}>
                    <Clock size={13} color={Colors.textTertiary} />
                    <Text style={styles.distanceText}>{shop.services.length} services</Text>
                  </View>
                  <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
                    <Heart size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredShops.length > 3 && (
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
        {popularShops.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Shops</Text>
            </View>

            <View style={styles.shopList}>
              {popularShops.map((shop) => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.shopCard}
                  onPress={() => router.push(`/shop-detail?id=${shop.id}` as any)}
                  activeOpacity={0.8}
                  testID={`popular-shop-${shop.id}`}
                >
                  <Image source={{ uri: shop.image }} style={styles.shopImage} contentFit="cover" />
                  <View style={styles.shopInfo}>
                    <View style={styles.shopNameRow}>
                      <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: shop.isOpen ? Colors.successLight : Colors.errorLight }]}>
                        <Text style={[styles.statusText, { color: shop.isOpen ? Colors.success : Colors.error }]}>
                          {shop.isOpen ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.shopMeta}>
                      <MapPin size={13} color={Colors.textTertiary} />
                      <Text style={styles.shopAddress} numberOfLines={1}>{shop.address}</Text>
                    </View>
                    <View style={styles.shopBottom}>
                      <View style={styles.ratingRow}>
                        <Star size={14} color={Colors.accent} fill={Colors.accent} />
                        <Text style={styles.ratingText}>{shop.rating > 0 ? shop.rating : 'New'}</Text>
                        {shop.reviewCount > 0 && <Text style={styles.reviewCount}>({shop.reviewCount})</Text>}
                      </View>
                      <View style={styles.distanceRow}>
                        <Clock size={13} color={Colors.textTertiary} />
                        <Text style={styles.distanceText}>{shop.services.length} services</Text>
                      </View>
                      <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
                        <Heart size={16} color={Colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {filteredShops.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllBtn}
                onPress={() => router.push('/customer/orders' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All Popular Shops</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
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
    marginHorizontal: 20, marginTop: 12, backgroundColor: Colors.accentLight, borderRadius: 14,
    padding: 14, gap: 6,
  },
  proofTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text },
  proofDetails: { fontSize: 12, color: Colors.textSecondary },
  proofAmount: { fontSize: 15, fontWeight: '800' as const, color: Colors.accent, marginTop: 4 },
  proofBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.white, paddingVertical: 8, borderRadius: 8 },
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

  // Service Shortcuts
  servicesSection: { paddingHorizontal: 20, marginTop: 20 },
  servicesGrid: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  serviceCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.borderLight },
  serviceIconContainer: { justifyContent: 'center', alignItems: 'center', height: 40 },
  serviceName: { fontSize: 11, fontWeight: '700' as const, color: Colors.text, textAlign: 'center' as const },

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
});
