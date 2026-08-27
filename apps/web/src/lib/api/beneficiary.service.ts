import { apiClient } from '@/lib/api-client';

export interface Beneficiary {
  id: string;
  name: string;
  phone: string;
  network: string;
  country: string;
  status: 'pending' | 'verified' | 'rejected';
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBeneficiaryPayload {
  nom: string;
  numero: string;
  reseau: string;
  pays: string;
  favori?: boolean;
}

export interface UpdateBeneficiaryPayload {
  nom?: string;
  favori?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limite: number;
  totalPages: number;
}

export const beneficiaryService = {
  list: async (): Promise<PaginatedResponse<Beneficiary>> => {
    const res = await apiClient.get<PaginatedResponse<Beneficiary>>('/beneficiaires');
    return res.data;
  },
  get: async (id: string): Promise<Beneficiary> => {
    const res = await apiClient.get<Beneficiary>(`/beneficiaires/${id}`);
    return res.data;
  },
  create: async (data: CreateBeneficiaryPayload): Promise<Beneficiary> => {
    const res = await apiClient.post<Beneficiary>('/beneficiaires', data);
    return res.data;
  },
  update: async (id: string, data: UpdateBeneficiaryPayload): Promise<Beneficiary> => {
    const res = await apiClient.patch<Beneficiary>(`/beneficiaires/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/beneficiaires/${id}`);
  },
  toggleFavorite: async (id: string): Promise<Beneficiary> => {
    const res = await apiClient.patch<Beneficiary>(`/beneficiaires/${id}/favori`);
    return res.data;
  },
  searchUser: async (query: string): Promise<{ name: string; walletId: string; phone?: string }[]> => {
    const res = await apiClient.get<{ name: string; walletId: string; phone?: string }[]>('/beneficiaires/search', {
      params: { q: query },
    });
    return res.data;
  },
};
