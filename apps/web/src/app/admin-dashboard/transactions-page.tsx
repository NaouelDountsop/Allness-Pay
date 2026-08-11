import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  Download,
  Eye,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";
import { Badge, Pagination } from "../../components/ui";
import { TransactionDetailModal, type TransactionDetail } from "./TransactionDetailModal";
import { adminService } from "../../lib/api/admin.service";

const TYPE_ICONS: Record<string, typeof Wallet> = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  transfer_in: ArrowDownLeft,
  transfer_out: ArrowUpRight,
};

const TYPE_LABELS: Record<string, string> = {
  deposit: "Dépôt",
  withdrawal: "Retrait",
  transfer_in: "Transfert reçu",
  transfer_out: "Transfert envoyé",
};

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TransactionDetail | null>(null);

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: adminService.listTransactions,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-transaction-stats"],
    queryFn: adminService.getTransactionStats,
  });

  const formatXAF = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value) + " XAF";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoading = loadingTx || loadingStats;

  if (isLoading) {
    return (
      <AdminLayout active="Transactions">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const paginatedTx = transactions?.slice((page - 1) * 10, page * 10) ?? [];
  const totalPages = Math.ceil((transactions?.length ?? 0) / 10);

  return (
    <AdminLayout active="Transactions">
      <h1 className="text-xl font-bold text-afrilink-dark mb-1">Gestion des Transactions</h1>
      <p className="text-sm text-gray-400 mb-6">
        Surveillez, filtrez et intervenez sur l'ensemble des flux financiers.
      </p>

      {/* Stats cards - independent from table */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Volume total</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatXAF(stats?.totalVolume ?? 0)}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Complétées</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.completedCount ?? 0}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </span>
            <span className="text-sm text-gray-300">Total transactions</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalTransactions ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              Type de transaction
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
                <th className="font-medium pb-3 hidden lg:table-cell">Date</th>
                <th className="font-medium pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTx.map((t) => {
                const isCredit = t.type === "deposit" || t.type === "transfer_in";
                const TypeIcon = TYPE_ICONS[t.type] ?? Wallet;
                return (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3.5">
                      <p className="text-xs font-medium text-afrilink-dark">{t.user}</p>
                      <p className="text-[11px] text-gray-400">{t.reference}</p>
                    </td>
                    <td className="text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <TypeIcon className="h-3.5 w-3.5 text-gray-400" />
                        {TYPE_LABELS[t.type] ?? t.type}
                      </div>
                    </td>
                    <td
                      className={`text-xs font-medium ${isCredit ? "text-afrilink-green" : "text-red-500"}`}
                    >
                      {isCredit ? "+" : "-"} {formatXAF(t.amount)}
                    </td>
                    <td>
                      <Badge tone="green" dot>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="text-xs text-gray-500 hidden lg:table-cell">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() =>
                          setSelected({
                            reference: t.reference,
                            date: formatDate(t.createdAt),
                            status: t.status as "Complété" | "En attente" | "Bloqué",
                            amount: formatXAF(t.amount),
                            type: TYPE_LABELS[t.type] ?? t.type,
                            fees: "—",
                            device: "—",
                            location: "—",
                            timeline: [
                              { label: "Transaction enregistrée", meta: `${t.user} · ${formatDate(t.createdAt)}` },
                            ],
                          })
                        }
                        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark ml-auto"
                        aria-label="Voir"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedTx.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
          Les alertes de comportement suspect seront affichées ici une fois détectées par le système.
        </p>
      </div>

      {selected && (
        <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
      )}
    </AdminLayout>
  );
}
