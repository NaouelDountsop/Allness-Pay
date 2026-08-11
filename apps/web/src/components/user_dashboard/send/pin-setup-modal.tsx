import { useState } from 'react';
import { X } from 'lucide-react';
import { PinPad } from './pin-pad';

interface PinSetupModalProps {
  onComplete: (pin: string) => void;
  onClose: () => void;
}

export function PinSetupModal({ onComplete, onClose }: PinSetupModalProps) {
  const [phase, setPhase] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);

  const handleChange = (value: string) => {
    if (phase === 'create') {
      setPin(value);
      if (value.length === 4) {
        setTimeout(() => setPhase('confirm'), 200);
      }
    } else {
      setConfirmPin(value);
      if (value.length === 4) {
        if (value === pin) {
          onComplete(pin);
        } else {
          setError(true);
          setTimeout(() => {
            setConfirmPin('');
            setError(false);
          }, 700);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white">
        <div className="bg-afrilink-dark px-6 py-5 flex items-center justify-between relative">
          <div className="flex flex-col items-center w-full">
            <img src="/afrilinkpay_logo2.svg" alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-white text-sm font-semibold">
              Afrilink<span className="text-afrilink-orange">Pay</span>
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
          <h3 className="text-base font-semibold text-afrilink-dark mb-1">
            {phase === 'create' ? 'Créer votre code PIN' : 'Confirmer votre code PIN'}
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            {phase === 'create'
              ? 'Ce code à 4 chiffres sécurisera toutes vos transactions.'
              : 'Veuillez ressaisir le même code pour confirmer.'}
          </p>

          <PinPad
            value={phase === 'create' ? pin : confirmPin}
            onChange={handleChange}
            error={error}
          />

          {error && (
            <p className="text-xs text-red-500 mt-4">Les codes ne correspondent pas, réessayez.</p>
          )}
        </div>
      </div>
    </div>
  );
}
