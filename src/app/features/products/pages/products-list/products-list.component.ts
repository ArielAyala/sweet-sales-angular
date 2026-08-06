import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ProductsService } from '../../services/products.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ProductCategory, PRODUCT_CATEGORIES } from '../../../../models/enums';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, IconComponent, EmptyStateComponent, CurrencyFormatPipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ 'productsTitle' | translate }}
        </h1>
        <a
          [routerLink]="['/products/new']"
          class="flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <app-icon name="plus" class="size-4" />
        </a>
      </div>

      <!-- Search -->
      <div class="relative">
        <app-icon name="search" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          [placeholder]="'search' | translate"
          (input)="query.set($any($event.target).value)"
          class="min-h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <!-- Category filter -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          (click)="selectedCategory.set(null)"
          class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
          [class]="selectedCategory() === null
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'"
        >
          {{ 'all' | translate }}
        </button>
        @for (cat of categories; track cat) {
          <button
            type="button"
            (click)="selectedCategory.set(cat)"
            class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            [class]="selectedCategory() === cat
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'"
          >
            {{ categoryLabel(cat) | translate }}
          </button>
        }
      </div>

      <!-- Products grid -->
      @if (filteredProducts().length === 0) {
        <app-empty-state [title]="'noProducts' | translate" [hint]="'noProductsHint' | translate">
          <span icon><app-icon name="box" class="size-8" /></span>
        </app-empty-state>
      } @else {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (product of filteredProducts(); track product.id) {
            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ product.name }}</h3>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ categoryLabel(product.category) | translate }}
                  </span>
                </div>
                <app-icon
                  [name]="product.isActive ? 'check' : 'close'"
                  class="size-5"
                  [class]="{
                    'text-emerald-500': product.isActive,
                    'text-gray-400': !product.isActive,
                  }"
                />
              </div>
              <p class="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                {{ product.description }}
              </p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-lg font-bold text-primary-600 dark:text-primary-300">
                  {{ product.basePrice | currencyFormat }}
                </span>
                <div class="flex gap-1">
                  <a
                    [routerLink]="['/products', product.id, 'edit']"
                    class="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    [attr.aria-label]="'edit' | translate"
                  >
                    <app-icon name="edit" class="size-4" />
                  </a>
                  <button
                    type="button"
                    (click)="toggle(product.id)"
                    class="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    [attr.aria-label]="'actions' | translate"
                  >
                    <app-icon name="check" class="size-4" />
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ProductsListPage {
  readonly categories = PRODUCT_CATEGORIES;
  readonly selectedCategory = signal<ProductCategory | null>(null);
  readonly query = signal('');

  constructor(private readonly productsService: ProductsService) {}

  protected readonly filteredProducts = computed(() => {
    const selected = this.selectedCategory();
    const query = this.query().trim().toLowerCase();
    return this.productsService.products().filter((p) => {
      const matchesCategory = selected === null || p.category === selected;
      const matchesQuery =
        query === '' ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  });

  toggle(id: string): void {
    this.productsService.toggleActive(id);
  }

  categoryLabel(cat: ProductCategory): string {
    return `category${cap(cat)}`;
  }
}

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}