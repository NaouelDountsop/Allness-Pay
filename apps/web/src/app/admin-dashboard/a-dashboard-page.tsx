import { useState, useEffect } from "react";
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
import { StatCard, Badge } from "../../components/ui";
import { adminService, type AdminDashboardStats } from "@/lib/api/admin.service";

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

const KYC_ROWS = [
  {
    initials: "MK",
    name: "Mariam Koné",
    email: "mariam.k@telesim.com",
    date: "Aujourd'hui, 08:12",
    doc: "Passeport (CI)",
    risk: "FAIBLE",
    riskTone: "green" as const,
  },
  {
    initials: "AB",
    name: "Amadou Barry",
    email: "a.barry@work.co",
    date: "Hier, 16:45",
    doc: "Carte d'identité",
    risk: "MODÉRÉ",
    riskTone: "orange" as const,
  },
  {
    initials: "SL",
    name: "Sophie Lambert",
    email: "s.lambert@service.fr",
    date: "Hier, 14:20",
    doc: "Permis de Conduire",
    risk: "ÉLEVÉ",
    riskTone: "red" as const,
  },
];

const CHART_VALUES = [40, 55, 70, 90, 65, 50, 78];

export default function DashboardPage() {
  const [period, setPeriod] = useState<"7j" | "30j">("7j");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getDashboardStats();
        if (isMounted) {
          setStats(data);
        }
      } catch {
        if (isMounted) {
          setError("Impossible de charger les statistiques du dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalUsers = stats?.totalUsers ?? "—";
  const totalKycPending = stats?.kyc.pending ?? "—";
  const monthlyVolume = stats?.monthlyVolume != null ? `€${stats.monthlyVolume.toLocaleString("fr-FR")}` : "—";
  const totalLiquidity = stats?.totalLiquidity != null ? `€${stats.totalLiquidity.toLocaleString("fr-FR")}` : "—";

  return (
    <AdminLayout active="dashboard">
      <h1 className="text-xl font-bold text-afrilink-dark mb-1">Tableau de bord</h1>
      <p className="text-sm text-gray-400 mb-6">
        Surveillez les comptes et gérez les limites financières.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard icon={Users} label="Utilisateurs Totaux" value={String(totalUsers)} />
        <StatCard
          icon={ShieldAlert}
          iconTone="red"
          label="KYC en Attente"
          value={String(totalKycPending)}
          tag={{ label: "Urgent", tone: "red" }}
        />
        <StatCard icon={TrendingUp} label="Volume Mensuel" value={monthlyVolume} />
        <StatCard
          icon={Wallet}
          label="Liquidité Système"
          value={totalLiquidity}
          hint="Seuil: Optimal"
          hintTone="green"
        />
      </div>

      {loading ? (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 text-center">
          <Loader2 className="mx-auto mb-3 h-6 w-6 text-afrilink-orange animate-spin" />
          <p className="text-sm text-gray-500">Chargement des statistiques...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 shadow-sm p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : (
        <>
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
      </>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-afrilink-dark">Approbations KYC Urgentes</p>
          <a href="#" className="text-xs text-afrilink-green font-medium hover:underline">
            Voir les dossiers KYC
          </a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3">Utilisateur</th>
              <th className="font-medium pb-3">Date de Soumission</th>
              <th className="font-medium pb-3">Type de Document</th>
              <th className="font-medium pb-3">Score Risque</th>
              <th className="font-medium pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {KYC_ROWS.map((row) => (
              <tr key={row.email} className="border-b border-gray-50 last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-afrilink-dark text-white text-[11px] font-semibold flex items-center justify-center">
                      {row.initials}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-afrilink-dark">{row.name}</p>
                      <p className="text-[11px] text-gray-400">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-xs text-gray-500">{row.date}</td>
                <td className="text-xs text-gray-500">{row.doc}</td>
                <td>
                  <Badge tone={row.riskTone}>{row.risk}</Badge>
                </td>
                <td className="text-right">
                  <button className="h-8 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium hover:opacity-90 transition-opacity">
                    Examiner
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
