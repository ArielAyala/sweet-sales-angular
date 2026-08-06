import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { SettingsService } from '../../core/services/settings.service';
import { I18nService } from '../../core/services/i18n.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'navOrders', route: '/orders', icon: 'orders' },
  { label: 'navProducts', route: '/products', icon: 'products' },
  { label: 'navReports', route: '/reports', icon: 'reports' },
  { label: 'navSettings', route: '/settings', icon: 'settings' },
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, ToastContainerComponent, IconComponent],
  template: `
    <div class="flex min-h-dvh bg-gray-50 dark:bg-gray-900">
      <!-- Desktop sidebar -->
      <aside
        class="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-700">
          <span class="flex size-9 items-center justify-center rounded-xl bg-primary-500 text-lg">🧁</span>
          <span class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ 'appName' | translate }}
          </span>
        </div>
        <nav class="flex-1 space-y-1 p-3">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
              #rla="routerLinkActive"
              class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <app-icon [name]="item.icon" class="size-5" />
              {{ item.label | translate }}
            </a>
          }
        </nav>
      </aside>

      <!-- Main column -->
      <div class="flex min-w-0 flex-1 flex-col">
        <header
          class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur lg:px-6 dark:border-gray-700 dark:bg-gray-800/90"
        >
          <div class="flex items-center gap-2 lg:hidden">
            <span class="flex size-9 items-center justify-center rounded-xl bg-primary-500 text-lg">🧁</span>
            <span class="text-lg font-bold text-gray-900 dark:text-gray-100">
              {{ 'appName' | translate }}
            </span>
          </div>
          <div class="hidden lg:block text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ 'appName' | translate }}
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-primary-600 dark:text-primary-300">
              {{ currency().symbol }} {{ currency().code }}
            </span>
            <button
              type="button"
              (click)="settings.toggleTheme()"
              class="flex size-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              [attr.aria-label]="'theme' | translate"
            >
              @if (settings.theme() === 'dark') {
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              }
            </button>
          </div>
        </header>

        <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 lg:pb-6">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile bottom navigation -->
      <nav
        class="fixed inset-x-0 bottom-0 z-30 flex border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden dark:border-gray-700 dark:bg-gray-800/95"
      >
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="text-primary-600 dark:text-primary-300"
            #rla="routerLinkActive"
            class="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            <app-icon [name]="item.icon" class="size-6" />
            {{ item.label | translate }}
          </a>
        }
      </nav>

      <app-toast-container />
    </div>
  `,
})
export class MainLayoutComponent {
  readonly navItems = NAV_ITEMS;
  readonly currency = inject(CurrencyService).currency;

  constructor(
    readonly settings: SettingsService,
    readonly i18n: I18nService,
  ) {}
}