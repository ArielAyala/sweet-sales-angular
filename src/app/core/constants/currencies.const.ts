import { Currency } from '../../models/settings.model';

/**
 * Supported currencies. PYG (Guaraní) is the default currency.
 */
export const CURRENCIES: Currency[] = [
  { code: 'PYG', symbol: '₲', name: 'Guaraní (PYG)', decimals: 0 },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', decimals: 2 },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso (ARS)', decimals: 2 },
];

export const DEFAULT_CURRENCY_CODE = 'PYG';