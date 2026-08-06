import { ProductCategory } from './enums';

export interface ProductSales {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface CategorySales {
  category: ProductCategory;
  revenue: number;
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  bestSelling: ProductSales[];
  byCategory: CategorySales[];
}