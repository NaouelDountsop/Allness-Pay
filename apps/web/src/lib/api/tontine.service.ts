import { apiClient } from "@/lib/api-client";

export interface Tontine {
  id: number;
  nom: string;
  description: string;
  montantCotisation: number;
  frequence: string;
  nombreMembres: number;
  statut: string;
  dateCreation: string;
}

export interface CreateTontinePayload {
  nom: string;
  description: string;
  montantCotisation: number;
  frequence: string;
  nombreMembres: number;
}

export const tontineService = {
  list: async (): Promise<Tontine[]> => {
    const res = await apiClient.get<Tontine[]>("/tontine");
    return res.data;
  },

  getById: async (id: number): Promise<Tontine> => {
    const res = await apiClient.get<Tontine>(`/tontine/${id}`);
    return res.data;
  },

  create: async (payload: CreateTontinePayload): Promise<Tontine> => {
    const res = await apiClient.post<Tontine>("/tontine", payload);
    return res.data;
  },

  update: async (id: number, payload: Partial<CreateTontinePayload>): Promise<Tontine> => {
    const res = await apiClient.patch<Tontine>(`/tontine/${id}`, payload);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/tontine/${id}`);
  },
};
