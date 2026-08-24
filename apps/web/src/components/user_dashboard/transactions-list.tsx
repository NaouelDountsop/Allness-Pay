import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Loader2, XCircle } from 'lucide-react';
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
          <h3 className="text-sm font-semibold text-[#082B37] dark:text-white" >Dernières transactions</h3>
          <a
            href="/dashboard/transactions"
            className="text-xs text-[#D28E2F] font-semibold hover:text-[#082B37] hover:underline underline-offset-2 transition-colors"
          >
            Voir tout
          </a>
        </div>
        <div className="flex items-center justify-center py-10 dark:text-white">
          <Loader2 className="w-6 h-6 text-allness-orange animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#082B37]/10 shadow-sm p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#082B37] dark:text-white/90">Dernières transactions</h3>
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
          const isFailed = t.status === 'failed';
          const isCompleted = t.status === 'completed';
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
                      isFailed ? 'bg-red-50' : credit ? 'bg-allness-green/10' : 'bg-red-50'
                    }`}
                  >
                    {isFailed ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : credit ? (
                      <ArrowDownLeft className="w-4 h-4 text-allness-green" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#082B37] dark:text-white/90font-medium truncate dark:text-white">
                      {transactionService.getTypeLabel(t.type)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 ">
                      <span className="text-[10px] dark:text-white/90font-medium bg-[#082B37]/10 text-[#082B37] px-1.5 py-0.5 rounded dark:text-allness-green">
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
                      isFailed ? 'text-red-500' : credit ? 'text-allness-green' : 'text-red-500'
                    }`}
                  >
                    {isCompleted ? (credit ? '+' : '-') : ''}
                    {new Intl.NumberFormat('fr-FR').format(t.amount)}{' '}
                    <span className="hidden sm:inline">XAF</span>
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isFailed ? 'bg-red-50' : 'bg-allness-green/10'
                    }`}
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${isFailed ? 'text-red-500' : 'text-allness-green'}`}
                    />
                  </div>
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
