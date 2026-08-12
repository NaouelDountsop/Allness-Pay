import { apiClient } from '@/lib/api-client';

export interface Beneficiary {
  id: string;
  userId: number;
  name: string;
  phone: string;
  network: string;
  country: string;
  nickname?: string;
  status: 'pending' | 'verified' | 'rejected';
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBeneficiaryPayload {
  name: string;
  phone: string;
  network: string;
  country: string;
  nickname?: string;
}

export interface UpdateBeneficiaryPayload {
  name?: string;
  nickname?: string;
  isFavorite?: boolean;
}

export const beneficiaryService = {
  list: async (): Promise<Beneficiary[]> => {
    const res = await apiClient.get<Beneficiary[]>('/beneficiaries');
    return res.data;
  },
  get: async (id: string): Promise<Beneficiary> => {
    const res = await apiClient.get<Beneficiary>(`/beneficiaries/${id}`);
    return res.data;
  },
  create: async (data: CreateBeneficiaryPayload): Promise<Beneficiary> => {
    const res = await apiClient.post<Beneficiary>('/beneficiaries', data);
    return res.data;
  },
  update: async (id: string, data: UpdateBeneficiaryPayload): Promise<Beneficiary> => {
    const res = await apiClient.patch<Beneficiary>(`/beneficiaries/${id}`, data);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/beneficiaries/${id}`);
  },
  toggleFavorite: async (id: string): Promise<Beneficiary> => {
    const res = await apiClient.patch<Beneficiary>(`/beneficiaries/${id}/toggle-favorite`);
    return res.data;
  },
};
