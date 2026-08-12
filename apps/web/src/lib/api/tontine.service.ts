import { apiClient } from '@/lib/api-client';

export interface TontineMember {
  id: string;
  userId: number;
  role: string;
  status: string;
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
  id: string;
  name: string;
  description?: string;
  targetAmount: string;
  contributionAmount: string;
  memberLimit: number;
  currency: string;
  frequency: string;
  status: string;
  currentCycle: number;
  nextContributionAt?: string;
  creatorId: number;
  creator?: {
    id?: number;
    nom?: string;
    prenom?: string;
  };
  members?: TontineMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTontinePayload {
  name: string;
  description: string;
  targetAmount: number;
  contributionAmount: number;
  frequency: string;
  memberLimit: number;
  currency?: string;
  walletId?: string;
}

export interface TontineInvitation {
  id: number;
  tontineId: number;
  inviterUserId: number;
  inviteeUserId?: number;
  inviteeEmail?: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

const basePath = '/tontines';

export const tontineService = {
  list: async (): Promise<Tontine[]> => {
    const res = await apiClient.get<Tontine[]>(basePath);
    return res.data;
  },

  getById: async (id: string): Promise<Tontine> => {
    const res = await apiClient.get<Tontine>(`${basePath}/${id}`);
    return res.data;
  },

  create: async (payload: CreateTontinePayload): Promise<Tontine> => {
    const res = await apiClient.post<Tontine>(basePath, payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateTontinePayload>): Promise<Tontine> => {
    const res = await apiClient.patch<Tontine>(`${basePath}/${id}`, payload);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${basePath}/${id}`);
  },

  leave: async (id: string): Promise<void> => {
    await apiClient.post(`${basePath}/${id}/leave`);
  },

  invite: async (tontineId: string, data: { inviteeEmail?: string; inviteeUserId?: number }) => {
    const res = await apiClient.post(`${basePath}/${tontineId}/invitations`, data);
    return res.data;
  },

  listInvitations: async (tontineId: string) => {
    const res = await apiClient.get(`${basePath}/${tontineId}/invitations`);
    return res.data;
  },

  listPendingInvitations: async (): Promise<TontineInvitation[]> => {
    const res = await apiClient.get<TontineInvitation[]>(`${basePath}/invitations/pending`);
    return res.data;
  },

  acceptByToken: async (token: string): Promise<TontineMember> => {
    const res = await apiClient.post<TontineMember>(`${basePath}/invitations/accept`, { token });
    return res.data;
  },
};
