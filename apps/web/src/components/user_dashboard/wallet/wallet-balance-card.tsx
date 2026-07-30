import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface WalletBalanceCardProps {
  walletId: string;
  balance: number;
  currency: string;
  status?: string;
}

export function WalletBalanceCard({
  walletId,
  balance,
  currency,
  status = "Actif",
}: WalletBalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const formatted = new Intl.NumberFormat("fr-FR").format(balance);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-afrilink-dark to-afrilink-darker text-white p-4 sm:p-6 relative overflow-hidden">
      {/* Watermark globe terrestre (méridiens/parallèles) */}
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
        {/* Cercle extérieur */}
        <circle cx="100" cy="100" r="90" stroke="url(#globeGradient)" strokeWidth="1.5" />
        {/* Méridiens (ellipses verticales) */}
        <ellipse cx="100" cy="100" rx="35" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="65" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="90" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
        {/* Parallèles (lignes horizontales courbées) */}
        <ellipse cx="100" cy="55" rx="90" ry="25" stroke="url(#globeGradient)" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="90" ry="8" stroke="url(#globeGradient)" strokeWidth="1" />
        <ellipse cx="100" cy="145" rx="90" ry="25" stroke="url(#globeGradient)" strokeWidth="1" />
      </svg>

      {/* Watermark logo en dégradé blanc/orange (masque CSS sur le SVG) */}
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
            <p className="text-xs text-white/60 tracking-wide">AFRILINK WALLET</p>
            <p className="text-sm font-medium">{walletId}</p>
          </div>
        </div>
        <span className="text-[11px] font-medium bg-white/10 text-green-300 px-2.5 py-1 rounded-full">
          {status}
        </span>
      </div>

      <p className="text-xs text-white/60 mb-1 relative z-10">Solde Total</p>
      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
        <p className="text-2xl sm:text-3xl font-bold truncate">
          {visible ? formatted : "•••••••"}{" "}
          <span className="text-sm sm:text-base font-medium text-afrilink-orange">{currency}</span>
        </p>
        <button onClick={() => setVisible((v) => !v)} aria-label="Afficher/masquer le solde" className="shrink-0">
          {visible ? (
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
          ) : (
            <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
          )}
        </button>
      </div>
    </div>
  );
}