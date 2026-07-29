import { Trophy, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Tontine } from "@/lib/mock/tontines-data";

interface TontineDetailHeaderProps {
  tontine: Tontine;
}

export function TontineDetailHeader({ tontine }: TontineDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <p className="text-xs text-gray-400 mb-1">Cagnotte totale</p>
        <p className="text-xl font-bold text-gray-900 mb-4">
          {new Intl.NumberFormat("fr-FR").format(tontine.potAmount)}{" "}
          <span className="text-sm font-normal text-gray-400">{tontine.currency}</span>
        </p>
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="text-gray-400">Prochaine Rotation</p>
            <p className="text-gray-800 font-medium">{tontine.nextRotationDate}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Fréquence</p>
            <p className="text-gray-800 font-medium">{tontine.frequency}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-afrilink-orange bg-white p-5 flex flex-col items-center justify-center text-center">
        <Trophy className="w-6 h-6 text-afrilink-orange mb-2" />
        <p className="text-xs text-gray-400 mb-1">Gagnant Actuel</p>
        <p className="text-sm font-semibold text-gray-900">{tontine.currentWinner}</p>
        <p className="text-xs text-afrilink-orange">{tontine.currentWinnerLocation}</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-gray-100 mb-2" />
        <p className="text-sm font-semibold text-gray-900">John Doe</p>
        <p className="text-[11px] text-gray-400">ADMIN</p>
      </div>
    </div>
  );
}
