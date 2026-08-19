import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { pinService } from '@/lib/api/pin.service';
import { PinSetupModal } from '@/components/user_dashboard/send/pin-setup-modal';
import { PinConfirmModal } from '@/components/user_dashboard/send/pin-confirm-modal';

interface WalletBalanceCardProps {
  walletNumber: string;
  walletInternalId: string;
  balance: number;
  currency: string;
  status?: string;
  kycApproved?: boolean;
}

export function WalletBalanceCard({
  walletNumber,
  walletInternalId,
  balance,
  currency,
  status = 'Actif',
  kycApproved = false,
}: WalletBalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const [pinModal, setPinModal] = useState<'setup' | 'verify' | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  const formatted = new Intl.NumberFormat('fr-FR').format(balance);
  const maskedWalletId = walletNumber.length > 3 ? walletNumber.slice(0, 3) + ' ••••••••' : '••••••••';

  const handleEyeClick = async () => {
    if (visible) {
      setVisible(false);
      return;
    }

    if (!kycApproved) {
      setVisible(true);
      return;
    }

    setCheckingPin(true);
    try {
      const status = await pinService.getStatus(walletInternalId);
      if (status.hasPin) {
        setPinModal('verify');
      } else {
        setPinModal('setup');
      }
    } catch {
      setVisible(true);
    } finally {
      setCheckingPin(false);
    }
  };

  const handlePinSetupComplete = async (pin: string) => {
    try {
      await pinService.create(walletInternalId, pin);
      setPinModal(null);
      setVisible(true);
    } catch {
      // keep modal open on error
    }
  };

  const handlePinVerify = async (pin: string): Promise<boolean> => {
    try {
      const ok = await pinService.verify(walletInternalId, pin);
      if (ok) {
        setPinModal(null);
        setVisible(true);
      }
      return ok;
    } catch {
      return false;
    }
  };

  return (
    <>
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
            <p className="text-xs text-white/60 tracking-wide">ALLNESS WALLET</p>
            <p className="text-sm font-medium">{visible ? walletNumber : maskedWalletId}</p>
          </div>
        </div>
        <span className="text-[11px] font-medium bg-white/10 text-green-300 px-2.5 py-1 rounded-full">
          {status}
        </span>
      </div>

     <p className="text-xs text-white/60 mb-1 relative z-10">Solde Total</p>
        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <p className="text-3xl sm:text-4xl font-bold truncate">
            {visible ? formatted : '•••••••'}{' '}
            <span className="text-base sm:text-lg font-medium text-afrilink-orange">{currency}</span>
          </p>
          <button
            onClick={handleEyeClick}
            disabled={checkingPin}
            aria-label="Afficher/masquer le solde"
            className="shrink-0 disabled:opacity-50"
          >
            {checkingPin ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 animate-spin" />
            ) : visible ? (
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
            ) : (
              <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
            )}
          </button>
        </div>
      </div>

      {pinModal === 'setup' && (
        <PinSetupModal
          onComplete={handlePinSetupComplete}
          onClose={() => setPinModal(null)}
        />
      )}
      {pinModal === 'verify' && (
        <PinConfirmModal
          walletId={walletInternalId}
          onConfirm={handlePinVerify}
          onClose={() => setPinModal(null)}
        />
      )}
    </>
  );
}
