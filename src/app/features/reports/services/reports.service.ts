import { Injectable, computed } from '@angular/core';
import { OrdersService } from '../../orders/services/orders.service';
import { ProductsService } from '../../products/services/products.service';
import { SalesReport, ProductSales, CategorySales } from '../../../models/report.model';
import { orderTotal } from '../../../models/order.model';
import { ProductCategory, PRODUCT_CATEGORIES } from '../../../models/enums';

/**
 * Computes sales metrics from stored orders for a given period.
 */
@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  readonly report = computed<SalesReport>(() => this.buildReport());

  /**
   * Returns completed orders within the inclusive date range.
   * Filter is based on the completion date (completedAt), not the delivery date.
   */
  getCompletedInRange(start: Date, end: Date) {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return this.ordersService.orders().filter((o) => {
      if (o.status !== 'completed' || !o.completedAt) {
        return false;
      }
      const completedAt = new Date(o.completedAt).getTime();
      return completedAt >= startTime && completedAt <= endTime;
    });
  }

  buildReport(start?: Date, end?: Date): SalesReport {
    const orders = start && end ? this.getCompletedInRange(start, end) : [];
    if (!start || !end) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        averageOrderValue: 0,
        bestSelling: [],
        byCategory: [],
      };
    }

    const completed = orders;
    const totalRevenue = completed.reduce(
      (sum, o) => sum + orderTotal(o),
      0,
    );
    const totalOrders = orders.length;
    const completedOrders = completed.length;
    const pendingOrders = totalOrders - completedOrders;
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // Best selling products
    const productMap = new Map<string, ProductSales>();
    for (const order of completed) {
      for (const item of order.items) {
        const current = productMap.get(item.productId) ?? {
          productName: item.productName,
          quantity: 0,
          revenue: 0,
        };
        current.quantity += item.quantity;
        current.revenue += item.quantity * item.unitPrice;
        productMap.set(item.productId, current);
      }
    }
    const bestSelling = [...productMap.values()].sort(
      (a, b) => b.quantity - a.quantity,
    );

    // Revenue by category
    const categoryMap = new Map<ProductCategory, number>();
    for (const order of completed) {
      for (const item of order.items) {
        const product = this.productsService.getById(item.productId);
        const category = product?.category ?? 'other';
        const subtotal = item.quantity * item.unitPrice;
        categoryMap.set(category, (categoryMap.get(category) ?? 0) + subtotal);
      }
    }
    const byCategory: CategorySales[] = PRODUCT_CATEGORIES.filter((c) =>
      categoryMap.has(c),
    ).map((category) => ({
      category,
      revenue: categoryMap.get(category) ?? 0,
    }));

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      averageOrderValue,
      bestSelling,
      byCategory,
    };
  }
}
