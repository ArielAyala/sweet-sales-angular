import { startOfWeek, startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export type ReportPeriod = 'today' | 'week' | 'month' | 'custom';

export function formatDate(
  date: Date,
  pattern = 'MMM d, yyyy',
  lang: 'en' | 'es' = 'en',
): string {
  return format(date, pattern, { locale: lang === 'es' ? es : enUS });
}

export function formatTime(date: Date, lang: 'en' | 'es' = 'en'): string {
  return format(date, 'HH:mm', { locale: lang === 'es' ? es : enUS });
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getRangeForPeriod(
  period: ReportPeriod,
  custom?: { start: Date; end: Date },
): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfDay(now) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'custom':
      return custom
        ? { start: startOfDay(custom.start), end: endOfDay(custom.end) }
        : { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
  }
}