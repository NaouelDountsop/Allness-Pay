import { apiClient } from "@/lib/api-client";

export interface TontineMember {
  id: number;
  userId: number;
  role: string;
  status: string;
  tourOrdre: number;
  beneficiaryOrder?: number;
  hasReceivedPayout?: boolean;
  missedContributions?: number;
  user?: {
    id?: number;
    nom?: string;
    prenom?: string;
    ville?: string;
    pays?: string;
    email?: string;
  };
}

export interface Tontine {
  id: number;
  name: string;
  description?: string;
  montantCotisation: number;
  frequence: string;
  nombreMembres: number;
  statut: string;
  tourActuel: number;
  devise?: string;
  lieu?: string;
  createurId: number;
  createur?: {
    id?: number;
    nom?: string;
    prenom?: string;
  };
  membres?: TontineMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTontinePayload {
  name: string;
  description: string;
  montantCotisation: number;
  frequence: string;
  nombreMembres: number;
  devise?: string;
  lieu?: string;
}

const basePath = "/tontines";

export const tontineService = {
  list: async (): Promise<Tontine[]> => {
    const res = await apiClient.get<Tontine[]>(basePath);
    return res.data;
  },

  getById: async (id: number): Promise<Tontine> => {
    const res = await apiClient.get<Tontine>(`${basePath}/${id}`);
    return res.data;
  },

  create: async (payload: CreateTontinePayload): Promise<Tontine> => {
    const res = await apiClient.post<Tontine>(basePath, payload);
    return res.data;
  },

  update: async (id: number, payload: Partial<CreateTontinePayload>): Promise<Tontine> => {
    const res = await apiClient.patch<Tontine>(`${basePath}/${id}`, payload);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}`);
  },

  leave: async (id: number): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/leave`);
  },

  invite: async (tontineId: number, data: { inviteeEmail?: string; inviteeUserId?: number }) => {
    const res = await apiClient.post(`${basePath}/${tontineId}/invitations`, data);
    return res.data;
  },

  listInvitations: async (tontineId: number) => {
    const res = await apiClient.get(`${basePath}/${tontineId}/invitations`);
    return res.data;
  },

  acceptByToken: async (token: string): Promise<TontineMember> => {
    const res = await apiClient.post<TontineMember>(`${basePath}/invitations/accept`, { token });
    return res.data;
  },
};
