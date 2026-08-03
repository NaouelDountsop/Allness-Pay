import { apiClient } from "@/lib/api-client";

export interface PinStatus {
  hasPin: boolean;
  createdAt: string | null;
}

export const pinService = {
  getStatus: async (walletId: string): Promise<PinStatus> => {
    const res = await apiClient.get<PinStatus>(`/wallets/${walletId}/pin/status`);
    return res.data;
  },

  create: async (walletId: string, pin: string): Promise<void> => {
    await apiClient.post(`/wallets/${walletId}/pin`, { pin });
  },

  verify: async (walletId: string, pin: string): Promise<boolean> => {
    const res = await apiClient.post<{ valid: boolean }>(`/wallets/${walletId}/pin/verify`, { pin });
    return res.data.valid;
  },

  update: async (walletId: string, currentPin: string, newPin: string): Promise<void> => {
    await apiClient.patch(`/wallets/${walletId}/pin`, { currentPin, newPin });
  },

  forgot: async (walletId: string): Promise<void> => {
    await apiClient.post(`/wallets/${walletId}/pin/forgot`);
  },

  reset: async (walletId: string, resetToken: string, newPin: string): Promise<void> => {
    await apiClient.post(`/wallets/${walletId}/pin/reset`, { resetToken, newPin });
  },
};
