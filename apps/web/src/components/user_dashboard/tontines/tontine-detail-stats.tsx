import { useNavigate } from "react-router-dom";
import { Users, Repeat } from "lucide-react";
import type { Tontine } from "@/lib/mock/tontines-data";

interface TontineDetailStatsProps {
  tontine: Tontine;
}

export function TontineDetailStats({ tontine }: TontineDetailStatsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3">
        <Users className="w-5 h-5 text-blue-500" />
        <div>
          <p className="text-xs text-gray-400">Total Membres</p>
          <p className="text-sm font-semibold text-gray-900">{tontine.participantsCount} Membres</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3">
        <Repeat className="w-5 h-5 text-afrilink-green" />
        <div>
          <p className="text-xs text-gray-400">Cycle de Rotation</p>
          <p className="text-sm font-semibold text-gray-900">
            {tontine.currentTurn} / {tontine.totalTurns} mois
          </p>
        </div>
      </div>
    </div>
  );
}
