import { UserPlus, QrCode, Smartphone, FileText } from "lucide-react";

const quickActions = [
  { label: "Enregistrer un contact", icon: UserPlus },
  { label: "Scanner un QR", icon: QrCode },
  { label: "Recharge de crédit", icon: Smartphone },
  { label: "Factures & services", icon: FileText },
];

export function QuickActionsGrid() {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-3 hover:border-afrilink-green/40 transition-colors"
          >
            <span className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-afrilink-dark">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-[11px] text-center text-gray-600 leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
