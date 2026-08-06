import { Injectable, signal } from '@angular/core';
import { Product, ProductInput } from '../../../models/product.model';
import { ProductCategory } from '../../../models/enums';
import { StorageService } from '../../../core/services/storage.service';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys.const';

/**
 * Manages product CRUD with signal-based state persisted to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  readonly products = signal<Product[]>([]);

  constructor(private readonly storage: StorageService) {
    this.products.set(this.storage.get<Product[]>(STORAGE_KEYS.products, []));
  }

  getById(id: string): Product | undefined {
    return this.products().find((p) => p.id === id);
  }

  getActive(): Product[] {
    return this.products().filter((p) => p.isActive);
  }

  byCategory(category: ProductCategory): Product[] {
    return this.products().filter((p) => p.category === category);
  }

  search(query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.products();
    }
    return this.products().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }

  addProduct(input: ProductInput): Product {
    const now = new Date();
    const product: Product = {
      id: crypto.randomUUID(),
      ...input,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.products.update((current) => [...current, product]);
    this.persist();
    return product;
  }

  updateProduct(id: string, input: ProductInput): void {
    this.products.update((current) =>
      current.map((p) =>
        p.id === id ? { ...p, ...input, updatedAt: new Date() } : p,
      ),
    );
    this.persist();
  }

  toggleActive(id: string): void {
    this.products.update((current) =>
      current.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive, updatedAt: new Date() } : p,
      ),
    );
    this.persist();
  }

  deleteProduct(id: string): void {
    this.products.update((current) => current.filter((p) => p.id !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.products, this.products());
  }
}