import { useState } from 'react';
import { Eye, EyeOff, Loader2, QrCode, X } from 'lucide-react';
import { pinService } from '@/lib/api/pin.service';
import { PinSetupModal } from '@/components/user_dashboard/send/pin-setup-modal';
import { PinConfirmModal } from '@/components/user_dashboard/send/pin-confirm-modal';
import { WalletQrCodeDisplay } from '@/components/user_dashboard/wallet/wallet-qr-code';

interface WalletBalanceCardProps {
  walletNumber: string;
  walletInternalId: string;
  balance: number;
  currency: string;
  status?: string;
  kycApproved?: boolean;
  visible: boolean;
  onVisibleChange: (v: boolean) => void;
}

export function WalletBalanceCard({
  walletNumber,
  walletInternalId,
  balance,
  currency,
  status = 'Actif',
  kycApproved = false,
  visible,
  onVisibleChange,
}: WalletBalanceCardProps) {
  const [pinModal, setPinModal] = useState<'setup' | 'verify' | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const formatted = new Intl.NumberFormat('fr-FR').format(balance);
  const maskedWalletId = walletNumber.length > 3 ? walletNumber.slice(0, 3) + ' ••••••••' : '••••••••';

  const handleEyeClick = async () => {
    if (visible) {
      onVisibleChange(false);
      return;
    }

    if (!kycApproved) {
      onVisibleChange(true);
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
      onVisibleChange(true);
    } finally {
      setCheckingPin(false);
    }
  };

  const handlePinSetupComplete = async (pin: string) => {
    try {
      await pinService.create(walletInternalId, pin);
      setPinModal(null);
      onVisibleChange(true);
    } catch {
      // keep modal open on error
    }
  };

  const handlePinVerify = async (pin: string): Promise<string | null> => {
    try {
      const ok = await pinService.verify(walletInternalId, pin);
      if (ok) {
        setPinModal(null);
        onVisibleChange(true);
        return null;
      }
      return 'Code PIN incorrect.';
    } catch (err: unknown) {
      const axiosData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const msg = axiosData?.message;
      if (typeof msg === 'string' && msg.length > 0) return msg;
      if (Array.isArray(msg) && msg.length > 0) return msg[0];
      return 'Une erreur est survenue. Réessayez.';
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-allness-dark text-white p-4 sm:p-6 relative overflow-hidden">
        <svg
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-6 -right-2 w-52 h-52 opacity-60"
          viewBox="0 0 200 200"
          fill="none"
        >
          <defs>
            <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="50%" stopColor="var(--brand-orange, #D28E2F)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--brand-orange, #D28E2F)" stopOpacity="0.05" />
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
          className="pointer-events-none select-none absolute -top-8 -right-8 w-56 h-56 bg-gradient-to-br from-amber-300/40 to-allness-orange/10"
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
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{visible ? walletNumber : maskedWalletId}</p>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="p-1 rounded-md border border-white/20 hover:border-allness-orange/50 transition-colors"
                  aria-label="Voir mon QR code"
                >
                  <QrCode className="w-4 h-4 text-allness-orange" />
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-allness-dark text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  Voir mon QR code
                  <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-allness-dark" />
                </span>
              </div>
            </div>
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
            <span className="text-base sm:text-lg font-medium text-allness-orange">{currency}</span>
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
              <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
            ) : (
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
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
      {showQrModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowQrModal(false)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="bg-allness-dark px-6 py-5 flex items-center justify-between relative">
              <div className="flex flex-col items-center w-full">
                <img src="/allnesspay_logo1.png" alt="" className="w-8 h-8 object-contain mb-1" />
                <span className="text-white text-sm font-semibold">
                  Allness<span className="text-allness-orange">Pay</span>
                </span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute right-5 top-5 text-white/70 hover:text-white"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-base font-semibold text-allness-dark mb-1">
                Mon QR Code
              </h3>
              <p className="text-xs text-orange-500 mb-4">
                Scannez ce code pour recevoir des fonds.
              </p>
              <WalletQrCodeDisplay walletId={walletInternalId} walletNumber={walletNumber} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}