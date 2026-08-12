import { z } from 'zod';

// ── User ───────────────────────────────────────────────────────────────

export interface UserProfile {
  idutilisateur: number;
  nom: string;
  prenom: string;
  datenaissance: string;
  sexe: string;
  pays: string;
  ville: string;
  telephone: string;
  adresse: string;
  email: string;
  profession: string;
  statut: string;
  verificationotp: boolean;
  dateinscription: string;
  datemodification: string;
}

// ── Wallet ─────────────────────────────────────────────────────────────

export const WalletStatusEnum = z.enum(['inactive', 'active', 'suspended', 'closed']);
export type WalletStatus = z.infer<typeof WalletStatusEnum>;

export interface Wallet {
  id: string;
  walletNumber: string;
  userId: number;
  balance: string;
  currency: string;
  status: WalletStatus;
  isPrimary: boolean;
  label?: string;
  createdAt: string;
  updatedAt: string;
}
