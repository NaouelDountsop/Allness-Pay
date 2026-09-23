import { useState } from 'react';
import { Store, UserCheck, Clock, Coins, Plus, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Badge, Pagination } from '../../components/ui';
import { TableActions } from '../../components/common/table-actions';

const MERCHANTS = [
  {
    initials: 'ES',
    name: 'E-Shop Excellence',
    contact: 'Marc Benard',
    category: 'Commerce en ligne',
    categoryTone: 'blue' as const,
    status: 'Actif',
    statusTone: 'green' as const,
  },
  {
    initials: 'BC',
    name: 'Boulangerie Centrale',
    contact: 'Bernard K.',
    category: 'Alimentation',
    categoryTone: 'orange' as const,
    status: 'Actif',
    statusTone: 'green' as const,
  },
  {
    initials: 'SW',
    name: 'Shop & Wine',
    contact: 'Alain Fauve',
    category: 'Boissons',
    categoryTone: 'purple' as const,
    status: 'En attente',
    statusTone: 'orange' as const,
  },
];

export default function MerchantsListPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = MERCHANTS.filter((m) => {
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout active="marchands">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-allness-dark mb-1">Gestion des Marchands</h1>
          <p className="text-sm text-gray-400">
            Gérez votre réseau de commerçants et surveillez leurs transactions.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/marchands/nouveau')}
          className="h-9 px-4 rounded-lg bg-allness-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouveau Marchand
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-allness-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Marchands Actifs</span>
          </div>
          <p className="text-2xl font-bold text-white">1,248</p>
        </div>

        <div className="bg-allness-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Nouvelles Inscriptions</span>
          </div>
          <p className="text-2xl font-bold text-white">1,06k</p>
        </div>

        <div className="bg-allness-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-sm text-gray-300">Approbations en attente</span>
          </div>
          <p className="text-2xl font-bold text-white">44</p>
        </div>

        <div className="bg-allness-dark rounded-2xl p-5">
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
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
          >
            <option value="all">Toutes les catégories</option>
            <option value="Commerce en ligne">Commerce en ligne</option>
            <option value="Alimentation">Alimentation</option>
            <option value="Boissons">Boissons</option>
            <option value="Électronique">Électronique</option>
            <option value="Service">Service</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
          >
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="En attente">En attente</option>
            <option value="Inactif">Inactif</option>
          </select>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                <th className="font-medium pb-3">Marchand</th>
                <th className="font-medium pb-3 hidden sm:table-cell">Contact</th>
                <th className="font-medium pb-3 hidden md:table-cell">Catégorie</th>
                <th className="font-medium pb-3">Statut</th>
                <th className="font-medium pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((m) => (
                <tr key={m.name} className="border-b border-gray-50 last:border-0">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-allness-dark text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {m.initials}
                      </span>
                      <p className="text-xs font-medium text-allness-dark truncate">{m.name}</p>
                    </div>
                  </td>
                  <td className="text-xs text-gray-600 hidden sm:table-cell">{m.contact}</td>
                  <td className="hidden md:table-cell">
                    <Badge tone={m.categoryTone}>{m.category}</Badge>
                  </td>
                  <td>
                    <Badge tone={m.statusTone} dot>
                      {m.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end">
                      <TableActions
                        onView={() => navigate('/admin/marchands/1')}
                        onEdit={() => navigate('/admin/marchands/1')}
                        onDelete={() => {/* TODO: delete merchant */}}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </AdminLayout>
  );
}
