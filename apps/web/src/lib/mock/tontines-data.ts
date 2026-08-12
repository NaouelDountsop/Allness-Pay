export interface TontineMember {
  id: string;
  name: string;
  location: string;
  status: 'paid' | 'pending' | 'late';
  turnMonth: number;
}

export interface Tontine {
  id: string;
  name: string;
  type: string;
  frequency: 'Hebdomadaire' | 'Mensuelle';
  potAmount: number;
  currency: string;
  participantsCount: number;
  currentTurn: number;
  totalTurns: number;
  progressPercent: number;
  isAdmin: boolean;
  currentWinner?: string;
  currentWinnerLocation?: string;
  nextRotationDate?: string;
  members: TontineMember[];
}

export interface TontineInvitation {
  id: string;
  name: string;
  subtitle: string;
  status: 'invitation' | 'pending';
}

export interface Contribution {
  id: string;
  date: string;
  time: string;
  memberName: string;
  amount: number;
  status: 'valide' | 'en_attente' | 'echoue';
}

export const mockTontines: Tontine[] = [
  {
    id: '1',
    name: 'Cercle de Confiance',
    type: 'Mensuelle',
    frequency: 'Mensuelle',
    potAmount: 2500000,
    currency: 'CFA',
    participantsCount: 12,
    currentTurn: 7,
    totalTurns: 12,
    progressPercent: 85,
    isAdmin: true,
    currentWinner: 'Jean-Pierre M.',
    currentWinnerLocation: 'Ottawa, Canada',
    nextRotationDate: '15 Mai 2024',
    members: [
      {
        id: 'm1',
        name: 'Alice Mbarga',
        location: 'Douala, Cameroun',
        status: 'paid',
        turnMonth: 12,
      },
      {
        id: 'm2',
        name: 'Frank Tagne',
        location: 'Paris, France',
        status: 'pending',
        turnMonth: 10,
      },
      {
        id: 'm3',
        name: 'Samuel Kamga',
        location: 'Montréal, Canada',
        status: 'paid',
        turnMonth: 15,
      },
    ],
  },
  {
    id: '2',
    name: 'Impact Diaspora',
    type: 'Hebdomadaire',
    frequency: 'Hebdomadaire',
    potAmount: 500000,
    currency: 'CFA',
    participantsCount: 18,
    currentTurn: 4,
    totalTurns: 10,
    progressPercent: 40,
    isAdmin: false,
    currentWinner: 'Jean-Pierre M.',
    currentWinnerLocation: 'Ottawa, Canada',
    nextRotationDate: '15 Mai 2024',
    members: [
      {
        id: 'm1',
        name: 'Alice Mbarga',
        location: 'Douala, Cameroun',
        status: 'paid',
        turnMonth: 12,
      },
      {
        id: 'm2',
        name: 'Frank Tagne',
        location: 'Paris, France',
        status: 'pending',
        turnMonth: 10,
      },
      {
        id: 'm3',
        name: 'Samuel Kamga',
        location: 'Montréal, Canada',
        status: 'paid',
        turnMonth: 15,
      },
    ],
  },
];

export const mockInvitations: TontineInvitation[] = [
  {
    id: 'i1',
    name: 'Solidarité Marché Central',
    subtitle: 'Invitation de Mamadou S. · 100 000 CFA / Semaine',
    status: 'invitation',
  },
  {
    id: 'i2',
    name: 'Projet Immo 2025',
    subtitle: 'Lancement prévu · 12 Déc. · En attente de 3 participants',
    status: 'pending',
  },
];

export const mockContributions: Contribution[] = [
  {
    id: 'c1',
    date: '14 Oct 2023',
    time: '14:32:08',
    memberName: 'Sophie Dubois',
    amount: 500,
    status: 'valide',
  },
  {
    id: 'c2',
    date: '14 Oct 2023',
    time: '11:15:00',
    memberName: 'Moussa Kone',
    amount: 500,
    status: 'en_attente',
  },
  {
    id: 'c3',
    date: '13 Oct 2023',
    time: '16:48:05',
    memberName: 'Jean Dupont',
    amount: 1000,
    status: 'valide',
  },
  {
    id: 'c4',
    date: '12 Oct 2023',
    time: '08:02:13',
    memberName: 'Amélie Laurent',
    amount: 500,
    status: 'echoue',
  },
  {
    id: 'c5',
    date: '11 Oct 2023',
    time: '09:30:00',
    memberName: 'Claire Rousseau',
    amount: 500,
    status: 'valide',
  },
];

export const mockCycles = [
  { id: 'cy4', label: 'Cycle 4 (en cours)', range: 'Du 31/12/25 au 30/01/26', active: true },
  { id: 'cy3', label: 'Cycle 3', range: 'Du 31/12/25 au 30/01/26', active: false },
  { id: 'cy2', label: 'Cycle 2', range: 'Du 31/12/25 au 30/01/26', active: false },
  { id: 'cy1', label: 'Cycle 1', range: 'Du 31/12/25 au 30/01/26', active: false },
];
