import { Routes } from '@angular/router';
import { ProductsListPage } from './pages/products-list/products-list.component';
import { ProductFormPage } from './pages/product-form/product-form.component';

export const PRODUCTS_ROUTES: Routes = [
  { path: '', component: ProductsListPage },
  { path: 'new', component: ProductFormPage },
  { path: ':id/edit', component: ProductFormPage },
];