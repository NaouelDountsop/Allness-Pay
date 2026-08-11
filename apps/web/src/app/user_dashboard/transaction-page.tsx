import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  ShieldCheck,
  CheckCircle,
  ChevronDown,
  Download,
  Eye,
  //AlertTriangle,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/user_dashboard/dash-layout';
import { DashboardHeader } from '../../components/user_dashboard/header';
import { Badge } from '../../components/ui';
import { TransactionDetailModal } from './transaction-detail-modal';
import { transactionService, type WalletTransaction } from '../../lib/api/transaction.service';
import { walletService } from '../../lib/api/wallet.service';

export default function TransactionsPage() {
  const [selected, setSelected] = useState<WalletTransaction | null>(null);

  const { data: wallet } = useQuery({
    queryKey: ['wallet-primary'],
    queryFn: walletService.getPrimary,
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', wallet?.id],
    queryFn: () => transactionService.listByWallet(wallet!.id),
    enabled: !!wallet?.id,
  });

  const totalVolume =
    transactions?.reduce((sum, t) => {
      const credit = transactionService.isCredit(t.type);
      return credit ? sum + t.amount : sum - t.amount;
    }, 0) ?? 0;

  const completedCount = transactions?.length ?? 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark mb-1">Transactions</h1>
        <p className="text-sm text-gray-400 mb-6">Consultez l'historique de vos transactions.</p>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="bg-afrilink-dark rounded-2xl p-5">
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

          <div className="bg-afrilink-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </span>
              <span className="text-sm text-gray-300">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{transactions?.length ?? 0}</p>
            <p className="text-xs text-gray-400">Depuis la création</p>
          </div>

          <div className="bg-afrilink-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </span>
              <span className="text-sm text-gray-300">Complétées</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{completedCount}</p>
            <p className="text-xs text-green-400">↗ Réussites</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
                Type
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
                Statut
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <button className="h-9 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Download className="w-3.5 h-3.5" />
              Exporter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="font-medium pb-3">Utilisateur / Référence</th>
                  <th className="font-medium pb-3">Type</th>
                  <th className="font-medium pb-3">Montant</th>
                  <th className="font-medium pb-3">Statut</th>
                  <th className="font-medium pb-3">Date</th>
                  <th className="font-medium pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((t) => {
                  const credit = transactionService.isCredit(t.type);
                  return (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3.5">
                        <p className="text-xs font-medium text-afrilink-dark">{t.reference}</p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[200px]">
                          {t.description}
                        </p>
                      </td>
                      <td className="text-xs text-gray-600">
                        {transactionService.getTypeLabel(t.type)}
                      </td>
                      <td
                        className={`text-xs font-medium ${credit ? 'text-afrilink-green' : 'text-red-500'}`}
                      >
                        {credit ? '+' : '-'} {new Intl.NumberFormat('fr-FR').format(t.amount)} XAF
                      </td>
                      <td>
                        <Badge
                          tone={
                            t.status === 'completed'
                              ? 'green'
                              : t.status === 'pending'
                                ? 'amber'
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
                      <td className="text-xs text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelected(t)}
                          className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark ml-auto"
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
          currency="XAF"
          onClose={() => setSelected(null)}
        />
      )}
    </DashboardLayout>
  );
}
