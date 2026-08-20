import {  Users, TrendingUp, AlertCircle, Layers } from 'lucide-react';

interface TontinesStatsProps {
  totalContributed: number;
  currency: string;
  totalTontinesCount: number;
  activeTontinesCount: number;
  nextGainAmount: number;
  nextGainDate: string;
  nextGainLabel: string;
  pendingRequestsCount: number;
}

export function TontinesStats({
  //totalContributed,
  currency,
  totalTontinesCount,
  activeTontinesCount,
  nextGainAmount,
  nextGainDate,
  nextGainLabel,
  pendingRequestsCount,
}: TontinesStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-400" />
          </span>
          <span className="text-sm text-gray-300">Total Tontines</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">{totalTontinesCount}</p>
        <p className="text-xs text-gray-400">Toutes tontines</p>
      </div>

      <div className="bg-allness-dark rounded-2xl p-5">
      {/* <div className="bg-afrilink-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-green-400" />
          </span>
          <span className="text-sm text-gray-300">Total cotisé</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {new Intl.NumberFormat('fr-FR').format(totalContributed)} {currency}
        </p>
        <p className="text-xs text-green-400">↗ Depuis la création</p>
      </div> */}

      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </span>
          <span className="text-sm text-gray-300">Actives</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">{activeTontinesCount}</p>
        <p className="text-xs text-gray-400">En cours</p>
      </div>

      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </span>
          <span className="text-sm text-gray-300">Prochain Gain</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {new Intl.NumberFormat('fr-FR').format(nextGainAmount)} {currency}
        </p>
        <p className="text-xs text-gray-400">
          {nextGainDate} · {nextGainLabel}
        </p>
      </div>

      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </span>
          <span className="text-sm text-gray-300">En Attente</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">{pendingRequestsCount} Demandes</p>
        <p className="text-xs text-orange-400">À traiter</p>
      </div>
    </div>
  );
}
