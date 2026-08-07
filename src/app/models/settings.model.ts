import { Language, ThemeMode } from './enums';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface AppSettings {
  businessName: string;
  language: Language;
  currencyCode: string;
  theme: ThemeMode;
}