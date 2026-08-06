import { TestBed } from '@angular/core/testing';
import { ProductsService } from './products.service';
import { ProductInput } from '../../../models/product.model';

function makeProduct(): ProductInput {
  return {
    name: 'Chocolate Cake',
    category: 'cakes',
    basePrice: 150000,
    description: 'Delicious',
  };
}

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsService);
  });

  it('starts empty', () => {
    expect(service.products()).toEqual([]);
  });

  it('adds a product with active status', () => {
    const product = service.addProduct(makeProduct());
    expect(service.products()).toHaveLength(1);
    expect(product.isActive).toBe(true);
    expect(service.getById(product.id)).toEqual(product);
  });

  it('updates a product', () => {
    const product = service.addProduct(makeProduct());
    service.updateProduct(product.id, { ...makeProduct(), name: 'Vanilla Cake' });
    expect(service.getById(product.id)?.name).toBe('Vanilla Cake');
  });

  it('toggles active status', () => {
    const product = service.addProduct(makeProduct());
    service.toggleActive(product.id);
    expect(service.getById(product.id)?.isActive).toBe(false);
    service.toggleActive(product.id);
    expect(service.getById(product.id)?.isActive).toBe(true);
  });

  it('deletes a product', () => {
    const product = service.addProduct(makeProduct());
    service.deleteProduct(product.id);
    expect(service.products()).toHaveLength(0);
  });

  it('filters by category and search', () => {
    service.addProduct(makeProduct());
    service.addProduct({ ...makeProduct(), name: 'Cookie', category: 'cookies' });
    expect(service.byCategory('cakes')).toHaveLength(1);
    expect(service.search('cookie')).toHaveLength(1);
    expect(service.search('')).toHaveLength(2);
  });

  it('persists to localStorage', () => {
    service.addProduct(makeProduct());
    const reloaded = TestBed.inject(ProductsService);
    expect(reloaded.products()).toHaveLength(1);
  });
});