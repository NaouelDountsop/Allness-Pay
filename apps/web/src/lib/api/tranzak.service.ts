import { apiClient } from '@/lib/api-client';

export interface TranzakPaymentPayload {
  walletNumber: string;
  amount: string;
  phone_number: string;
  description?: string;
}

export interface TranzakPaymentResponse {
  transactionId: string;
  status: string;
  paymentUrl?: string;
}

export interface TranzakPaymentStatusResponse {
  status: string;
  amount: string;
}

export const tranzakService = {
  initiatePayment: async (data: TranzakPaymentPayload): Promise<TranzakPaymentResponse> => {
    const res = await apiClient.post<TranzakPaymentResponse>('/payments/tranzak/payment', data);
    return res.data;
  },

  getPaymentStatus: async (
    transactionId: string,
  ): Promise<TranzakPaymentStatusResponse> => {
    const res = await apiClient.get<TranzakPaymentStatusResponse>(
      `/payments/tranzak/status/${transactionId}`,
    );
    return res.data;
  },
};
