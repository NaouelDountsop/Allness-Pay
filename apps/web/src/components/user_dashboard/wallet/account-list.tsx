import { Wallet, Landmark, Sparkles, ArrowRight } from "lucide-react";
import type { WalletAccount } from "@/lib/mock/wallet-data";

const fallbackIconByType = {
  wallet: Wallet,
  mobile_money: Wallet,
  bank: Landmark,
};

const fallbackColorByType = {
  wallet: "bg-afrilink-dark",
  mobile_money: "bg-afrilink-orange",
  bank: "bg-blue-600",
};

interface AccountListProps {
  accounts: WalletAccount[];
}

export function AccountList({ accounts }: AccountListProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Mes comptes</h3>
        <ul className="divide-y divide-gray-100">
          {accounts.map((acc) => {
            const FallbackIcon = fallbackIconByType[acc.type];
            return (
              <li key={acc.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {acc.logoUrl ? (
                    <span className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={acc.logoUrl}
                        alt={acc.label}
                        className="w-full h-full object-contain p-1"
                      />
                    </span>
                  ) : (
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${fallbackColorByType[acc.type]}`}
                    >
                      <FallbackIcon className="w-4 h-4" />
                    </span>
                  )}
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

      {/* Encart promo - ajouter un compte Afrilink */}
      <button className="w-full text-left rounded-2xl border border-afrilink-orange/20 bg-gradient-to-br from-afrilink-orange via-afrilink-dark to-afrilink-darker shadow-sm p-5 flex items-center justify-between gap-3 transition hover:shadow-md hover:border-afrilink-orange/50">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Ajoutez un compte Afrilink</p>
            <p className="text-xs text-white/70 mt-0.5">
              Centralisez vos transferts et payez sans frais cachés
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white shrink-0" />
      </button>
    </div>
  );
}