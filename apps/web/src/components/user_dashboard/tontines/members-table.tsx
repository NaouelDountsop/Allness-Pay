import { MoreVertical, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TontineMember } from '@/lib/api/tontine.service';

const statusStyles: Record<string, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'bg-green-50 text-afrilink-green' },
  pending: { label: 'En attente', className: 'bg-orange-50 text-afrilink-orange' },
  inactive: { label: 'Inactif', className: 'bg-red-50 text-red-600' },
};

interface MembersTableProps {
  members: TontineMember[];
  tontineId?: string;
  memberLimit?: number;
  status?: string;
}

export function MembersTable({ members, tontineId, memberLimit, status }: MembersTableProps) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (!tontineId) return;
    navigate(`/dashboard/tontines/${tontineId}/members`);
  };

  const handleAddMember = () => {
    if (!tontineId) return;
    navigate(`/dashboard/tontines/${tontineId}/invite`);
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
          className="text-xs text-afrilink-green font-medium"
        >
          Voir tout →
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-sm min-w-[460px]">
          <thead>
            <tr className="bg-afrilink-dark text-white text-xs">
              <th className="text-left font-medium px-4 py-2.5">Nom du Membre</th>
              <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Localisation</th>
              <th className="text-left font-medium px-4 py-2.5">Statut</th>
              <th className="text-left font-medium px-4 py-2.5 hidden md:table-cell">Tour</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((m) => {
              const status = (statusStyles[m.status ?? 'pending'] ?? statusStyles.pending) as {
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
                      className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">Tour {m.beneficiaryOrder ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button aria-label="Actions" className="text-gray-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {canAddMember && (
              <tr className="border-t border-dashed border-gray-200 bg-gray-50/50">
                <td colSpan={5} className="px-4 py-3">
                  <button
                    onClick={handleAddMember}
                    className="flex items-center gap-2 text-sm text-afrilink-green font-medium hover:text-afrilink-green/80 transition-colors"
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
    </div>
  );
}
