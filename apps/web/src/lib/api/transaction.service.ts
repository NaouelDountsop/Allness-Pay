import { apiClient } from "@/lib/api-client";

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: "deposit" | "withdrawal" | "transfer_in" | "transfer_out";
  amount: number;
  relatedWalletId: string | null;
  reference: string | null;
  description: string | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  provider: string | null;
  phoneNumber: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  deposit: "Dépôt",
  withdrawal: "Retrait",
  transfer_in: "Transfert reçu",
  transfer_out: "Transfert envoyé",
};

export const transactionService = {
  listByWallet: async (walletId: string): Promise<WalletTransaction[]> => {
    const res = await apiClient.get<WalletTransaction[]>(`/wallets/${walletId}/transactions`);
    return res.data;
  },

  getTypeLabel: (type: string): string => TYPE_LABELS[type] ?? type,

  isCredit: (type: string): boolean => type === "deposit" || type === "transfer_in",
};
