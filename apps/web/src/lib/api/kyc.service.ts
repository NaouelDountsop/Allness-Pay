import { apiClient } from "@/lib/api-client";
import type {
  KycRecord,
  KycReviewResult,
  CreateKycDto,
  ReviewKycDto,
} from "@afrilinkpay/shared";

export const kycService = {
  /**
   * Soumettre un dossier KYC (utilisateur).
   * Utilise multipart/form-data pour les fichiers.
   */
  submit: async (data: {
    IdentityDocumentType: CreateKycDto["IdentityDocumentType"];
    proofOfAddressType: CreateKycDto["proofOfAddressType"];
    documentFront: File;
    documentBack?: File | null;
    selfie: File;
    proofOfAddress: File;
  }): Promise<KycRecord> => {
    const formData = new FormData();
    formData.append("IdentityDocumentType", data.IdentityDocumentType);
    formData.append("proofOfAddressType", data.proofOfAddressType);
    formData.append("documentFront", data.documentFront);
    if (data.documentBack) {
      formData.append("documentBack", data.documentBack);
    }
    formData.append("selfie", data.selfie);
    formData.append("proofOfAddress", data.proofOfAddress);

    const res = await apiClient.post<KycRecord>("/kyc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * Récupérer le dossier KYC de l'utilisateur connecté.
   */
  getMine: async (): Promise<KycRecord> => {
    const res = await apiClient.get<KycRecord>("/kyc/me");
    return res.data;
  },

  /**
   * Récupérer un dossier KYC par ID (utilisateur propriétaire).
   */
  getById: async (id: number): Promise<KycRecord> => {
    const res = await apiClient.get<KycRecord>(`/kyc/${id}`);
    return res.data;
  },

  /**
   * Récupérer un dossier KYC par ID pour l'admin.
   */
  getAdminById: async (id: number): Promise<KycRecord> => {
    const res = await apiClient.get<KycRecord>(`/admin/kyc/${id}`);
    return res.data;
  },

  /**
   * Lister tous les dossiers KYC (admin).
   * @param status - Filtrer par statut optionnel
   */
  list: async (status?: string): Promise<KycRecord[]> => {
    const params = status ? { status } : undefined;
    const res = await apiClient.get<KycRecord[]>("/kyc", { params });
    return res.data;
  },

  /**
   * Examiner un dossier KYC (admin).
   */
  review: async (
    id: number,
    data: ReviewKycDto,
  ): Promise<KycReviewResult> => {
    const res = await apiClient.patch<KycReviewResult>(
      `/kyc/${id}/review`,
      data,
    );
    return res.data;
  },

  /**
   * Modifier un dossier KYC (utilisateur, statut PENDING uniquement).
   */
  update: async (
    id: number,
    data: Partial<CreateKycDto>,
  ): Promise<KycRecord> => {
    const res = await apiClient.patch<KycRecord>(`/kyc/${id}`, data);
    return res.data;
  },

  /**
   * Supprimer un dossier KYC (utilisateur propriétaire).
   */
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/kyc/${id}`);
  },
};
