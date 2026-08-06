import { Trophy, Crown } from "lucide-react";
import type { Tontine } from "@/lib/api/tontine.service";

interface TontineDetailHeaderProps {
  tontine: Tontine;
  progressPercent?: number;
}

export function TontineDetailHeader({ tontine }: TontineDetailHeaderProps) {
  const adminName = tontine.createur ? `${tontine.createur.prenom ?? ""} ${tontine.createur.nom ?? ""}`.trim() : "Admin";
  const currentMember = tontine.membres?.find((m) => m.tourOrdre === tontine.tourActuel);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {/* Cagnotte totale — style wallet */}
      <div className="rounded-2xl bg-gradient-to-br from-afrilink-dark to-afrilink-darker text-white p-4 sm:p-6 relative overflow-hidden">
        <svg
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-6 -right-2 w-52 h-52 opacity-60"
          viewBox="0 0 200 200"
          fill="none"
        >
          <defs>
            <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#D28E2F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D28E2F" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" stroke="url(#globeGradient)" strokeWidth="1.5" />
          <ellipse cx="100" cy="100" rx="35" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="65" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="90" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="55" rx="90" ry="25" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="90" ry="8" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="145" rx="90" ry="25" stroke="url(#globeGradient)" strokeWidth="1" />
        </svg>

        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-8 -right-8 w-56 h-56 bg-gradient-to-br from-white/40 via-afrilink-orange/35 to-afrilink-orange/10"
          style={{
            WebkitMaskImage: "url(/afrilinkpay_logo1.svg)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskImage: "url(/afrilinkpay_logo1.svg)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <img src="/afrilinkpay_logo1.svg" alt="" className="w-9 h-9 object-contain" />
            <div>
              <p className="text-xs text-white/60 tracking-wide">CAGNOTTE TONTINE</p>
              <p className="text-sm font-medium">{tontine.name}</p>
            </div>
          </div>
          <span className="text-[11px] font-medium bg-white/10 text-green-300 px-2.5 py-1 rounded-full">
            {tontine.frequence}
          </span>
        </div>

        <p className="text-xs text-white/60 mb-1 relative z-10">Cagnotte totale</p>
        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <p className="text-3xl sm:text-4xl font-bold truncate">
            {new Intl.NumberFormat("fr-FR").format(tontine.montantCotisation)}{" "}
            <span className="text-base sm:text-lg font-medium text-afrilink-orange">{tontine.devise ?? "CFA"}</span>
          </p>
        </div>
      </div>

      {/* Gagnant actuel */}
      <div className="rounded-xl border-2 border-afrilink-orange bg-gradient-to-b from-orange-50/50 to-white p-5 flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 rounded-full bg-afrilink-orange/10 flex items-center justify-center mb-2">
          <Trophy className="w-5 h-5 text-afrilink-orange" />
        </div>
        <p className="text-xs text-gray-400 mb-1">Gagnant actuel</p>
        <p className="text-sm font-semibold text-gray-900">
          {currentMember?.user?.prenom} {currentMember?.user?.nom}
        </p>
        <p className="text-xs text-afrilink-orange font-medium">
          {currentMember?.user?.ville}, {currentMember?.user?.pays}
        </p>
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