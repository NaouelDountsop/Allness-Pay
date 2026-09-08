import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Wallet as WalletType } from '@afrilinkpay/shared';
import { CURRENCY_SYMBOLS } from '@/lib/mock/send-money-data';
import useManagedCurrencies from '@/lib/hooks/use-managed-currencies';

interface WalletSelectorProps {
  wallets: WalletType[];
  selectedWalletId: string | null;
  onSelect: (wallet: WalletType) => void;
}

export function WalletSelector({ wallets, selectedWalletId, onSelect }: WalletSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = wallets.find((w) => w.id === selectedWalletId) ?? null;
  const { set: managedSet, isLoading: managedLoading } = useManagedCurrencies();

  const visibleWallets = managedLoading
    ? wallets
    : wallets.filter((w) => managedSet.has(w.currency) || w.id === selected?.id);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selected) return null;

  const formatBalance = (balance: string | number, currency: string) => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
    return `${new Intl.NumberFormat('fr-FR').format(num || 0)} ${symbol}`;
  };

  return (
    <div className="mb-6" ref={ref}>
      <p className="text-sm font-semibold text-gray-700 mb-3">Wallet expéditeur</p>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-allness-green transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-allness-green/10 flex items-center justify-center overflow-hidden">
              <img src="/allnesspay_logo1.png" alt="AllnessPay" className="w-7 h-7 object-contain" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-allness-dark">
                {selected.label ?? selected.walletNumber}
              </p>
              <p className="text-xs text-gray-500">
                {selected.currency} · Solde : {formatBalance(selected.balance, selected.currency)}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-gray-200 bg-white shadow-lg z-20 overflow-hidden">
            {visibleWallets.map((wallet) => {
              const isSelected = wallet.id === selected.id;
              return (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => {
                    onSelect(wallet);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-allness-green/5'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ${
                      isSelected ? 'bg-allness-green/10' : 'bg-gray-100'
                    }`}
                  >
                    <img src="/allnesspay_logo1.png" alt="AllnessPay" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? 'text-allness-green' : 'text-allness-dark'
                      }`}
                    >
                      {wallet.label ?? wallet.walletNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {wallet.currency} · {formatBalance(wallet.balance, wallet.currency)}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-allness-green shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
