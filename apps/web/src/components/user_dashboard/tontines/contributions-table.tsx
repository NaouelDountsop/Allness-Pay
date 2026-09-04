import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { TableActions } from '@/components/common/table-actions';
import { Pagination } from '@/components/ui/pagination';

interface CycleContribution {
  amount: number;
  status: string;
}

interface MemberContributionRow {
  id: string;
  memberName: string;
  cycles: Record<string, CycleContribution>;
  total: number;
}

interface Cycle {
  id: string;
  name: string;
  date?: string;
}

const statusStyles: Record<
  string,
  { label: string; className: string }
> = {
  PAID: {
    label: 'Validé',
    className:
      'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  paid: {
    label: 'Validé',
    className:
      'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  PENDING: {
    label: 'En attente',
    className:
      'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  LATE: {
    label: 'En retard',
    className:
      'bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  },
  FAILED: {
    label: 'Échoué',
    className:
      'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400',
  },
};

const PAGE_SIZE = 10;

interface ContributionsTableProps {
  tontineName: string;
  cycles: Cycle[];
  contributions: MemberContributionRow[];
  currency?: string;
  onViewContribution?: (member: MemberContributionRow) => void;
}

export function ContributionsTable({
  tontineName,
  cycles,
  contributions,
  currency = 'CFA',
  onViewContribution,
}: ContributionsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = contributions.filter((member) => {
    const matchesSearch = member.memberName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      cycles.some(
        (cycle) =>
          member.cycles[cycle.id]?.status === statusFilter
      );

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount);

  return (
    <div className="rounded-xl border border-gray-100 dark:border-[#18353B] bg-white dark:bg-[#08191E] overflow-hidden">

      {/* =========================
          TITRE DE LA TONTINE
      ========================== */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-[#18353B]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F1F5F5] text-center uppercase">
          {tontineName}
        </h2>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
          Suivi des cotisations par cycle
        </p>
      </div>

      {/* =========================
          FILTRES
      ========================== */}
      <div className="flex flex-col sm:flex-row gap-3 p-4">

        {/* Recherche membre */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
          />

          <input
            type="text"
            placeholder="Filtrer par nom de membre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-lg border border-gray-200 dark:border-[#18353B] pl-9 pr-3 text-sm bg-white dark:bg-[#0D2228] text-gray-900 dark:text-[#F1F5F5] focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
          />
        </div>

        {/* Filtre statut */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#18353B] text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0D2228] focus:outline-none focus:ring-1 focus:ring-allness-orange"
        >
          <option value="all">Tous les statuts</option>
          <option value="PAID">Validé</option>
          <option value="PENDING">En attente</option>
          <option value="LATE">En retard</option>
          <option value="FAILED">Échoué</option>
        </select>

        {/* Réinitialiser */}
        <button
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setPage(1);
          }}
          className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#18353B] text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-[#0D2228] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      {/* =========================
          TABLEAU
      ========================== */}
      <div className="overflow-x-auto">

        <table className="w-full text-sm min-w-max">

          <thead>

            {/* Ligne principale : cycles */}
            <tr className="bg-allness-dark text-white text-xs">

              <th
                rowSpan={2}
                className="text-left font-medium px-4 py-3 border-r border-white/20 sticky left-0 bg-allness-dark z-10"
              >
                Nom et prénom
              </th>

              {cycles.map((cycle) => (
                <th
                  key={cycle.id}
                  colSpan={2}
                  className="text-center font-semibold px-4 py-2 border-r border-white/20"
                >
                  <div>{cycle.name}</div>

                  {cycle.date && (
                    <div className="text-[10px] font-normal text-gray-300 mt-0.5">
                      {cycle.date}
                    </div>
                  )}
                </th>
              ))}

              <th
                rowSpan={2}
                className="text-right font-semibold px-4 py-3"
              >
                TOTAL
              </th>

              {onViewContribution && (
                <th
                  rowSpan={2}
                  className="text-right font-semibold px-4 py-3"
                >
                  Actions
                </th>
              )}
            </tr>

            {/* Sous-colonnes de chaque cycle */}
            <tr className="bg-allness-dark text-white text-[11px]">

              {cycles.map((cycle) => (
                <th
                  key={`${cycle.id}-sub`}
                  colSpan={2}
                  className="border-r border-white/20 px-3 py-2"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <span>Montant</span>
                    <span>Statut</span>
                  </div>
                </th>
              ))}

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-[#18353B]">

            {paginated.map((member) => {

              const initials = member.memberName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);

              return (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#0D2228] transition-colors"
                >

                  {/* Nom */}
                  <td className="px-4 py-3 sticky left-0 bg-white dark:bg-[#08191E] border-r border-gray-100 dark:border-[#18353B] z-10">
                    <div className="flex items-center gap-2">

                      <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300 shrink-0">
                        {initials}
                      </span>

                      <span className="text-gray-800 dark:text-[#F1F5F5] whitespace-nowrap">
                        {member.memberName}
                      </span>

                    </div>
                  </td>

                  {/* Cycles */}
                  {cycles.map((cycle) => {

                    const contribution = member.cycles[cycle.id];

                    const status =
                      (contribution?.status ? statusStyles[contribution.status] : undefined) ?? {
                        label: 'Non versé',
                        className:
                          'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                      };

                    return (
                      <td
                        key={cycle.id}
                        colSpan={2}
                        className="px-3 py-3 border-r border-gray-100 dark:border-[#18353B]"
                      >

                        <div className="grid grid-cols-2 gap-3 items-center">

                          {/* Montant */}
                          <span className="font-medium text-gray-800 dark:text-[#F1F5F5] whitespace-nowrap">
                            {formatAmount(contribution?.amount ?? 0)}{' '}
                            {currency}
                          </span>

                          {/* Statut */}
                          <span
                            className={`text-[10px] font-medium px-2 py-1 rounded-full inline-flex justify-center whitespace-nowrap ${status.className}`}
                          >
                            {status.label}
                          </span>

                        </div>

                      </td>
                    );
                  })}

                  {/* Total */}
                  <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-[#F1F5F5] whitespace-nowrap">
                    {formatAmount(member.total)} {currency}
                  </td>

                  {/* Actions */}
                  {onViewContribution && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <TableActions
                          onView={() =>
                            onViewContribution(member)
                          }
                        />
                      </div>
                    </td>
                  )}

                </tr>
              );
            })}

          </tbody>
        </table>
      </div>

      {/* =========================
          AUCUN RÉSULTAT
      ========================== */}
      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-400">
          Aucun membre trouvé.
        </div>
      )}

      {/* =========================
          PAGINATION
      ========================== */}
      {totalPages > 1 && (
        <div className="px-4 pb-3">
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      )}

    </div>
  );
}