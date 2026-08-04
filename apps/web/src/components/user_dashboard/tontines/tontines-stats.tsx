import { Users, TrendingUp, AlertCircle } from "lucide-react";

interface TontinesStatsProps {
  totalContributed: number;
  currency: string;
  activeTontinesCount: number;
  nextGainAmount: number;
  nextGainDate: string;
  nextGainLabel: string;
  pendingRequestsCount: number;
}

export function TontinesStats({
  totalContributed,
  currency,
  activeTontinesCount,
  nextGainAmount,
  nextGainDate,
  nextGainLabel,
  pendingRequestsCount,
}: TontinesStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <Users className="w-5 h-5 text-blue-500 mb-2" />
        <p className="text-xs text-gray-400 mb-1">Mes Tontines</p>
        <p className="text-xl sm:text-2xl font-bold text-afrilink-orange">{activeTontinesCount} Actives</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <TrendingUp className="w-5 h-5 text-afrilink-green mb-2" />
        <p className="text-xs text-gray-400 mb-1">Total Cotisé</p>
        <p className="text-xl sm:text-2xl font-bold text-afrilink-orange">
          {new Intl.NumberFormat("fr-FR").format(totalContributed)} <span className="text-sm font-normal">{currency}</span>
        </p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <TrendingUp className="w-5 h-5 text-afrilink-green mb-2" />
        <p className="text-xs text-gray-400 mb-1">Prochain Gain</p>
        <p className="text-xl sm:text-2xl font-bold text-afrilink-orange">
          {new Intl.NumberFormat("fr-FR").format(nextGainAmount)}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">{nextGainDate} · {nextGainLabel}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <AlertCircle className="w-5 h-5 text-afrilink-orange mb-2" />
        <p className="text-xs text-gray-400 mb-1">En Attente</p>
        <p className="text-xl sm:text-2xl font-bold text-afrilink-orange">{pendingRequestsCount} Demandes</p>
      </div>
    </div>
  );
}
