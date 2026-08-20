import { apiClient } from '@/lib/api-client';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
  amount: number;
  relatedWalletId: string | null;
  reference: string | null;
  description: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  provider: string | null;
  phoneNumber: string | null;
  createdAt: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  net: number;
  incomePercent: number;
  expensePercent: number;
  trend: Array<{ month: string; income: number; expense: number }>;
}

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  transfer_in: 'Transfert reçu',
  transfer_out: 'Transfert envoyé',
};

export interface TransferResult {
  from: { id: string; balance: number };
  to: { id: string; balance: number };
}

export interface CampayWithdrawResult {
  transactionId: string;
  status: string;
  reference: string;
}

export const transactionService = {
  listByWallet: async (walletId: string): Promise<WalletTransaction[]> => {
    const res = await apiClient.get<WalletTransaction[]>(`/wallets/${walletId}/transactions`);
    return res.data;
  },

  getMonthlySummary: async (walletId: string): Promise<MonthlySummary> => {
    const res = await apiClient.get<MonthlySummary>(`/wallets/${walletId}/transactions/monthly-summary`);
    return res.data;
  },

  createTransfer: async (
    walletId: string,
    data: { toWalletId: string; amount: string; description?: string; pin: string },
  ): Promise<TransferResult> => {
    const res = await apiClient.post<TransferResult>(`/wallets/${walletId}/transfer`, data);
    return res.data;
  },

  campayWithdraw: async (data: {
    walletNumber: string;
    amount: string;
    phone_number: string;
    description?: string;
  }): Promise<CampayWithdrawResult> => {
    const res = await apiClient.post<CampayWithdrawResult>('/payments/campay/withdraw', data);
    return res.data;
  },

  getTypeLabel: (type: string): string => TYPE_LABELS[type] ?? type,

  isCredit: (type: string): boolean => type === 'deposit' || type === 'transfer_in',
};
