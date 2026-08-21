import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PiggyBank,
  Coins,
  ShieldAlert,
  Target,
  Download,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Tabs, Badge } from '../../components/ui';
import { Pagination } from '../../components/ui/pagination';
//import { TableActions } from '../../components/common/table-actions';
import { adminService } from '../../lib/api/admin.service';

const PAGE_SIZE = 10;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TontinesSupervisionPage() {
  const [tab, setTab] = useState('Toutes les Tontines');
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);

  const { data: tontines, isLoading: loadingTontines } = useQuery({
    queryKey: ['admin-tontines'],
    queryFn: adminService.listTontines,
  });

  const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

  const totalTontines = tontines?.length ?? 0;
  const activeTontines = tontines?.filter((t) => t.status === 'active').length ?? 0;
  const totalVolume = tontines?.reduce((sum, t) => sum + Number(t.contributionAmount) * t.currentCycle, 0) ?? 0;

  const isLoading = loadingTontines;

  const filteredTontines = tab === 'Alertes Actives'
    ? tontines?.filter((t) => t.status === 'DRAFT' || Number(t.contributionAmount) * t.memberLimit > 1000000) ?? []
    : tontines ?? [];

  const totalPages = Math.ceil(filteredTontines.length / PAGE_SIZE);
  const paginatedTontines = filteredTontines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminService.exportTontines();
      downloadBlob(blob, `tontines_export_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      // silent
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout active="tontines">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-allness-orange animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="tontines">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-allness-dark mb-1">Supervision des Tontines</h1>
          <p className="text-sm text-gray-400">
            Consultez l'activité, gérez les risques et intervenez si nécessaire.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="h-9 px-4 rounded-lg bg-allness-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Exporter
        </button>
      </div>

      {/* Stats cards - independent from table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-allness-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Tontines Totales</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalTontines)}</p>
        </div>

        <div className="bg-allness-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Volume Total Cotisé</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalVolume)} XAF</p>
        </div>

        <div className="bg-allness-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </span>
            <span className="text-sm text-gray-300">Alertes de Blocage</span>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-xs text-red-400 mt-1">Urgent</p>
        </div>

        <div className="bg-allness-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-sm text-gray-300">Tontines Actives</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(activeTontines)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <Tabs tabs={['Toutes les Tontines', 'Alertes Actives']} active={tab} onChange={setTab} />

        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 mt-4">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3">Nom de la Tontine</th>
              <th className="font-medium pb-3 hidden lg:table-cell">Membres</th>
              <th className="font-medium pb-3">Montant</th>
              <th className="font-medium pb-3 hidden lg:table-cell">Fréquence</th>
              <th className="font-medium pb-3">Progression</th>
              <th className="font-medium pb-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTontines.map((t) => {
              const progressPercent =
                t.memberLimit > 0 ? Math.round((t.currentCycle / t.memberLimit) * 100) : 0;
              const statusTone =
                t.status === 'active' ? 'green' : t.status === 'pending' ? 'orange' : 'red';
              return (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3.5">
                    <p className="text-xs font-medium text-allness-dark">{t.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {t.creator?.prenom} {t.creator?.nom}
                    </p>
                  </td>
                  <td className="text-xs text-gray-600 hidden lg:table-cell">{t.memberLimit}</td>
                  <td className="text-xs text-gray-600">
                    {formatNumber(Number(t.contributionAmount))} {t.currency ?? 'CFA'}
                  </td>
                  <td className="text-xs text-gray-600 hidden lg:table-cell">{t.frequency}</td>
                  <td>
                    <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-allness-green rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </td>
                  <td>
                    <Badge tone={statusTone} dot>
                      {t.status === 'active'
                        ? 'Actif'
                        : t.status === 'pending'
                          ? 'En attente'
                          : 'Fermé'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {paginatedTontines.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  Aucune tontine trouvée.
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

        <div className="mt-5 rounded-xl bg-red-50 border border-red-100 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </span>
            <div>
              <p className="text-xs font-semibold text-red-600">Détection d'activité suspecte</p>
              <p className="text-[11px] text-red-400">Aucune alerte pour le moment.</p>
            </div>
          </div>
          <button className="h-9 px-4 rounded-lg bg-red-500 text-white text-xs font-medium hover:opacity-90 transition-opacity shrink-0">
            Lancer l'investigation
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
