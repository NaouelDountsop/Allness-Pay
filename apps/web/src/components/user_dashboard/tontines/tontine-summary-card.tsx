import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TontineSummaryCardProps {
  frequency: string;
  nextDueDate: string;
  turnOrder: string;
  totalPaid: number;
  currency: string;
  progressPercent: number;
  membersCount: number;
}

export function TontineSummaryCard({
  frequency,
  nextDueDate,
  turnOrder,
  totalPaid,
  currency,
  progressPercent,
  membersCount,
}: TontineSummaryCardProps) {
  const { t } = useTranslation();
  const currencyLabels: Record<string, string> = {
    XAF: 'FCFA',
    XOF: 'CFA',
    CAD: 'CA$',
    EUR: '€',
    USD: '$',
  };
  const displayCurrency = currencyLabels[currency] ?? currency;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('tontines.summary')}</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">{t('tontines.frequency')}</dt>
            <dd className="font-medium text-gray-800">{frequency}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">{t('tontines.nextDue')}</dt>
            <dd className="font-medium text-blue-600">{nextDueDate}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">{t('tontines.turnOrder')}</dt>
            <dd className="font-medium text-gray-800">{turnOrder}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">{t('tontines.totalPaid')}</dt>
            <dd className="font-medium text-gray-800">
              {new Intl.NumberFormat('fr-FR').format(totalPaid)} {displayCurrency}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">{t('tontines.cycleProgression')}</span>
            <span className="text-allness-green font-medium">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-allness-green"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3">
        <Users className="w-4 h-4 text-blue-500" />
        <div>
          <p className="text-[11px] text-gray-500">{t('tontines.groupMembers')}</p>
          <p className="text-sm font-medium text-gray-800">{membersCount} {t('tontines.participants')}</p>
        </div>
      </div>

      <div className="rounded-xl bg-allness-dark p-5 relative overflow-hidden">
        <p className="text-xs text-white/70 mb-1">{t('tontines.buildFutureTogether')}</p>
        <p className="text-[11px] text-white/60">
          {t('tontines.buildFutureDescription')}
        </p>
      </div>
    </div>
  );
}
