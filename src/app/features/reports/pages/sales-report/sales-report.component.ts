import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ReportsService } from '../../services/reports.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ReportPeriod } from '../../../../shared/utils/date.utils';
import { getRangeForPeriod } from '../../../../shared/utils/date.utils';
import { ProductCategory } from '../../../../models/enums';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { downloadCsv } from '../../../../shared/utils/export.utils';
import { orderTotal } from '../../../../models/order.model';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    TranslatePipe,
    ButtonComponent,
    IconComponent,
    EmptyStateComponent,
    CurrencyFormatPipe,
  ],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ 'reportsTitle' | translate }}
      </h1>

      <!-- Period selector -->
      <div class="flex flex-wrap gap-2">
        @for (period of periods; track period) {
          <button
            type="button"
            (click)="selectPeriod(period)"
            class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
            [class]="period === selectedPeriod()
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'"
          >
            {{ periodLabel(period) | translate }}
          </button>
        }
      </div>

      @if (customRange()) {
        <div class="flex gap-3">
          <input
            type="date"
            [value]="customStart()"
            (change)="customStart.set($any($event.target).value)"
            class="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <input
            type="date"
            [value]="customEnd()"
            (change)="customEnd.set($any($event.target).value)"
            class="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      }

      @if (report().totalOrders === 0) {
        <app-empty-state [title]="'noSales' | translate">
          <span icon><app-icon name="reports" class="size-8" /></span>
        </app-empty-state>
      } @else {
        <!-- KPI cards -->
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ 'totalRevenue' | translate }}</p>
            <p class="mt-1 text-lg font-bold text-primary-600 dark:text-primary-300">
              {{ report().totalRevenue | currencyFormat }}
            </p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ 'totalOrders' | translate }}</p>
            <p class="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{{ report().totalOrders }}</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ 'avgOrderValue' | translate }}</p>
            <p class="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
              {{ report().averageOrderValue | currencyFormat }}
            </p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ 'completedOrders' | translate }}</p>
            <p class="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ report().completedOrders }}</p>
          </div>
        </div>

        <!-- Best selling -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ 'mostSoldProducts' | translate }}
          </h2>
          @if (report().bestSelling.length === 0) {
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'noResults' | translate }}</p>
          } @else {
            <div class="space-y-2">
              @for (item of report().bestSelling; track $index) {
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-800 dark:text-gray-200">{{ item.productName }}</span>
                  <span class="text-gray-500 dark:text-gray-400">×{{ item.quantity }}</span>
                  <span class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ item.revenue | currencyFormat }}
                  </span>
                </div>
              }
            </div>
          }
        </section>

        <!-- By category -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ 'salesByCategory' | translate }}
          </h2>
          <div class="space-y-2">
            @for (cat of report().byCategory; track cat.category) {
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-800 dark:text-gray-200">{{ categoryLabel(cat.category) | translate }}</span>
                <span class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ cat.revenue | currencyFormat }}
                </span>
              </div>
            }
          </div>
        </section>

        <div class="flex justify-end">
          <app-button variant="secondary" (clickEvent)="exportReport()">
            <app-icon name="download" class="size-4" />
            {{ 'exportReport' | translate }}
          </app-button>
        </div>
      }
    </div>
  `,
})
export class SalesReportPage {
  private readonly reportsService = inject(ReportsService);
  private readonly currencyService = inject(CurrencyService);

  readonly periods: ReportPeriod[] = ['today', 'week', 'month'];
  readonly selectedPeriod = signal<ReportPeriod>('week');
  readonly customRange = signal(false);
  readonly customStart = signal('');
  readonly customEnd = signal('');

  readonly range = computed(() => {
    if (this.customRange()) {
      return getRangeForPeriod('custom', {
        start: new Date(this.customStart()),
        end: new Date(this.customEnd()),
      });
    }
    return getRangeForPeriod(this.selectedPeriod());
  });

  protected readonly report = computed(() => {
    const { start, end } = this.range();
    return this.reportsService.buildReport(start, end);
  });

  selectPeriod(period: ReportPeriod): void {
    this.selectedPeriod.set(period);
    this.customRange.set(false);
  }

  periodLabel(period: ReportPeriod): string {
    return period;
  }

  categoryLabel(cat: ProductCategory): string {
    return `category${cat.charAt(0).toUpperCase()}${cat.slice(1)}`;
  }

  exportReport(): void {
    const { start, end } = this.range();
    const orders = this.reportsService.getCompletedInRange(start, end);
    const rows = orders.map((o) => ({
      orderNumber: o.orderNumber,
      customer: o.customer.name,
      deliveryDate: o.deliveryDate,
      deliveryTime: o.deliveryTime,
      items: o.items.map((i) => `${i.productName} x${i.quantity}`).join(' | '),
      total: orderTotal(o),
      completedAt: o.completedAt ?? '',
    }));
    downloadCsv(rows as Record<string, unknown>[], `sweet-sales-report-${Date.now()}.csv`);
  }
}
