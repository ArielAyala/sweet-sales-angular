import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

/**
 * Formats a date using the active language locale.
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
  pure: false,
})
export class DateFormatPipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) {}

  transform(value: Date | string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
    const locale = this.i18n.currentLanguage() === 'es' ? 'es-PY' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}