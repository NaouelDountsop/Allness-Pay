import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Settings, Send, Loader2, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { TontineDetailHeader } from '@/components/user_dashboard/tontines/tontine-detail-header';
import { TontineDetailStats } from '@/components/user_dashboard/tontines/tontine-detail-stats';
import { CycleTimeline } from '@/components/user_dashboard/tontines/cycle-timeline';
import { MembersTable } from '@/components/user_dashboard/tontines/members-table';
import { InviteMemberModal } from '@/components/user_dashboard/tontines/invite-member-modal';
import { tontineService } from '@/lib/api/tontine.service';
import { useUserProfile } from '@/hooks/use-user-profile';

const statusBadge: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'ACTIVE', className: 'bg-allness-green/10 text-allness-green' },
  DRAFT: { label: 'BROUILLON', className: 'bg-gray-100 text-gray-500' },
  COMPLETED: { label: 'TERMINÉE', className: 'bg-blue-50 text-blue-600' },
  PAUSED: { label: 'EN PAUSE', className: 'bg-amber-50 text-amber-600' },
};

export default function TontineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { profile } = useUserProfile();

  const { data: tontine, isLoading } = useQuery({
    queryKey: ['tontine', id],
    queryFn: () => tontineService.getById(id!),
    enabled: !!id,
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ['tontine-contributions', id],
    queryFn: () => tontineService.listContributions(id!),
    enabled: !!id,
  });

  const isCreator = profile && tontine && profile.idutilisateur === tontine.creatorId;

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-allness-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!tontine) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="px-4 sm:px-8 pb-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700">
            <p className="text-lg font-semibold">Tontine introuvable</p>
            <p className="mt-2 text-sm text-gray-500">
              Le groupe d'épargne demandé est introuvable. Retournez à la liste des tontines.
            </p>
            <button
              onClick={() => navigate('/dashboard/tontines')}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-allness-green px-4 py-2 text-sm font-medium text-white hover:bg-allness-greenHover"
            >
              Retour aux tontines
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const progressPercent =
    tontine.memberLimit > 0
      ? Math.round((tontine.currentCycle / tontine.memberLimit) * 100)
      : 0;

  const badge = statusBadge[tontine.status] ?? statusBadge.DRAFT;

  const descriptionParts: string[] = [];
  descriptionParts.push('Groupe d\'épargne collaborative');
  descriptionParts.push(`Fréquence : ${tontine.frequency}`);
  if (tontine.createdAt) {
    descriptionParts.push(
      `Créée le ${new Date(tontine.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="pb-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/dashboard/tontines')}
                className="flex items-center gap-1.5 text-lg font-semibold text-allness-dark hover:text-allness-dark/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-allness-dark">
                Tontine {tontine.name}
              </h1>
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${badge?.className}`}
              >
                {badge?.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-8">
              {descriptionParts.join(' · ')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => navigate(`/dashboard/tontines/${tontine.id}/history`)}
              className="h-10 px-4 rounded-lg border border-allness-green text-allness-green text-sm font-medium hover:bg-allness-green/10 transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Historique des versements</span>
              <span className="sm:hidden">Historique</span>
            </button>
            {isCreator && (
              <button
                onClick={() => navigate(`/dashboard/tontines/${tontine.id}/settings`)}
                aria-label="Paramètres"
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => navigate(`/dashboard/tontines/${tontine.id}/contribute`)}
              className="h-10 px-4 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden md:inline">Nouveau versement</span>
            </button>
          </div>
        </div>

        {/* 3 summary cards */}
        <TontineDetailHeader tontine={tontine} progressPercent={progressPercent} />

        {/* Cycle timeline */}
        <CycleTimeline
          currentCycle={tontine.currentCycle}
          totalTurns={tontine.memberLimit}
          members={tontine.members ?? []}
          currency={tontine.currency}
          contributionAmount={Number(tontine.contributionAmount)}
        />

        {/* 3 columns: versements / contribution / activité */}
        <TontineDetailStats tontine={tontine} contributions={contributions} />

        {/* Members table */}
        <MembersTable
          members={tontine.members ?? []}
          tontineId={tontine.id}
          memberLimit={tontine.memberLimit}
          status={tontine.status}
          contributionAmount={Number(tontine.contributionAmount)}
          currency={tontine.currency ?? 'XAF'}
          currentCycle={tontine.currentCycle}
          onAddMember={() => setInviteOpen(true)}
        />

        {inviteOpen && (
          <InviteMemberModal
            tontineId={tontine.id}
            tontineName={tontine.name}
            onClose={() => setInviteOpen(false)}
          />
        )}

        <button
          aria-label="Support"
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-50"
          onClick={() => navigate(`/dashboard/tontines/${tontine.id}/chat`)}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </DashboardLayout>
  );
}
