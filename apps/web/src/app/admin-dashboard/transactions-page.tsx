import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Eye,
  AlertTriangle,
  Download,
  Loader2,
  XCircle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Badge, Pagination } from '../../components/ui';
import { TransactionDetailModal } from './TransactionDetailModal';
import { adminService, type AdminTransaction } from '../../lib/api/admin.service';

const STATUS_BADGE: Record<string, { tone: 'green' | 'orange' | 'red' | 'blue' | 'amber'; label: string }> = {
  COMPLETED: { tone: 'green', label: 'Complété' },
  completed: { tone: 'green', label: 'Complété' },
  PENDING: { tone: 'orange', label: 'En attente' },
  pending: { tone: 'orange', label: 'En attente' },
  FAILED: { tone: 'red', label: 'Échoué' },
  failed: { tone: 'red', label: 'Échoué' },
  BLOCKED: { tone: 'red', label: 'Bloqué' },
  blocked: { tone: 'red', label: 'Bloqué' },
};

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  transfer_in: 'Transfert reçu',
  transfer_out: 'Transfert envoyé',
};

function formatAmount(amount: number, type: string): string {
  const credit = type === 'deposit' || type === 'transfer_in';
  const formatted = new Intl.NumberFormat('fr-FR').format(amount);
  return credit ? `+ ${formatted}` : `- ${formatted}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminTransaction | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  const { data: txData, isLoading } = useQuery({
    queryKey: ['admin-transactions', page, typeFilter, statusFilter],
    queryFn: () =>
      adminService.listTransactions({
        page,
        pageSize: 10,
        ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminService.getDashboardStats,
  });

  const { data: failedData } = useQuery({
    queryKey: ['admin-transactions-failed'],
    queryFn: () =>
      adminService.listTransactions({
        status: 'FAILED',
        pageSize: 1,
      }),
  });

  const transactions = txData?.data ?? [];
  const totalPages = txData?.pageCount ?? 1;

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminService.exportTransactions();
      downloadBlob(blob, `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      // silent
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout active="Transactions">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-afrilink-dark mb-1">Gestion des Transactions</h1>
          <p className="text-sm text-gray-400">
            Surveillez, filtrez et intervenez sur l'ensemble des flux financiers.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="h-9 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Exporter CSV
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Volume total</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {new Intl.NumberFormat('fr-FR').format(stats?.totalLiquidity ?? 0)} XAF
          </p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Complétées</span>
          </div>
          <p className="text-2xl font-bold text-white">{txData?.totalItems ?? 0}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </span>
            <span className="text-sm text-gray-300">Échouées</span>
          </div>
          <p className="text-2xl font-bold text-white">{failedData?.totalItems ?? 0}</p>
          <p className="text-xs text-red-400">✕ À traiter</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-sm text-gray-300">Total transactions</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalTransactions ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
          >
            <option value="all">Tous les types</option>
            <option value="deposit">Dépôt</option>
            <option value="withdrawal">Retrait</option>
            <option value="transfer_in">Transfert reçu</option>
            <option value="transfer_out">Transfert envoyé</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
          >
            <option value="all">Tous les statuts</option>
            <option value="COMPLETED">Complété</option>
            <option value="PENDING">En attente</option>
            <option value="FAILED">Échoué</option>
          </select>
          <button
            onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setPage(1); }}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="font-medium pb-3">Utilisateur / Référence</th>
                  <th className="font-medium pb-3 hidden sm:table-cell">Type</th>
                  <th className="font-medium pb-3">Montant</th>
                  <th className="font-medium pb-3">Statut</th>
                  <th className="font-medium pb-3 hidden lg:table-cell">Date</th>
                  <th className="font-medium pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const badge = STATUS_BADGE[t.status] ?? { tone: 'orange' as const, label: t.status };
                  const isCredit = t.type === 'deposit' || t.type === 'transfer_in';
                  return (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3.5">
                        <p className="text-xs font-medium text-afrilink-dark truncate">{t.user}</p>
                        <p className="text-[11px] text-gray-400">{t.reference}</p>
                      </td>
                      <td className="text-xs text-gray-600 hidden sm:table-cell">
                        {TYPE_LABELS[t.type] ?? t.type}
                      </td>
                      <td className={`text-xs font-medium ${isCredit ? 'text-afrilink-green' : 'text-afrilink-dark'}`}>
                        {formatAmount(t.amount, t.type)}
                      </td>
                      <td>
                        <Badge tone={badge.tone} dot>
                          {badge.label}
                        </Badge>
                      </td>
                      <td className="text-xs text-gray-500 hidden lg:table-cell">
                        {formatDateTime(t.createdAt)}
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
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                      Aucune transaction trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm font-semibold text-red-600">Audit des Alertes</p>
        </div>
        <p className="text-xs text-gray-500">
          Les alertes de comportement suspect seront affichées ici une fois détectées par le
          système.
        </p>
      </div>

      {selected && (
        <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
      )}
    </AdminLayout>
  );
}
