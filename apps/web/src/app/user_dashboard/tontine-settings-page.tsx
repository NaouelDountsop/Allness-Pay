import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { RotationOrderList } from '@/components/user_dashboard/tontines/rotation-order-list';
import { CycleSummaryPanel } from '@/components/user_dashboard/tontines/cycle-summary-panel';
import { ScheduleCalendarModal } from '@/components/user_dashboard/tontines/schedule-calendar-modal';
import { InviteMemberModal } from '@/components/user_dashboard/tontines/invite-member-modal';
import { tontineService } from '@/lib/api/tontine.service';
import { authStorage } from '@/lib/auth-storage';

function getCurrentUserId(): number | null {
  try {
    const token = authStorage.getToken();
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

function getFrequencyLabel(freq: string): string {
  const map: Record<string, string> = {
    WEEKLY: 'Hebdomadaire',
    BIWEEKLY: 'Bimensuelle',
    MONTHLY: 'Mensuelle',
  };
  return map[freq] ?? freq;
}

export default function TontineSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tontineId = id;
  const currentUserId = getCurrentUserId();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const { data: tontine, isLoading } = useQuery({
    queryKey: ['tontine', tontineId],
    queryFn: () => tontineService.getById(tontineId!),
    enabled: !!tontineId,
  });

  const isAdmin = tontine?.creatorId === currentUserId;
  const isDraft = tontine?.status === 'DRAFT';
  const activeMembers = tontine?.members?.filter((m) => m.status === 'ACTIVE') ?? [];

  const startMutation = useMutation({
    mutationFn: () => tontineService.updateStatus(tontineId!, 'ACTIVE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontine', tontineId] });
      queryClient.invalidateQueries({ queryKey: ['tontines'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => tontineService.update(tontineId!, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontine', tontineId] });
      queryClient.invalidateQueries({ queryKey: ['tontines'] });
    },
  });

  const rotationMembers = activeMembers
    .sort((a, b) => (a.beneficiaryOrder ?? 0) - (b.beneficiaryOrder ?? 0))
    .map((m, i) => ({
      id: String(m.id),
      name: m.user
        ? `${m.user.prenom ?? ''} ${m.user.nom ?? ''}`.trim()
        : `Membre ${m.userId}`,
      month: new Date(2026, i, 1).toLocaleDateString('fr-FR', { month: 'long' }),
    }));

  const frequency = tontine?.frequency ?? 'MONTHLY';
  const memberCount = activeMembers.length || (tontine?.memberLimit ?? 0);
  const contributionAmount = tontine ? Number(tontine.contributionAmount) : 0;
  const totalPot = contributionAmount * memberCount;
  const currencyLabels: Record<string, string> = {
    XAF: 'FCFA',
    XOF: 'CFA',
    CAD: 'CA$',
    EUR: '€',
    USD: '$',
  };
  const displayCurrency = currencyLabels[tontine?.currency ?? 'XAF'] ?? tontine?.currency ?? 'FCFA';

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!tontine) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="px-4 sm:px-8 pb-10">
          <p className="text-sm text-gray-500">Tontine introuvable.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="px-4 sm:px-8 pb-10">
          <p className="text-sm text-gray-500">
            Vous n'avez pas les droits d'administrateur sur cette tontine.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="px-4 sm:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/dashboard/tontines/${id}`)}
            className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark"
          >
            <ArrowLeft className="w-5 h-5" />
            Paramètres Généraux
          </button>
          {isDraft && (
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending || activeMembers.length < 2}
              className="h-10 px-5 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {startMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Démarrer la Tontine
            </button>
          )}
        </div>

        {activeMembers.length < 2 && isDraft && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            Au moins 2 membres actifs sont nécessaires pour démarrer la tontine.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-medium text-gray-500">Nom de la Tontine</label>
                  <div className="w-full h-11 rounded-lg border border-gray-100 px-3 mt-1 text-sm bg-gray-50 text-gray-700 flex items-center">
                    {tontine.name}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Montant de Cotisation ({displayCurrency})
                  </label>
                  <div className="w-full h-11 rounded-lg border border-gray-100 px-3 mt-1 text-sm bg-gray-50 text-gray-700 flex items-center">
                    {new Intl.NumberFormat('fr-FR').format(contributionAmount)} {displayCurrency}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <RotationOrderList
                members={rotationMembers}
                onInvite={() => setShowInvite(true)}
              />
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Règles de Participation</h3>
              <label className="text-xs font-medium text-gray-500">Logique de rotation</label>
              <div className="w-full h-11 rounded-lg border border-gray-100 px-3 mt-1 text-sm bg-gray-50 text-gray-700 flex items-center">
                {getFrequencyLabel(frequency)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Règles de Sanction</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Frais de retard (%)</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Délai de Grâce (Jours)
                  </label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
                Pénalité : Des frais de retard de 5% s'appliquent automatiquement après le délai
                de grâce. Les frais sont redistribués au dernier bénéficiaire de la tontine.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="h-10 px-5 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer les modifications
              </button>
            </div>
          </div>

          <CycleSummaryPanel
            frequency={frequency}
            totalPot={totalPot}
            membersCount={activeMembers.length}
            nextDrawDate={tontine.nextContributionAt
              ? new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
            currency={tontine.currency ?? 'XAF'}
            onShowCalendar={() => setShowCalendar(true)}
          />
        </div>
      </div>

      {showCalendar && (
        <ScheduleCalendarModal
          onClose={() => setShowCalendar(false)}
          frequence={tontine.frequency}
        />
      )}
      {showInvite && (
        <InviteMemberModal
          tontineId={tontineId!}
          tontineName={tontine.name}
          onClose={() => setShowInvite(false)}
        />
      )}
    </DashboardLayout>
  );
}
