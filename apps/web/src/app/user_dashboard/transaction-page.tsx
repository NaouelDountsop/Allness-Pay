import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { TransactionDetailModal } from './transaction-detail-modal';
import { transactionService, type WalletTransaction } from '../../lib/api/transaction.service';
import { walletService } from '../../lib/api/wallet.service';

export default function TransactionsPage() {
  const [selected, setSelected] = useState<WalletTransaction | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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
    const matchesSearch =
      (t.reference ?? '').toLowerCase().includes(search.toLowerCase()) ||
      transactionService.getTypeLabel(t.type).toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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
            <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">Transactions</h1>
            <p className="text-sm text-gray-400">Consultez l'historique de vos transactions.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="group relative h-9 rounded-lg bg-allness-green text-white text-xs font-medium flex items-center justify-center sm:px-4 px-0 w-9 sm:w-auto hover:opacity-90 transition-opacity">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-2">Exporter</span>
              <span className="sm:hidden absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#082B37] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Exporter
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
              <span className="text-sm text-gray-300">Volume total</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {new Intl.NumberFormat('fr-FR').format(totalVolume)} XAF
            </p>
            <p className="text-xs text-green-400">↗ Solde net</p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </span>
              <span className="text-sm text-gray-300">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{transactions?.length ?? 0}</p>
            <p className="text-xs text-gray-400">Depuis la création</p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </span>
              <span className="text-sm text-gray-300">Complétées</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{completedCount}</p>
            <p className="text-xs text-green-400">↗ Réussites</p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </span>
              <span className="text-sm text-gray-300">Échouées</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{failedCount}</p>
            <p className="text-xs text-red-400">✕ À traiter</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 items-end">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Rechercher</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Référence, type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-allness-orange"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
              >
                <option value="all">Tous les types</option>
                <option value="deposit">Dépôt</option>
                <option value="withdrawal">Retrait</option>
                <option value="transfer_in">Transfert reçu</option>
                <option value="transfer_out">Transfert envoyé</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Complété</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
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
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="font-medium pb-3">Référence</th>
                  <th className="font-medium pb-3 hidden sm:table-cell">Type</th>
                  <th className="font-medium pb-3">Montant</th>
                  <th className="font-medium pb-3 hidden md:table-cell">Statut</th>
                  <th className="font-medium pb-3 hidden lg:table-cell">Date</th>
                  <th className="font-medium pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((t) => {
                  const credit = transactionService.isCredit(t.type);
                  const isCompleted = t.status === 'completed';
                  return (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3.5">
                        <p className="text-xs font-medium text-allness-dark truncate max-w-[140px]">{t.reference}</p>
                      </td>
                      <td className="text-xs text-gray-600 hidden sm:table-cell">
                        {transactionService.getTypeLabel(t.type)}
                      </td>
                      <td
                        className={`text-xs font-medium ${
                          t.status === 'failed' ? 'text-red-500' : credit ? 'text-allness-green' : 'text-red-500'
                        }`}
                      >
                        {isCompleted ? (credit ? '+' : '-') : ''} {new Intl.NumberFormat('fr-FR').format(t.amount)} XAF
                      </td>
                      <td className="hidden md:table-cell">
                        <Badge
                          tone={
                            t.status === 'completed'
                              ? 'green'
                              : t.status === 'pending'
                                ? 'orange'
                                : 'red'
                          }
                          dot
                        >
                          {t.status === 'completed'
                            ? 'Complété'
                            : t.status === 'pending'
                              ? 'En attente'
                              : 'Échoué'}
                        </Badge>
                      </td>
                      <td className="text-xs text-gray-500 hidden lg:table-cell">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelected(t)}
                          className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-allness-dark ml-auto"
                          aria-label="Voir"
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
