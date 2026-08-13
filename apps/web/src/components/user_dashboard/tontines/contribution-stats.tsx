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
      <div className="bg-afrilink-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-green-400" />
          </span>
          <span className="text-sm text-gray-300">Total Cotisé</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {new Intl.NumberFormat('fr-FR').format(totalContributed)} {currency}
        </p>
        <p className="text-xs text-green-400">+12% par rapport au mois dernier</p>
      </div>

      <div className="bg-afrilink-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Repeat className="w-5 h-5 text-blue-400" />
          </span>
          <span className="text-sm text-gray-300">Nombre de Versements</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">{contributionsCount}</p>
        <p className="text-xs text-gray-400">Total depuis le début de la session</p>
      </div>

      <div className="bg-afrilink-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-[#D28E2F]/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#D28E2F]" />
          </span>
          <span className="text-sm text-gray-300">Progression du cycle</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          Tour actuel: {currentTurn} / {totalTurns}
        </p>
        <span className="inline-block text-[11px] font-medium bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
          ACTIVE
        </span>
      </div>
    </div>
  );
}
