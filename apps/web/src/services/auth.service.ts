import { apiClient } from "@/lib/api-client";

export interface RegisterPayload {
  nom: string;
  prenom: string;
  datenaissance: string; // format ISO "YYYY-MM-DD"
  sexe: string;
  nationalite: string;
  pays: string;
  ville: string;
  telephone: string;
  adresse?: string;
  email: string;
  motdepasse: string;
  profession: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>("/users", payload);
    return data;
  },
};
