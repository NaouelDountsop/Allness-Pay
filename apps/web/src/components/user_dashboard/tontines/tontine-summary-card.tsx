import { Users } from "lucide-react";

interface TontineSummaryCardProps {
  frequency: string;
  nextDueDate: string;
  turnOrder: string;
  totalPaid: number;
  progressPercent: number;
  membersCount: number;
}

export function TontineSummaryCard({
  frequency,
  nextDueDate,
  turnOrder,
  totalPaid,
  progressPercent,
  membersCount,
}: TontineSummaryCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Résumé de la Tontine</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Fréquence</dt>
            <dd className="font-medium text-gray-800">{frequency}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Prochaine échéance</dt>
            <dd className="font-medium text-blue-600">{nextDueDate}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Ordre de passage</dt>
            <dd className="font-medium text-gray-800">{turnOrder}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-400">Total versé</dt>
            <dd className="font-medium text-gray-800">
              {new Intl.NumberFormat("fr-FR").format(totalPaid)} €
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">Progression du cycle</span>
            <span className="text-afrilink-green font-medium">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-afrilink-green"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3">
        <Users className="w-4 h-4 text-blue-500" />
        <div>
          <p className="text-[11px] text-gray-400">MEMBRES DU GROUPE</p>
          <p className="text-sm font-medium text-gray-800">{membersCount} Participants</p>
        </div>
      </div>

      <div className="rounded-xl bg-afrilink-dark p-5 relative overflow-hidden">
        <p className="text-xs text-white/60 mb-1">Bâtir l'avenir ensemble</p>
        <p className="text-[11px] text-white/40">
          Chaque versement rapproche votre communauté de ses objectifs.
        </p>
      </div>
    </div>
  );
}
