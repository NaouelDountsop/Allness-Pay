export interface WalletAccount {
  id: string;
  label: string;
  type: "wallet" | "mobile_money" | "bank";
  provider?: string;
  balance: number;
}

export const mockWalletAccounts: WalletAccount[] = [
  { id: "1", label: "Wallet Principal", type: "wallet", balance: 1350000 },
  { id: "2", label: "MTN Mobile Money", type: "mobile_money", balance: 290000 },
  { id: "3", label: "Orange Money", type: "mobile_money", balance: 75000 },
  { id: "4", label: "Compte Bancaire", type: "bank", balance: 1500000 },
];
