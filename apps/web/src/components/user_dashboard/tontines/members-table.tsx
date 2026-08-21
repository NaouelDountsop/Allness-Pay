import { useState } from 'react';
import {  MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TontineMember } from '@/lib/api/tontine.service';
import { Pagination } from '@/components/ui/pagination';

const defaultStatus = { label: 'À venir', className: 'bg-gray-50 text-gray-500' };

const statusStyles: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Payé', className: 'bg-emerald-50 text-allness-green' },
  PENDING: { label: 'En attente', className: 'bg-amber-50 text-allness-orange' },
  LATE: { label: 'En retard', className: 'bg-red-50 text-red-600' },
  FAILED: { label: 'Échoué', className: 'bg-red-50 text-red-600' },
  UPCOMING: defaultStatus,
};

const PAGE_SIZE = 5;

interface MembersTableProps {
  members: TontineMember[];
  tontineId?: string;
  memberLimit?: number;
  status?: string;
  contributionAmount?: number;
  currency?: string;
  currentCycle?: number;
  onAddMember?: () => void;
  onViewMember?: (member: TontineMember) => void;
  onRemoveMember?: (member: TontineMember) => void;
}

export function MembersTable({
  members,
  tontineId,
  // memberLimit,
  // status,
  contributionAmount = 0,
  currency = 'XAF',
  currentCycle = 0,
  // onAddMember,
  onViewMember,
}: MembersTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(members.length / PAGE_SIZE);
  const paginated = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleViewAll = () => {
    if (!tontineId) return;
    navigate(`/dashboard/tontines/${tontineId}/members`);
  };

  // const canAddMember =
  //   tontineId &&
  //   status === 'DRAFT' &&
  //   memberLimit &&
  //   members.length < memberLimit;

  const getMemberStatus = (member: TontineMember): string => {
    const order = member.beneficiaryOrder ?? 0;
    if (order < currentCycle) return 'PAID';
    if (order === currentCycle) return member.status === 'PAID' ? 'PAID' : 'PENDING';
    return 'UPCOMING';
  };

  const formatAmount = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold text-gray-900">
          Membres ({members.length})
        </h3>
        {/* {(canAddMember || status !== 'DRAFT') && (
          <button
            type="button"
            onClick={onAddMember}
            className="flex items-center gap-1.5 text-xs text-allness-green font-medium hover:text-allness-green/80 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Ajouter un membre
          </button>
        )} */}
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="text-left font-medium px-4 py-2.5">Membre</th>
              <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Localisation</th>
              <th className="text-left font-medium px-4 py-2.5">Tour</th>
              <th className="text-left font-medium px-4 py-2.5">Contribution</th>
              <th className="text-left font-medium px-4 py-2.5">Status</th>
              <th className="text-right font-medium px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((m) => {
              const memberName = m.user
                ? `${m.user.prenom ?? ''} ${m.user.nom ?? ''}`.trim()
                : 'Membre';
              const location = m.user
                ? `${m.user.ville ?? ''}, ${m.user.pays ?? ''}`.trim()
                : '—';
              const initials = m.user
                ? `${m.user.prenom?.charAt(0) ?? ''}${m.user.nom?.charAt(0) ?? ''}`.toUpperCase()
                : '?';

              const memberStatus = getMemberStatus(m);
              const statusStyle: { label: string; className: string } =
                statusStyles[memberStatus] ?? defaultStatus;

              return (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-medium text-gray-500 shrink-0">
                        {initials}
                      </span>
                      <span className="text-gray-800 truncate font-medium">{memberName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{location}</td>
                  <td className="px-4 py-3 text-gray-600">{m.beneficiaryOrder ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {formatAmount(contributionAmount)} {currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${statusStyle.className}`}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => onViewMember?.(m)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 pb-3">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      <div className="border-t border-gray-100 p-3">
        <button
          onClick={handleViewAll}
          className="w-full text-center text-xs text-allness-green font-medium hover:underline"
        >
          Voir tous les membres ({members.length}) →
        </button>
      </div>
    </div>
  );
}
