import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { PinPad } from './pin-pad';

interface PinConfirmModalProps {
  onConfirm: (pin: string) => boolean | Promise<boolean>;
  onClose: () => void;
}

export function PinConfirmModal({ onConfirm, onClose }: PinConfirmModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    setPin(value);
    setError(false);
  };

  const handleConfirm = async () => {
    if (pin.length < 4 || loading) return;
    setLoading(true);
    try {
      const ok = await onConfirm(pin);
      if (!ok) {
        setError(true);
        setPin('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white">
        <div className="bg-afrilink-dark px-6 py-5 flex items-center justify-between relative">
          <div className="flex flex-col items-center w-full">
            <img src="/allnesspay_logo1.png" alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-white text-sm font-semibold">
              Allness<span className="text-afrilink-orange">Pay</span>
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
            Confirmer la transaction
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Veuillez saisir votre code PIN à 4 chiffres pour valider le transfert.
          </p>

          <PinPad value={pin} onChange={handleChange} error={error} />

          {error && <p className="text-xs text-red-500 mt-4">Code PIN incorrect, réessayez.</p>}

          <button
            onClick={handleConfirm}
            disabled={pin.length < 4 || loading}
            className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium mt-6 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Vérification...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
