interface CycleSummaryPanelProps {
  frequency: string;
  membersCount: number;
  totalPot: number;
  nextDrawDate: string;
  currency: string;
  onShowCalendar: () => void;
  children?: React.ReactNode;
}

function getDurationLabel(frequency: string, memberCount: number): string {
  switch (frequency) {
    case 'WEEKLY': {
      const totalWeeks = memberCount;
      const months = Math.round(totalWeeks / 4.33);
      return months >= 1 ? `${totalWeeks} semaines (~${months} mois)` : `${totalWeeks} semaines`;
    }
    case 'BIWEEKLY': {
      const totalWeeks = memberCount * 2;
      const months = Math.round(totalWeeks / 4.33);
      return months >= 1 ? `${totalWeeks} semaines (~${months} mois)` : `${totalWeeks} semaines`;
    }
    case 'MONTHLY':
    default:
      return `${memberCount} Mois`;
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
  const currencyLabels: Record<string, string> = {
    XAF: 'FCFA',
    XOF: 'CFA',
    CAD: 'CA$',
    EUR: '€',
    USD: '$',
  };

  const displayCurrency = currencyLabels[currency] ?? currency;
  const durationLabel = getDurationLabel(frequency, membersCount);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Résumé du Cycle</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Durée Totale</dt>
            <dd className="font-medium text-gray-800">{durationLabel}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Pot Final (Cycle)</dt>
            <dd className="font-medium text-gray-800">
              {new Intl.NumberFormat('fr-FR').format(totalPot)} {displayCurrency}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Membres Inscrits</dt>
            <dd className="font-medium text-gray-800">{membersCount} Personnes</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Prochain Tirage</dt>
            <dd className="font-medium text-gray-800">{nextDrawDate}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl bg-blue-50 p-4 text-xs text-blue-700">
        Les fonds sont garantis par le fonds de réserve institutionnel Fintech Forward.
      </div>

      <button
        onClick={onShowCalendar}
        className="w-full h-11 rounded-lg border border-gray-200 text-sm text-gray-600"
      >
        Aperçu du Calendrier Public
      </button>

      {children}
    </div>
  );
}
