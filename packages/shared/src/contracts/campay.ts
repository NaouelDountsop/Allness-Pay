export interface CampayPaymentRequest {
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

export interface CampayCallbackRequest {
  reference: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
}

export interface CampayPaymentStatusResponse {
  status: string;
  amount: string;
}
