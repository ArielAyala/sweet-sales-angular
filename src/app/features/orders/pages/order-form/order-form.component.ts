import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { OrdersService } from '../../services/orders.service';
import { ProductsService } from '../../../products/services/products.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { OrderItem, orderSubtotal } from '../../../../models/order.model';
import { DeliveryType, OrderStatus } from '../../../../models/enums';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { I18nService } from '../../../../core/services/i18n.service';

interface DraftItem extends OrderItem {
  tempQuantity: number;
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ButtonComponent,
    IconComponent,
    CurrencyFormatPipe,
  ],
  template: `
    <form [formGroup]="form" class="mx-auto max-w-lg space-y-6">
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="router.navigate(['/orders'])"
          class="flex size-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          [attr.aria-label]="'back' | translate"
        >
          <app-icon name="back" class="size-5" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ isEditing() ? ('editOrder' | translate) : ('newOrder' | translate) }}
        </h1>
      </div>

      <!-- Customer info -->
      <section
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ 'customer' | translate }}
        </h2>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ 'customerName' | translate }}
            </label>
            <input
              type="text"
              formControlName="name"
              class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ 'phone' | translate }} <span class="text-xs">({{ 'optional' | translate }})</span>
            </label>
            <input
              type="tel"
              formControlName="phone"
              inputmode="tel"
              class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>
      </section>

      <!-- Products selection -->
      <section
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ 'items' | translate }}
          </h2>
          <span class="text-sm text-gray-500">{{ draftItems().length }} {{ 'items' | translate }}</span>
        </div>

        @if (activeProducts().length === 0) {
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'noProducts' | translate }}</p>
        } @else {
          <div class="space-y-2">
            @for (product of activeProducts(); track product.id) {
              <div class="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ product.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ product.basePrice | currencyFormat }}
                  </p>
                </div>
                <button
                  type="button"
                  (click)="addItem(product)"
                  class="flex size-10 items-center justify-center rounded-lg bg-primary-500 text-white hover:bg-primary-600"
                  [attr.aria-label]="'addProduct' | translate"
                >
                  <app-icon name="plus" class="size-5" />
                </button>
              </div>
            }
          </div>
        }

        @if (draftItems().length > 0) {
          <div class="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            @for (item of draftItems(); track item.productId) {
              <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ item.productName }}
                  </p>
                  <button
                    type="button"
                    (click)="removeItem(item.productId)"
                    class="flex size-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    [attr.aria-label]="'delete' | translate"
                  >
                    <app-icon name="close" class="size-4" />
                  </button>
                </div>
                <div class="mt-2 flex items-center gap-3">
                  <div class="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
                    <button
                      type="button"
                      (click)="changeQty(item, -1)"
                      class="flex size-9 items-center justify-center text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span class="min-w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {{ item.quantity }}
                    </span>
                    <button
                      type="button"
                      (click)="changeQty(item, 1)"
                      class="flex size-9 items-center justify-center text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      aria-label="Increase"
                    >+
                    </button>
                  </div>
                  <input
                    type="text"
                    [value]="item.customizations ?? ''"
                    (input)="setCustomization(item.productId, $any($event.target).value)"
                    [placeholder]="'customizations' | translate"
                    class="min-h-9 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            }

            <div class="flex items-center justify-between pt-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ 'subtotal' | translate }}
              </span>
              <span class="font-bold text-primary-600 dark:text-primary-300">
                {{ subtotal() | currencyFormat }}
              </span>
            </div>
          </div>
        }
      </section>

      <!-- Deposit (partial payment) -->
      <section
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ 'deposit' | translate }}
        </h2>
        <div class="space-y-2">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ 'depositAmount' | translate }} <span class="text-xs">({{ 'optional' | translate }})</span>
          </label>
          <input
            type="number"
            formControlName="deposit"
            inputmode="decimal"
            min="0"
            step="0.01"
            [placeholder]="'depositPlaceholder' | translate"
            class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          @if (deposit() > 0) {
            <div class="mt-3 flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-500/10">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ 'balance' | translate }}</span>
              <span class="font-semibold text-blue-600 dark:text-blue-300">
                {{ (subtotal() - deposit()) | currencyFormat }}
              </span>
            </div>
          }
        </div>
      </section>

      <!-- Delivery info -->
      <section
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ 'delivery' | translate }}
        </h2>
        <div class="space-y-4">
          <div class="flex gap-3">
            @for (type of deliveryTypes; track type) {
              <button
                type="button"
                (click)="setDeliveryType(type)"
                class="flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
                [class]="deliveryType() === type
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                  : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'"
              >
                {{ type }}
              </button>
            }
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ 'deliveryDate' | translate }}
              </label>
              <input
                type="date"
                formControlName="deliveryDate"
                class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ 'deliveryTime' | translate }}
              </label>
              <input
                type="time"
                formControlName="deliveryTime"
                class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ 'notes' | translate }} <span class="text-xs">({{ 'optional' | translate }})</span>
            </label>
            <textarea
              formControlName="notes"
              rows="2"
              [placeholder]="'notesPlaceholder' | translate"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            ></textarea>
          </div>
        </div>
      </section>

      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ 'total' | translate }}</p>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-300">
            {{ subtotal() | currencyFormat }}
          </p>
        </div>
        <app-button type="submit" (clickEvent)="onSave()" [disabled]="form.invalid || draftItems().length === 0">
          {{ isEditing() ? ('updateOrder' | translate) : ('createOrder' | translate) }}
        </app-button>
      </div>
    </form>
  `,
})
export class OrderFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly productsService = inject(ProductsService);
  private readonly toastService = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly deliveryTypes: DeliveryType[] = ['pickup', 'delivery'];
  readonly draftItems = signal<DraftItem[]>([]);
  readonly deliveryType = signal<DeliveryType>('pickup');

  private readonly depositControl = () => this.form.get('deposit')?.value ?? 0;
  protected readonly deposit = () => Math.max(0, this.depositControl());

  private readonly orderId: string | null = this.route.snapshot.paramMap.get('id');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    phone: [''],
    deliveryDate: ['', [Validators.required]],
    deliveryTime: ['', [Validators.required]],
    notes: [''],
    deposit: [0],
  });

  constructor() {
    if (this.orderId) {
      const order = this.ordersService.getById(this.orderId);
      if (order) {
        this.form.patchValue({
          name: order.customer.name,
          phone: order.customer.phone ?? '',
          deliveryDate: order.deliveryDate.toString().slice(0, 10),
          deliveryTime: order.deliveryTime,
          notes: order.notes ?? '',
          deposit: order.deposit ?? 0,
        });
        this.deliveryType.set(order.deliveryType);
        this.draftItems.set(
          order.items.map((item) => ({ ...item, tempQuantity: item.quantity })),
        );
      }
    }
  }

  protected readonly activeProducts = () =>
    this.productsService.getActive().sort((a, b) => a.name.localeCompare(b.name));

  protected readonly subtotal = () => orderSubtotal(this.draftItems());

  isEditing(): boolean {
    return this.orderId !== null;
  }

  addItem(product: { id: string; name: string; basePrice: number }): void {
    this.draftItems.update((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, tempQuantity: item.tempQuantity + 1 }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.basePrice,
          quantity: 1,
          tempQuantity: 1,
        },
      ];
    });
  }

  changeQty(item: DraftItem, delta: number): void {
    this.draftItems.update((current) =>
      current.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: Math.max(0, i.quantity + delta) }
          : i,
      ),
    );
  }

  removeItem(productId: string): void {
    this.draftItems.update((current) => current.filter((i) => i.productId !== productId));
  }

  setCustomization(productId: string, value: string): void {
    this.draftItems.update((current) =>
      current.map((i) =>
        i.productId === productId ? { ...i, customizations: value } : i,
      ),
    );
  }

  setDeliveryType(type: DeliveryType): void {
    this.deliveryType.set(type);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const items = this.draftItems()
      .filter((item) => item.quantity > 0)
      .map(({ productId, productName, quantity, unitPrice, customizations }) => ({
        productId,
        productName,
        quantity,
        unitPrice,
        customizations,
      }));
    if (items.length === 0) {
      this.toastService.error(this.i18n.translate('atLeastOneItem'));
      return;
    }
    const input = {
      customer: {
        name: value.name.trim(),
        phone: value.phone.trim() || undefined,
      },
      items,
      deliveryType: this.deliveryType(),
      deliveryDate: new Date(value.deliveryDate + 'T' + (value.deliveryTime || '12:00')),
      deliveryTime: value.deliveryTime,
      notes: value.notes.trim() || undefined,
      deposit: Math.max(0, value.deposit) || undefined,
    };
    if (this.orderId) {
      this.ordersService.updateOrder(this.orderId, input);
      this.toastService.success(this.i18n.translate('orderUpdated'));
    } else {
      this.ordersService.createOrder(input);
      this.toastService.success(this.i18n.translate('orderCreated'));
    }
    this.router.navigate(['/orders']);
  }
}
