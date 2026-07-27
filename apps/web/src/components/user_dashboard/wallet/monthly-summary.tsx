interface MonthlySummaryProps {
  month: string;
  incomePercent: number;
  expensePercent: number;
  netAmount: number;
}

export function MonthlySummary({
  month,
  incomePercent,
  expensePercent,
  netAmount,
}: MonthlySummaryProps) {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Résumé mensuel</h3>
        <span className="text-xs text-gray-400">{month}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden flex mb-3">
        <div className="h-full bg-afrilink-green" style={{ width: `${incomePercent}%` }} />
        <div className="h-full bg-afrilink-orange" style={{ width: `${expensePercent}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-afrilink-green">+{incomePercent}%</span>
        <span className="text-afrilink-orange">-{expensePercent}%</span>
      </div>

      <p className="text-sm font-semibold text-gray-800 mt-3">
        {new Intl.NumberFormat("fr-FR").format(netAmount)} FCFA
      </p>
    </div>
  );
}
