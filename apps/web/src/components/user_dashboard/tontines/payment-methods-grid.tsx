import { Wallet, CreditCard, Smartphone, Landmark } from "lucide-react";

export type PaymentMethod = "wallet" | "card" | "mobile_money" | "bank_transfer";

interface PaymentMethodsGridProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const methods: { key: PaymentMethod; label: string; icon: typeof Wallet }[] = [
  { key: "wallet", label: "Portefeuille Afrilink Pay", icon: Wallet },
  { key: "card", label: "Carte Bancaire", icon: CreditCard },
  { key: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { key: "bank_transfer", label: "Virement Bancaire", icon: Landmark },
];

export function PaymentMethodsGrid({ selected, onSelect }: PaymentMethodsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map(({ key, label, icon: Icon }) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`h-24 rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 text-center transition-colors ${
              isSelected
                ? "border-afrilink-green bg-green-50/40"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Icon className={`w-5 h-5 ${isSelected ? "text-afrilink-green" : "text-gray-500"}`} />
            <span
              className={`text-xs leading-tight ${
                isSelected ? "text-afrilink-green font-medium" : "text-gray-700"
              }`}
            >
              {label}
            </span>
            {isSelected && (
              <span className="text-[10px] font-medium text-afrilink-green">SÉLECTIONNÉ</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
