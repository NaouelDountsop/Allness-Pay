import { apiClient } from "@/lib/api-client";

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: "deposit" | "withdrawal" | "transfer_in" | "transfer_out";
  amount: number;
  relatedWalletId: string | null;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

export const transactionService = {
  listByWallet: async (walletId: string): Promise<WalletTransaction[]> => {
    const res = await apiClient.get<WalletTransaction[]>(`/wallets/${walletId}/transactions`);
    return res.data;
  },
};
