import { useNavigate } from "react-router-dom";
import { UserPlus, QrCode, Smartphone, FileText } from "lucide-react";

const quickActions = [
  { label: "Enregistrer un contact", icon: UserPlus, path: "/dashboard/beneficiaries" },
  { label: "Scanner un QR", icon: QrCode, path: "/dashboard/payments/scan" },
  { label: "Recharge de crédit", icon: Smartphone, path: "/dashboard/payments" },
  { label: "Factures & services", icon: FileText, path: "/dashboard/payments" },
];

export function QuickActionsGrid() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-[#082B37]/10 shadow-sm p-5 bg-white">
      <h3 className="text-sm font-semibold text-[#082B37] mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#082B37]/10 p-3 hover:border-[#D28E2F]/50 hover:bg-[#082B37]/[0.03] active:scale-[0.97] transition-all"
          >
            <span className="w-9 h-9 rounded-lg bg-[#D28E2F]/10 flex items-center justify-center text-[#D28E2F]">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-[11px] text-center text-[#082B37]/70 leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}