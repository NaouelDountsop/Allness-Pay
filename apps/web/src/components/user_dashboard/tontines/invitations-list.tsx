import { X, Check } from "lucide-react";
import type { TontineInvitation } from "@/lib/mock/tontines-data";

interface InvitationsListProps {
  invitations: TontineInvitation[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Tontines en Attente &amp; Invitations
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="rounded-xl border border-gray-100 bg-white p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 text-xs font-medium">
                {inv.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{inv.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{inv.subtitle}</p>
              </div>
            </div>

            {inv.status === "invitation" ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  aria-label="Refuser"
                  className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button className="h-7 px-3 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Accepter
                </button>
              </div>
            ) : (
              <span className="shrink-0 text-[10px] font-medium bg-orange-50 text-afrilink-orange px-2.5 py-1 rounded-full">
                En attente
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
