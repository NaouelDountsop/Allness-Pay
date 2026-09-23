import { useState } from 'react';
import type { PaymentMethodType } from '@/context/deposit-flow.constants';
import { getAvailableTontineMethods } from '@/utils/payment-methods';
import { Clock } from 'lucide-react';

export type { PaymentMethodType as PaymentMethod };

interface PaymentMethodsGridProps {
  selected: PaymentMethodType;
  onSelect: (method: PaymentMethodType) => void;
  countryCode?: string;
}

export function PaymentMethodsGrid({ selected, onSelect, countryCode }: PaymentMethodsGridProps) {
  const methods = getAvailableTontineMethods(countryCode ?? 'CM');
  const [hoveredKey, setHoveredKey] = useState<PaymentMethodType | null>(null);

  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map(({ key, label, image, disabled }) => {
        const isSelected = selected === key;
        const isHovered = hoveredKey === key;
        const showOverlay = disabled && isHovered;

        return (
          <button
            key={key}
            type="button"
            onClick={() => !disabled && onSelect(key)}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
            disabled={disabled}
            className={`relative h-24 rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 text-center transition-colors ${
              disabled
                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                : isSelected
                  ? 'border-allness-green bg-green-50/40'
                  : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {disabled && (
              <div
                className={`absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1 bg-white/90 transition-opacity z-10 ${
                  showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Clock className="w-5 h-5 text-allness-orange" />
                <span className="text-[11px] font-semibold text-allness-orange">Bientôt disponible</span>
              </div>
            )}
            <img src={image} alt={label} className="w-8 h-8 object-contain" />
            <span
              className={`text-xs leading-tight ${
                isSelected ? 'text-allness-green font-medium' : 'text-gray-700'
              }`}
            >
              {label}
            </span>
            {isSelected && (
              <span className="text-[10px] font-medium text-allness-green">SÉLECTIONNÉ</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
