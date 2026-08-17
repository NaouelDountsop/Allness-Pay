import { X, Check, XIcon, Loader2, Calendar, UserPlus } from 'lucide-react';
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
  return <span>{user.prenom} {user.nom}</span>;
}

function TontineName({ tontineId }: { tontineId: string }) {
  const { data: tontine } = useQuery({
    queryKey: ['tontine', tontineId],
    queryFn: () => tontineService.getById(tontineId),
    enabled: !!tontineId,
  });

  if (!tontine) return <span className="animate-pulse">...</span>;
  return <span>{tontine.name}</span>;
}

function InvitationCard({ invitation }: { invitation: TontineInvitation }) {
  const queryClient = useQueryClient();

  const respondMutation = useMutation({
    mutationFn: (response: 'ACCEPT' | 'DECLINE') =>
      tontineService.respondInvitation(invitation.id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['tontines'] });
    },
  });

  const isAccepted = invitation.status === 'ACCEPTED';
  const isDeclined = invitation.status === 'DECLINED';
  const isPending = invitation.status === 'PENDING';

  return (
    <div className="rounded-xl bg-gray-50 p-4 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-afrilink-dark">
            <TontineName tontineId={invitation.tontineId} />
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <InviterName userId={invitation.inviterUserId} /> vous invite à rejoindre
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Calendar className="w-3 h-3 text-gray-300" />
            <p className="text-[11px] text-gray-400">
              Expire le {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {isPending && (
            <div className="flex items-center gap-1.5">
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
          )}
          {isAccepted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-green-50 text-green-600 px-3 py-1.5 rounded-lg">
              <Check className="w-3 h-3" />
              Acceptée
            </span>
          )}
          {isDeclined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-red-50 text-red-500 px-3 py-1.5 rounded-lg">
              <XIcon className="w-3 h-3" />
              Refusée
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function InvitationJoinPopup({ invitations, onClose }: InvitationJoinPopupProps) {
  const pending = invitations.filter((inv) => inv.status === 'PENDING');

  if (pending.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-white">
        <div className="bg-afrilink-dark px-6 py-5 flex items-center justify-between relative">
          <div className="flex flex-col items-center w-full">
            <img src="/afrilinkpay_logo1.svg" alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-white text-sm font-semibold">
              Afrilink<span className="text-afrilink-orange">Pay</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-white/70 hover:text-white"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <UserPlus className="w-4 h-4 text-afrilink-orange" />
            <h3 className="text-base font-semibold text-afrilink-dark">
              Invitation en attente
            </h3>
          </div>
          <p className="text-xs text-gray-500 text-center mb-5">
            {pending.length} invitation{pending.length > 1 ? 's' : ''} à traiter
          </p>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {pending.map((inv) => (
              <InvitationCard key={inv.id} invitation={inv} />
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full h-11 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 mt-5 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
