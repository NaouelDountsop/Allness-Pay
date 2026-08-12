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
import { adminService } from '../../lib/api/admin.service';

export default function TontinesSupervisionPage() {
  const [tab, setTab] = useState('Toutes les Tontines');

  const { data: tontines, isLoading: loadingTontines } = useQuery({
    queryKey: ['admin-tontines'],
    queryFn: adminService.listTontines,
  });

  const { data: tontineStats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-tontine-stats'],
    queryFn: adminService.getTontineStats,
  });

  const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

  const isLoading = loadingTontines || loadingStats;

  if (isLoading) {
    return (
      <AdminLayout active="tontines">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="tontines">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-afrilink-dark mb-1">Supervision des Tontines</h1>
          <p className="text-sm text-gray-400">
            Consultez l'activité, gérez les risques et intervenez si nécessaire.
          </p>
        </div>
        <button className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Exporter
        </button>
      </div>

      {/* Stats cards - independent from table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Tontines Totales</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(tontineStats?.totalTontines ?? 0)}
          </p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Volume Total Cotisé</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(tontineStats?.totalVolume ?? 0)} XAF
          </p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </span>
            <span className="text-sm text-gray-300">Alertes de Blocage</span>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-xs text-red-400 mt-1">Urgent</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-sm text-gray-300">Tontines Actives</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(tontineStats?.activeTontines ?? 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <Tabs tabs={['Toutes les Tontines', 'Alertes Actives']} active={tab} onChange={setTab} />

        <table className="w-full text-sm mt-4">
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
            {tontines?.map((t) => {
              const progressPercent =
                t.memberLimit > 0 ? Math.round((t.currentCycle / t.memberLimit) * 100) : 0;
              const statusTone =
                t.status === 'active' ? 'green' : t.status === 'pending' ? 'orange' : 'red';
              return (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3.5">
                    <p className="text-xs font-medium text-afrilink-dark">{t.name}</p>
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
                        className="h-full bg-afrilink-green rounded-full"
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
            {tontines?.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  Aucune tontine trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
