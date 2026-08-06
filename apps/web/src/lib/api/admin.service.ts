import { apiClient } from "@/lib/api-client";

export interface AdminDashboardStats {
  totalUsers: number;
  totalWallets: number;
  totalTransactions: number;
  totalLiquidity: number;
  monthlyVolume: number;
  kyc: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface AdminUser {
  idutilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  pays: string;
  ville: string;
  profession: string;
  statut: string;
  verificationotp: boolean;
  dateinscription: string;
  datemodification: string;
}

export interface AdminKycRecord {
  id: number;
  userId: number;
  IdentityDocumentType: string;
  proofOfAddressType: string;
  documentFrontUrl: string;
  documentBackUrl: string | null;
  selfieUrl: string;
  proofOfAddressUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewComment: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTontine {
  id: number;
  name: string;
  description?: string;
  montantCotisation: number;
  frequence: string;
  nombreMembres: number;
  statut: string;
  tourActuel: number;
  devise?: string;
  createurId: number;
  createur?: {
    id?: number;
    nom?: string;
    prenom?: string;
  };
  membres?: Array<{
    id: number;
    userId: number;
    role: string;
    status: string;
    tourOrdre: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<AdminDashboardStats>("/admin/dashboard/stats");
    return res.data;
  },

  listUsers: async (): Promise<AdminUser[]> => {
    const res = await apiClient.get<AdminUser[]>("/admin/users");
    return res.data;
  },

  getUserById: async (id: number): Promise<AdminUser> => {
    const res = await apiClient.get<AdminUser>(`/admin/users/${id}`);
    return res.data;
  },

  listKyc: async (status?: string): Promise<AdminKycRecord[]> => {
    const params = status ? { status } : undefined;
    const res = await apiClient.get<AdminKycRecord[]>("/admin/kyc", { params });
    return res.data;
  },

  getKycById: async (id: number): Promise<AdminKycRecord> => {
    const res = await apiClient.get<AdminKycRecord>(`/admin/kyc/${id}`);
    return res.data;
  },

  reviewKyc: async (id: number, data: { status: string; reviewComment?: string }): Promise<AdminKycRecord> => {
    const res = await apiClient.patch<AdminKycRecord>(`/admin/kyc/${id}`, data);
    return res.data;
  },

  listTontines: async (): Promise<AdminTontine[]> => {
    const res = await apiClient.get<AdminTontine[]>("/admin/tontines");
    return res.data;
  },
};
