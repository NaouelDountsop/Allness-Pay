import { apiClient } from '@/lib/api-client';
import type { Wallet } from '@afrilinkpay/shared';

export interface CreateWalletPayload {
  currency?: string;
  label?: string;
}

export const walletService = {
  /**
   * Créer un nouveau portefeuille.
   */
  create: async (data: CreateWalletPayload = {}): Promise<Wallet> => {
    const res = await apiClient.post<Wallet>('/wallets', data);
    return res.data;
  },

  /**
   * Récupérer tous les portefeuilles de l'utilisateur connecté.
   */
  list: async (): Promise<Wallet[]> => {
    const res = await apiClient.get<Wallet[]>('/wallets');
    return res.data;
  },

  /**
   * Récupérer le portefeuille principal de l'utilisateur.
   * Si pas de portefeuille principal, retourne le premier portefeuille actif.
   */
  getPrimary: async (): Promise<Wallet | null> => {
    const res = await apiClient.get<Wallet[]>('/wallets');
    const wallets = res.data;
    if (!wallets || wallets.length === 0) return null;
    return wallets.find((w) => w.isPrimary) ?? wallets[0] ?? null;
  },

  /**
   * Récupérer un portefeuille par ID.
   */
  getById: async (id: string): Promise<Wallet> => {
    const res = await apiClient.get<Wallet>(`/wallets/${id}`);
    return res.data;
  },
};
