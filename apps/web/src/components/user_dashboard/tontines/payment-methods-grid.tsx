import type { PaymentMethodType } from '@/context/deposit-flow.constants';
import { getAvailableTontineMethods } from '@/utils/payment-methods';

export type { PaymentMethodType as PaymentMethod };

interface PaymentMethodsGridProps {
  selected: PaymentMethodType;
  onSelect: (method: PaymentMethodType) => void;
  countryCode?: string;
}

export function PaymentMethodsGrid({ selected, onSelect, countryCode }: PaymentMethodsGridProps) {
  const methods = getAvailableTontineMethods(countryCode ?? 'CM');

  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map(({ key, label, image }) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`h-24 rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 text-center transition-colors ${
              isSelected
                ? 'border-allness-green bg-green-50/40'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
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
