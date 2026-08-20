import { useState } from 'react';
import { UserPlus, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TontineMember } from '@/lib/api/tontine.service';
import { TableActions } from '@/components/common/table-actions';
import { Pagination } from '@/components/ui/pagination';

const roleStyles: Record<string, { label: string; className: string }> = {
  ADMIN: { label: 'Admin', className: 'bg-allness-orange/10 text-allness-orange' },
  MEMBER: { label: 'Membre', className: 'bg-blue-50 text-blue-600' },
};

const PAGE_SIZE = 5;

interface MembersTableProps {
  members: TontineMember[];
  tontineId?: string;
  memberLimit?: number;
  status?: string;
  onAddMember?: () => void;
  onViewMember?: (member: TontineMember) => void;
  onRemoveMember?: (member: TontineMember) => void;
}

export function MembersTable({
  members,
  tontineId,
  memberLimit,
  status,
  onAddMember,
  onViewMember,
  onRemoveMember,
}: MembersTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(members.length / PAGE_SIZE);
  const paginated = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleViewAll = () => {
    if (!tontineId) return;
    navigate(`/dashboard/tontines/${tontineId}/members`);
  };

  const canAddMember =
    tontineId &&
    status === 'DRAFT' &&
    memberLimit &&
    members.length < memberLimit;

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold text-gray-900">Membres</h3>
        <button
          type="button"
          onClick={handleViewAll}
          className="text-xs text-allness-green font-medium"
        >
          Voir tout →
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-sm min-w-[460px]">
          <thead>
            <tr className="bg-allness-dark text-white text-xs">
              <th className="text-left font-medium px-4 py-2.5">Nom du Membre</th>
              <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Localisation</th>
              <th className="text-left font-medium px-4 py-2.5">Rôle</th>
              <th className="text-left font-medium px-4 py-2.5 hidden md:table-cell">Tour</th>
              <th className="text-right font-medium px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((m) => {
              const role = (roleStyles[m.role ?? 'MEMBER'] ?? roleStyles.MEMBER) as {
                label: string;
                className: string;
              };
              const memberName = m.user
                ? `${m.user.prenom ?? ''} ${m.user.nom ?? ''}`.trim()
                : 'Membre';
              const location = m.user ? `${m.user.ville ?? ''}, ${m.user.pays ?? ''}`.trim() : '---';
              const initials = m.user
                ? `${m.user.prenom?.charAt(0) ?? ''}${m.user.nom?.charAt(0) ?? ''}`.toUpperCase()
                : '?';
              return (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500 shrink-0">
                        {initials}
                      </span>
                      <span className="text-gray-800 truncate">{memberName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${role.className}`}
                    >
                      {m.role === 'ADMIN' && <Crown className="w-3 h-3" />}
                      {role.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">Tour {m.beneficiaryOrder ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <TableActions
                        onView={onViewMember ? () => onViewMember(m) : undefined}
                        onDelete={m.role !== 'ADMIN' && onRemoveMember ? () => onRemoveMember(m) : undefined}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {canAddMember && (
              <tr className="border-t border-dashed border-gray-200 bg-gray-50/50">
                <td colSpan={5} className="px-4 py-3">
                  <button
                    onClick={onAddMember}
                    className="flex items-center gap-2 text-sm text-allness-green font-medium hover:text-allness-green/80 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajouter un membre
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 pb-3">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
