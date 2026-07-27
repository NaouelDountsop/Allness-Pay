import { Wallet, Smartphone, Landmark } from "lucide-react";
import type { WalletAccount } from "@/lib/mock/wallet-data";

const iconByType = {
  wallet: Wallet,
  mobile_money: Smartphone,
  bank: Landmark,
};

const colorByType = {
  wallet: "bg-afrilink-dark",
  mobile_money: "bg-afrilink-orange",
  bank: "bg-blue-600",
};

interface AccountListProps {
  accounts: WalletAccount[];
}

export function AccountList({ accounts }: AccountListProps) {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Mes comptes</h3>
      <ul className="divide-y divide-gray-100">
        {accounts.map((acc) => {
          const Icon = iconByType[acc.type];
          return (
            <li key={acc.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${colorByType[acc.type]}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <p className="text-sm text-gray-800">{acc.label}</p>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {new Intl.NumberFormat("fr-FR").format(acc.balance)} FCFA
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
