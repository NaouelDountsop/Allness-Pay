import { Receipt } from "lucide-react";
import type { RecentPayment } from "@/lib/mock/payments-data";

interface RecentPaymentsListProps {
  payments: RecentPayment[];
}

export function RecentPaymentsList({ payments }: RecentPaymentsListProps) {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Paiements récents</h3>
        <a href="#" className="text-xs text-afrilink-green font-medium">
          Voir tout
        </a>
      </div>
      <ul className="divide-y divide-gray-100">
        {payments.map((p) => (
          <li key={p.id} className="flex items-center justify-between py-3 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4 text-gray-400" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate">{p.label}</p>
                {p.reference && <p className="text-xs text-gray-400 truncate">{p.reference}</p>}
              </div>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-800 text-right whitespace-nowrap shrink-0 pl-2">
              {new Intl.NumberFormat("fr-FR").format(p.amount)} <span className="hidden sm:inline">FCFA</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
