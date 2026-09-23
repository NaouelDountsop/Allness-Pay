export type MobileMoneyOperator = "mtn" | "orange";
export type DepositMethod = "mobile_money" | "bank";
export type Currency = "XAF" | "XOF" | "CAD" | "EUR";

export type PaymentMethodType = "wallet" | "mobile_money" | "orange_money" | "card";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  XAF: "FCFA",
  XOF: "CFA",
  CAD: "CA$",
  EUR: "€",
};

export const BANK_LABELS: Record<string, string> = {
  sgbc: "SGBC (Société Générale Cameroun)",
  uba: "UBA Cameroun",
  afriland: "Afriland First Bank",
  beac: "BEAC",
  ecobank: "Ecobank Cameroun",
  bicec: "BICEC",
  btc: "BTCI (Banque Camerounaise des Travailleurs)",
  autres: "Autres",
};

export interface DepositState {
  method: DepositMethod;
  operator: MobileMoneyOperator;
  phoneNumber: string;
  bankName: string;
  iban: string;
  accountHolder: string;
  amount: string;
  currency: Currency;
  description: string;
  reference: string;
  transactionId: string;
  createdAt: Date | null;
}
