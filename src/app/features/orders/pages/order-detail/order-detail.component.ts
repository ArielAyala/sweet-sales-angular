import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { OrdersService } from '../../services/orders.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Order, orderSubtotal, orderTotal, orderBalance } from '../../../../models/order.model';
import { OrderStatus } from '../../../../models/enums';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    CurrencyFormatPipe,
    DateFormatPipe,
  ],
  template: `
    <div class="mx-auto max-w-lg space-y-6">
      @if (order() === undefined) {
        <app-empty-state [title]="'noOrders' | translate">
          <span icon><app-icon name="cart" class="size-8" /></span>
        </app-empty-state>
      } @else {
        @let current = order()!;

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ 'orderNumber' | translate }}{{ current.orderNumber }}
            </h1>
            <span
              class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
              [class]="statusBadgeClass(current.status)"
            >
              {{ current.status | translate }}
            </span>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              (click)="share()"
              class="flex size-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              [attr.aria-label]="'share' | translate"
            >
              <app-icon name="share" class="size-5" />
            </button>
            <a
              [routerLink]="['/orders', current.id, 'edit']"
              class="flex size-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              [attr.aria-label]="'edit' | translate"
            >
              <app-icon name="edit" class="size-5" />
            </a>
            <button
              type="button"
              (click)="deleteConfirm.set(true)"
              class="flex size-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              [attr.aria-label]="'delete' | translate"
            >
              <app-icon name="delete" class="size-5" />
            </button>
          </div>
        </div>

        <section
          class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {{ 'customer' | translate }}
          </h2>
          <div class="flex items-center gap-3">
            <span class="flex size-11 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
              <app-icon name="user" class="size-5" />
            </span>
            <div>
              <p class="font-semibold text-gray-900 dark:text-gray-100">
                {{ current.customer.name }}
              </p>
              @if (current.customer.phone) {
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ current.customer.phone }}
                </p>
              }
            </div>
          </div>
        </section>

        <section
          class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ 'items' | translate }}
          </h2>
          <div class="space-y-3">
            @for (item of current.items; track item.productId) {
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ item.productName }} <span class="text-gray-500">×{{ item.quantity }}</span>
                  </p>
                  @if (item.customizations) {
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.customizations }}</p>
                  }
                </div>
                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ item.quantity * item.unitPrice | currencyFormat }}
                </span>
              </div>
            }
          </div>
          <div class="mt-4 space-y-1 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{{ 'subtotal' | translate }}</span>
              <span>{{ subtotal(current) | currencyFormat }}</span>
            </div>
            @if (current.priceAdjustment) {
              <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{{ 'adjustmentReason' | translate }}</span>
                <span>{{ current.priceAdjustment.reason }}</span>
              </div>
            }
            <div class="flex justify-between text-base font-bold text-gray-900 dark:text-gray-100">
              <span>{{ 'total' | translate }}</span>
              <span class="text-primary-600 dark:text-primary-300">{{ total(current) | currencyFormat }}</span>
            </div>
           </div>
         </section>

         <section
           class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
         >
           <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
             {{ 'paymentMethod' | translate }}
           </h2>
           <p class="font-medium text-gray-900 dark:text-gray-100">
             {{ (current.paymentMethod || 'cash') | translate }}
           </p>
         </section>

         <!-- Deposit (partial payment) -->
         @if (current.deposit && current.deposit > 0) {
           <section
             class="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10"
           >
             <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
               {{ 'deposit' | translate }}
             </h2>
             <div class="space-y-2 text-sm">
               <div class="flex justify-between">
                 <span class="text-gray-700 dark:text-gray-300">{{ 'total' | translate }}</span>
                 <span class="font-semibold text-gray-900 dark:text-gray-100">{{ total(current) | currencyFormat }}</span>
               </div>
               <div class="flex justify-between">
                 <span class="text-gray-700 dark:text-gray-300">{{ 'depositAmount' | translate }}</span>
                 <span class="font-semibold text-blue-600 dark:text-blue-300">{{ current.deposit | currencyFormat }}</span>
               </div>
                <div class="border-t border-blue-200 pt-2 dark:border-blue-500/30">
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-900 dark:text-gray-100">{{ 'balance' | translate }}</span>
                    <span class="text-lg font-bold text-blue-600 dark:text-blue-300">
                      {{ balance(current) | currencyFormat }}
                    </span>
                  </div>
                </div>
             </div>
           </section>
         }

         <section
           class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
         >
           <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
             {{ 'delivery' | translate }}
          </h2>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">{{ 'deliveryType' | translate }}</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                {{ current.deliveryType | translate }}
              </p>
            </div>
            @if (current.deliveryDate || current.deliveryTime) {
              <div>
                <p class="text-gray-500 dark:text-gray-400">{{ 'deliveryDate' | translate }}</p>
                <p class="font-medium text-gray-900 dark:text-gray-100">
                  @if (current.deliveryDate && current.deliveryTime) {
                    {{ current.deliveryDate | dateFormat }} · {{ current.deliveryTime }}
                  } @else if (current.deliveryDate) {
                    {{ current.deliveryDate | dateFormat }}
                  } @else {
                    {{ current.deliveryTime }}
                  }
                </p>
              </div>
            }
            @if (current.notes) {
              <div class="col-span-2">
                <p class="text-gray-500 dark:text-gray-400">{{ 'notes' | translate }}</p>
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ current.notes }}</p>
              </div>
            }
            <div>
              <p class="text-gray-500 dark:text-gray-400">{{ 'createdOn' | translate }}</p>
              <p class="font-medium text-gray-900 dark:text-gray-100">{{ current.createdAt | dateFormat }}</p>
            </div>
            @if (current.completedAt) {
              <div>
                <p class="text-gray-500 dark:text-gray-400">{{ 'completedAt' | translate }}</p>
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ current.completedAt | dateFormat }}</p>
              </div>
            }
          </div>
        </section>

        <div class="flex gap-3">
          @if (current.status === 'pending') {
            <app-button class="flex-1" variant="secondary" (clickEvent)="openAdjustPrice()">
              <app-icon name="check" class="size-4" />
              {{ 'markCompleted' | translate }}
            </app-button>
          } @else {
            <app-button class="flex-1" variant="ghost" (clickEvent)="reopen()">
              {{ 'pending' | translate }}
            </app-button>
          }
        </div>
      }

       <!-- Price adjustment modal -->
       @if (adjustPriceOpen()) {
         <app-modal [title]="'markCompletedTitle' | translate" (closeEvent)="adjustPriceOpen.set(false)">
           <div class="space-y-4">
             <p class="text-sm text-gray-600 dark:text-gray-300">{{ 'adjustPriceHint' | translate }}</p>
             
             <!-- Current order summary -->
             @let current = order()!;
             <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
               <div class="space-y-1 text-sm">
                 <div class="flex justify-between text-gray-600 dark:text-gray-400">
                   <span>{{ 'subtotal' | translate }}</span>
                   <span>{{ subtotal(current) | currencyFormat }}</span>
                 </div>
                 @if (current.deposit && current.deposit > 0) {
                   <div class="flex justify-between text-blue-600 dark:text-blue-300">
                     <span>{{ 'depositAmount' | translate }}</span>
                     <span>{{ current.deposit | currencyFormat }}</span>
                   </div>
                 }
               </div>
             </div>

             <div>
               <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                 {{ 'adjustPrice' | translate }}
               </label>
               <input
                 type="number"
                 inputmode="decimal"
                 [value]="adjustedAmount()"
                 (input)="onAmountInput($any($event.target).value)"
                 class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
               />
               @if (current.deposit && current.deposit > 0) {
                 <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                   {{ 'balance' | translate }}: {{ (adjustedAmount() - current.deposit) | currencyFormat }}
                 </p>
               }
             </div>
             <div>
               <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                 {{ 'adjustmentReason' | translate }} <span class="text-xs">({{ 'optional' | translate }})</span>
               </label>
               <input
                 type="text"
                 [value]="adjustmentReason()"
                 (input)="adjustmentReason.set($any($event.target).value)"
                 class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
               />
            </div>
            <div class="flex justify-end gap-3">
              <app-button variant="ghost" (clickEvent)="adjustPriceOpen.set(false)">
                {{ 'cancel' | translate }}
              </app-button>
              <app-button (clickEvent)="complete()">
                {{ 'confirm' | translate }}
              </app-button>
            </div>
          </div>
        </app-modal>
      }

      <app-confirm-dialog
        [open]="deleteConfirm()"
        [title]="'delete' | translate"
        [message]="'deleteOrderConfirm' | translate"
        [confirmLabel]="'delete' | translate"
        (confirmEvent)="deleteOrder()"
        (cancelEvent)="deleteConfirm.set(false)"
      />
    </div>
  `,
})
export class OrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly toastService = inject(ToastService);
  private readonly currencyService = inject(CurrencyService);
  private readonly i18n = inject(I18nService);

  readonly order = signal<Order | null>(null);
  readonly adjustPriceOpen = signal(false);
  readonly deleteConfirm = signal(false);
  readonly adjustedAmount = signal<number>(0);
  readonly adjustmentReason = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.order.set(this.ordersService.getById(id) ?? null);
    }
    const initial = this.order();
    if (initial) {
      this.adjustedAmount.set(orderTotal(initial));
    }
  }

  subtotal(order: Order): number {
    return orderSubtotal(order.items);
  }

  total(order: Order): number {
    return orderTotal(order);
  }

  balance(order: Order): number {
    return orderBalance(order);
  }

  statusBadgeClass(status: OrderStatus): string {
    return status === 'completed'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
  }

  openAdjustPrice(): void {
    const current = this.order();
    if (current) {
      this.adjustedAmount.set(orderTotal(current));
    }
    this.adjustPriceOpen.set(true);
  }

  onAmountInput(value: string): void {
    this.adjustedAmount.set(Number(value));
  }

  complete(): void {
    const current = this.order();
    if (!current) {
      return;
    }
    const amount = Number(this.adjustedAmount());
    if (Number.isNaN(amount) || amount < 0) {
      this.toastService.error(this.i18n.translate('adjustPriceInvalid'));
      return;
    }
    this.ordersService.completeOrder(current.id, {
      adjustedAmount: amount,
      reason: this.adjustmentReason().trim() || undefined,
    });
    this.order.set(this.ordersService.getById(current.id) ?? null);
    this.adjustPriceOpen.set(false);
    this.toastService.success(this.i18n.translate('orderUpdated'));
  }

  reopen(): void {
    const current = this.order();
    if (current) {
      this.ordersService.reopenOrder(current.id);
      this.order.set(this.ordersService.getById(current.id) ?? null);
      this.toastService.info(this.i18n.translate('orderUpdated'));
    }
  }

  share(): void {
    const current = this.order();
    if (!current) {
      return;
    }
    const text = this.ordersService.shareSummary(
      current,
      (value) => this.currencyService.format(value),
    );
    if (navigator.share) {
      navigator
        .share({ text })
        .catch(() => undefined);
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => this.toastService.success(this.i18n.translate('summaryCopied')))
        .catch(() => undefined);
    }
  }

  deleteOrder(): void {
    const current = this.order();
    if (current) {
      this.ordersService.deleteOrder(current.id);
      this.toastService.info(this.i18n.translate('orderDeleted'));
    }
    this.router.navigate(['/orders']);
  }
}
