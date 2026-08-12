export interface ServiceCategory {
  key: string;
  label: string;
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
  amount: number;
}

export const serviceCategories: ServiceCategory[] = [
  { key: 'electricity', label: 'Électricité', icon: 'electricity', favorite: true },
  { key: 'water', label: 'Eau', icon: 'water' },
  { key: 'telecom', label: 'Télécom', icon: 'telecom' },
  { key: 'tv', label: 'Télévision', icon: 'tv' },
  { key: 'education', label: 'Éducation', icon: 'education' },
  { key: 'transport', label: 'Transport', icon: 'transport' },
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
    reference: '01/02/2026',
    date: '',
    amount: 25400,
  },
  {
    id: '2',
    label: 'Crédit Orange - 690123456',
    reference: '',
    date: '',
    amount: 5000,
  },
];
