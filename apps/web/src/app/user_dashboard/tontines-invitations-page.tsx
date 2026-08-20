import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  Mail,
  Users,
  Calendar,
  Clock,
  Check,
  XIcon,
  ChevronRight,
  HelpCircle,
  Shield,
  Lock,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { tontineService, type TontineInvitation } from '@/lib/api/tontine.service';
import { userService } from '@/lib/api/user.service';

type FilterTab = 'all' | 'pending' | 'expired' | 'declined';

function InvitationUser({ userId }: { userId?: number }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId!),
    enabled: !!userId,
  });

  if (!userId) return null;
  if (!user) return <span className="animate-pulse">...</span>;

  return (
    <span>
      {user.prenom} {user.nom}
    </span>
  );
}

function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: {
  invitation: TontineInvitation;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isAccepting: boolean;
  isDeclining: boolean;
}) {
  const navigate = useNavigate();
  const { data: tontine } = useQuery({
    queryKey: ['tontine', invitation.tontineId],
    queryFn: () => tontineService.getById(invitation.tontineId),
  });

  const isPending = invitation.status === 'PENDING';
  const isAccepted = invitation.status === 'ACCEPTED';
  const isDeclined = invitation.status === 'DECLINED';
  const isExpired = invitation.status === 'EXPIRED';

  const frequencyMap: Record<string, string> = {
    WEEKLY: 'Hebdomadaire',
    BIWEEKLY: 'Bimensuelle',
    MONTHLY: 'Mensuelle',
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-allness-dark flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-allness-orange" />
          </div>
          <div className="min-w-0 flex-1">
            {isPending && (
              <span className="inline-flex items-center text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mb-1.5">
                EN ATTENTE
              </span>
            )}
            {isAccepted && (
              <span className="inline-flex items-center text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-1.5">
                ACCEPTÉE
              </span>
            )}
            {isDeclined && (
              <span className="inline-flex items-center text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full mb-1.5">
                REFUSÉE
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mb-1.5">
                EXPIRÉE
              </span>
            )}
            <h3 className="text-sm font-semibold text-gray-900">{tontine?.name }</h3>
            <p className="text-xs text-allness-dark mt-0.5">
              Invité par : <span className="text-allness-orange"> <InvitationUser userId={invitation.inviterUserId} /> </span>
            </p>
            {tontine && (
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {tontine.memberLimit} membres
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {frequencyMap[tontine.frequency] ?? tontine.frequency}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium text-allness-dark">
                    {new Intl.NumberFormat('fr-FR').format(Number(tontine.contributionAmount))}{' '}
                    {tontine.currency ?? 'XAF'}
                  </span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3 text-gray-300" />
              <p className="text-[11px] text-gray-400">
                Prochaine échéance :{' '}
                <span className="font-medium text-allness-green">
                  {tontine?.nextContributionAt
                    ? new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '---'}
                </span>
              </p>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Reçue le {new Date(invitation.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => navigate(`/dashboard/tontines/${invitation.tontineId}`)}
            className="h-8 px-3 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Voir les détails
          </button>
          {isPending && (
            <>
              <button
                onClick={() => onAccept(invitation.id)}
                disabled={isAccepting}
                className="h-8 px-3 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-xs font-medium transition-colors inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isAccepting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Accepter
              </button>
              <button
                onClick={() => onDecline(invitation.id)}
                disabled={isDeclining}
                className="h-8 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isDeclining ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XIcon className="w-3.5 h-3.5" />
                )}
                Refuser
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TontinesInvitationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['all-my-invitations'],
    queryFn: tontineService.listAllMyInvitations,
  });

  const acceptMutation = useMutation({
    mutationFn: (invitationId: string) => tontineService.respondInvitation(invitationId, 'ACCEPT'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-my-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['tontines'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (invitationId: string) => tontineService.respondInvitation(invitationId, 'DECLINE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-my-invitations'] });
    },
  });

  const pending = invitations.filter((inv) => inv.status === 'PENDING');
  const expired = invitations.filter((inv) => inv.status === 'EXPIRED');
  const declined = invitations.filter((inv) => inv.status === 'DECLINED');

  const filteredInvitations = (() => {
    switch (activeTab) {
      case 'pending':
        return pending;
      case 'expired':
        return expired;
      case 'declined':
        return declined;
      default:
        return invitations;
    }
  })();

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Toutes', count: invitations.length },
    { key: 'pending', label: 'En attente', count: pending.length },
    { key: 'expired', label: 'Expirées', count: expired.length },
    { key: 'declined', label: 'Refusées', count: declined.length },
  ];

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

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard/tontines')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-allness-dark mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux tontines
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-allness-dark">Invitations aux tontines</h1>
              <p className="text-sm text-gray-500 mt-1">
                {pending.length > 0
                  ? `Vous avez ${pending.length} invitation${pending.length > 1 ? 's' : ''} en attente.`
                  : "Vous n'avez aucune invitation en attente."}
                <br />
                Rejoignez une tontine ou consultez les détails avant de décider.
              </p>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-allness-dark text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Invitations list */}
            <div className="space-y-4">
              {filteredInvitations.length === 0 ? (
                <div className="text-center py-16">
                  <Mail className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">Aucune invitation</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activeTab === 'all'
                      ? "Vous n'avez pas encore reçu d'invitation."
                      : `Aucune invitation ${
                          activeTab === 'pending' ? 'en attente' : activeTab === 'expired' ? 'expirée' : 'refusée'
                        }.`}
                  </p>
                </div>
              ) : (
                filteredInvitations.map((inv) => (
                  <InvitationCard
                    key={inv.id}
                    invitation={inv}
                    onAccept={(id) => acceptMutation.mutate(id)}
                    onDecline={(id) => declineMutation.mutate(id)}
                    isAccepting={acceptMutation.isPending}
                    isDeclining={declineMutation.isPending}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            {/* Summary card */}
            <div className="rounded-2xl bg-gradient-to-br from-allness-dark to-allness-darker text-white p-6 relative overflow-hidden">
              <img src="/enveloppe.png" alt="" className="w-full  object-contain mb-1" />

              <svg
                aria-hidden="true"
                className="pointer-events-none select-none absolute -top-4 -right-2 w-32 h-32 opacity-60"
                viewBox="0 0 200 200"
                fill="none"
              >
                <defs>
                  <linearGradient id="globeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#D28E2F" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#D28E2F" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="90" stroke="url(#globeGradient2)" strokeWidth="1.5" />
                <ellipse cx="100" cy="100" rx="35" ry="90" stroke="url(#globeGradient2)" strokeWidth="1" />
                <ellipse cx="100" cy="100" rx="65" ry="90" stroke="url(#globeGradient2)" strokeWidth="1" />
              </svg>

              <div className="relative z-10">
                <p className="text-sm text-white/70">Vous avez</p>
                <p className="text-4xl font-bold text-allness-orange mt-1">{pending.length}</p>
                <p className="text-sm font-medium text-white/80 mt-0.5">
                  invitation{pending.length > 1 ? 's' : ''} en attente
                </p>
              </div>

              <button
                onClick={() => setActiveTab('pending')}
                className="mt-5 w-full h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                Voir toutes les invitations
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Conseils card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-allness-green/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-allness-green" />
                </span>
                <h3 className="text-sm font-semibold text-allness-dark">Conseils</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <Check className="w-3.5 h-3.5 text-allness-green mt-0.5 shrink-0" />
                  Vérifiez les informations de la tontine avant d'accepter.
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <Check className="w-3.5 h-3.5 text-allness-green mt-0.5 shrink-0" />
                  Assurez-vous de connaître l'organisateur.
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <Lock className="w-3.5 h-3.5 text-allness-green mt-0.5 shrink-0" />
                  Ne partagez jamais votre code PIN ou mot de passe.
                </li>
              </ul>
            </div>

            {/* Help card */}
            <button className="w-full rounded-2xl border border-gray-100 bg-white p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-allness-dark">Besoin d'aide ?</p>
                  <p className="text-xs text-gray-500">Contactez notre support</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
