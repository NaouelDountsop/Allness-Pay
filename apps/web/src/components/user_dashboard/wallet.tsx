import { useState } from "react";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  currency: string;
  ownerName: string;
  incomeToday: number;
  expenseToday: number;
}

export function BalanceCard({
  balance,
  currency,
  ownerName,
  incomeToday,
  expenseToday,
}: BalanceCardProps) {
  const [visible, setVisible] = useState(true);

  const formatted = new Intl.NumberFormat("fr-FR").format(balance);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-afrilink-dark to-afrilink-darker text-white p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/70">Solde total disponible</p>
          <button onClick={() => setVisible((v) => !v)} aria-label="Afficher/masquer le solde">
            {visible ? (
              <Eye className="w-6 h-6 text-white/70" />
            ) : (
              <EyeOff className="w-6 h-6 text-white/70" />
            )}
          </button>
        </div>

        <p className="text-3xl font-bold mb-1">
          {visible ? `${formatted} ${currency}` : "•••••••"}
        </p>
        <p className="text-sm text-white/60">{ownerName}</p>

        <div className="absolute right-4 bottom-4 w-16 h-10 rounded-md bg-white/10 border border-white/10" />
      </div>

      <div className="flex gap-3">
        <div className="flex-1 rounded-xl bg-green-50 px-4 py-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-afrilink-green" />
          <div>
            <p className="text-[11px] text-gray-500">ENTRÉES</p>
            <p className="text-sm font-semibold text-afrilink-green">
              +{incomeToday.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex-1 rounded-xl bg-red-50 px-4 py-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <div>
            <p className="text-[11px] text-gray-500">SORTIES</p>
            <p className="text-sm font-semibold text-red-500">{expenseToday.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
