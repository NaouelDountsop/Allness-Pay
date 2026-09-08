export interface ServiceCategory {
  key: string;
  label: string;
  description: string;
  icon: 'electricity' | 'water' | 'telecom' | 'tv' | 'education' | 'transport';
  favorite?: boolean;
}

export interface Biller {
  key: string;
  name: string;
  logoUrl: string;
  category: string;
}

export interface RecentPayment {
  id: string;
  label: string;
  reference: string;
  date: string;
  time: string;
  amount: number;
  currency?: string;
  status: 'paid' | 'pending';
}

export const serviceCategories: ServiceCategory[] = [
  {
    key: 'electricity',
    label: 'Électricité',
    description: "Payez vos factures d'électricité",
    icon: 'electricity',
    favorite: true,
  },
  {
    key: 'water',
    label: 'Eau',
    description: "Payez vos factures d'eau",
    icon: 'water',
  },
  {
    key: 'telecom',
    label: 'Télécom',
    description: 'Crédit téléphonique et abonnements',
    icon: 'telecom',
  },
  {
    key: 'tv',
    label: 'Télévision',
    description: 'Abonnements TV et bouquets',
    icon: 'tv',
  },
  {
    key: 'education',
    label: 'Éducation',
    description: "Frais de scolarité et examens",
    icon: 'education',
  },
  {
    key: 'transport',
    label: 'Transport',
    description: 'Billets, cartes et abonnements',
    icon: 'transport',
  },
];

export const billersByCategory: Record<string, Biller[]> = {
  electricity: [
    { key: 'socadel', name: 'SOCADEL', logoUrl: '/billers/socadel.png', category: 'electricity' },
  ],
};

export const mockRecentPayments: RecentPayment[] = [
  {
    id: '1',
    label: 'Facture ENEO - N° 2059485',
    reference: '01/02/2026 · 14:32',
    date: '01/02/2026',
    time: '14:32',
    amount: 25400,
    currency: 'XAF',
    status: 'paid',
  },
  {
    id: '2',
    label: 'Recharge Orange - 6 000 FCFA',
    reference: '30/01/2026 · 09:15',
    date: '30/01/2026',
    time: '09:15',
    amount: 6000,
    currency: 'XAF',
    status: 'paid',
  },
  {
    id: '3',
    label: 'Abonnement Canal+',
    reference: '28/01/2026 · 16:20',
    date: '28/01/2026',
    time: '16:20',
    amount: 15000,
    currency: 'XAF',
    status: 'pending',
  },
];
