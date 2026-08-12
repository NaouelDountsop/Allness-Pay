import { apiClient } from '@/lib/api-client';
import type { UserProfile } from '@afrilinkpay/shared';

export const userService = {
  /**
   * Récupérer le profil de l'utilisateur connecté (via JWT).
   */
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/auth/profile');
    return res.data;
  },

  /**
   * Récupérer un utilisateur par ID.
   */
  getById: async (id: number): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>(`/users/${id}`);
    return res.data;
  },

  /**
   * Mettre à jour le profil utilisateur.
   */
  update: async (id: number, data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await apiClient.patch<UserProfile>(`/users/${id}`, data);
    return res.data;
  },
};
