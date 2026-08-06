import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SettingsService } from '../../../../core/services/settings.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { OrdersService } from '../../../orders/services/orders.service';
import { ProductsService } from '../../../products/services/products.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Language, ThemeMode } from '../../../../models/enums';
import { downloadCsv, downloadJson } from '../../../../shared/utils/export.utils';
import { orderTotal } from '../../../../models/order.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  template: `
    <div class="mx-auto max-w-lg space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ 'settingsTitle' | translate }}
      </h1>

      <!-- Language -->
      <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ 'languageSection' | translate }}
        </h2>
        <div class="flex gap-3">
          @for (lang of languages; track lang) {
            <button
              type="button"
              (click)="setLanguage(lang)"
              class="flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors"
              [class]="lang === settings.language()
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'"
            >
              {{ lang === 'es' ? 'Español' : 'English' }}
            </button>
          }
        </div>
      </section>

      <!-- Currency -->
      <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ 'currencySection' | translate }}
        </h2>
        <select
          [value]="settings.currencyCode()"
          (change)="setCurrency($any($event.target).value)"
          class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          @for (currency of currencyService.currencies; track currency.code) {
            <option [value]="currency.code">{{ currency.name }}</option>
          }
        </select>
      </section>

      <!-- Theme -->
      <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ 'themeSection' | translate }}
        </h2>
        <div class="flex gap-3">
          @for (theme of themes; track theme) {
            <button
              type="button"
              (click)="setTheme(theme)"
              class="flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition-colors"
              [class]="theme === settings.theme()
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'"
            >
              {{ theme === 'dark' ? ('darkMode' | translate) : ('lightMode' | translate) }}
            </button>
          }
        </div>
      </section>

      <!-- Data -->
      <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ 'dataSection' | translate }}
        </h2>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">{{ 'exportHint' | translate }}</p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <app-button class="flex-1" variant="secondary" (clickEvent)="exportCsv()">
            <app-icon name="download" class="size-4" />
            {{ 'exportCsv' | translate }}
          </app-button>
          <app-button class="flex-1" variant="ghost" (clickEvent)="exportJson()">
            <app-icon name="download" class="size-4" />
            {{ 'exportJson' | translate }}
          </app-button>
        </div>
      </section>

      <!-- About -->
      <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ 'aboutSection' | translate }}
        </h2>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ 'appName' | translate }}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ 'version' | translate }} 0.1.0</span>
        </div>
      </section>
    </div>
  `,
})
export class SettingsPage {
  readonly languages: Language[] = ['en', 'es'];
  readonly themes: ThemeMode[] = ['light', 'dark'];

  constructor(
    readonly settings: SettingsService,
    readonly currencyService: CurrencyService,
    private readonly i18n: I18nService,
    private readonly toastService: ToastService,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  setLanguage(lang: Language): void {
    this.settings.setLanguage(lang);
    this.i18n.setLanguage(lang);
    this.toastService.success(this.i18n.translate('changesSaved'));
  }

  setCurrency(code: string): void {
    this.settings.setCurrency(code);
    this.toastService.success(this.i18n.translate('changesSaved'));
  }

  setTheme(theme: ThemeMode): void {
    this.settings.setTheme(theme);
    this.toastService.success(this.i18n.translate('changesSaved'));
  }

  exportCsv(): void {
    const rows = this.ordersService.orders().map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      firstName: o.customer.firstName,
      lastName: o.customer.lastName,
      phone: o.customer.phone ?? '',
      deliveryType: o.deliveryType,
      deliveryDate: o.deliveryDate,
      deliveryTime: o.deliveryTime,
      items: o.items.map((i) => `${i.productName} x${i.quantity}`).join(' | '),
      total: orderTotal(o),
      notes: o.notes ?? '',
      created: o.createdAt,
    }));
    downloadCsv(rows as Record<string, unknown>[], `sweet-sales-orders-${Date.now()}.csv`);
    this.toastService.success(this.i18n.translate('exportStarted'));
  }

  exportJson(): void {
    downloadJson(
      {
        exportedAt: new Date(),
        products: this.productsService.products(),
        orders: this.ordersService.orders(),
        settings: this.settings.settings(),
      },
      `sweet-sales-data-${Date.now()}.json`,
    );
    this.toastService.success(this.i18n.translate('exportStarted'));
  }
}