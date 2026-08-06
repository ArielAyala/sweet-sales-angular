import { Language } from '../../models/enums';
import { en } from './en';
import { es } from './es';

/**
 * Flat key-value translation dictionary.
 */
export type TranslationDict = Record<string, string>;

const TRANSLATIONS: Record<Language, TranslationDict> = { en, es };

export type TranslationKey = keyof typeof en;

export { TRANSLATIONS };
export type { Language };