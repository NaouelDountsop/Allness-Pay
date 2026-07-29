export interface WalletAccount {
  id: string;
  label: string;
  type: "wallet" | "mobile_money" | "bank";
  provider?: string;
  logoUrl?: string;
  balance: number;
}

export const mockWalletAccounts: WalletAccount[] = [
  {
    id: "1",
    label: "Wallet Principal",
    type: "wallet",
    logoUrl: "/afrilinkpay_logo2.svg",
    balance: 1350000,
  },
  {
    id: "2",
    label: "MTN Mobile Money",
    type: "mobile_money",
    provider: "mtn",
    logoUrl: "/mtn-momo.png",
    balance: 290000,
  },
  {
    id: "3",
    label: "Orange Money",
    type: "mobile_money",
    provider: "orange",
    logoUrl: "/orange-money.png",
    balance: 75000,
  },
  {
    id: "4",
    label: "Compte Bancaire",
    type: "bank",
    logoUrl: "/bank.png",
    balance: 1500000,
  },
];
