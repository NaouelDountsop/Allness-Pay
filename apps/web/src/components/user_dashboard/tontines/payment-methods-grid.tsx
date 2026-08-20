export type PaymentMethod = 'wallet' | 'card' | 'mobile_money' | 'orange_money';

interface PaymentMethodsGridProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const methods: { key: PaymentMethod; label: string; image: string }[] = [
  { key: 'wallet', label: 'Portefeuille Allness', image: '/allnesspay_logo2.png' },
  { key: 'mobile_money', label: 'MTN Mobile Money', image: '/mtn-momo.png' },
  { key: 'orange_money', label: 'Orange Money', image: '/orange-money.png' },
  { key: 'card', label: 'Carte Bancaire', image: '/bank.png' },
];

export function PaymentMethodsGrid({ selected, onSelect }: PaymentMethodsGridProps) {
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
