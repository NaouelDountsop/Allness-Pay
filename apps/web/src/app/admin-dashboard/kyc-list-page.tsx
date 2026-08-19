import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Files, CheckCircle2, Clock, XCircle, Search, RotateCcw, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Badge, Tabs } from '../../components/ui';
import { adminService } from '../../lib/api/admin.service';
import type { AdminKycRecord } from '../../lib/api/admin.service';

const STATUS_TABS = ['Tous', 'Validés', 'En attente', 'Rejetés'];

const STATUS_FILTER_MAP: Record<string, string | undefined> = {
  Tous: undefined,
  Validés: 'APPROVED',
  'En attente': 'PENDING',
  Rejetés: 'REJECTED',
};

const STATUS_BADGE: Record<
  string,
  { tone: 'green' | 'orange' | 'red' | 'blue' | 'amber'; label: string }
> = {
  APPROVED: { tone: 'green', label: 'Validé' },
  PENDING: { tone: 'orange', label: 'En attente' },
  REJECTED: { tone: 'red', label: 'Rejeté' },
};

const DOC_LABELS: Record<string, string> = {
  PASSPORT: 'Passeport',
  NATIONAL_ID: "Carte d'identité",
  DRIVER_LICENSE: 'Permis de conduire',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function KycListPage() {
  const [tab, setTab] = useState('Tous');
  const navigate = useNavigate();
  const [records, setRecords] = useState<AdminKycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminService.getDashboardStats,
  });

  const fetchRecords = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.listKyc(status);
      setRecords(data);
    } catch {
      setError('Erreur lors du chargement des dossiers KYC.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(STATUS_FILTER_MAP[tab]);
  }, [tab, fetchRecords]);

  const filtered =
    tab === 'Tous' ? records : records.filter((r) => r.status === STATUS_FILTER_MAP[tab]);

  const searched = filtered.filter(
    (r) =>
      (r.userName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.userNom ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.userEmail ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout active="kyc">
      <h1 className="text-lg sm:text-xl font-bold text-afrilink-dark mb-1">Gestion KYC</h1>
      <p className="text-sm text-gray-400 mb-6">
        Validez les documents d'identité et suivez le niveau de conformité des utilisateurs.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Files className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Total Dossiers</span>
          </div>
          <p className="text-2xl font-bold text-white">{String(stats?.kyc.total ?? 0)}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Validés</span>
          </div>
          <p className="text-2xl font-bold text-white">{String(stats?.kyc.approved ?? 0)}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-sm text-gray-300">En attente</span>
          </div>
          <p className="text-2xl font-bold text-white">{String(stats?.kyc.pending ?? 0)}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </span>
            <span className="text-sm text-gray-300">Rejetés</span>
          </div>
          <p className="text-2xl font-bold text-white">{String(stats?.kyc.rejected ?? 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <Tabs tabs={STATUS_TABS} active={tab} onChange={setTab} />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
              />
            </div>
            <button
              onClick={() => {
                setSearch('');
                setTab('Tous');
              }}
              className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : searched.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">Aucun dossier KYC trouvé.</div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="font-medium pb-3">Nom</th>
                  <th className="font-medium pb-3 hidden sm:table-cell">Date</th>
                  <th className="font-medium pb-3 hidden md:table-cell">Document</th>
                  <th className="font-medium pb-3">Statut</th>
                  <th className="font-medium pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {searched.map((row) => {
                  const badge = STATUS_BADGE[row.status] ?? {
                    tone: 'orange' as const,
                    label: row.status,
                  };
                  const displayName = [row.userName, row.userNom].filter(Boolean).join(' ');
                  const initials = displayName
                    ? displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : '??';
                  return (
                    <tr key={row.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-afrilink-dark text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-afrilink-dark truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {row.userEmail ?? `ID: ${row.userId}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-gray-500 hidden sm:table-cell">{formatDate(row.createdAt)}</td>
                      <td className="text-xs text-gray-500 hidden md:table-cell">
                        {DOC_LABELS[row.IdentityDocumentType] || row.IdentityDocumentType}
                      </td>
                      <td>
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/admin/kyc/${row.id}`)}
                          className="h-8 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          Examiner
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
