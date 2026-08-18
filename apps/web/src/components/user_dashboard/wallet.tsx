import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
  status = 'Actif',
}: WalletBalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const formatted = new Intl.NumberFormat('fr-FR').format(balance);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-afrilink-dark to-afrilink-darker text-white p-6 relative overflow-hidden">
      {/* Watermark carte du monde en points - couvre toute la carte */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(/word.png)',
          backgroundSize: '130%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(1.4)',
        }}
      />

      {/* Watermark logo en dégradé blanc/orange (masque CSS sur le SVG) */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-8 -right-8 w-56 h-56 bg-gradient-to-br from-white/40 via-afrilink-orange/35 to-afrilink-orange/10"
        style={{
          WebkitMaskImage: 'url(/allnesspay_logo1.png)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: 'url(/allnesspay_logo1.png)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }}
      />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <img src="/allnesspay_logo1.png" alt="" className="w-9 h-9 object-contain" />
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
      <div className="flex items-center gap-3 relative z-10">
        <p className="text-3xl font-bold">
          {visible ? formatted : '•••••••'}{' '}
          <span className="text-base font-medium text-afrilink-orange">{currency}</span>
        </p>
        <button onClick={() => setVisible((v) => !v)} aria-label="Afficher/masquer le solde">
          {visible ? (
            <Eye className="w-6 h-6 text-white/60" />
          ) : (
            <EyeOff className="w-6 h-6 text-white/60" />
          )}
        </button>
      </div>
    </div>
  );
}
