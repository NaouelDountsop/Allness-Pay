import { apiClient } from '@/lib/api-client';

export interface CreatePaymentIntentPayload {
  walletNumber: string;
  amount: string;
  currency?: string;
  description?: string;
}

export interface CreatePaymentIntentResponse {
  transactionId: string;
  clientSecret: string;
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
}

export interface PaymentStatusResponse {
  status: string;
  amount: number;
  currency: string;
}

export const stripeService = {
  createPaymentIntent: async (
    data: CreatePaymentIntentPayload,
  ): Promise<CreatePaymentIntentResponse> => {
    const res = await apiClient.post<CreatePaymentIntentResponse>(
      '/payments/stripe/payment-intent',
      data,
    );
    return res.data;
  },

  getPaymentStatus: async (
    paymentIntentId: string,
  ): Promise<PaymentStatusResponse> => {
    const res = await apiClient.get<PaymentStatusResponse>(
      `/payments/stripe/status/${paymentIntentId}`,
    );
    return res.data;
  },
};
