import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, MessageCircle } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { TontinesEmptyState } from "@/components/user_dashboard/tontines/tontines-empty-state";
import { TontinesStats } from "@/components/user_dashboard/tontines/tontines-stats";
import { TontineCard } from "@/components/user_dashboard/tontines/tontine-card";
import { NewInitiativeCard } from "@/components/user_dashboard/tontines/new-initiative-card";
import { InvitationsList } from "@/components/user_dashboard/tontines/invitations-list";
import { tontineService } from "@/lib/api/tontine.service";

export default function TontinesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tontines, isLoading } = useQuery({
    queryKey: ['tontines'],
    queryFn: tontineService.list,
  });

  const { data: invitations } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: tontineService.listPendingInvitations,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, response }: { id: number; response: "ACCEPT" | "DECLINE" }) =>
      tontineService.respondInvitation(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["tontines"] });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const hasTontines = tontines && tontines.length > 0;

  const totalContributed =
    tontines?.reduce((sum, t) => sum + Number(t.contributionAmount) * t.currentCycle, 0) ?? 0;
  const nextGain = tontines?.find((t) => t.currentCycle < t.memberLimit);

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        {!hasTontines && (
          <TontinesEmptyState
            onCreate={() => navigate('/dashboard/tontines/create')}
            onJoin={() => {}}
          />
        )}

        {invitations && invitations.length > 0 && (
          <div className={!hasTontines ? "mt-6" : ""}>
            <InvitationsList
              invitations={invitations}
              onAccept={(id) => respondMutation.mutate({ id, response: "ACCEPT" })}
              onDecline={(id) => respondMutation.mutate({ id, response: "DECLINE" })}
            />
          </div>
        )}

        {hasTontines && (
          <>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h1 className="text-2xl font-semibold text-afrilink-dark">Tontines</h1>
                <p className="text-sm text-gray-500">Épargnez ensemble, à tour de rôle</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard/tontines/chat')}
                  className="h-10 px-4 rounded-lg border border-afrilink-dark text-afrilink-dark text-sm font-medium transition-colors inline-flex items-center gap-2 hover:bg-gray-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Conversations</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/tontines/create')}
                  className="h-10 px-5 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Nouvelle Tontine</span>
                </button>
              </div>
            </div>

            <div className="mt-6">
              <TontinesStats
                totalContributed={totalContributed}
                currency={tontines?.[0]?.currency ?? 'CFA'}
                activeTontinesCount={tontines?.length ?? 0}
                nextGainAmount={Number(nextGain?.contributionAmount ?? 0)}
                nextGainDate={
                  nextGain?.createdAt
                    ? new Date(nextGain.createdAt).toLocaleDateString('fr-FR')
                    : '---'
                }
                nextGainLabel={nextGain?.name ?? '---'}
                pendingRequestsCount={0}
              />
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mes Tontines Actives</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {tontines?.map((t) => (
                <TontineCard key={t.id} tontine={t} />
              ))}
              <NewInitiativeCard />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
