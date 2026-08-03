import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { TontinesEmptyState } from "@/components/user_dashboard/tontines/tontines-empty-state";
import { TontinesStats } from "@/components/user_dashboard/tontines/tontines-stats";
import { TontineCard } from "@/components/user_dashboard/tontines/tontine-card";
import { NewInitiativeCard } from "@/components/user_dashboard/tontines/new-initiative-card";
import { InvitationCard } from "@/components/user_dashboard/tontines/invitations-list";
import { mockTontines, mockInvitations } from "@/lib/mock/tontines-data";

const HAS_TONTINES = mockTontines.length > 0;

export default function TontinesPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="px-4 sm:px-8 pb-10">
        {!HAS_TONTINES ? (
          <TontinesEmptyState
            onCreate={() => navigate("/dashboard/tontines/create")}
            onJoin={() => {}}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-afrilink-dark">Tontines</h1>
                <p className="text-sm text-gray-500">Épargnez ensemble, à tour de rôle</p>
              </div>
              <button
                onClick={() => navigate("/dashboard/tontines/create")}
                className="h-10 px-5 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Nouvelle Tontine</span>
              </button>
            </div>

            <div className="mt-6">
              <TontinesStats
                totalContributed={12450000}
                currency="CFA"
                activeTontinesCount={mockTontines.length}
                nextGainAmount={500000}
                nextGainDate="30/07/26"
                nextGainLabel="Impact Diaspora"
                pendingRequestsCount={mockInvitations.length}
              />
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mes Tontines Actives</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {mockTontines.map((t) => (
                <TontineCard key={t.id} tontine={t} />
              ))}
              <NewInitiativeCard />
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">Invitations</h3>
            <div className="space-y-3">
              {mockInvitations.map((inv) => (
                <InvitationCard key={inv.id} invitation={inv} />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
