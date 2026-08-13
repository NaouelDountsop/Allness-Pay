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
  CAD: { XAF: 442.15, XOF: 442.15, EUR: 0.68, USD: 0.74, GBP: 0.58, GHS: 8.92, NGN: 1145.50, KES: 98.30, ZAR: 13.85, RWF: 1050.00, CDF: 2100.00, GNF: 5650.00 },
  EUR: { CAD: 1.47, XAF: 654.50, XOF: 654.50, USD: 1.09, GBP: 0.85, GHS: 13.12, NGN: 1685.00, KES: 144.60, ZAR: 20.37, RWF: 1545.00, CDF: 3090.00, GNF: 8310.00 },
  USD: { CAD: 1.35, XAF: 600.00, XOF: 600.00, EUR: 0.92, GBP: 0.72, GHS: 12.05, NGN: 1545.00, KES: 132.60, ZAR: 18.70, RWF: 1415.00, CDF: 2830.00, GNF: 7610.00 },
  XAF: { CAD: 0.00226, EUR: 0.00153, USD: 0.00167, GBP: 0.00120, XOF: 1.00, GHS: 0.0201, NGN: 2.58, KES: 0.222, ZAR: 0.0314, RWF: 2.38, CDF: 4.75, GNF: 12.70 },
  XOF: { CAD: 0.00226, EUR: 0.00153, USD: 0.00167, GBP: 0.00120, XAF: 1.00, GHS: 0.0201, NGN: 2.58, KES: 0.222, ZAR: 0.0314, RWF: 2.38, CDF: 4.75, GNF: 12.70 },
  GBP: { CAD: 1.73, EUR: 1.18, USD: 1.39, XAF: 780.00, XOF: 780.00, GHS: 15.60, NGN: 2000.00, KES: 171.00, ZAR: 24.10, RWF: 1825.00, CDF: 3650.00, GNF: 9800.00 },
  GHS: { CAD: 0.112, EUR: 0.076, USD: 0.083, XAF: 49.75, XOF: 49.75, GBP: 0.064, NGN: 128.50, KES: 11.03, ZAR: 1.56, RWF: 117.50, CDF: 235.00, GNF: 630.00 },
  NGN: { CAD: 0.000873, EUR: 0.000593, USD: 0.000647, XAF: 0.388, XOF: 0.388, GBP: 0.000500, GHS: 0.00778, KES: 0.0858, ZAR: 0.0121, RWF: 0.914, CDF: 1.83, GNF: 4.91 },
  KES: { CAD: 0.0102, EUR: 0.00691, USD: 0.00754, XAF: 4.50, XOF: 4.50, GBP: 0.00585, GHS: 0.0907, NGN: 11.66, ZAR: 0.141, RWF: 10.68, CDF: 21.35, GNF: 57.20 },
  ZAR: { CAD: 0.0722, EUR: 0.0491, USD: 0.0535, XAF: 31.85, XOF: 31.85, GBP: 0.0415, GHS: 0.641, NGN: 82.65, KES: 7.10, RWF: 75.80, CDF: 151.50, GNF: 405.50 },
  RWF: { CAD: 0.000952, EUR: 0.000647, USD: 0.000707, XAF: 0.420, XOF: 0.420, GBP: 0.000548, GHS: 0.00851, NGN: 1.09, KES: 0.0936, ZAR: 0.0132, CDF: 2.00, GNF: 5.35 },
  CDF: { CAD: 0.000476, EUR: 0.000324, USD: 0.000353, XAF: 0.210, XOF: 0.210, GBP: 0.000274, GHS: 0.00426, NGN: 0.547, KES: 0.0468, ZAR: 0.00660, RWF: 0.500, GNF: 2.68 },
  GNF: { CAD: 0.000177, EUR: 0.000120, USD: 0.000131, XAF: 0.0787, XOF: 0.0787, GBP: 0.000102, GHS: 0.00159, NGN: 0.204, KES: 0.0175, ZAR: 0.00247, RWF: 0.187, CDF: 0.373 },
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  CAD: 'CA$',
  EUR: '€',
  USD: '$',
  GBP: '£',
  XAF: 'FCFA',
  XOF: 'CFA',
  GHS: 'GH₵',
  NGN: '₦',
  KES: 'KSh',
  ZAR: 'R',
  RWF: 'FRw',
  CDF: 'FC',
  GNF: 'FG',
};

export const CURRENCY_LABELS: Record<string, string> = {
  CAD: 'Dollar canadien',
  EUR: 'Euro',
  USD: 'Dollar américain',
  GBP: 'Livre sterling',
  XAF: 'Franc CFA (CEMAC)',
  XOF: 'Franc CFA (UEMOA)',
  GHS: 'Cedi ghanéen',
  NGN: 'Naira nigérian',
  KES: 'Shilling kényan',
  ZAR: 'Rand sud-africain',
  RWF: 'Franc rwandais',
  CDF: 'Franc congolais',
  GNF: 'Franc guinéen',
};

export function getExchangeRate(from: string, to: string): number {
  if (from === to) return 1;
  return EXCHANGE_RATES[from]?.[to] ?? 1;
}
