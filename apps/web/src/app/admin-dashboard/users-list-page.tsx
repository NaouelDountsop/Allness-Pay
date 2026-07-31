import { useState } from "react";
import {
  Users,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  Download,
  UserPlus,
  ChevronDown,
  SlidersHorizontal,
  Eye,
  Pencil,
  Ban,
} from "lucide-react";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";
import { StatCard, Badge, Pagination } from "../../components/ui";
import { UserDetailPanel } from "./user-detail-panel";

const USERS = [
  {
    id: "AD",
    name: "Amadou Diallo",
    email: "a.diallo@email.com",
    status: "Actif",
    statusTone: "green" as const,
    balance: "1,450.00€",
    lastLogin: "Aujourd'hui, 09:42",
  },
  {
    id: "MT",
    name: "Marie Traoré",
    email: "m.traore@email.com",
    status: "En attente de KYC",
    statusTone: "orange" as const,
    balance: "12.50€",
    lastLogin: "Hier, 18:20",
  },
  {
    id: "KK",
    name: "Koffi Kouadio",
    email: "k.affe@wine.ci",
    status: "Suspendu",
    statusTone: "red" as const,
    balance: "0.00€",
    lastLogin: "Il y a 3 jours",
  },
  {
    id: "ON",
    name: "Ousmane Ndiaye",
    email: "o.ndiaye@digital.sn",
    status: "Actif",
    statusTone: "green" as const,
    balance: "540.20€",
    lastLogin: "Aujourd'hui, 06:15",
  },
];

export default function UsersListPage() {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <AdminLayout active="utilisateurs">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-afrilink-dark mb-1">Gestion Utilisateurs</h1>
          <p className="text-sm text-gray-400">
            Surveillez les comptes, validez les KYC et gérez les limites financières.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Exporter
          </button>
          <button className="h-9 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <UserPlus className="w-3.5 h-3.5" />
            Inviter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard icon={Users} label="Utilisateurs Totaux" value="12,482" />
        <StatCard icon={CheckCircle2} label="KYC Complétés" value="94.2%" />
        <StatCard icon={ArrowLeftRight} label="Flux Mensuel" value="4.8M €" />
        <StatCard icon={AlertTriangle} iconTone="red" label="Alertes Fraude" value="12" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              Tous les pays
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              Niveau Utilisateur
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Plus de filtres
            </button>
          </div>
          <p className="text-xs text-gray-400">Affichage de 250 utilisateurs</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3">Utilisateur</th>
              <th className="font-medium pb-3">Statut KYC</th>
              <th className="font-medium pb-3">Solde Portefeuille</th>
              <th className="font-medium pb-3">Dernière Connexion</th>
              <th className="font-medium pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.email} className="border-b border-gray-50 last:border-0">
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-afrilink-dark text-white text-[11px] font-semibold flex items-center justify-center">
                      {u.id}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-afrilink-dark">{u.name}</p>
                      <p className="text-[11px] text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge tone={u.statusTone} dot>
                    {u.status}
                  </Badge>
                </td>
                <td className="text-xs text-gray-600">{u.balance}</td>
                <td className="text-xs text-gray-500">{u.lastLogin}</td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedUser(u.name)}
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
            ))}
          </tbody>
        </table>

        <Pagination page={page} totalPages={12} onChange={setPage} />
      </div>

      {selectedUser && <UserDetailPanel onClose={() => setSelectedUser(null)} />}
    </AdminLayout>
  );
}
