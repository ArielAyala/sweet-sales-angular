import { TestBed } from '@angular/core/testing';
import { OrdersService } from './orders.service';
import { OrderInput } from './orders.service';
import { Order } from '../../../models/order.model';

function makeOrderInput(): OrderInput {
  return {
    customer: { name: 'Maria Gonzalez', phone: '0981' },
    items: [
      {
        productId: 'p1',
        productName: 'Chocolate Cake',
        quantity: 2,
        unitPrice: 100000,
      },
    ],
    deliveryType: 'pickup',
    deliveryDate: new Date('2026-08-10T15:00:00'),
    deliveryTime: '15:00',
    notes: 'Birthday cake',
  };
}

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersService);
  });

  it('starts empty', () => {
    expect(service.orders()).toEqual([]);
  });

  it('creates an order as pending with sequential number', () => {
    const order = service.createOrder(makeOrderInput());
    expect(order.status).toBe('pending');
    expect(order.orderNumber).toBe('0001');
    expect(order.totalAmount).toBe(200000);
    expect(order.id).toBeTruthy();
  });

  it('increments order numbers', () => {
    service.createOrder(makeOrderInput());
    const second = service.createOrder(makeOrderInput());
    expect(second.orderNumber).toBe('0002');
  });

  it('updates an order', () => {
    const order = service.createOrder(makeOrderInput());
    service.updateOrder(order.id, { ...makeOrderInput(), notes: 'Updated' });
    expect(service.getById(order.id)?.notes).toBe('Updated');
  });

  it('completes an order with a price adjustment', () => {
    const order = service.createOrder(makeOrderInput());
    service.completeOrder(order.id, { adjustedAmount: 180000, reason: 'Discount' });
    const completed = service.getById(order.id) as Order;
    expect(completed.status).toBe('completed');
    expect(completed.totalAmount).toBe(180000);
    expect(completed.priceAdjustment?.originalAmount).toBe(200000);
    expect(completed.completedAt).toBeTruthy();
  });

  it('reopens a completed order', () => {
    const order = service.createOrder(makeOrderInput());
    service.completeOrder(order.id, { adjustedAmount: 180000 });
    service.reopenOrder(order.id);
    const reopened = service.getById(order.id) as Order;
    expect(reopened.status).toBe('pending');
    expect(reopened.completedAt).toBeUndefined();
  });

  it('deletes an order', () => {
    const order = service.createOrder(makeOrderInput());
    service.deleteOrder(order.id);
    expect(service.orders()).toHaveLength(0);
  });

  it('filters by status and search', () => {
    const order = service.createOrder(makeOrderInput());
    expect(service.byStatus('pending')).toHaveLength(1);
    expect(service.search('maria')).toHaveLength(1);
    expect(service.search('0001')).toHaveLength(1);
    expect(service.search('')).toHaveLength(1);
  });

  it('builds a shareable summary', () => {
    const order = service.createOrder(makeOrderInput());
    const text = service.shareSummary(order, (v) => `₲${v}`);
    expect(text).toContain('Order #0001');
    expect(text).toContain('Maria Gonzalez');
    expect(text).toContain('₲200000');
  });

  it('persists to localStorage', () => {
    service.createOrder(makeOrderInput());
    const reloaded = TestBed.inject(OrdersService);
    expect(reloaded.orders()).toHaveLength(1);
    expect(reloaded.byStatus('pending')).toHaveLength(1);
  });
});