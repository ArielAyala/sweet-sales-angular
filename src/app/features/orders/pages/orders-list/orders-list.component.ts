import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { OrdersService } from '../../services/orders.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { OrderStatus } from '../../../../models/enums';
import { Order, orderTotal } from '../../../../models/order.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

type StatusFilter = OrderStatus | 'all';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    IconComponent,
    EmptyStateComponent,
    CurrencyFormatPipe,
    DateFormatPipe,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ 'ordersTitle' | translate }}
        </h1>
        <a
          [routerLink]="['/orders/new']"
          class="flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <app-icon name="plus" class="size-4" />
          <span class="hidden sm:inline">{{ 'newOrder' | translate }}</span>
        </a>
      </div>

      <!-- Search -->
      <div class="relative">
        <app-icon
          name="search"
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          [placeholder]="'search' | translate"
          (input)="query.set($any($event.target).value)"
          class="min-h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <!-- Status filter -->
      <div class="flex gap-2">
        @for (status of statuses; track status) {
          <button
            type="button"
            (click)="selectedStatus.set(status)"
            class="flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            [class]="selectedStatus() === status
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'"
          >
            {{ statusLabel(status) | translate }}
          </button>
        }
      </div>

      <!-- Orders list -->
      @if (filteredOrders().length === 0) {
        <app-empty-state [title]="'noOrders' | translate" [hint]="'noOrdersHint' | translate">
          <span icon><app-icon name="cart" class="size-8" /></span>
        </app-empty-state>
      } @else {
        <div class="space-y-3">
          @for (order of filteredOrders(); track order.id) {
            <a
              [routerLink]="['/orders', order.id]"
              class="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ 'orderNumber' | translate }}{{ order.orderNumber }}
                  </span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    [class]="statusBadgeClass(order.status)"
                  >
                    {{ statusLabel(order.status) | translate }}
                  </span>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ order.deliveryDate | dateFormat }}
                </span>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    {{ order.customer.firstName }} {{ order.customer.lastName }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ order.items.length }} {{ 'items' | translate }} · {{ order.deliveryType }}
                  </p>
                </div>
                <span class="text-lg font-bold text-primary-600 dark:text-primary-300">
                  {{ orderTotal(order) | currencyFormat }}
                </span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class OrdersListPage {
  readonly statuses: StatusFilter[] = ['all', 'pending', 'completed'];
  readonly selectedStatus = signal<StatusFilter>('all');
  readonly query = signal('');

  constructor(private readonly ordersService: OrdersService) {}

  protected readonly filteredOrders = computed(() => {
    const status = this.selectedStatus();
    const query = this.query().trim().toLowerCase();
    return this.ordersService.sortedByNewest(
      this.ordersService.orders().filter((o) => {
        const matchesStatus = status === 'all' || o.status === status;
        const matchesQuery =
          query === '' ||
          o.orderNumber.toLowerCase().includes(query) ||
          `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
      }),
    );
  });

  statusLabel(status: StatusFilter): string {
    if (status === 'all') {
      return 'all';
    }
    return status;
  }

  statusBadgeClass(status: OrderStatus): string {
    return status === 'completed'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
  }

  orderTotal(order: Order): number {
    return orderTotal(order);
  }
}