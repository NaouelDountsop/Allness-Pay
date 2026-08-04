import { Wallet, Users, TrendingUp, AlertCircle } from "lucide-react";

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
        <Wallet className="w-4 h-4 text-gray-400 mb-2" />
        <p className="text-[11px] text-gray-400 mb-1">Total cotisé</p>
        <p className="text-sm font-bold text-gray-900">
          {new Intl.NumberFormat("fr-FR").format(totalContributed)} {currency}
        </p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <Users className="w-4 h-4 text-blue-500 mb-2" />
        <p className="text-[11px] text-gray-400 mb-1">Mes Tontines</p>
        <p className="text-sm font-bold text-gray-900">{activeTontinesCount} Actives</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <TrendingUp className="w-4 h-4 text-afrilink-green mb-2" />
        <p className="text-[11px] text-gray-400 mb-1">Prochain Gain</p>
        <p className="text-sm font-bold text-gray-900">
          {new Intl.NumberFormat("fr-FR").format(nextGainAmount)} {currency}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {nextGainDate} · {nextGainLabel}
        </p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <AlertCircle className="w-4 h-4 text-afrilink-orange mb-2" />
        <p className="text-[11px] text-gray-400 mb-1">En Attente</p>
        <p className="text-sm font-bold text-gray-900">{pendingRequestsCount} Demandes</p>
      </div>
    </div>
  );
}
