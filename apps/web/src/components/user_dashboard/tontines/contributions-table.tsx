import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { TableActions } from '@/components/common/table-actions';
import { Pagination } from '@/components/ui/pagination';

interface ContributionRow {
  id: string;
  date: string;
  time?: string;
  memberName: string;
  amount: number;
  status: string;
  currency?: string;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Validé', className: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  paid: { label: 'Validé', className: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  PENDING: { label: 'En attente', className: 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  LATE: { label: 'En retard', className: 'bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' },
  FAILED: { label: 'Échoué', className: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400' },
};

const PAGE_SIZE = 10;

interface ContributionsTableProps {
  contributions: ContributionRow[];
  currency?: string;
  onViewContribution?: (contribution: ContributionRow) => void;
}

export function ContributionsTable({ contributions, currency = 'CFA', onViewContribution }: ContributionsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = contributions.filter((c) => {
    const matchesSearch = c.memberName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesDate = !dateFilter || c.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-xl border border-gray-100 bg-white dark:border-brand-border dark:bg-brand-card overflow-hidden">
    <div className="rounded-xl border border-gray-100 dark:border-[#18353B] bg-white dark:bg-[#08191E] overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Filtrer par nom de membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-200 dark:border-[#18353B] pl-9 pr-3 text-sm bg-white dark:bg-[#0D2228] text-gray-900 dark:text-[#F1F5F5] focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#18353B] text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0D2228] focus:outline-none focus:ring-1 focus:ring-allness-orange"
        >
          <option value="all">Tous les statuts</option>
          <option value="PAID">Validé</option>
          <option value="PENDING">En attente</option>
          <option value="LATE">En retard</option>
          <option value="FAILED">Échoué</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#18353B] text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0D2228] focus:outline-none focus:ring-1 focus:ring-allness-orange"
        />
        <button
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setDateFilter('');
          }}
          className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#18353B] text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-[#0D2228] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="bg-allness-dark text-white text-xs">
              <th className="text-left font-medium px-4 py-2.5">Date du Versement</th>
              <th className="text-left font-medium px-4 py-2.5">Nom du Membre</th>
              <th className="text-left font-medium px-4 py-2.5">Montant</th>
              <th className="text-left font-medium px-4 py-2.5">Statut</th>
              <th className="text-right font-medium px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-[#18353B]">
            {paginated.map((c) => {
              const status = statusStyles[c.status] ?? { label: c.status, className: 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400' };
              const initials = c.memberName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);
              return (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#0D2228] transition-colors">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {c.date}
                    {c.time && <span className="block text-[11px] text-gray-400 dark:text-gray-500">{c.time}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300 shrink-0">
                        {initials}
                      </span>
                      <span className="text-gray-800 dark:text-[#F1F5F5] truncate">{c.memberName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-[#F1F5F5]">
                    {new Intl.NumberFormat('fr-FR').format(c.amount)} {c.currency ?? currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <TableActions
                        onView={onViewContribution ? () => onViewContribution(c) : undefined}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
          Aucun versement trouvé.
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-4 pb-3">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
