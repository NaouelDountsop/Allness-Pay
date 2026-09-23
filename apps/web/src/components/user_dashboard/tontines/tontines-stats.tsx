import {  Users, TrendingUp, AlertCircle, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-400" />
          </span>
          <span className="text-sm text-gray-300">{t('tontines.totalTontines')}</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">{totalTontinesCount}</p>
        <p className="text-xs text-gray-400">{t('tontines.allTontines')}</p>
      </div>

      {/* <div className="bg-allness-dark rounded-2xl p-5">
       <div className="bg-allness-dark rounded-2xl p-5">
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
      </div>  */}

      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </span>
          <span className="text-sm text-gray-300">{t('tontines.active')}</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">{activeTontinesCount}</p>
        <p className="text-xs text-gray-400">{t('tontines.inProgress')}</p>
      </div>

      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </span>
          <span className="text-sm text-gray-300">{t('tontines.nextGain')}</span>
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
          <span className="text-sm text-gray-300">{t('tontines.pending')}</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">{pendingRequestsCount} {t('tontines.requests')}</p>
        <p className="text-xs text-orange-400">{t('tontines.toProcess')}</p>
      </div>
    </div>
  );
}
