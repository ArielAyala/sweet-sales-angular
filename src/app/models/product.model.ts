import { ProductCategory } from './enums';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInput {
  name: string;
  category: ProductCategory;
  basePrice: number;
  description: string;
}