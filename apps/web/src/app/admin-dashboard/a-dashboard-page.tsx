import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ShieldAlert,
  TrendingUp,
  Wallet,
  RefreshCcw,
  UserPlus,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Badge } from '../../components/ui';
import { adminService } from '../../lib/api/admin.service';

const ACTIVITY_ICONS: Record<string, typeof RefreshCcw> = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  transfer_in: ArrowDownLeft,
  transfer_out: Send,
  user_registered: UserPlus,
};

const ACTIVITY_TONES: Record<string, 'green' | 'blue' | 'red' | 'gray'> = {
  deposit: 'green',
  withdrawal: 'red',
  transfer_in: 'green',
  transfer_out: 'blue',
  user_registered: 'blue',
};

const ACTIVITY_TAGS: Record<string, { label: string; tone: 'green' | 'blue' | 'red' | 'gray' }> = {
  deposit: { label: 'Dépôt', tone: 'green' },
  withdrawal: { label: 'Retrait', tone: 'red' },
  transfer_in: { label: 'Reçu', tone: 'green' },
  transfer_out: { label: 'Envoyé', tone: 'blue' },
  user_registered: { label: 'Inscription', tone: 'blue' },
};

export default function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminService.getDashboardStats,
  });

  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: adminService.getRecentActivities,
  });

  const { data: kycPending } = useQuery({
    queryKey: ['admin-kyc-pending'],
    queryFn: adminService.getKycPending,
  });

  const { data: chartData } = useQuery({
    queryKey: ['admin-chart-weekly'],
    queryFn: adminService.getChartWeekly,
  });

  const isLoading = loadingStats || loadingActivities;

  if (isLoading) {
    return (
      <AdminLayout active="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
  };

  return (
    <AdminLayout active="dashboard">
      <h1 className="text-lg sm:text-xl font-bold text-afrilink-dark mb-1">Tableau de bord</h1>
      <p className="text-sm text-gray-400 mb-6">
        Surveillez les comptes et gérez les limites financières.
      </p>

      {/* Stats cards - independent */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Utilisateurs Totaux</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(stats?.totalUsers ?? 0)}</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </span>
            <span className="text-sm text-gray-300">KYC en Attente</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(stats?.kyc.pending ?? 0)}</p>
          <p className="text-xs text-red-400 mt-1">Urgent</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Volume Mensuel</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(stats?.monthlyVolume ?? 0)} XAF
          </p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-sm text-gray-300">Liquidité Système</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(stats?.totalLiquidity ?? 0)} XAF
          </p>
          <p className="text-xs text-green-400 mt-1">Seuil: Optimal</p>
        </div>
      </div>

      {/* Chart + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-afrilink-dark">Croissance des Transactions</p>
          </div>
          <div className="h-48">
            {chartData && chartData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#006C49"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#006C49' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">Aucune transaction cette semaine</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities from backend */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <p className="text-sm font-semibold text-afrilink-dark mb-4">Activités Récentes</p>
          <div className="flex flex-col gap-4 flex-1">
            {activities?.map((a, i) => {
              const Icon = ACTIVITY_ICONS[a.type] ?? RefreshCcw;
              const tone = ACTIVITY_TONES[a.type] ?? 'gray';
              const tag = ACTIVITY_TAGS[a.type] ?? { label: 'Autre', tone: 'gray' as const };
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-afrilink-dark truncate">{a.title}</p>
                    <p className="text-[11px] text-gray-400">
                      {a.meta} · {getTimeAgo(a.createdAt)}
                    </p>
                  </div>
                  <Badge tone={tone}>{tag.label}</Badge>
                </div>
              );
            })}
            {activities?.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Aucune activité récente.</p>
            )}
          </div>
          <a
            href="/admin/transactions"
            className="mt-4 h-9 rounded-lg bg-afrilink-green text-white text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            Voir tout l'historique
          </a>
        </div>
      </div>

      {/* KYC section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-afrilink-dark">Approbations KYC Urgentes</p>
          <a href="/admin/kyc" className="text-xs text-afrilink-green font-medium hover:underline">
            Voir les {stats?.kyc.pending ?? 0} dossiers
          </a>
        </div>
        {kycPending && kycPending.length > 0 ? (
          <div className="flex flex-col gap-3">
            {kycPending.map((kyc) => (
              <div key={kyc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-afrilink-dark truncate">{kyc.userName}</p>
                  <p className="text-[11px] text-gray-400">
                    {kyc.documentType ?? 'KYC'} · {getTimeAgo(kyc.createdAt)}
                  </p>
                </div>
                <a
                  href="/admin/kyc"
                  className="text-[11px] text-afrilink-green font-medium hover:underline shrink-0"
                >
                  Vérifier
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Aucune demande KYC en attente.</p>
        )}
      </div>
    </AdminLayout>
  );
}
