import { Wallet, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Wallet as ApiWallet } from '@afrilinkpay/shared';

interface AccountListProps {
  wallets: ApiWallet[];
  onAddAccount: () => void;
  onSelectWallet?: (wallet: ApiWallet) => void;
  selectedWalletId?: string | null;
}

export function AccountList({ wallets, onAddAccount, onSelectWallet, selectedWalletId }: AccountListProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Mes comptes</h3>
        <ul className="divide-y divide-gray-100">
          {wallets.map((w) => {
            const isSelected = selectedWalletId === w.id;
            return (
              <li
                key={w.id}
                className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-allness-green/[0.06] border border-allness-green/20'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => onSelectWallet?.(w)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 bg-allness-dark"
                  >
                    <Wallet className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm text-gray-800">{w.label ?? w.walletNumber}</p>
                    {w.label && <p className="text-[11px] text-gray-400">{w.walletNumber}</p>}
                    {w.isPrimary && (
                      <span className="text-[10px] text-allness-green font-medium">Principal</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {new Intl.NumberFormat('fr-FR').format(Number(w.balance))} {w.currency}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-allness-green shrink-0" />
                  )}
                </div>
              </li>
            );
          })}
          {wallets.length === 0 && (
            <li className="py-6 text-center text-sm text-gray-400">Aucun portefeuille trouvé</li>
          )}
        </ul>
      </div>

      <button
        onClick={onAddAccount}
        className="w-full text-left rounded-2xl border border-allness-orange/20 bg-gradient-to-br from-allness-orange via-allness-dark to-allness-darker shadow-sm p-5 flex items-center justify-between gap-3 transition hover:shadow-md hover:border-allness-orange/50"
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Ajoutez un compte Allness</p>
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
