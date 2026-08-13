import { X, UserPlus, Check, XIcon, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tontineService } from '@/lib/api/tontine.service';
import { userService } from '@/lib/api/user.service';
import type { TontineInvitation } from '@/lib/api/tontine.service';

interface InvitationJoinPopupProps {
  invitations: TontineInvitation[];
  onClose: () => void;
}

function InviterName({ userId }: { userId: number }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
    enabled: !!userId,
  });

  if (!user) return <span className="animate-pulse">...</span>;
  return <span className="font-medium">{user.prenom} {user.nom}</span>;
}

function InvitationCard({ invitation, onAccepted }: { invitation: TontineInvitation; onAccepted: () => void }) {
  const queryClient = useQueryClient();

  const respondMutation = useMutation({
    mutationFn: (response: 'ACCEPT' | 'DECLINE') =>
      tontineService.respondInvitation(invitation.id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['tontines'] });
      onAccepted();
    },
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">
            <InviterName userId={invitation.inviterUserId} />
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            vous invite à rejoindre sa tontine
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Expire le {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            aria-label="Refuser"
            disabled={respondMutation.isPending}
            onClick={() => respondMutation.mutate('DECLINE')}
            className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={respondMutation.isPending}
            onClick={() => respondMutation.mutate('ACCEPT')}
            className="h-8 px-3 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-1 hover:bg-afrilink-greenHover transition-colors disabled:opacity-50"
          >
            {respondMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Rejoindre
          </button>
        </div>
      </div>
    </div>
  );
}

export function InvitationJoinPopup({ invitations, onClose }: InvitationJoinPopupProps) {
  const pending = invitations.filter((inv) => inv.status === 'PENDING');

  if (pending.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-afrilink-orange/10 flex items-center justify-center">
              <UserPlus className="w-4.5 h-4.5 text-afrilink-orange" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Invitation en attente</p>
              <p className="text-[11px] text-gray-400">
                {pending.length} invitation{pending.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-500">
            Vous avez reçu des invitations à rejoindre des tontines. Acceptez pour devenir membre.
          </p>
          {pending.map((inv) => (
            <InvitationCard key={inv.id} invitation={inv} onAccepted={onClose} />
          ))}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
