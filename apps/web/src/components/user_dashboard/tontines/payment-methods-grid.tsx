import { Wallet, CreditCard, Smartphone, Landmark } from "lucide-react";

export type PaymentMethod = "wallet" | "card" | "mobile_money" | "bank_transfer";

interface PaymentMethodsGridProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const methods: {
  key: PaymentMethod;
  label: string;
  icon: typeof Wallet;
  logo?: string;
  color: string;
}[] = [
  { key: "wallet", label: "Portefeuille", icon: Wallet, logo: "/afrilinkpay_logo2.svg", color: "text-afrilink-dark" },
  { key: "card", label: "Carte Bancaire", icon: CreditCard, logo: "/bank.png", color: "text-blue-600" },
  { key: "mobile_money", label: "Mobile Money", icon: Smartphone, logo: "/mtn-momo.png", color: "text-yellow-600" },
  { key: "bank_transfer", label: "Virement", icon: Landmark, logo: "/orange-money.png", color: "text-orange-500" },
];

export function PaymentMethodsGrid({ selected, onSelect }: PaymentMethodsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map(({ key, label, icon: Icon, logo, color }) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`relative h-28 rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2.5 text-center transition-all ${
              isSelected
                ? "border-afrilink-green bg-green-50/50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            {isSelected && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-afrilink-green" />
            )}

            {logo ? (
              <span className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                <img src={logo} alt={label} className="w-full h-full object-contain p-1.5" />
              </span>
            ) : (
              <span className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </span>
            )}

            <span
              className={`text-xs leading-tight font-medium ${
                isSelected ? "text-afrilink-green" : "text-gray-700"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
