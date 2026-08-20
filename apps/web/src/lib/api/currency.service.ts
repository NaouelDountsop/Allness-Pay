import { apiClient } from '@/lib/api-client';

export interface ExchangeRate {
  id: string;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  rate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const currencyService = {
  getExchangeRate: async (from: string, to: string): Promise<ExchangeRate | null> => {
    if (from === to) return null;
    try {
      const res = await apiClient.get<ExchangeRate>(`/currencies/exchange-rate/${from}/${to}`);
      return res.data;
    } catch {
      return null;
    }
  },

  listExchangeRates: async (): Promise<ExchangeRate[]> => {
    try {
      const res = await apiClient.get<ExchangeRate[]>('/currencies/exchange-rates/all');
      return res.data;
    } catch {
      return [];
    }
  },
};
