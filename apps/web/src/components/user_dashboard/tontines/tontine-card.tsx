import { useNavigate } from "react-router-dom";
import type { Tontine } from "@/lib/mock/tontines-data";

interface TontineCardProps {
  tontine: Tontine;
}

export function TontineCard({ tontine }: TontineCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-900">{tontine.name}</p>
        <span className="text-[10px] font-medium bg-green-50 text-afrilink-green px-2 py-0.5 rounded-full">
          {tontine.frequency}
        </span>
      </div>

      <p className="text-[11px] text-gray-400 mb-1">Cagnotte</p>
      <p className="text-lg font-bold text-gray-900 mb-3">
        {new Intl.NumberFormat("fr-FR").format(tontine.potAmount)}{" "}
        <span className="text-xs font-normal text-gray-400">{tontine.currency}</span>
      </p>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">Participants</p>
        <div className="flex -space-x-2">
          {tontine.members.slice(0, 3).map((m) => (
            <span
              key={m.id}
              className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-medium text-gray-500"
            >
              {m.name.charAt(0)}
            </span>
          ))}
          <span className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-medium text-gray-500">
            +{tontine.participantsCount - 3}
          </span>
        </div>
      </div>

      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-gray-400">
          Tour: {tontine.currentTurn} / {tontine.totalTurns}
        </span>
        <span className="text-afrilink-green font-medium">
          Progression {tontine.progressPercent}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-afrilink-orange"
          style={{ width: `${tontine.progressPercent}%` }}
        />
      </div>

      <button
        onClick={() => navigate(`/dashboard/tontines/${tontine.id}`)}
        className="w-full h-9 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-xs font-medium transition-colors"
      >
        Voir les détails
      </button>
    </div>
  );
}
