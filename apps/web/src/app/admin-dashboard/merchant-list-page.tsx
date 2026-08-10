import { useState } from "react";
import { Store, UserCheck, Clock, Coins, Plus, ChevronDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";
import { Badge, Pagination } from "../../components/ui";

const MERCHANTS = [
  {
    initials: "ES",
    name: "E-Shop Excellence",
    contact: "Marc Benard",
    category: "Commerce en ligne",
    categoryTone: "blue" as const,
    status: "Actif",
    statusTone: "green" as const,
  },
  {
    initials: "BC",
    name: "Boulangerie Centrale",
    contact: "Bernard K.",
    category: "Alimentation",
    categoryTone: "orange" as const,
    status: "Actif",
    statusTone: "green" as const,
  },
  {
    initials: "SW",
    name: "Shop & Wine",
    contact: "Alain Fauve",
    category: "Boissons",
    categoryTone: "purple" as const,
    status: "En attente",
    statusTone: "orange" as const,
  },
];

export default function MerchantsListPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  return (
    <AdminLayout active="marchands">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-afrilink-dark mb-1">Gestion des Marchands</h1>
          <p className="text-sm text-gray-400">
            Gérez votre réseau de commerçants et surveillez leurs transactions.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/marchands/nouveau")}
          className="h-9 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouveau Marchand
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Marchands Actifs</span>
          </div>
          <p className="text-2xl font-bold text-white">1,248</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Nouvelles Inscriptions</span>
          </div>
          <p className="text-2xl font-bold text-white">1,06k</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-sm text-gray-300">Approbations en attente</span>
          </div>
          <p className="text-2xl font-bold text-white">44</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Volume Traité</span>
          </div>
          <p className="text-2xl font-bold text-white">145 M</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-5">
          <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
            Toutes les catégories
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
            Tous les statuts
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3">Marchand</th>
              <th className="font-medium pb-3">Contact</th>
              <th className="font-medium pb-3">Catégorie</th>
              <th className="font-medium pb-3">Statut</th>
              <th className="font-medium pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MERCHANTS.map((m) => (
              <tr key={m.name} className="border-b border-gray-50 last:border-0">
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-afrilink-dark text-white text-[11px] font-semibold flex items-center justify-center">
                      {m.initials}
                    </span>
                    <p className="text-xs font-medium text-afrilink-dark">{m.name}</p>
                  </div>
                </td>
                <td className="text-xs text-gray-600">{m.contact}</td>
                <td>
                  <Badge tone={m.categoryTone}>{m.category}</Badge>
                </td>
                <td>
                  <Badge tone={m.statusTone} dot>
                    {m.status}
                  </Badge>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => navigate("/admin/marchands/1")}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark ml-auto"
                    aria-label="Voir"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={page} totalPages={5} onChange={setPage} />
      </div>
    </AdminLayout>
  );
}
