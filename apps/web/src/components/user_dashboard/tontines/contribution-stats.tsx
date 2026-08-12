import { Wallet, Repeat, Activity } from 'lucide-react';

interface ContributionStatsProps {
  totalContributed: number;
  currency: string;
  contributionsCount: number;
  currentTurn: number;
  totalTurns: number;
}

export function ContributionStats({
  totalContributed,
  currency,
  contributionsCount,
  currentTurn,
  totalTurns,
}: ContributionStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <Wallet className="w-4 h-4 text-gray-400 mb-2" />
        <p className="text-[11px] text-gray-400">Total Cotisé</p>
        <p className="text-lg font-bold text-gray-900">
          {new Intl.NumberFormat('fr-FR').format(totalContributed)} {currency}
        </p>
        <p className="text-[11px] text-afrilink-green mt-1">+12% par rapport au mois dernier</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <Repeat className="w-4 h-4 text-blue-500 mb-2" />
        <p className="text-[11px] text-gray-400">Nombre de Versements</p>
        <p className="text-lg font-bold text-gray-900">{contributionsCount}</p>
        <p className="text-[11px] text-gray-400 mt-1">Total depuis le début de la session</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <Activity className="w-4 h-4 text-afrilink-orange" />
          <span className="text-[10px] font-medium bg-green-50 text-afrilink-green px-2 py-0.5 rounded-full">
            ACTIVE
          </span>
        </div>
        <p className="text-[11px] text-gray-400">Progression du cycle</p>
        <p className="text-lg font-bold text-gray-900">
          Tour actuel: {currentTurn} / {totalTurns}
        </p>
      </div>
    </div>
  );
}
