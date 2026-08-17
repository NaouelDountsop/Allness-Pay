import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Loader2 } from 'lucide-react';
import { transactionService, type WalletTransaction } from '@/lib/api/transaction.service';

interface TransactionsListProps {
  transactions: WalletTransaction[];
  onSelect?: (transaction: WalletTransaction) => void;
  isLoading?: boolean;
}

export function TransactionsList({ transactions, onSelect, isLoading }: TransactionsListProps) {
  const navigate = useNavigate();
  if (isLoading) {
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
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
        </div>
      </div>
    );
  }

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
        {transactions.map((t) => {
          const credit = transactionService.isCredit(t.type);
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  if (onSelect) {
                    onSelect(t);
                  } else {
                    navigate('/dashboard/transactions');
                  }
                }}
                className="w-full flex items-center justify-between py-3 px-2 -mx-2 rounded-xl text-left transition-colors hover:bg-[#082B37]/[0.04] active:bg-[#082B37]/[0.07] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D28E2F]/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      credit ? 'bg-afrilink-green/10' : 'bg-red-50'
                    }`}
                  >
                    {credit ? (
                      <ArrowDownLeft className="w-4 h-4 text-afrilink-green" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#082B37] font-medium truncate">
                      {transactionService.getTypeLabel(t.type)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium bg-[#082B37]/10 text-[#082B37] px-1.5 py-0.5 rounded">
                        {t.reference || '—'}
                      </span>
                      <p className="text-xs text-[#D28E2F]">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <span
                    className={`text-xs sm:text-sm font-semibold text-right whitespace-nowrap ${
                      credit ? 'text-afrilink-green' : 'text-red-500'
                    }`}
                  >
                    {credit ? '+' : '-'}
                    {new Intl.NumberFormat('fr-FR').format(t.amount)}{' '}
                    <span className="hidden sm:inline">XAF</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#082B37]/25 hidden sm:block" />
                </div>
              </button>
            </li>
          );
        })}
        {transactions.length === 0 && (
          <li className="py-10 text-center text-sm text-gray-400">Aucune transaction</li>
        )}
      </ul>
    </div>
  );
}
