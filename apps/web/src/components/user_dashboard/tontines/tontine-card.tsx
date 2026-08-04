import { useNavigate } from "react-router-dom";
import { Users, Wallet } from "lucide-react";
import type { Tontine } from "@/lib/mock/tontines-data";

interface TontineCardProps {
  tontine: Tontine;
}

const avatarColors = [
  "bg-afrilink-green/10 text-afrilink-green",
  "bg-afrilink-orange/10 text-afrilink-orange",
  "bg-blue-50 text-blue-500",
  "bg-purple-50 text-purple-500",
];

export function TontineCard({ tontine }: TontineCardProps) {
  const navigate = useNavigate();
  const extraMembers = tontine.participantsCount - 3;

  return (
    <div className="min-h-[420px] flex flex-col rounded-xl border border-gray-100 bg-white p-6 hover:shadow-md hover:border-gray-200 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-gray-900 truncate pr-2">
          {tontine.name}
        </p>
        <span className="flex-shrink-0 text-[10px] font-medium bg-green-50 text-afrilink-green px-2 py-0.5 rounded-full whitespace-nowrap">
          {tontine.frequency}
        </span>
      </div>

      {/* Cagnotte — fond sombre personnalisé */}
      <div
        className="flex items-center gap-3 mb-6 rounded-lg p-5"
        style={{ backgroundColor: "#082B37" }}
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <Wallet className="w-4 h-4 text-afrilink-green" />
        </div>
        <div>
          <p className="text-[11px] text-white/60 leading-none mb-1">Cagnotte</p>
          <p className="text-xl font-bold text-white leading-none">
            {new Intl.NumberFormat("fr-FR").format(tontine.potAmount)}{" "}
            <span className="text-xs font-normal text-white/60">{tontine.currency}</span>
          </p>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span>{tontine.participantsCount} membres</span>
        </div>
        <div className="flex -space-x-2">
          {tontine.members.slice(0, 3).map((m, i) => (
            <span
              key={m.id}
              className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-semibold ${avatarColors[i % avatarColors.length]}`}
              title={m.name}
            >
              {m.name.charAt(0).toUpperCase()}
            </span>
          ))}
          {extraMembers > 0 && (
            <span className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-medium text-gray-500">
              +{extraMembers}
            </span>
          )}
        </div>
      </div>

      {/* Spacer pour pousser progression + bouton en bas */}
      <div className="flex-1" />

      {/* Progression */}
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="text-gray-400">
          Tour <span className="font-medium text-gray-600">{tontine.currentTurn}</span> / {tontine.totalTurns}
        </span>
        <span className="text-afrilink-green font-semibold">
          {tontine.progressPercent}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-afrilink-orange transition-all"
          style={{ width: `${Math.min(tontine.progressPercent, 100)}%` }}
        />
      </div>

      <button
        onClick={() => navigate(`/dashboard/tontines/${tontine.id}`)}
        className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-xs font-medium transition-colors"
      >
        Voir les détails
      </button>
    </div>
  );
}