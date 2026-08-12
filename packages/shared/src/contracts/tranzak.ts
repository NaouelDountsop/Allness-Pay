export interface TranzakPaymentRequest {
  walletId: string;
  amount: string;
  phone_number: string;
  description?: string;
}

export interface TranzakPaymentResponse {
  paymentUrl: string;
  transactionId: string;
}

export interface TranzakCallbackRequest {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED';
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
