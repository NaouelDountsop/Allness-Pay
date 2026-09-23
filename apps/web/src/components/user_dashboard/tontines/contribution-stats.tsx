import { Wallet, Repeat, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-green-400" />
          </span>
          <span className="text-sm text-gray-300">{t('tontines.totalContributed')}</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {new Intl.NumberFormat('fr-FR').format(totalContributed)} {currency}
        </p>
        <p className="text-xs text-green-400">{t('tontines.percentChange')}</p>
      </div>

      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Repeat className="w-5 h-5 text-blue-400" />
          </span>
          <span className="text-sm text-gray-300">{t('tontines.numberOfPayments')}</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">{contributionsCount}</p>
        <p className="text-xs text-gray-400">{t('tontines.totalSinceSessionStart')}</p>
      </div>

      <div className="bg-allness-dark rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-allness-orange/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-allness-orange" />
          </span>
          <span className="text-sm text-gray-300">{t('tontines.cycleProgression')}</span>
        </div>
        <p className="text-2xl font-bold text-white mb-2">
          {t('tontines.currentTurn', { current: currentTurn, total: totalTurns })}
        </p>
        <span className="inline-block text-[11px] font-medium bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
          ACTIVE
        </span>
      </div>
    </div>
  );
}
