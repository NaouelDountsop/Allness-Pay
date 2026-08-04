import { Api } from "./api";

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

export const AdminService = {
  getDashboardStats() {
    return Api.get<AdminDashboardStats>("/admin/dashboard/stats");
  },

  listUsers() {
    return Api.get<AdminUser[]>("/admin/users");
  },

  getUserById(id: number) {
    return Api.get<AdminUser>(`/admin/users/${id}`);
  },

  listKyc(status?: string) {
    const query = status ? `?status=${status}` : "";
    return Api.get<AdminKycRecord[]>(`/admin/kyc${query}`);
  },

  getKycById(id: number) {
    return Api.get<AdminKycRecord>(`/admin/kyc/${id}`);
  },
};
