export interface ServiceCategory {
  key: string;
  label: string;
  description: string;
  icon: 'electricity' | 'water' | 'internet' | 'tv' | 'airtime' | 'phone';
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
  provider?: string;
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
    description: "Payez votre facture d'électricité",
    icon: 'electricity',
    favorite: true,
  },
  {
    key: 'water',
    label: 'Eau',
    description: "Réglez votre facture d'eau",
    icon: 'water',
  },
  {
    key: 'internet',
    label: 'Internet',
    description: 'Payez votre abonnement',
    icon: 'internet',
  },
  {
    key: 'tv',
    label: 'TV / Canal+',
    description: 'Renouvelez votre abonnement',
    icon: 'tv',
  },
  {
    key: 'airtime',
    label: 'Airtime & Data',
    description: 'Rechargez un numéro',
    icon: 'airtime',
  },
  {
    key: 'phone',
    label: 'Téléphone',
    description: 'Payez vos services',
    icon: 'phone',
  },
];

export const billersByCategory: Record<string, Biller[]> = {
  electricity: [
    { key: 'eneo', name: 'ENEO', logoUrl: '/billers/eneo.png', category: 'electricity' },
    { key: 'socadel', name: 'SOCADEL', logoUrl: '/billers/socadel.png', category: 'electricity' },
  ],
  water: [
    { key: 'camwater', name: 'CAMWATER', logoUrl: '/billers/camwater.png', category: 'water' },
  ],
  internet: [
    { key: 'camtel', name: 'CAMTEL', logoUrl: '/billers/camtel.png', category: 'internet' },
  ],
  tv: [
    { key: 'canalplus', name: 'Canal+', logoUrl: '/billers/canalplus.png', category: 'tv' },
  ],
  airtime: [
    { key: 'mtn', name: 'MTN', logoUrl: '/billers/mtn.png', category: 'airtime' },
    { key: 'orange', name: 'Orange', logoUrl: '/billers/orange.png', category: 'airtime' },
  ],
  phone: [
    { key: 'mtn', name: 'MTN', logoUrl: '/billers/mtn.png', category: 'phone' },
    { key: 'orange', name: 'Orange', logoUrl: '/billers/orange.png', category: 'phone' },
  ],
};

export const mockRecentPayments: RecentPayment[] = [
  {
    id: '1',
    label: 'Électricité',
    provider: 'ENEO',
    reference: '12 sept. 2026',
    date: '12/09/2026',
    time: '14:32',
    amount: -15000,
    currency: 'XAF',
    status: 'paid',
  },
  {
    id: '2',
    label: 'Eau',
    provider: 'CAMWATER',
    reference: '06 sept. 2026',
    date: '06/09/2026',
    time: '09:15',
    amount: -8500,
    currency: 'XAF',
    status: 'paid',
  },
  {
    id: '3',
    label: 'Abonnement',
    provider: 'Canal+',
    reference: '01 sept. 2026',
    date: '01/09/2026',
    time: '16:20',
    amount: -5000,
    currency: 'XAF',
    status: 'paid',
  },
  {
    id: '4',
    label: 'Airtime & Data',
    provider: 'MTN',
    reference: '28 août 2026',
    date: '28/08/2026',
    time: '11:05',
    amount: -2000,
    currency: 'XAF',
    status: 'paid',
  },
];
