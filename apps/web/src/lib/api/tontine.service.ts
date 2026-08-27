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
  contributionAmount: number;
  frequency: string;
  memberLimit: number;
  currency?: string;
  walletId?: string;
}

export interface TontineInvitation {
  id: string;
  tontineId: string;
  inviterUserId: number;
  inviteeUserId?: number;
  inviteeEmail?: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  tontine?: Tontine;
}

export interface TontineCycle {
  id: string;
  tontineId: string;
  cycleNumber: number;
  beneficiaryId: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  totalPot: string;
  collectedAmount: string;
  dueDate: string;
  completedAt?: string;
}

export interface TontineContribution {
  id: string;
  cycleId: string;
  memberId: string;
  amount: string;
  status: 'PENDING' | 'PAID' | 'LATE' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  dueDate: string;
  penaltyCount: number;
  member?: {
    id: string;
    userId: number;
    user?: { id?: number; nom?: string; prenom?: string };
  };
}

export interface TontineMessage {
  id: string;
  tontineId: string;
  senderId: number | null;
  content: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isSystem: boolean;
  createdAt: string;
  sender?: {
    idutilisateur?: number;
    nom?: string;
    prenom?: string;
  };
}

export interface UnreadCount {
  total: number;
  unread: number;
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

  listInvitations: async (tontineId: string): Promise<TontineInvitation[]> => {
    const res = await apiClient.get<TontineInvitation[]>(`${basePath}/${tontineId}/invitations`);
    return res.data;
  },

  listPendingInvitations: async (): Promise<TontineInvitation[]> => {
    const res = await apiClient.get<TontineInvitation[]>(`${basePath}/invitations/pending`);
    return res.data;
  },

  listAllMyInvitations: async (): Promise<TontineInvitation[]> => {
    const res = await apiClient.get<TontineInvitation[]>(`${basePath}/invitations`);
    return res.data;
  },

  acceptByToken: async (token: string): Promise<TontineMember> => {
    const res = await apiClient.post<TontineMember>(`${basePath}/invitations/accept`, { token });
    return res.data;
  },

  respondInvitation: async (
    invitationId: string,
    response: 'ACCEPT' | 'DECLINE',
  ): Promise<TontineMember | null> => {
    const res = await apiClient.post<TontineMember | null>(
      `${basePath}/invitations/${invitationId}/respond`,
      { response },
    );
    return res.data;
  },

  contribute: async (
    tontineId: string,
    payload: { amount: string; walletId: string; pin: string },
  ): Promise<{ id: string; status: string }> => {
    const res = await apiClient.post<{ id: string; status: string }>(
      `${basePath}/${tontineId}/contribute`,
      payload,
    );
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<Tontine> => {
    const res = await apiClient.patch<Tontine>(`${basePath}/${id}/status`, { status });
    return res.data;
  },

  listCycles: async (tontineId: string): Promise<TontineCycle[]> => {
    const res = await apiClient.get<TontineCycle[]>(`${basePath}/${tontineId}/cycles`);
    return res.data;
  },

  listContributions: async (
    tontineId: string,
    cycleId?: string,
  ): Promise<TontineContribution[]> => {
    const params = cycleId ? { cycleId } : undefined;
    const res = await apiClient.get<TontineContribution[]>(
      `${basePath}/${tontineId}/contributions`,
      { params },
    );
    return res.data;
  },

  reorderMembers: async (tontineId: string, memberIds: string[]): Promise<TontineMember[]> => {
    const res = await apiClient.patch<TontineMember[]>(
      `${basePath}/${tontineId}/members/reorder`,
      { memberIds },
    );
    return res.data;
  },

  checkMyContributionStatus: async (
    tontineId: string,
  ): Promise<{ hasPaid: boolean; cycleNumber: number; amount: string; currency: string }> => {
    const res = await apiClient.get<{ hasPaid: boolean; cycleNumber: number; amount: string; currency: string }>(
      `${basePath}/${tontineId}/contribution-status`,
    );
    return res.data;
  },

  getMessages: async (tontineId: string): Promise<TontineMessage[]> => {
    const res = await apiClient.get<TontineMessage[]>(`${basePath}/${tontineId}/messages`);
    return res.data;
  },

  sendMessage: async (
    tontineId: string,
    payload: { content?: string; file?: File },
  ): Promise<TontineMessage> => {
    const formData = new FormData();
    if (payload.content) {
      formData.append('content', payload.content);
    }
    if (payload.file) {
      formData.append('file', payload.file);
    }
    const res = await apiClient.post<TontineMessage>(
      `${basePath}/${tontineId}/messages`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  markMessageAsRead: async (tontineId: string, messageId: string): Promise<void> => {
    await apiClient.post(`${basePath}/${tontineId}/messages/${messageId}/read`);
  },

  getUnreadCounts: async (tontineId: string): Promise<UnreadCount> => {
    const res = await apiClient.get<UnreadCount>(`${basePath}/${tontineId}/messages/unread`);
    return res.data;
  },
};
