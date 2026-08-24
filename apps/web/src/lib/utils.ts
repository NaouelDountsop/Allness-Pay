import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency helpers ───────────────────────────────────────────────

const CURRENCY_DISPLAY: Record<string, string> = {
  XAF: 'FCFA',
  XOF: 'CFA',
  CAD: 'CA$',
  EUR: '€',
  USD: '$',
  GBP: '£',
};

export function getCurrencySymbol(currency?: string | null): string {
  return CURRENCY_DISPLAY[currency ?? 'XAF'] ?? currency ?? 'FCFA';
}

export function formatAmount(amount: number, currency?: string): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(amount);
  return `${formatted} ${getCurrencySymbol(currency)}`;
}

export function formatAmountCompact(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

// ─── Date helpers ───────────────────────────────────────────────────

export function formatDateShort(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLong(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateNumeric(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `Il y a ${diffD} j`;
}

// ─── Frequency helpers ──────────────────────────────────────────────

export function getFrequencyLabel(freq: string, t?: (key: string) => string): string {
  const map: Record<string, string> = {
    WEEKLY: t ? t('tontines.weekly') : 'Hebdomadaire',
    BIWEEKLY: t ? t('tontines.biweekly') : 'Bimensuelle',
    MONTHLY: t ? t('tontines.monthly') : 'Mensuelle',
  };
  return map[freq] ?? freq;
}
