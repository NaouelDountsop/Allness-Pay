import { Check, XIcon, Calendar, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { TontineInvitation } from '@/lib/api/tontine.service';
import { userService } from '@/lib/api/user.service';
import { tontineService } from '@/lib/api/tontine.service';

interface InvitationsListProps {
  invitations: TontineInvitation[];
  onInvitationClick?: (invitation: TontineInvitation) => void;
}

function InvitationUser({ userId }: { userId?: number }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId!),
    enabled: !!userId,
  });

  if (!userId) return null;
  if (!user) return <span className="animate-pulse">...</span>;

  return (
    <span>{user.prenom} {user.nom}</span>
  );
}

function InvitationTontine({ tontineId }: { tontineId: string }) {
  const { data: tontine } = useQuery({
    queryKey: ['tontine', tontineId],
    queryFn: () => tontineService.getById(tontineId),
  });

  if (!tontine) return <span className="animate-pulse">...</span>;

  return <span>{tontine.name}</span>;
}

export function InvitationsList({ invitations, onInvitationClick }: InvitationsListProps) {
  if (invitations.length === 0) return null;

  const pending = invitations.filter((inv) => inv.status === 'PENDING');
  const processed = invitations.filter((inv) => inv.status !== 'PENDING');

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-afrilink-orange/10 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5 text-afrilink-orange" />
            </span>
            <h3 className="text-sm font-semibold text-afrilink-dark">
              Invitations en attente
            </h3>
            <span className="ml-auto text-[11px] font-medium bg-afrilink-orange/10 text-afrilink-orange px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pending.map((inv) => (
              <button
                key={inv.id}
                onClick={() => onInvitationClick?.(inv)}
                className="rounded-xl border border-afrilink-orange/20 bg-afrilink-orange/5 p-4 flex items-center justify-between gap-3 text-left hover:bg-afrilink-orange/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-afrilink-orange/15 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4.5 h-4.5 text-afrilink-orange" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-afrilink-dark truncate">
                      <InvitationTontine tontineId={inv.tontineId} />
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      <InvitationUser userId={inv.inviterUserId} />
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-gray-300" />
                      <p className="text-[11px] text-gray-400">
                        Expire le {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <span className="text-[10px] font-medium text-afrilink-orange opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir
                  </span>
                  <Check className="w-4 h-4 text-afrilink-orange" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-2">Traitées</h3>
          <div className="space-y-2">
            {processed.map((inv) => (
              <div
                key={inv.id}
                className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">
                      <InvitationTontine tontineId={inv.tontineId} />
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      <InvitationUser userId={inv.inviterUserId} />
                    </p>
                  </div>
                </div>
                {inv.status === 'ACCEPTED' ? (
                  <span className="shrink-0 text-[10px] font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Acceptée
                  </span>
                ) : inv.status === 'DECLINED' ? (
                  <span className="shrink-0 text-[10px] font-medium bg-red-50 text-red-500 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <XIcon className="w-3 h-3" />
                    Refusée
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-medium bg-orange-50 text-afrilink-orange px-2.5 py-1 rounded-full">
                    Expirée
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
