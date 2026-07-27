import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@/lib/mock/dashboard-data";

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Dernières transactions</h3>
        <a href="/dashboard/transactions" className="text-xs text-afrilink-green font-medium">
          Voir tout
        </a>
      </div>

      <ul className="divide-y divide-gray-100">
        {transactions.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  t.type === "credit" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {t.type === "credit" ? (
                  <ArrowDownLeft className="w-4 h-4 text-afrilink-green" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
            </div>
            <span
              className={`text-sm font-semibold ${
                t.type === "credit" ? "text-afrilink-green" : "text-red-500"
              }`}
            >
              {t.type === "credit" ? "+" : ""}
              {new Intl.NumberFormat("fr-FR").format(t.amount)} FCFA
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
