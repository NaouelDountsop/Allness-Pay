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

export const EXCHANGE_RATE_CAD_XAF = 442.15;
