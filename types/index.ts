export type UserRole = 'customer' | 'shop_owner' | 'rider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  rating?: number;
  isAvailable?: boolean;
  shopName?: string;
  shopAddress?: string;
  shopDescription?: string;
  businessPermit?: string;
  latitude?: number;
  longitude?: number;
  wallet?: number;
  vehicleType?: 'motorcycle' | 'bicycle' | 'car';
  plateNumber?: string;
  assignedShopId?: string;
  assignedShopName?: string;
  driverLicense?: string;
  validId?: string;
  isSuspended?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  shopId: string;
  rating: number;
  comment: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface LaundryShop {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  distance?: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  latitude?: number;
  longitude?: number;
  services: LaundryService[];
}

export interface LaundryService {
  id: string;
  shopId: string;
  name: string;
  description: string;
  pricePerKg: number;
  estimatedHours: number;
  icon: string;
  photo?: string;
}

export type OrderStatus =
  | 'booking_created'
  | 'scheduled'
  | 'rider_assigned'
  | 'picked_up'
  | 'in_transit_to_shop'
  | 'arrived_at_shop'
  | 'weighed'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'processing'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'paid'
  | 'completed'
  | 'rated'
  | 'cancelled'
  | 'declined';

export type PaymentMethod = 'gcash' | 'paymaya' | 'card' | 'cod';
export type PaymentStatus = 'pending' | 'awaiting' | 'paid' | 'released';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  shopId: string;
  shopName: string;
  riderId?: string;
  riderName?: string;
  serviceId: string;
  serviceName: string;
  pricePerKg: number;
  status: OrderStatus;
  weight?: number;
  serviceCost?: number;
  deliveryFee?: number;
  totalAmount?: number;
  estimatedAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  isPaid: boolean;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupSchedule?: string;
  deliveryDate?: string;
  weightPhoto?: string;
  laundryPhoto?: string;
  deliveryPhoto?: string;
  customerConfirmedPrice: boolean;
  notes?: string;
  shopRating?: number;
  shopReview?: string;
  riderRating?: number;
  riderReview?: string;
  receiptGenerated: boolean;
  platformCommission?: number;
  shopEarnings?: number;
  riderEarnings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'booking_created'
    | 'booking_confirmed'
    | 'booking_declined'
    | 'rider_assigned'
    | 'picked_up'
    | 'at_shop'
    | 'weight_proof'
    | 'price_confirmed'
    | 'payment_confirmed'
    | 'out_for_delivery'
    | 'order_delivered'
    | 'order_completed'
    | 'promotion'
    | 'system';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  orderId?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface DeliveryTask {
  id: string;
  orderId: string;
  riderId: string;
  type: 'pickup' | 'delivery';
  pickupAddress: string;
  dropoffAddress: string;
  customerName: string;
  shopName: string;
  status: 'assigned' | 'in_progress' | 'completed';
  estimatedTime: string;
  weight?: number;
  totalAmount?: number;
  weightPhoto?: string;
  deliveryPhoto?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: { id: string; name: string; role: UserRole }[];
  orderId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: Record<string, number>;
}

export interface Receipt {
  orderId: string;
  customerName: string;
  shopName: string;
  riderName: string;
  serviceName: string;
  pricePerKg: number;
  weight: number;
  serviceCost: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  weightProofUrl?: string;
  createdAt: string;
}
