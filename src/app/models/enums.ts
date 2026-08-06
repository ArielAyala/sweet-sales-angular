/**
 * Application-wide enumerations and union types.
 */

export type OrderStatus = 'pending' | 'completed';
export type DeliveryType = 'pickup' | 'delivery';
export type ProductCategory = 'cakes' | 'cupcakes' | 'cookies' | 'other';
export type ThemeMode = 'light' | 'dark';
export type Language = 'es' | 'en';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'cakes',
  'cupcakes',
  'cookies',
  'other',
];