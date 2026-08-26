import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  ShieldCheck,
  CheckCircle,
  Download,
  Eye,
  Loader2,
  Search,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/user_dashboard/dash-layout';
import { DashboardHeader } from '../../components/user_dashboard/header';
import { Badge } from '../../components/ui';
import { Pagination } from '../../components/ui/pagination';
import { TransactionDetailModal } from './transaction-detail-modal';
import { transactionService, type WalletTransaction } from '../../lib/api/transaction.service';
import { walletService } from '../../lib/api/wallet.service';

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<WalletTransaction | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: wallet } = useQuery({
    queryKey: ['wallet-primary'],
    queryFn: walletService.getPrimary,
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', wallet?.id],
    queryFn: () => transactionService.listByWallet(wallet!.id),
    enabled: !!wallet?.id,
  });

  const filtered = transactions?.filter((t) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (t.reference ?? '').toLowerCase().includes(query) ||
      transactionService.getTypeLabel(t.type).toLowerCase().includes(query) ||
      (t.counterpartyName ?? '').toLowerCase().includes(query) ||
      (t.phoneNumber ?? '').toLowerCase().includes(query) ||
      transactionService.getOperatorLabel(t.operator).toLowerCase().includes(query);
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil((filtered?.length ?? 0) / PAGE_SIZE);
  const paginated = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalVolume =
    transactions?.reduce((sum, t) => {
      if (t.status !== 'completed') return sum;
      const credit = transactionService.isCredit(t.type);
      const amount = Number(t.amount);
      return credit ? sum + amount : sum - amount;
    }, 0) ?? 0;

  const completedCount = transactions?.filter((t) => t.status === 'completed').length ?? 0;
  const failedCount = transactions?.filter((t) => t.status === 'failed').length ?? 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-allness-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-allness-dark dark:text-white">{t('transactions.title')}</h1>
            <p className="text-sm text-gray-400">{t('transactions.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!filtered || filtered.length === 0) return;
                const rows = [['Date', 'Type', 'Montant', 'Statut', 'Référence', 'Contrepartie']];
                filtered.forEach((t) => {
                  rows.push([
                    new Date(t.createdAt).toLocaleDateString('fr-FR'),
                    transactionService.getTypeLabel(t.type),
                    `${Number(t.amount)} XAF`,
                    t.status,
                    t.reference ?? '—',
                    t.counterpartyName ?? t.phoneNumber ?? '—',
                  ]);
                });
                const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="group relative h-9 rounded-lg bg-allness-green text-white text-xs font-medium flex items-center justify-center sm:px-4 px-0 w-9 sm:w-auto hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-2">{t('transactions.export')}</span>
              <span className="sm:hidden absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#082B37] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {t('transactions.export')}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-400" />
              </span>
              <span className="text-sm text-gray-300">{t('transactions.totalVolume')}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {new Intl.NumberFormat('fr-FR').format(totalVolume)} XAF
            </p>
            <p className="text-xs text-green-400">↗ {t('transactions.netBalance')}</p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </span>
              <span className="text-sm text-gray-300">{t('transactions.count')}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{transactions?.length ?? 0}</p>
            <p className="text-xs text-gray-400">{t('transactions.sinceCreation')}</p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </span>
              <span className="text-sm text-gray-300">{t('transactions.completed')}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{completedCount}</p>
            <p className="text-xs text-green-400">↗ {t('transactions.successes')}</p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </span>
              <span className="text-sm text-gray-300">{t('transactions.failed')}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{failedCount}</p>
            <p className="text-xs text-red-400">✕ {t('transactions.toProcess')}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 items-end">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('transactions.search')}</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('transactions.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-allness-orange"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('transactions.type')}</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
              >
                <option value="all">{t('transactions.allTypes')}</option>
                <option value="deposit">{t('transactions.typeDeposit')}</option>
                <option value="withdrawal">{t('transactions.typeWithdrawal')}</option>
                <option value="transfer_in">{t('transactions.typeTransferIn')}</option>
                <option value="transfer_out">{t('transactions.typeTransferOut')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('transactions.status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
              >
                <option value="all">{t('transactions.allStatuses')}</option>
                <option value="completed">{t('transactions.statusCompleted')}</option>
                <option value="pending">{t('transactions.statusPending')}</option>
                <option value="failed">{t('transactions.statusFailed')}</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="h-10 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('transactions.reset')}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="font-medium pb-3">{t('transactions.headerReference')}</th>
                  <th className="font-medium pb-3 hidden sm:table-cell">{t('transactions.headerType')}</th>
                  <th className="font-medium pb-3 hidden md:table-cell">{t('transactions.headerPerson')}</th>
                  <th className="font-medium pb-3">{t('transactions.headerAmount')}</th>
                  <th className="font-medium pb-3 hidden lg:table-cell">{t('transactions.headerStatus')}</th>
                  <th className="font-medium pb-3 hidden lg:table-cell">{t('transactions.headerDate')}</th>
                  <th className="font-medium pb-3 text-right">{t('transactions.headerActions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated?.map((tx) => {
                  const credit = transactionService.isCredit(tx.type);
                  const isCompleted = tx.status === 'completed';
                  const personName = credit
                    ? (tx.type === 'deposit'
                        ? transactionService.getOperatorLabel(tx.operator) || t('transactions.externalDeposit')
                        : tx.counterpartyName ?? t('transactions.sender'))
                    : (tx.type === 'withdrawal'
                        ? transactionService.getOperatorLabel(tx.operator) || t('transactions.externalWithdrawal')
                        : tx.counterpartyName ?? t('transactions.beneficiary'));
                  return (
                    <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3.5">
                        <p className="text-xs font-medium text-allness-dark truncate max-w-[140px]">{tx.reference}</p>
                      </td>
                      <td className="text-xs text-gray-600 hidden sm:table-cell">
                        {transactionService.getTypeLabel(tx.type)}
                      </td>
                      <td className="text-xs text-gray-600 hidden md:table-cell truncate max-w-[120px]">
                        {personName}
                      </td>
                      <td
                        className={`text-xs font-medium ${
                          tx.status === 'failed' ? 'text-gray-700' : credit ? 'text-allness-green' : 'text-red-500'
                        }`}
                      >
                        {isCompleted ? (credit ? '+' : '-') : ''} {new Intl.NumberFormat('fr-FR').format(tx.amount)} XAF
                      </td>
                      <td className="hidden lg:table-cell">
                        <Badge
                          tone={
                            tx.status === 'completed'
                              ? 'green'
                              : tx.status === 'pending'
                                ? 'orange'
                                : 'red'
                          }
                          dot
                        >
                          {tx.status === 'completed'
                            ? t('transactions.statusCompleted')
                            : tx.status === 'pending'
                              ? t('transactions.statusPending')
                              : t('transactions.statusFailed')}
                        </Badge>
                      </td>
                      <td className="text-xs text-gray-500 hidden lg:table-cell">
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelected(tx)}
                          className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-allness-dark ml-auto"
                          aria-label={t('transactions.view')}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {selected && (
        <TransactionDetailModal
          transaction={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </DashboardLayout>
  );
}
