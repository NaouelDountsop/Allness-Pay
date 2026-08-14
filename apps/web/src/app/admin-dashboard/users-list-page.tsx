import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  Download,
  UserPlus,
  RotateCcw,
  Eye,
  Pencil,
  Ban,
  Loader2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Pagination, Badge } from '../../components/ui';
import { UserDetailPanel } from './user-detail-panel';
import { adminService } from '../../lib/api/admin.service';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UsersListPage() {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.listUsers,
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminService.getDashboardStats,
  });

  const filtered = users?.filter((u) => {
    const matchesCountry = countryFilter === 'all' || u.pays === countryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.verificationotp) ||
      (statusFilter === 'pending' && !u.verificationotp);
    return matchesCountry && matchesStatus;
  });

  const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminService.exportUsers();
      downloadBlob(blob, `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      // silent
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout active="utilisateurs">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-afrilink-dark mb-1">Gestion Utilisateurs</h1>
          <p className="text-sm text-gray-400">
            Surveillez les comptes, validez les KYC et gérez les limites financières.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Exporter
          </button>
          <button className="h-9 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <UserPlus className="w-3.5 h-3.5" />
            Inviter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Utilisateurs Totaux</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(stats?.totalUsers ?? users?.length ?? 0)}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">KYC Complétés</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.kyc.approved ?? 0}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Flux Mensuel</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(stats?.monthlyVolume ?? 0)} XAF
          </p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </span>
            <span className="text-sm text-gray-300">Alertes Fraude</span>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
          >
            <option value="all">Tous les pays</option>
            <option value="CM">Cameroun</option>
            <option value="SN">Sénégal</option>
            <option value="CI">Côte d'Ivoire</option>
            <option value="GA">Gabon</option>
            <option value="CG">Congo</option>
            <option value="NE">Niger</option>
            <option value="ML">Mali</option>
            <option value="BF">Burkina Faso</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
          </select>
          <button
            onClick={() => {
              setCountryFilter('all');
              setStatusFilter('all');
            }}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="font-medium pb-3">Utilisateur</th>
                  <th className="font-medium pb-3">Statut KYC</th>
                  <th className="font-medium pb-3 hidden sm:table-cell">Téléphone</th>
                  <th className="font-medium pb-3 hidden md:table-cell">Date d'inscription</th>
                  <th className="font-medium pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((u) => {
                  const initials =
                    `${u.prenom?.charAt(0) ?? ''}${u.nom?.charAt(0) ?? ''}`.toUpperCase();
                  const statusTone = u.verificationotp ? ('green' as const) : ('orange' as const);
                  const statusLabel = u.verificationotp ? 'Actif' : 'En attente';
                  return (
                    <tr key={u.idutilisateur} className="border-b border-gray-50 last:border-0">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-afrilink-dark text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-afrilink-dark truncate">
                              {u.prenom} {u.nom}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge tone={statusTone} dot>
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="text-xs text-gray-600 hidden sm:table-cell">{u.telephone}</td>
                      <td className="text-xs text-gray-500 hidden md:table-cell">
                        {new Date(u.dateinscription).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(u.nom)}
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark"
                            aria-label="Voir"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark"
                            aria-label="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500"
                            aria-label="Bloquer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={Math.ceil((users?.length ?? 0) / 10)}
          onChange={setPage}
        />
      </div>

      {selectedUser && <UserDetailPanel onClose={() => setSelectedUser(null)} />}
    </AdminLayout>
  );
}
