import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  ShieldAlert,
  TrendingUp,
  Wallet,
  RefreshCcw,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";
import { Badge } from "../../components/ui";
import { adminService } from "../../lib/api/admin.service";

const ACTIVITIES = [
  {
    icon: RefreshCcw,
    tone: "green" as const,
    title: "Dépôt Tontine \"Espoir\"",
    meta: "€650.00 • Il y a 3min",
    tag: { label: "Nouvel", tone: "green" as const },
  },
  {
    icon: UserPlus,
    tone: "blue" as const,
    title: "Nouvel Utilisateur Inscrit",
    meta: "Jean Dupont • Il y a 8min",
    tag: { label: "Vérification", tone: "blue" as const },
  },
  {
    icon: AlertTriangle,
    tone: "red" as const,
    title: "Retrait Suspect Bloqué",
    meta: "€2,500.00 • Il y a 12m",
    tag: { label: "Alerte", tone: "red" as const },
  },
  {
    icon: CheckCircle2,
    tone: "gray" as const,
    title: "Liquidation Cycle A4",
    meta: "Tontine Alpha • Il y a 20m",
    tag: { label: "Traité", tone: "gray" as const },
  },
];

const CHART_VALUES = [40, 55, 70, 90, 65, 50, 78];

export default function DashboardPage() {
  const [period, setPeriod] = useState<"7j" | "30j">("7j");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: adminService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <AdminLayout active="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

  return (
    <AdminLayout active="dashboard">
      <h1 className="text-xl font-bold text-afrilink-dark mb-1">Tableau de bord</h1>
      <p className="text-sm text-gray-400 mb-6">
        Surveillez les comptes et gérez les limites financières.
      </p>

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
          <p className="text-2xl font-bold text-white">{formatNumber(stats?.monthlyVolume ?? 0)} XAF</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-sm text-gray-300">Liquidité Système</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(stats?.totalLiquidity ?? 0)} XAF</p>
          <p className="text-xs text-green-400 mt-1">Seuil: Optimal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-afrilink-dark">Croissance des Transactions</p>
            <div className="flex items-center bg-gray-50 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setPeriod("7j")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  period === "7j" ? "bg-white shadow-sm text-afrilink-dark" : "text-gray-400"
                }`}
              >
                7 Jours
              </button>
              <button
                onClick={() => setPeriod("30j")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  period === "30j" ? "bg-white shadow-sm text-afrilink-dark" : "text-gray-400"
                }`}
              >
                30 Jours
              </button>
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {CHART_VALUES.map((v, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-md ${
                  i === CHART_VALUES.length - 2 ? "bg-afrilink-green" : "bg-afrilink-green/40"
                }`}
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <p className="text-sm font-semibold text-afrilink-dark mb-4">Activités Récentes</p>
          <div className="flex flex-col gap-4 flex-1">
            {ACTIVITIES.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-afrilink-dark truncate">{a.title}</p>
                    <p className="text-[11px] text-gray-400">{a.meta}</p>
                  </div>
                  <Badge tone={a.tag.tone}>{a.tag.label}</Badge>
                </div>
              );
            })}
          </div>
          <button className="mt-4 h-9 rounded-lg bg-afrilink-green text-white text-xs font-medium hover:opacity-90 transition-opacity">
            Voir tout l'historique
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-afrilink-dark">Approbations KYC Urgentes</p>
          <a href="/admin/kyc" className="text-xs text-afrilink-green font-medium hover:underline">
            Voir les {stats?.kyc.pending ?? 0} dossiers
          </a>
        </div>
        <p className="text-xs text-gray-400">
          Consultez la liste complète des demandes KYC en attente.
        </p>
      </div>
    </AdminLayout>
  );
}
