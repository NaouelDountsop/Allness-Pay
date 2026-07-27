import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface WalletBalanceCardProps {
  walletId: string;
  balance: number;
  currency: string;
  status?: string;
}

export function WalletBalanceCard({
  walletId,
  balance,
  currency,
  status = "Actif",
}: WalletBalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const formatted = new Intl.NumberFormat("fr-FR").format(balance);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-afrilink-dark to-afrilink-darker text-white p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src="/afrilinkpay_logo2.svg" alt="" className="w-6 h-6 object-contain" />
          <div>
            <p className="text-xs text-white/60 tracking-wide">AFRILINK WALLET</p>
            <p className="text-sm font-medium">{walletId}</p>
          </div>
        </div>
        <span className="text-[11px] font-medium bg-white/10 text-green-300 px-2.5 py-1 rounded-full">
          {status}
        </span>
      </div>

      <p className="text-xs text-white/60 mb-1">Solde Total</p>
      <div className="flex items-center gap-3">
        <p className="text-3xl font-bold">
          {visible ? formatted : "•••••••"}{" "}
          <span className="text-base font-medium text-afrilink-orange">{currency}</span>
        </p>
        <button onClick={() => setVisible((v) => !v)} aria-label="Afficher/masquer le solde">
          {visible ? (
            <Eye className="w-4 h-4 text-white/60" />
          ) : (
            <EyeOff className="w-4 h-4 text-white/60" />
          )}
        </button>
      </div>
    </div>
  );
}
