import { Injectable, signal } from '@angular/core';
import { Language } from '../../models/enums';
import { TRANSLATIONS, TranslationDict } from '../i18n/translations';

/**
 * Lightweight runtime i18n. Loads translations from in-memory dictionaries,
 * which works fully offline without HTTP requests.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly currentLanguage = signal<Language>('en');

  get translations(): TranslationDict {
    return TRANSLATIONS[this.currentLanguage()];
  }

  setLanguage(language: Language): void {
    this.currentLanguage.set(language);
  }

  translate(key: string, params?: Record<string, string | number>): string {
    let text = this.translations[key] ?? key;
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        text = text.replaceAll(`{{${param}}}`, String(value));
      }
    }
    return text;
  }
}