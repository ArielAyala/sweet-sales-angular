import { Routes } from '@angular/router';
import { OrdersListPage } from './pages/orders-list/orders-list.component';
import { OrderFormPage } from './pages/order-form/order-form.component';
import { OrderDetailPage } from './pages/order-detail/order-detail.component';

export const ORDERS_ROUTES: Routes = [
  { path: '', component: OrdersListPage },
  { path: 'new', component: OrderFormPage },
  { path: ':id', component: OrderDetailPage },
  { path: ':id/edit', component: OrderFormPage },
];