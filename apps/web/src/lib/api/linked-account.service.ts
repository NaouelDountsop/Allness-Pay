import { apiClient } from "@/lib/api-client";

export type LinkedAccountType = "mobile_money" | "bank_account" | "international_account";

export type LinkedAccountOperator =
  | "mtn_momo"
  | "orange_money"
  | "wave"
  | "free_money"
  | "moov_money"
  | "airtel_money"
  | "bank_app"
  | "other";

export interface LinkedAccount {
  id: string;
  userId: number;
  walletId: string;
  type: LinkedAccountType;
  operator: LinkedAccountOperator;
  label: string;
  phoneNumber?: string;
  accountNumber?: string;
  bankName?: string;
  iban?: string;
  swiftCode?: string;
  currency: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REMOVED";
  isDefault: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkedAccountPayload {
  walletId: string;
  type: LinkedAccountType;
  operator: LinkedAccountOperator;
  label: string;
  phoneNumber?: string;
  accountNumber?: string;
  bankName?: string;
  iban?: string;
  swiftCode?: string;
  currency?: string;
}

export const linkedAccountService = {
  list: async (): Promise<LinkedAccount[]> => {
    const res = await apiClient.get<LinkedAccount[]>("/linked-accounts");
    return res.data;
  },
  create: async (data: CreateLinkedAccountPayload): Promise<LinkedAccount> => {
    const res = await apiClient.post<LinkedAccount>("/linked-accounts", data);
    return res.data;
  },
  verify: async (id: string, code: string): Promise<LinkedAccount> => {
    const res = await apiClient.post<LinkedAccount>(`/linked-accounts/${id}/verify`, { code });
    return res.data;
  },
  setDefault: async (id: string): Promise<LinkedAccount> => {
    const res = await apiClient.patch<LinkedAccount>(`/linked-accounts/${id}/set-default`);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/linked-accounts/${id}`);
  },
};