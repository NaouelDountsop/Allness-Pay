import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Plus, Loader2, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { TontinesEmptyState } from '@/components/user_dashboard/tontines/tontines-empty-state';
import { TontinesStats } from '@/components/user_dashboard/tontines/tontines-stats';
import { TontineCard } from '@/components/user_dashboard/tontines/tontine-card';
import { NewInitiativeCard } from '@/components/user_dashboard/tontines/new-initiative-card';
import { KycGuardPopup } from '@/components/user_dashboard/tontines/kyc-guard-popup';
import { InvitationJoinPopup } from '@/components/user_dashboard/tontines/invitation-join-popup';
import { tontineService } from '@/lib/api/tontine.service';
import { kycService } from '@/lib/api/kyc.service';

export default function TontinesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showKycGuard, setShowKycGuard] = useState(false);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);

  useEffect(() => {
    if (location.state?.fromBanner) {
      setShowInvitationPopup(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const { data: tontines, isLoading: isLoadingTontines } = useQuery({
    queryKey: ['tontines'],
    queryFn: tontineService.list,
  });

  const { data: kyc, isLoading: isLoadingKyc } = useQuery({
    queryKey: ['kyc-me'],
    queryFn: () => kycService.getMine(),
    retry: false,
  });

  const { data: invitations } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: tontineService.listPendingInvitations,
    enabled: kyc?.status === 'APPROVED',
  });

  const isLoading = isLoadingTontines || isLoadingKyc;

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

  const kycApproved = kyc?.status === 'APPROVED';
  const pendingInvitations = invitations?.filter((inv) => inv.status === 'PENDING') ?? [];
  const hasTontines = tontines && tontines.length > 0;

  const totalContributed =
    tontines?.reduce((sum, t) => sum + Number(t.contributionAmount) * t.currentCycle, 0) ?? 0;
  const nextGain = tontines?.find((t) => t.currentCycle < t.memberLimit);

  return (
    <DashboardLayout>
      <DashboardHeader />

      {showKycGuard && <KycGuardPopup onClose={() => setShowKycGuard(false)} />}

      {showInvitationPopup && kycApproved && (
        <InvitationJoinPopup
          invitations={invitations ?? []}
          onClose={() => setShowInvitationPopup(false)}
        />
      )}

      <div>
        {!kycApproved && !showKycGuard ? (
          <TontinesEmptyState
            onCreate={() => setShowKycGuard(true)}
            onJoin={() => setShowKycGuard(true)}
          />
        ) : !hasTontines ? (
          <TontinesEmptyState
            onCreate={() => navigate('/dashboard/tontines/create')}
            onJoin={() => {
              if (pendingInvitations.length > 0) {
                setShowInvitationPopup(true);
              }
            }}
          />
        ) : null
        }

        {hasTontines && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h1 className="text-2xl font-semibold text-allness-dark">{t('tontines.pageTitle')}</h1>
                <p className="text-sm text-gray-600">{t('tontines.pageSubtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard/tontines/invitations')}
                  className="h-10 px-4 rounded-lg border border-allness-dark text-allness-dark text-sm font-medium transition-colors inline-flex items-center gap-2 hover:bg-gray-50 relative"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden md:inline">{t('tontines.invitations')}</span>
                  {pendingInvitations.length > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                      {pendingInvitations.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/dashboard/tontines/create')}
                  className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">{t('tontines.newTontine')}</span>
                </button>
              </div>
            </div>

            <div className="mt-6">
              <TontinesStats
                totalContributed={totalContributed}
                currency={tontines?.[0]?.currency ?? 'CFA'}
                totalTontinesCount={tontines?.length ?? 0}
                activeTontinesCount={tontines?.filter((t) => t.status === 'ACTIVE').length ?? 0}
                nextGainAmount={Number(nextGain?.contributionAmount ?? 0)}
                nextGainDate={
                  nextGain?.createdAt
                    ? new Date(nextGain.createdAt).toLocaleDateString('fr-FR')
                    : '---'
                }
                nextGainLabel={nextGain?.name ?? '---'}
                pendingRequestsCount={pendingInvitations.length}
              />
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('tontines.myActiveTontines')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {tontines?.map((t) => (
                <TontineCard key={t.id} tontine={t} />
              ))}
              <NewInitiativeCard />
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
