import { useState } from "react";
import { Trophy, Eye, EyeOff, Calendar, Repeat, Crown } from "lucide-react";
import type { Tontine } from "@/lib/mock/tontines-data";

interface TontineDetailHeaderProps {
  tontine: Tontine;
  adminName?: string;
}

export function TontineDetailHeader({ tontine, adminName = "John Doe" }: TontineDetailHeaderProps) {
  const [visible, setVisible] = useState(true);
  const formatted = new Intl.NumberFormat("fr-FR").format(tontine.potAmount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {/* Cagnotte totale — carte style wallet */}
      <div className="sm:col-span-1 rounded-2xl bg-gradient-to-br from-afrilink-dark to-afrilink-darker text-white p-5 relative overflow-hidden flex flex-col">
        {/* Watermark globe */}
        <svg
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-4 -right-1 w-36 h-36 opacity-60"
          viewBox="0 0 200 200"
          fill="none"
        >
          <defs>
            <linearGradient id="globeDetail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#D28E2F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D28E2F" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" stroke="url(#globeDetail)" strokeWidth="1.5" />
          <ellipse cx="100" cy="100" rx="35" ry="90" stroke="url(#globeDetail)" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="65" ry="90" stroke="url(#globeDetail)" strokeWidth="1" />
          <ellipse cx="100" cy="55" rx="90" ry="25" stroke="url(#globeDetail)" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="90" ry="8" stroke="url(#globeDetail)" strokeWidth="1" />
          <ellipse cx="100" cy="145" rx="90" ry="25" stroke="url(#globeDetail)" strokeWidth="1" />
        </svg>

        {/* Watermark logo */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-6 -right-6 w-40 h-40 bg-gradient-to-br from-white/40 via-afrilink-orange/35 to-afrilink-orange/10"
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

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <img src="/afrilinkpay_logo1.svg" alt="" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-[10px] text-white/60 tracking-wide">CAGNOTTE TOTALE</p>
              <p className="text-xs font-medium">{tontine.type}</p>
            </div>
          </div>
          <span className="text-[10px] font-medium bg-white/10 text-green-300 px-2 py-0.5 rounded-full">
            {tontine.isAdmin ? "Admin" : "Membre"}
          </span>
        </div>

        <p className="text-[10px] text-white/60 mb-0.5 relative z-10">Montant Total</p>
        <div className="flex items-center gap-2 relative z-10 mb-4">
          <p className="text-2xl sm:text-3xl font-bold truncate">
            {visible ? formatted : "•••••••"}{" "}
            <span className="text-sm font-medium text-afrilink-orange">{tontine.currency}</span>
          </p>
          <button onClick={() => setVisible((v) => !v)} aria-label="Afficher/masquer" className="shrink-0">
            {visible ? (
              <Eye className="w-4 h-4 text-white/60" />
            ) : (
              <EyeOff className="w-4 h-4 text-white/60" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] mt-auto pt-3 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/40" />
            <div>
              <p className="text-white/40 leading-none mb-0.5">Prochaine rotation</p>
              <p className="text-white font-medium leading-none">{tontine.nextRotationDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-white/40" />
            <div className="text-right">
              <p className="text-white/40 leading-none mb-0.5">Fréquence</p>
              <p className="text-white font-medium leading-none">{tontine.frequency}</p>
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
