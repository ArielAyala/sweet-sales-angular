import { DeliveryType, OrderStatus, PaymentMethod } from './enums';

export interface Customer {
  name: string;
  phone?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  customizations?: string;
}

export interface PriceAdjustment {
  originalAmount: number;
  adjustedAmount: number;
  reason?: string;
  adjustedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  deposit?: number; // Seña (pago parcial) - opcional
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryDate: Date;
  deliveryTime: string;
  notes?: string;
  priceAdjustment?: PriceAdjustment;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderSummary {
  order: Order;
  itemsCount: number;
  subtotal: number;
  total: number;
}

/**
 * Computes the subtotal of an order's items before any adjustment.
 */
export function orderSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

/**
 * Computes the final total of an order applying the price adjustment if present.
 */
export function orderTotal(order: Pick<Order, 'items' | 'priceAdjustment'>): number {
  const subtotal = orderSubtotal(order.items);
  return order.priceAdjustment ? order.priceAdjustment.adjustedAmount : subtotal;
}

/**
 * Computes the remaining balance after deposit.
 */
export function orderBalance(order: Pick<Order, 'items' | 'priceAdjustment' | 'deposit'>): number {
  const total = orderTotal(order);
  const deposit = order.deposit || 0;
  return total - deposit;
}
