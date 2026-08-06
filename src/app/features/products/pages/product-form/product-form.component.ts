import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ProductsService } from '../../services/products.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductCategory, PRODUCT_CATEGORIES } from '../../../../models/enums';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, ButtonComponent, IconComponent],
  template: `
    <div class="mx-auto max-w-lg space-y-6">
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="router.navigate(['/products'])"
          class="flex size-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          [attr.aria-label]="'back' | translate"
        >
          <app-icon name="back" class="size-5" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ isEditing() ? ('editProduct' | translate) : ('newProduct' | translate) }}
        </h1>
      </div>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ 'productName' | translate }}
          </label>
          <input
            id="name"
            type="text"
            formControlName="name"
            [placeholder]="'productNamePlaceholder' | translate"
            class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          @if (form.controls.name.invalid && form.controls.name.touched) {
            <p class="mt-1 text-xs text-red-600">{{ 'productNameRequired' | translate }}</p>
          }
        </div>

        <div>
          <label for="category" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ 'category' | translate }}
          </label>
          <select
            id="category"
            formControlName="category"
            class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ categoryLabel(cat) | translate }}</option>
            }
          </select>
        </div>

        <div>
          <label for="price" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ 'basePrice' | translate }}
          </label>
          <input
            id="price"
            type="number"
            formControlName="basePrice"
            inputmode="decimal"
            min="0"
            step="0.01"
            class="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          @if (form.controls.basePrice.invalid && form.controls.basePrice.touched) {
            <p class="mt-1 text-xs text-red-600">{{ 'priceInvalid' | translate }}</p>
          }
        </div>

        <div>
          <label for="description" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ 'description' | translate }}
          </label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            [placeholder]="'descriptionPlaceholder' | translate"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <app-button variant="ghost" (clickEvent)="router.navigate(['/products'])">
            {{ 'cancel' | translate }}
          </app-button>
          <app-button type="submit">
            {{ isEditing() ? ('saveProduct' | translate) : ('saveProduct' | translate) }}
          </app-button>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly toastService = inject(ToastService);
  private readonly i18n = inject(I18nService);

  readonly categories = PRODUCT_CATEGORIES;
  private readonly productId: string | null = this.route.snapshot.paramMap.get('id');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    category: ['cakes' as ProductCategory, [Validators.required]],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  constructor() {
    if (this.productId) {
      const product = this.productsService.getById(this.productId);
      if (product) {
        this.form.patchValue({
          name: product.name,
          category: product.category,
          basePrice: product.basePrice,
          description: product.description,
        });
      }
    }
  }

  isEditing(): boolean {
    return this.productId !== null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const input = {
      name: value.name.trim(),
      category: value.category,
      basePrice: value.basePrice,
      description: value.description.trim(),
    };
    if (this.productId) {
      this.productsService.updateProduct(this.productId, input);
      this.toastService.success(this.i18n.translate('productUpdated'));
    } else {
      this.productsService.addProduct(input);
      this.toastService.success(this.i18n.translate('productCreated'));
    }
    this.router.navigate(['/products']);
  }

  categoryLabel(cat: ProductCategory): string {
    return `category${cat.charAt(0).toUpperCase()}${cat.slice(1)}`;
  }
}