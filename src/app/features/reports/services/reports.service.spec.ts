import { TestBed } from '@angular/core/testing';
import { ReportsService } from './reports.service';
import { OrdersService } from '../../orders/services/orders.service';
import { ProductsService } from '../../products/services/products.service';
import { OrderInput } from '../../orders/services/orders.service';

function makeOrder(day: number, price: number, productId = 'p1'): OrderInput {
  return {
    customer: { name: 'A B' },
    items: [{ productId, productName: 'Cake', quantity: 1, unitPrice: price }],
    deliveryType: 'pickup',
    deliveryDate: new Date(2026, 7, day, 12, 0),
    deliveryTime: '12:00',
    paymentMethod: 'cash',
  };
}

function setCompletedAt(orders: OrdersService, id: string, date: Date) {
  orders.orders.update((list) =>
    list.map((o) => (o.id === id ? { ...o, completedAt: date } : o)),
  );
}

describe('ReportsService', () => {
  let reports: ReportsService;
  let orders: OrdersService;
  let products: ProductsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    orders = TestBed.inject(OrdersService);
    products = TestBed.inject(ProductsService);
    reports = TestBed.inject(ReportsService);
  });

  it('reports zero for empty data', () => {
    const report = reports.buildReport(new Date(2026, 7, 1), new Date(2026, 7, 31));
    expect(report.totalRevenue).toBe(0);
    expect(report.totalOrders).toBe(0);
  });

  it('aggregates completed orders within range', () => {
    const first = orders.createOrder(makeOrder(5, 100000));
    const second = orders.createOrder(makeOrder(20, 50000));
    orders.completeOrder(first.id, { adjustedAmount: 90000 });
    orders.completeOrder(second.id);
    setCompletedAt(orders, first.id, new Date(2026, 7, 5, 12, 0));
    setCompletedAt(orders, second.id, new Date(2026, 7, 20, 12, 0));

    const report = reports.buildReport(new Date(2026, 7, 1), new Date(2026, 7, 31));
    expect(report.totalOrders).toBe(2);
    expect(report.totalRevenue).toBe(140000);
    expect(report.completedOrders).toBe(2);
    expect(report.averageOrderValue).toBe(70000);
    expect(report.bestSelling[0].productName).toBe('Cake');
  });

  it('includes only completed orders in revenue', () => {
    const first = orders.createOrder(makeOrder(5, 100000));
    const pending = orders.createOrder(makeOrder(10, 999999));
    orders.completeOrder(first.id);
    setCompletedAt(orders, first.id, new Date(2026, 7, 5, 12, 0));

    const report = reports.buildReport(new Date(2026, 7, 1), new Date(2026, 7, 31));
    expect(report.totalOrders).toBe(1);
    expect(report.totalRevenue).toBe(100000);
    void pending;
  });

  it('excludes orders outside the range', () => {
    const outside = orders.createOrder(makeOrder(1, 100000));
    orders.completeOrder(outside.id);
    setCompletedAt(orders, outside.id, new Date(2026, 7, 1, 12, 0));
    const report = reports.buildReport(new Date(2026, 7, 5), new Date(2026, 7, 15));
    expect(report.totalOrders).toBe(0);
  });

  it('breaks down revenue by category', () => {
    const product = products.addProduct({
      name: 'Chocolate Cake',
      category: 'cakes',
      basePrice: 100000,
      description: '',
    });
    const input = makeOrder(5, 100000, product.id);
    const order = orders.createOrder(input);
    orders.completeOrder(order.id);
    setCompletedAt(orders, order.id, new Date(2026, 7, 5, 12, 0));

    const report = reports.buildReport(new Date(2026, 7, 1), new Date(2026, 7, 31));
    expect(report.byCategory.find((c) => c.category === 'cakes')?.revenue).toBe(100000);
  });
});
