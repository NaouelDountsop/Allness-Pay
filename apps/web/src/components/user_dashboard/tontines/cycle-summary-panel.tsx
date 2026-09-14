import { useTranslation } from 'react-i18next';

interface CycleSummaryPanelProps {
  frequency: string;
  membersCount: number;
  totalPot: number;
  nextDrawDate: string;
  currency: string;
  onShowCalendar: () => void;
  children?: React.ReactNode;
}

function getDurationLabel(t: (key: string, options?: Record<string, unknown>) => string, frequency: string, memberCount: number): string {
  switch (frequency) {
    case 'WEEKLY': {
      const totalWeeks = memberCount;
      const months = Math.round(totalWeeks / 4.33);
      return months >= 1 ? t('tontines.durationWeeksWithMonths', { weeks: totalWeeks, months }) : t('tontines.durationWeeks', { weeks: totalWeeks });
    }
    case 'BIWEEKLY': {
      const totalWeeks = memberCount * 2;
      const months = Math.round(totalWeeks / 4.33);
      return months >= 1 ? t('tontines.durationWeeksWithMonths', { weeks: totalWeeks, months }) : t('tontines.durationWeeks', { weeks: totalWeeks });
    }
    case 'MONTHLY':
    default:
      return t('tontines.durationMonths', { months: memberCount });
  }
}

export function CycleSummaryPanel({
  frequency,
  membersCount,
  totalPot,
  nextDrawDate,
  currency,
  onShowCalendar,
  children,
}: CycleSummaryPanelProps) {
  const { t } = useTranslation();
  const currencyLabels: Record<string, string> = {
    XAF: 'FCFA',
    XOF: 'CFA',
    CAD: 'CA$',
    EUR: '€',
    USD: '$',
  };

  const displayCurrency = currencyLabels[currency] ?? currency;
  const durationLabel = getDurationLabel(t, frequency, membersCount);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('tontines.cycleSummary')}</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">{t('tontines.totalDuration')}</dt>
            <dd className="font-medium text-gray-800">{durationLabel}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">{t('tontines.potFinalCycle')}</dt>
            <dd className="font-medium text-gray-800">
              {new Intl.NumberFormat('fr-FR').format(totalPot)} {displayCurrency}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">{t('tontines.registeredMembers')}</dt>
            <dd className="font-medium text-gray-800">{membersCount} {t('tontines.persons')}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">{t('tontines.nextDraw')}</dt>
            <dd className="font-medium text-gray-800">{nextDrawDate}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl bg-blue-50 p-4 text-xs text-blue-700">
        {t('tontines.fundsGuaranteed')}
      </div>

      <button
        onClick={onShowCalendar}
        className="w-full h-11 rounded-lg border border-gray-200 text-sm text-gray-600"
      >
        {t('tontines.publicCalendarPreview')}
      </button>

      {children}
    </div>
  );
}
