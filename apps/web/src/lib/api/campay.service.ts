import { apiClient } from '@/lib/api-client';

export interface CampayPaymentPayload {
  walletNumber: string;
  amount: string;
  phone_number: string;
  description?: string;
}

export interface CampayPaymentResponse {
  transactionId: string;
  status: string;
  reference: string;
}

export interface CampayPaymentStatusResponse {
  status: string;
  amount: string;
}

export const campayService = {
  initiatePayment: async (data: CampayPaymentPayload): Promise<CampayPaymentResponse> => {
    const res = await apiClient.post<CampayPaymentResponse>('/payments/campay/payment', data);
    return res.data;
  },

  getPaymentStatus: async (
    transactionId: string,
  ): Promise<CampayPaymentStatusResponse> => {
    const res = await apiClient.get<CampayPaymentStatusResponse>(
      `/payments/campay/status/${transactionId}`,
    );
    return res.data;
  },

  verifyPayment: async (
    transactionId: string,
  ): Promise<CampayPaymentStatusResponse> => {
    const res = await apiClient.post<CampayPaymentStatusResponse>(
      `/payments/campay/verify/${transactionId}`,
    );
    return res.data;
  },
};
