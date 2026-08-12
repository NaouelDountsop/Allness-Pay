export interface Transaction {
  id: string;
  label: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
}

export interface QuickContact {
  id: string;
  name: string;
  avatarUrl?: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    label: 'Transfert reçu de Jean P.',
    date: '22 Juil 2026, 14:30',
    amount: 150000,
    type: 'credit',
  },
  {
    id: '2',
    label: 'Paiement à Carrefour Market',
    date: '21 Juil 2026, 09:12',
    amount: -25000,
    type: 'debit',
  },
  {
    id: '3',
    label: 'Recharge MTN Mobile Money',
    date: '20 Juil 2026, 18:05',
    amount: -50000,
    type: 'debit',
  },
  {
    id: '4',
    label: 'Dépôt sur dépôt partenaire',
    date: '19 Juil 2026, 11:40',
    amount: 100000,
    type: 'credit',
  },
  {
    id: '5',
    label: 'Transfert à Marie L.',
    date: '17 Juil 2026, 08:15',
    amount: -75000,
    type: 'debit',
  },
];

export const mockContacts: QuickContact[] = [
  { id: '1', name: 'Sarah' },
  { id: '2', name: 'James' },
  { id: '3', name: 'Marcus' },
];

export const mockSpendingChart = [
  { month: 'Jan', value: 40 },
  { month: 'Fev', value: 55 },
  { month: 'Mar', value: 35 },
  { month: 'Avr', value: 60 },
  { month: 'Mai', value: 45 },
  { month: 'Juin', value: 90 },
];

export const mockSpendingBreakdown = [
  { label: 'Shopping', percent: 42, color: '#1E8449' },
  { label: 'Housing', percent: 28, color: '#0F2E33' },
  { label: 'Other', percent: 30, color: '#D1D5DB' },
];
