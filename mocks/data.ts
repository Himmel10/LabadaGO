import { OrderStatus } from '@/types';

export const ORDER_STATUS_LABELS: Record<string, string> = {
  booking_created: 'Booking Created',
  scheduled: 'Scheduled for Pickup',
  rider_assigned: 'Rider Assigned',
  picked_up: 'Picked Up',
  in_transit_to_shop: 'In Transit to Shop',
  arrived_at_shop: 'Arrived at Shop',
  weighed: 'Weighed & Proof Uploaded',
  awaiting_confirmation: 'Waiting for Confirmation',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  paid: 'Paid',
  completed: 'Completed',
  rated: 'Rated',
  cancelled: 'Cancelled',
  declined: 'Declined',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'booking_created',
  'scheduled',
  'rider_assigned',
  'picked_up',
  'in_transit_to_shop',
  'arrived_at_shop',
  'weighed',
  'awaiting_confirmation',
  'confirmed',
  'processing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'paid',
  'completed',
  'rated',
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  gcash: 'GCash',
  paymaya: 'PayMaya',
  card: 'Credit/Debit Card',
  cod: 'Cash on Delivery',
};

export const DELIVERY_FEE_BASE = 30;
export const DELIVERY_FEE_PER_KM = 5;
export const PLATFORM_COMMISSION_RATE = 0.10;
export const RIDER_COMMISSION_RATE = 0.15;
