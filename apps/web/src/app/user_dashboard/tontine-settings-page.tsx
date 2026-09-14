import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Play, Clock, CalendarDays, Mail, Timer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { RotationOrderList } from '@/components/user_dashboard/tontines/rotation-order-list';
import { CycleSummaryPanel } from '@/components/user_dashboard/tontines/cycle-summary-panel';
import { CycleCollectionsPanel } from '@/components/user_dashboard/tontines/cycle-collections-panel';
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

export default function TontineSettingsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getFrequencyLabel = (freq: string): string => {
    const map: Record<string, string> = {
      WEEKLY: t('tontines.weekly'),
      BIWEEKLY: t('tontines.biweekly'),
      MONTHLY: t('tontines.monthly'),
    };
    return map[freq] ?? freq;
  };

  const getInvitationStatusBadge = (status: string): { label: string; className: string } => {
    const map: Record<string, { label: string; className: string }> = {
      PENDING: { label: t('tontines.pending'), className: 'bg-amber-50 text-amber-600' },
      ACCEPTED: { label: t('tontines.accepted'), className: 'bg-green-50 text-allness-green' },
      DECLINED: { label: t('tontines.declined'), className: 'bg-red-50 text-red-500' },
      REFUSED: { label: t('tontines.declined'), className: 'bg-red-50 text-red-500' },
    };
    return map[status] ?? { label: status, className: 'bg-gray-50 text-gray-600' };
  };
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

  const { data: pendingInvitations = [] } = useQuery({
    queryKey: ['tontine-invitations', tontineId],
    queryFn: () => tontineService.listInvitations(tontineId!),
    enabled: !!tontineId && isAdmin,
  });

  const { data: cycles } = useQuery({
    queryKey: ['tontine-cycles', tontineId],
    queryFn: () => tontineService.listCycles(tontineId!),
    enabled: !!tontineId,
  });

  const activeCycle = useMemo(
    () => cycles?.find((c) => c.status === 'ACTIVE') ?? null,
    [cycles],
  );

  const frequency = tontine?.frequency ?? 'MONTHLY';

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeCycle) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [activeCycle]);

  const remaining = useMemo(() => {
    if (!activeCycle) return null;

    const getFrequencyMs = (freq: string): number => {
      switch (freq) {
        case 'WEEKLY': return 7 * 24 * 60 * 60 * 1000;
        case 'BIWEEKLY': return 14 * 24 * 60 * 60 * 1000;
        case 'MONTHLY':
        default: return 30 * 24 * 60 * 60 * 1000;
      }
    };

    const startReference = activeCycle.activatedAt
      ? new Date(activeCycle.activatedAt).getTime()
      : new Date(activeCycle.createdAt ?? activeCycle.dueDate).getTime();

    const closingTime = startReference + getFrequencyMs(frequency);
    const diff = closingTime - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, expired: false, closingTime };
  }, [activeCycle, now, frequency]);

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

  const getRotationLabel = (freq: string, index: number): string => {
    const freqMs: Record<string, number> = {
      WEEKLY: 7 * 24 * 60 * 60 * 1000,
      BIWEEKLY: 14 * 24 * 60 * 60 * 1000,
      MONTHLY: 30 * 24 * 60 * 60 * 1000,
    };
    const baseStart = activeCycle?.activatedAt
      ? new Date(activeCycle.activatedAt).getTime()
      : tontine?.createdAt
        ? new Date(tontine.createdAt).getTime()
        : null;
    if (baseStart) {
      const turnDate = new Date(baseStart + (freqMs[freq] ?? 30 * 24 * 60 * 60 * 1000) * index);
      return `Tour ${index + 1} — ${turnDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    switch (freq) {
      case 'WEEKLY':
        return `Semaine ${index + 1}`;
      case 'BIWEEKLY':
        return `Bimensuel ${index + 1}`;
      case 'MONTHLY':
      default:
        return `Tour ${index + 1}`;
    }
  };

  const reorderMutation = useMutation({
    mutationFn: (memberIds: string[]) => tontineService.reorderMembers(tontineId!, memberIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontine', tontineId] });
    },
  });

  const activeRotationMembers = activeMembers
    .sort((a, b) => (a.beneficiaryOrder ?? 0) - (b.beneficiaryOrder ?? 0))
    .map((m, i) => ({
      id: String(m.id),
      name: m.user
        ? `${m.user.prenom ?? ''} ${m.user.nom ?? ''}`.trim()
        : `Membre ${m.userId}`,
      month: getRotationLabel(frequency, i),
      isPending: false,
    }));

  const pendingRotationMembers = pendingInvitations
    .filter((inv) => inv.status === 'PENDING')
    .map((inv, i) => ({
      id: `inv-${inv.id}`,
      name: inv.inviteeEmail ?? `Invité ${i + 1}`,
      month: '—',
      isPending: true,
    }));

  const rotationMembers = [...activeRotationMembers, ...pendingRotationMembers];

  const recentInvitations = [...pendingInvitations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

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
          <Loader2 className="w-6 h-6 text-allness-orange animate-spin" />
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
            className="flex items-center gap-2 text-lg font-semibold text-allness-dark"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('tontines.settingsTitle')}
          </button>
          {isDraft && (
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending || activeMembers.length < 2}
              className="h-10 px-5 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {startMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{t('tontines.startTontine')}</span>
            </button>
          )}
        </div>

        {activeMembers.length < 2 && isDraft && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            {t('tontines.needMinMembers')}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-medium text-gray-600">{t('tontines.tontineName')}</label>
                  <div className="w-full h-11 rounded-lg border border-gray-100 px-3 mt-1 text-sm bg-gray-50 text-gray-700 flex items-center">
                    {tontine.name}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    {t('tontines.contributionAmount')} ({displayCurrency})
                  </label>
                  <div className="w-full h-11 rounded-lg border border-gray-100 px-3 mt-1 text-sm bg-gray-50 text-gray-700 flex items-center">
                    {new Intl.NumberFormat('fr-FR').format(contributionAmount)} {displayCurrency}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <RotationOrderList
                members={rotationMembers}
                onInvite={() => setShowInvite(true)}
                onReorder={(ids) => {
                  const realIds = ids.filter((id) => !id.startsWith('inv-'));
                  reorderMutation.mutate(realIds);
                }}
                disabled={!isDraft}
              />
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('tontines.participationRules')}</h3>
              <label className="text-xs font-medium text-gray-600">{t('tontines.rotationLogic')}</label>
              <div className="w-full h-11 rounded-lg border border-gray-100 px-3 mt-1 text-sm bg-gray-50 text-gray-700 flex items-center">
                {getFrequencyLabel(frequency)}
              </div>
            </div>

            {/* Progression & Paiements par cycle */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Progression & Paiements</h3>
                {activeCycle && (
                  <span className="text-[11px] text-gray-400">
                    Cycle {activeCycle.cycleNumber}
                  </span>
                )}
              </div>

              {activeCycle && remaining && (
                <div className="mb-4 rounded-xl bg-allness-dark p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-allness-orange" />
                    <span className="text-xs font-medium text-gray-300">
                      {remaining.expired ? 'Échéance dépassée' : 'Temps restant'}
                    </span>
                  </div>
                  {remaining.expired ? (
                    <p className="text-lg font-bold text-red-400">Cycle en attente de clôture</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      {remaining.days > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{remaining.days}</p>
                          <p className="text-[10px] text-gray-400">jour{remaining.days > 1 ? 's' : ''}</p>
                        </div>
                      )}
                      {remaining.days > 0 && <span className="text-lg text-gray-500">:</span>}
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{String(remaining.hours).padStart(2, '0')}</p>
                        <p className="text-[10px] text-gray-400">heure{remaining.hours > 1 ? 's' : ''}</p>
                      </div>
                      <span className="text-lg text-gray-500">:</span>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{String(remaining.minutes).padStart(2, '0')}</p>
                        <p className="text-[10px] text-gray-400">min</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Clôture prévue</span>
                      <span>
                        {remaining.closingTime
                          ? new Date(remaining.closingTime).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-700 overflow-hidden">
                      {(() => {
                        if (!remaining.closingTime || !activeCycle.activatedAt) {
                          return <div className="h-full bg-allness-orange rounded-full w-1/2" />;
                        }
                        const elapsed = now - new Date(activeCycle.activatedAt).getTime();
                        const total = remaining.closingTime - new Date(activeCycle.activatedAt).getTime();
                        const pct = total > 0 ? Math.min(100, Math.max(2, (elapsed / total) * 100)) : 100;
                        return (
                          <div
                            className="h-full bg-allness-orange rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {!activeCycle && (
                <div className="mb-4 rounded-xl bg-gray-50 p-4 text-center">
                  <Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Aucun cycle actif pour le moment</p>
                </div>
              )}

              <CycleCollectionsPanel
                tontineId={tontineId!}
                currency={tontine.currency ?? 'XAF'}
                frequency={frequency}
              />
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('tontines.sanctionRules')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">{t('tontines.lateFeePercent')}</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    {t('tontines.gracePeriodDays')}
                  </label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
                {t('tontines.lateFeeWarning')}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="h-10 px-5 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('tontines.saveChanges')}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <CycleSummaryPanel
              frequency={frequency}
              totalPot={totalPot}
              membersCount={activeMembers.length}
              nextDrawDate={
                remaining?.closingTime
                  ? new Date(remaining.closingTime).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'
              }
              currency={tontine.currency ?? 'XAF'}
              onShowCalendar={() => setShowCalendar(true)}
            >
              {/* Rotation Order Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-allness-green" />
                  <h3 className="text-sm font-semibold text-gray-900">Ordre de Passage</h3>
                </div>

                {isDraft && activeMembers.length < 2 && (
                  <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-orange-50 border border-orange-200">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <p className="text-[11px] text-blue-700">
                      La tontine démarrera une fois au moins <span className="font-semibold">2 membres actifs</span> inscrits.
                    </p>
                  </div>
                )}

                {!isDraft && remaining?.closingTime && (
                  <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-green-50 border border-green-100">
                    <CalendarDays className="w-3.5 h-3.5 text-allness-green shrink-0" />
                    <p className="text-[11px] text-green-700">
                      Prochaine cotisation le{' '}
                      <span className="font-semibold">
                        {new Date(remaining.closingTime).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  {activeRotationMembers.map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-gray-50"
                    >
                      <span className="w-5 h-5 rounded-full bg-allness-green text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{m.name}</p>
                        <p className="text-[10px] text-gray-500">{m.month}</p>
                      </div>
                      {tontine.status === 'ACTIVE' && i === 0 && (
                        <span className="text-[9px] font-semibold text-allness-green bg-green-50 px-1.5 py-0.5 rounded-full">
                          Actuel
                        </span>
                      )}
                    </div>
                  ))}

                  {activeRotationMembers.length === 0 && pendingRotationMembers.length === 0 && (
                    <p className="text-[11px] text-gray-500 text-center py-2">
                      {t('tontines.noMembers')}
                    </p>
                  )}
                </div>
              </div>
            </CycleSummaryPanel>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-allness-green" />
                   {t('tontines.sentInvitations')}
                </h3>
                {/* <button className="text-xs font-medium text-allness-green hover:underline">
                  Voir toutes →
                </button> */}
              </div>

              <div className="space-y-3">
                {recentInvitations.map((inv) => {
                  const badge = getInvitationStatusBadge(inv.status);
                  return (
                    <div key={inv.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {inv.inviteeEmail}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Invité le{' '}
                          {new Date(inv.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  );
                })}

                {recentInvitations.length === 0 && (
                  <p className="text-[11px] text-gray-500 text-center py-2">
                    {t('tontines.noInvitations')}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowInvite(true)}
                className="mt-4 text-xs font-medium text-allness-green hover:underline flex items-center gap-1"
              >
                {t('tontines.inviteMember')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCalendar && (
        <ScheduleCalendarModal
          onClose={() => setShowCalendar(false)}
          frequence={tontine.frequency}
        />
      )}
      <InviteMemberModal
        open={showInvite}
        onOpenChange={setShowInvite}
        tontineId={tontineId!}
        tontineName={tontine.name}
      />
    </DashboardLayout>
  );
}