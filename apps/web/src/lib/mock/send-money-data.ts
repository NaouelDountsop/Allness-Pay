export interface RecentTransfer {
  id: string;
  name: string;
  location: string;
  amount: number;
  currency: string;
  date: string;
}

export const mockRecentTransfers: RecentTransfer[] = [
  {
    id: '1',
    name: "Samuel Eto'o",
    location: 'Douala · Il y a 2 jours',
    amount: 500,
    currency: 'CAD',
    date: '',
  },
  {
    id: '2',
    name: 'Francis Ngannou',
    location: 'Yaoundé · Il y a 4 jours',
    amount: 2450,
    currency: 'CAD',
    date: '',
  },
  {
    id: '3',
    name: 'Pascal Siakam',
    location: 'Douala · Il y a 1 sem.',
    amount: 120,
    currency: 'CAD',
    date: '',
  },
];

// Table de conversion des devises (base: 1 unité de la devise source → devise cible)
export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  CAD: { XAF: 442.15, XOF: 442.15, EUR: 0.68 },
  EUR: { CAD: 1.47, XAF: 654.50, XOF: 654.50 },
  XAF: { CAD: 0.00226, EUR: 0.00153, XOF: 1.00 },
  XOF: { CAD: 0.00226, EUR: 0.00153, XAF: 1.00 },
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  CAD: 'CA$',
  EUR: '€',
  XAF: 'FCFA',
  XOF: 'CFA',
};

export const CURRENCY_LABELS: Record<string, string> = {
  CAD: 'Dollar canadien',
  EUR: 'Euro',
  XAF: 'Franc CFA (CEMAC)',
  XOF: 'Franc CFA (UEMOA)',
};

export function getExchangeRate(from: string, to: string): number {
  if (from === to) return 1;
  return EXCHANGE_RATES[from]?.[to] ?? 1;
}
