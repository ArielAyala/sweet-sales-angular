import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

/**
 * Formats a numeric value as the active currency.
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true,
  pure: false,
})
export class CurrencyFormatPipe implements PipeTransform {
  constructor(private readonly currencyService: CurrencyService) {}

  transform(value: number | null | undefined): string {
    return this.currencyService.format(value ?? 0);
  }
}