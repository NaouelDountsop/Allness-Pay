import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";
import { StatCard, Badge, Pagination } from "../../components/ui";
import { UserDetailPanel } from "./user-detail-panel";
import { adminService, type AdminUser } from "@/lib/api/admin.service";

const statusToneMap: Record<string, "green" | "orange" | "red"> = {
  ACTIF: "green",
  SUSPENDU: "red",
  INACTIF: "orange",
  PENDING: "orange",
};

//const USERS: AdminUser[] = [];

export default function UsersListPage() {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.listUsers();
        if (isMounted) {
          setUsers(data);
        }
      } catch {
        if (isMounted) {
          setError("Impossible de charger les utilisateurs.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

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
        <StatCard icon={Users} label="Utilisateurs Totaux" value={String(users.length)} />
        <StatCard icon={CheckCircle2} label="KYC Complétés" value="—" />
        <StatCard icon={ArrowLeftRight} label="Flux Mensuel" value="—" />
        <StatCard icon={AlertTriangle} iconTone="red" label="Alertes Fraude" value="—" />
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
          <p className="text-xs text-gray-400">Affichage de {users.length} utilisateurs</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="font-medium pb-3">Utilisateur</th>
                  <th className="font-medium pb-3">Statut</th>
                  <th className="font-medium pb-3">Téléphone</th>
                  <th className="font-medium pb-3">Pays</th>
                  <th className="font-medium pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.idutilisateur} className="border-b border-gray-50 last:border-0">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-afrilink-dark text-white text-[11px] font-semibold flex items-center justify-center">
                          {u.nom[0]}{u.prenom[0]}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-afrilink-dark">{u.prenom} {u.nom}</p>
                          <p className="text-[11px] text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={statusToneMap[u.statut] ?? "orange"} dot>
                        {u.statut}
                      </Badge>
                    </td>
                    <td className="text-xs text-gray-600">{u.telephone}</td>
                    <td className="text-xs text-gray-600">{u.pays}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(u.idutilisateur)}
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
          </>
        )}
      </div>

      {selectedUser && <UserDetailPanel onClose={() => setSelectedUser(null)} />}
    </AdminLayout>
  );
}
