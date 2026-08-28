import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, XCircle, Clock } from 'lucide-react';
import { transactionService, type WalletTransaction } from '@/lib/api/transaction.service';
import {LoadingSpinner} from '@/components/common/loading-spinner';
import { formatAmount, formatDateShort } from '@/lib/utils';

interface TransactionsListProps {
  transactions: WalletTransaction[];
  onSelect?: (transaction: WalletTransaction) => void;
  isLoading?: boolean;
}

export function TransactionsList({ transactions, onSelect, isLoading }: TransactionsListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{('tontines.latestTransactions')}</h3>
          <a
            href="/dashboard/transactions"
            className="text-xs text-allness-orange font-semibold hover:underline underline-offset-2 transition-colors"
          >
            Voir tout
          </a>
        </div>
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dernières transactions</h3>
        <a
          href="/dashboard/transactions"
          className="text-xs text-allness-orange font-semibold hover:underline underline-offset-2 transition-colors"
        >
          Voir tout
        </a>
      </div>

      <ul className="space-y-1">
        {transactions.map((tx) => {
          const credit = transactionService.isCredit(tx.type);
          const isFailed = tx.status === 'failed';
          const isPending = tx.status === 'pending';
          const isCompleted = tx.status === 'completed';
          return (
            <li key={tx.id}>
              <button
                type="button"
                onClick={() => {
                  if (onSelect) {
                    onSelect(tx);
                  } else {
                    navigate('/dashboard/transactions');
                  }
                }}
                className="w-full flex items-center justify-between py-3 px-2 -mx-2 rounded-xl text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-allness-orange/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isFailed
                        ? 'bg-red-50 dark:bg-red-500/15'
                        : isPending
                          ? 'bg-orange-50 dark:bg-orange-500/15'
                          : credit
                            ? 'bg-emerald-50 dark:bg-emerald-500/15'
                            : 'bg-red-50 dark:bg-red-500/15'
                    }`}
                  >
                    {isFailed ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : isPending ? (
                      <Clock className="w-4 h-4 text-allness-orange" />
                    ) : credit ? (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                      {transactionService.getTypeLabel(tx.type)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded hidden sm:inline">
                        {tx.reference || '—'}
                      </span>
                      <p className="text-xs text-allness-orange sm:hidden">
                        {formatDateShort(tx.createdAt)}
                      </p>
                      <p className="text-xs text-allness-orange hidden sm:block">
                        {formatDateShort(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <span
                    className={`text-xs sm:text-sm font-semibold text-right whitespace-nowrap ${
                      isFailed ? 'text-red-500' : isPending ? 'text-allness-orange' : credit ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {isCompleted ? (credit ? '+' : '-') : ''}
                    {formatAmount(tx.amount)}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isFailed
                        ? 'bg-red-50 dark:bg-red-500/15'
                        : isPending
                          ? 'bg-orange-50 dark:bg-orange-500/15'
                          : credit
                            ? 'bg-emerald-50 dark:bg-emerald-500/15'
                            : 'bg-red-50 dark:bg-red-500/15'
                    }`}
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${isFailed ? 'text-red-500' : isPending ? 'text-allness-orange' : credit ? 'text-emerald-500' : 'text-red-500'}`}
                    />
                  </div>
                </div>
              </button>
            </li>
          );
        })}
        {transactions.length === 0 && (
          <li className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">Aucune transaction</li>
        )}
      </ul>
    </div>
  );
}
