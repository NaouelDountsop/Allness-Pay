import { X, Check, Mail, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { TontineInvitation } from "@/lib/api/tontine.service";
import { userService } from "@/lib/api/user.service";
import { tontineService } from "@/lib/api/tontine.service";

interface InvitationsListProps {
  invitations: TontineInvitation[];
  onAccept?: (invitationId: number) => void;
  onDecline?: (invitationId: number) => void;
}

function InvitationUser({ userId }: { userId?: number }) {
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getById(userId!),
    enabled: !!userId,
  });

  if (!userId) return null;
  if (!user) return <span className="animate-pulse">Chargement...</span>;

  return (
    <span>
      {user.prenom} {user.nom}
    </span>
  );
}

function InvitationTontine({ tontineId }: { tontineId: string }) {
  const { data: tontine } = useQuery({
    queryKey: ["tontine", tontineId],
    queryFn: () => tontineService.getById(tontineId),
  });

  if (!tontine) return <span className="animate-pulse">Chargement...</span>;

  return <span>{tontine.name}</span>;
}

export function InvitationsList({ invitations, onAccept, onDecline }: InvitationsListProps) {
  if (invitations.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Invitations en attente
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="rounded-xl border border-gray-100 bg-white p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 text-xs font-medium">
                {inv.inviteeEmail ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  <InvitationTontine tontineId={inv.tontineId} />
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {inv.inviteeEmail || <InvitationUser userId={inv.inviteeUserId} />}
                </p>
              </div>
            </div>

            {inv.status === "PENDING" ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  aria-label="Refuser"
                  onClick={() => onDecline?.(inv.id)}
                  className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onAccept?.(inv.id)}
                  className="h-7 px-3 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-1 hover:bg-afrilink-greenHover transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Accepter
                </button>
              </div>
            ) : inv.status === "ACCEPTED" ? (
              <span className="shrink-0 text-[10px] font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                Acceptée
              </span>
            ) : inv.status === "DECLINED" ? (
              <span className="shrink-0 text-[10px] font-medium bg-red-50 text-red-500 px-2.5 py-1 rounded-full">
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
  );
}
