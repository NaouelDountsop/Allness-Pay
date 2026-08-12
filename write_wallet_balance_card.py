from pathlib import Path

content = '''import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface WalletBalanceCardProps {
  walletId: string;
  balance: number;
  currency: string;
  status: string;
}

export function WalletBalanceCard({
  walletId,
  balance,
  currency,
  status,
}: WalletBalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const formatted = new Intl.NumberFormat("fr-FR").format(balance);

  return (
    <div className="rounded-2xl bg-afrilink-dark text-white p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-white/60 tracking-wide">PORTFEUILLE</p>
          <p className="text-sm font-medium truncate max-w-[180px]">{walletId}</p>
        </div>
        <span className="text-[11px] font-medium bg-white/10 text-green-300 px-2.5 py-1 rounded-full whitespace-nowrap">
          {status}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div>
          <p className="text-xs text-white/60">Solde disponible</p>
          <p className="text-3xl font-bold mt-1">
            {visible ? formatted : "•••••••"}{" "}
            <span className="text-base font-medium text-afrilink-orange">{currency}</span>
          </p>
        </div>
        <button
          onClick={() => setVisible((v) => !v)}
          aria-label="Afficher/masquer le solde"
          className="rounded-full bg-white/10 p-2"
        >
          {visible ? (
            <Eye className="w-5 h-5 text-white/80" />
          ) : (
            <EyeOff className="w-5 h-5 text-white/80" />
          )}
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-white/60">ID du portefeuille</p>
        <p className="text-sm text-white/90 truncate">{walletId}</p>
      </div>

      <div className="mt-6 rounded-2xl bg-white/5 p-4 text-xs text-white/70">
        <p className="font-medium text-white mb-1">État du portefeuille</p>
        <p>{status}</p>
      </div>
    </div>
  );
}
'''

Path('apps/web/src/components/user_dashboard/wallet/wallet-balance-card.tsx').write_text(content, encoding='utf-8')
