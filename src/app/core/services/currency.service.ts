import { Injectable, computed } from '@angular/core';
import { CURRENCIES } from '../constants/currencies.const';
import { Currency } from '../../models/settings.model';
import { SettingsService } from './settings.service';

/**
 * Formats numeric amounts using the active currency and locale.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  readonly currencies = CURRENCIES;

  readonly currency = computed<Currency>(() => {
    const code = this.settings.currencyCode();
    return this.currencies.find((c) => c.code === code) ?? this.currencies[0];
  });

  constructor(private readonly settings: SettingsService) {}

  format(value: number): string {
    const currency = this.currency();
    const locale = this.settings.language() === 'es' ? 'es-PY' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(value);
  }

  getSymbol(): string {
    return this.currency().symbol;
  }
}