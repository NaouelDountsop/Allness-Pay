import { ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Transaction } from '@/lib/mock/dashboard-data';

interface TransactionsListProps {
  transactions: Transaction[];
  onSelect?: (transaction: Transaction) => void;
}

export function TransactionsList({ transactions, onSelect }: TransactionsListProps) {
  return (
    <div className="rounded-2xl border border-[#082B37]/10 shadow-sm p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#082B37]">Dernières transactions</h3>
        <a
          href="/dashboard/transactions"
          className="text-xs text-[#D28E2F] font-semibold hover:text-[#082B37] hover:underline underline-offset-2 transition-colors"
        >
          Voir tout
        </a>
      </div>

      <ul className="space-y-1">
        {transactions.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect?.(t)}
              className="w-full flex items-center justify-between py-3 px-2 -mx-2 rounded-xl text-left transition-colors hover:bg-[#082B37]/[0.04] active:bg-[#082B37]/[0.07] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D28E2F]/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#082B37]/10">
                  {t.type === 'credit' ? (
                    <ArrowDownLeft className="w-4 h-4 text-[#082B37]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-[#082B37]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#082B37] font-medium truncate">{t.label}</p>
                  <p className="text-xs text-[#D28E2F]">{t.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-2">
                <span
                  className={`text-xs sm:text-sm font-semibold text-right whitespace-nowrap ${
                    t.type === 'credit' ? 'text-afrilink-green' : 'text-red-500'
                  }`}
                >
                  {t.type === 'credit' ? '+' : ''}
                  {new Intl.NumberFormat('fr-FR').format(t.amount)}{' '}
                  <span className="hidden sm:inline">FCFA</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#082B37]/25 hidden sm:block" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
