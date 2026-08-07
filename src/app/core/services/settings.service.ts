import { Injectable, computed, effect, signal } from '@angular/core';
import { Language, ThemeMode } from '../../models/enums';
import { AppSettings } from '../../models/settings.model';
import { DEFAULT_CURRENCY_CODE } from '../constants/currencies.const';
import { STORAGE_KEYS } from '../constants/storage-keys.const';
import { StorageService } from './storage.service';
import { I18nService } from './i18n.service';

export const DEFAULT_BUSINESS_NAME = 'Sweet Sales';

const DEFAULT_SETTINGS: AppSettings = {
  businessName: DEFAULT_BUSINESS_NAME,
  language: 'en',
  currencyCode: DEFAULT_CURRENCY_CODE,
  theme: 'light',
};

/**
 * Single source of truth for application settings (business name, language, currency, theme).
 * Persists the whole settings object under one storage key.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<AppSettings>(DEFAULT_SETTINGS);

  constructor(
    private readonly storage: StorageService,
    private readonly i18n: I18nService,
  ) {
    this.settings.set(this.loadSettings());
    this.applyLanguage(this.settings().language);
    this.i18n.setLanguage(this.settings().language);

    // Keep the DOM class in sync with the theme signal for the whole session.
    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  readonly businessName = computed(() => this.settings().businessName || DEFAULT_BUSINESS_NAME);
  readonly language = computed(() => this.settings().language);
  readonly currencyCode = computed(() => this.settings().currencyCode);
  readonly theme = computed(() => this.settings().theme);

  setBusinessName(businessName: string): void {
    const name = businessName.trim() || DEFAULT_BUSINESS_NAME;
    this.updateSettings({ businessName: name });
  }

  setLanguage(language: Language): void {
    this.updateSettings({ language });
    this.applyLanguage(language);
    this.i18n.setLanguage(language);
  }

  setCurrency(currencyCode: string): void {
    this.updateSettings({ currencyCode });
  }

  setTheme(theme: ThemeMode): void {
    this.updateSettings({ theme });
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  private updateSettings(patch: Partial<AppSettings>): void {
    this.settings.update((current) => ({ ...current, ...patch }));
    this.storage.set(STORAGE_KEYS.settings, this.settings());
  }

  private loadSettings(): AppSettings {
    const stored = this.storage.get<Partial<AppSettings> | null>(
      STORAGE_KEYS.settings,
      null,
    );
    const merged = { ...DEFAULT_SETTINGS, ...stored };
    if (!merged.businessName?.trim()) {
      merged.businessName = DEFAULT_BUSINESS_NAME;
    }
    return merged;
  }

  private applyTheme(theme: ThemeMode): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  private applyLanguage(language: Language): void {
    document.documentElement.lang = language;
  }
}
