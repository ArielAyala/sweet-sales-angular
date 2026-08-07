import { Injectable, signal } from '@angular/core';
import { Order, OrderItem, orderSubtotal, orderTotal } from '../../../models/order.model';
import { OrderStatus } from '../../../models/enums';
import { StorageService } from '../../../core/services/storage.service';
import { SettingsService } from '../../../core/services/settings.service';
import { I18nService } from '../../../core/services/i18n.service';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys.const';

export interface OrderInput {
  customer: Order['customer'];
  items: OrderItem[];
  deliveryType: Order['deliveryType'];
  deliveryDate: Date;
  deliveryTime: string;
  notes?: string;
  deposit?: number;
}

/**
 * Manages order lifecycle: create, update, complete, delete.
 * Persists orders and the last order number to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  readonly orders = signal<Order[]>([]);

  private lastOrderNumber = 0;

  constructor(
    private readonly storage: StorageService,
    private readonly settings: SettingsService,
    private readonly i18n: I18nService,
  ) {
    this.orders.set(this.migrateOrders(this.storage.get<Order[]>(STORAGE_KEYS.orders, [])));
    this.lastOrderNumber = this.storage.get<number>(STORAGE_KEYS.lastOrderNumber, 0);
  }

  getById(id: string): Order | undefined {
    return this.orders().find((o) => o.id === id);
  }

  byStatus(status: OrderStatus): Order[] {
    return this.orders().filter((o) => o.status === status);
  }

  search(query: string): Order[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.orders();
    }
    return this.orders().filter((o) => {
      const customer = o.customer.name.toLowerCase();
      const number = o.orderNumber.toLowerCase();
      return customer.includes(q) || number.includes(q);
    });
  }

  /**
   * Orders sorted by createdAt descending (newest first).
   */
  sortedByNewest(orders: Order[] = this.orders()): Order[] {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  createOrder(input: OrderInput): Order {
    const now = new Date();
    const items = this.normalizeItems(input.items);
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: this.nextOrderNumber(),
      customer: input.customer,
      items,
      totalAmount: orderSubtotal(items),
      deposit: input.deposit && input.deposit > 0 ? input.deposit : undefined,
      status: 'pending',
      deliveryType: input.deliveryType,
      deliveryDate: input.deliveryDate,
      deliveryTime: input.deliveryTime,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.update((current) => [...current, order]);
    this.persist();
    return order;
  }

  updateOrder(id: string, input: OrderInput): void {
    this.orders.update((current) =>
      current.map((o) => {
        if (o.id !== id) {
          return o;
        }
        const items = this.normalizeItems(input.items);
        const updated: Order = {
          ...o,
          customer: input.customer,
          items,
          totalAmount: orderTotal({ items, priceAdjustment: o.priceAdjustment }),
          deposit: input.deposit && input.deposit > 0 ? input.deposit : undefined,
          deliveryType: input.deliveryType,
          deliveryDate: input.deliveryDate,
          deliveryTime: input.deliveryTime,
          notes: input.notes,
          updatedAt: new Date(),
        };
        return updated;
      }),
    );
    this.persist();
  }

  /**
   * Marks an order as completed, optionally applying a price adjustment.
   */
  completeOrder(
    id: string,
    options?: { adjustedAmount?: number; reason?: string },
  ): void {
    this.orders.update((current) =>
      current.map((o) => {
        if (o.id !== id) {
          return o;
        }
        const subtotal = orderSubtotal(o.items);
        let adjustment = o.priceAdjustment;
        if (options?.adjustedAmount !== undefined) {
          adjustment = {
            originalAmount: subtotal,
            adjustedAmount: options.adjustedAmount,
            reason: options.reason,
            adjustedAt: new Date(),
          };
        }
        return {
          ...o,
          status: 'completed' as OrderStatus,
          priceAdjustment: adjustment,
          totalAmount: orderTotal({ items: o.items, priceAdjustment: adjustment }),
          completedAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    );
    this.persist();
  }

  /**
   * Reactivates a completed order (moves it back to pending).
   */
  reopenOrder(id: string): void {
    this.orders.update((current) =>
      current.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'pending' as OrderStatus,
              completedAt: undefined,
              updatedAt: new Date(),
            }
          : o,
      ),
    );
    this.persist();
  }

  deleteOrder(id: string): void {
    this.orders.update((current) => current.filter((o) => o.id !== id));
    this.persist();
  }

  /**
   * Builds a shareable plain-text summary of an order.
   * Labels follow the current language; header uses the configured business name.
   */
  shareSummary(order: Order, formatPrice: (value: number) => string): string {
    const t = (key: string, params?: Record<string, string | number>) =>
      this.i18n.translate(key, params);
    const lines: string[] = [];
    lines.push(`🧁 ${this.settings.businessName()} - ${t('orderNumber')}${order.orderNumber}`);
    lines.push('');
    lines.push(`${t('customer')}: ${order.customer.name}`);
    if (order.customer.phone) {
      lines.push(`${t('phoneShort')}: ${order.customer.phone}`);
    }
    lines.push('');
    lines.push(`${t('orderItemsDetail')}:`);
    for (const item of order.items) {
      lines.push(`- ${item.productName} x${item.quantity} - ${formatPrice(item.unitPrice)}`);
      if (item.customizations) {
        lines.push(`  ${t('notes')}: ${item.customizations}`);
      }
    }
    lines.push('');
    const total = orderTotal(order);
    lines.push(`${t('total')}: ${formatPrice(total)}`);
    if (order.deposit && order.deposit > 0) {
      lines.push(`${t('deposit')}: ${formatPrice(order.deposit)}`);
      lines.push(`${t('balance')}: ${formatPrice(total - order.deposit)}`);
    }
    if (this.hasDeliveryInfo(order)) {
      lines.push('');
      const typeLabel = order.deliveryType === 'pickup' ? t('pickup') : t('delivery');
      lines.push(
        t('shareDeliveryLine', {
          type: typeLabel,
          date: new Date(order.deliveryDate).toLocaleDateString(),
          time: order.deliveryTime,
        }),
      );
    }
    if (order.notes) {
      lines.push('');
      lines.push(`${t('notes')}: ${order.notes}`);
    }
    return lines.join('\n');
  }

  private hasDeliveryInfo(order: Order): boolean {
    if (!order.deliveryType || !order.deliveryTime) {
      return false;
    }
    if (!order.deliveryDate) {
      return false;
    }
    const date = new Date(order.deliveryDate);
    return !Number.isNaN(date.getTime());
  }

  private migrateOrders(orders: Order[]): Order[] {
    return orders.map((o) => {
      const legacy = o.customer as unknown as Record<string, string | undefined>;
      if (!o.customer.name && (legacy['firstName'] || legacy['lastName'])) {
        return {
          ...o,
          customer: {
            name: `${legacy['firstName'] ?? ''} ${legacy['lastName'] ?? ''}`.trim(),
            phone: o.customer.phone,
          },
        };
      }
      return o;
    });
  }

  private normalizeItems(items: OrderItem[]): OrderItem[] {
    return items
      .filter((item) => item.productId && item.quantity > 0)
      .map((item) => ({
        ...item,
        subtotal: item.quantity * item.unitPrice,
      }));
  }

  private nextOrderNumber(): string {
    this.lastOrderNumber += 1;
    this.storage.set(STORAGE_KEYS.lastOrderNumber, this.lastOrderNumber);
    return String(this.lastOrderNumber).padStart(4, '0');
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.orders, this.orders());
  }
}
