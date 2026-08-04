import { X, Check } from "lucide-react";
import type { TontineInvitation } from "@/lib/mock/tontines-data";

interface InvitationCardProps {
  invitation: TontineInvitation;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function InvitationCard({ invitation, onAccept, onDecline }: InvitationCardProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-3">
      {/* Avatar + infos */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-500">
          {invitation.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">
            {invitation.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {invitation.subtitle}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onDecline?.(invitation.id)}
          className="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
          aria-label="Refuser"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
        <button
          onClick={() => onAccept?.(invitation.id)}
          className="h-9 px-4 rounded-full bg-afrilink-dark hover:opacity-90 text-white text-sm font-medium flex items-center gap-1.5 transition-opacity"
          style={{ backgroundColor: "#0B4D3B" }}
        >
          <Check className="w-4 h-4" />
          Accepter
        </button>
      </div>
    </div>
  );
}