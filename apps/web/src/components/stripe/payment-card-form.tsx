import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import type { StripeElementChangeEvent } from '@stripe/stripe-js';
import { ShieldCheck } from 'lucide-react';

const elementStyle = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#1a1a2e',
      padding: '12px',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: {
      color: '#ef4444',
    },
  },
};

interface PaymentCardFormProps {
  holderName: string;
  onHolderNameChange: (name: string) => void;
  onCardChange: (complete: boolean) => void;
  onError: (message: string) => void;
}

export function PaymentCardForm({
  holderName,
  onHolderNameChange,
  onCardChange,
  onError,
}: PaymentCardFormProps) {
  const handleCardNumberChange = (event: StripeElementChangeEvent) => {
    onCardChange(event.complete);
    if (event.error) {
      onError(event.error.message);
    } else {
      onError('');
    }
  };

  const handleCardExpiryChange = (event: StripeElementChangeEvent) => {
    if (event.error) onError(event.error.message);
  };

  const handleCardCvcChange = (event: StripeElementChangeEvent) => {
    if (event.error) onError(event.error.message);
  };

  return (
    <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Numéro de carte
        </label>
        <div className="h-12 rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-allness-orange/30 focus-within:border-allness-orange transition-all">
          <CardNumberElement
            options={elementStyle}
            onChange={handleCardNumberChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Date d'expiration
          </label>
          <div className="h-12 rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-allness-orange/30 focus-within:border-allness-orange transition-all">
            <CardExpiryElement
              options={elementStyle}
              onChange={handleCardExpiryChange}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            CVV
          </label>
          <div className="h-12 rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-allness-orange/30 focus-within:border-allness-orange transition-all">
            <CardCvcElement
              options={elementStyle}
              onChange={handleCardCvcChange}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Nom du titulaire
        </label>
        <input
          type="text"
          autoComplete="cc-name"
          value={holderName}
          onChange={(e) => onHolderNameChange(e.target.value)}
          placeholder="Jean Dupont"
          className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:ring-2 focus-within:ring-allness-orange/30 focus-within:border-allness-orange transition-all bg-white"
        />
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-allness-green" />
          <span className="text-xs font-semibold text-allness-dark">100% sécurisé</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Vos données de carte sont chiffrées et protegées.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[9px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">PCI DSS</span>
          <span className="text-[9px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">Verified by VISA</span>
          <span className="text-[9px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">MasterCard SecureCode</span>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <img src="/OIP%20(2).webp" alt="Badge 1" className="h-6 w-auto" />
          <img src="/2026-09-08_113011.png" alt="Badge 2" className="h-6 w-auto" />
          <img src="/R.jpg" alt="Badge 3" className="h-6 w-auto" />
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
        En confirmant, vous acceptez les conditions générales de vente.
      </p>
    </form>
  );
}
