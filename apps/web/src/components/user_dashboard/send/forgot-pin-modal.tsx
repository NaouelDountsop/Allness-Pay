import { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { pinService } from '@/lib/api/pin.service';
import { PinPad } from './pin-pad';

interface ForgotPinModalProps {
  walletId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'sending' | 'otp' | 'new-pin' | 'confirm-pin' | 'success';

export function ForgotPinModal({ walletId, onClose, onSuccess }: ForgotPinModalProps) {
  const [step, setStep] = useState<Step>('sending');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await pinService.forgot(walletId);
      setStep('otp');
    } catch {
      setError("Erreur lors de l'envoi de l'OTP. Réessayez.");
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  // const handleOtpComplete = async (value: string) => {
  //   setOtp(value);
  //   if (value.length === 6) {
  //     setStep('new-pin');
  //   }
  // };

  const handleNewPinComplete = (value: string) => {
    setNewPin(value);
    if (value.length === 4) {
      setStep('confirm-pin');
    }
  };

  const handleConfirmPinComplete = async (value: string) => {
    setConfirmPin(value);
    if (value.length !== 4) return;

    if (value !== newPin) {
      setError('Les codes ne correspondent pas.');
      setNewPin('');
      setConfirmPin('');
      setStep('new-pin');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await pinService.reset(walletId, otp, newPin);
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch {
      setError('Code OTP invalide ou expiré. Réessayez.');
      setOtp('');
      setNewPin('');
      setConfirmPin('');
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handlePinPadChange = (value: string) => {
    if (step === 'new-pin') handleNewPinComplete(value);
    else if (step === 'confirm-pin') handleConfirmPinComplete(value);
  };

  //const pinValue = step === 'new-pin' ? newPin : step === 'confirm-pin' ? confirmPin : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white">
        <div className="bg-allness-dark px-6 py-5 flex items-center justify-between relative">
          <div className="flex flex-col items-center w-full">
            <img src="/afrilinkpay_logo1.svg" alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-white text-sm font-semibold">
              allness<span className="text-allness-orange">Pay</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-white/70 hover:text-white"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          {/* Step: Sending OTP */}
          {step === 'sending' && (
            <>
              <h3 className="text-base font-semibold text-allness-dark mb-1">
                Réinitialisation du PIN
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Un code de vérification va être envoyé à votre adresse email.
              </p>
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Envoi en cours...' : 'Envoyer le code'}
              </button>
            </>
          )}

          {/* Step: Enter OTP */}
          {step === 'otp' && (
            <>
              <h3 className="text-base font-semibold text-allness-dark mb-1">
                Saisir le code OTP
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Entrez le code à 6 chiffres envoyé par email.
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setOtp(v);
                  if (v.length === 6) setStep('new-pin');
                }}
                placeholder="000000"
                className="w-full h-12 text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
              />
              {error && <p className="text-xs text-red-500 mt-4">{error}</p>}
            </>
          )}

          {/* Step: Create new PIN */}
          {step === 'new-pin' && (
            <>
              <h3 className="text-base font-semibold text-allness-dark mb-1">
                Créer un nouveau PIN
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Choisissez un code à 4 chiffres pour sécuriser vos transactions.
              </p>
              <PinPad
                value={newPin}
                onChange={handlePinPadChange}
                error={!!error}
              />
            </>
          )}

          {/* Step: Confirm new PIN */}
          {step === 'confirm-pin' && (
            <>
              <h3 className="text-base font-semibold text-allness-dark mb-1">
                Confirmer le nouveau PIN
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Ressaisissez le même code pour confirmer.
              </p>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-allness-orange animate-spin" />
                </div>
              ) : (
                <PinPad
                  value={confirmPin}
                  onChange={handleConfirmPinComplete}
                  error={!!error}
                />
              )}
              {error && <p className="text-xs text-red-500 mt-4">{error}</p>}
            </>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-allness-green" />
              </div>
              <h3 className="text-base font-semibold text-allness-dark mb-1">
                PIN réinitialisé !
              </h3>
              <p className="text-xs text-gray-500">
                Votre nouveau PIN a été enregistré avec succès.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
