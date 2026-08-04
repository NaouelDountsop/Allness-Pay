import { Trophy, Wallet, Calendar, Repeat, Crown } from "lucide-react";
import type { Tontine } from "@/lib/mock/tontines-data";

interface TontineDetailHeaderProps {
  tontine: Tontine;
  adminName?: string; // à passer depuis la page (ex: currentUser ou membre admin)
}

export function TontineDetailHeader({ tontine, adminName = "John Doe" }: TontineDetailHeaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {/* Cagnotte totale */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-afrilink-green/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-afrilink-green" />
          </div>
          <p className="text-xs text-gray-400">Cagnotte totale</p>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-4">
          {new Intl.NumberFormat("fr-FR").format(tontine.potAmount)}{" "}
          <span className="text-sm font-normal text-gray-400">{tontine.currency}</span>
        </p>
        <div className="flex items-center justify-between text-xs mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-gray-400 leading-none mb-0.5">Prochaine rotation</p>
              <p className="text-gray-800 font-medium leading-none">{tontine.nextRotationDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-gray-400" />
            <div className="text-right">
              <p className="text-gray-400 leading-none mb-0.5">Fréquence</p>
              <p className="text-gray-800 font-medium leading-none">{tontine.frequency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gagnant actuel */}
      <div className="rounded-xl border-2 border-afrilink-orange bg-gradient-to-b from-orange-50/50 to-white p-5 flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 rounded-full bg-afrilink-orange/10 flex items-center justify-center mb-2">
          <Trophy className="w-5 h-5 text-afrilink-orange" />
        </div>
        <p className="text-xs text-gray-400 mb-1">Gagnant actuel</p>
        <p className="text-sm font-semibold text-gray-900">{tontine.currentWinner}</p>
        <p className="text-xs text-afrilink-orange font-medium">{tontine.currentWinnerLocation}</p>
      </div>

      {/* Admin */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col items-center justify-center text-center">
        <div className="relative mb-2">
          <div className="w-11 h-11 rounded-full bg-afrilink-dark/10 flex items-center justify-center text-sm font-semibold text-afrilink-dark">
            {adminName.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-afrilink-dark flex items-center justify-center border-2 border-white">
            <Crown className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-900">{adminName}</p>
        <p className="text-[11px] text-gray-400 font-medium tracking-wide">ADMINISTRATEUR</p>
      </div>
    </div>
  );
}