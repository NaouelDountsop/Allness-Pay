import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Tontine, TontineContribution } from '@/lib/api/tontine.service';

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "À l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  const remainingMin = diffMin % 60;
  if (diffH < 24) {
    return remainingMin > 0
      ? `Il y a ${diffH}h ${remainingMin}min`
      : `Il y a ${diffH}h`;
  }
  const diffD = Math.floor(diffH / 24);
  const remainingH = diffH % 24;
  if (diffD < 30) {
    return remainingH > 0
      ? `Il y a ${diffD}j ${remainingH}h`
      : `Il y a ${diffD}j`;
  }
  const diffMonth = Math.floor(diffD / 30);
  return `Il y a ${diffMonth} mois`;
}

interface TontineDetailStatsProps {
  tontine: Tontine;
  contributions?: TontineContribution[];
}

function DonutChart({
  paid,
  pending,
  late,
  total,
}: {
  paid: number;
  pending: number;
  late: number;
  total: number;
}) {
  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const paidPercent = total > 0 ? paid / total : 0;
  const pendingPercent = total > 0 ? pending / total : 0;
  const latePercent = total > 0 ? late / total : 0;

  const paidDash = paidPercent * circumference;
  const pendingDash = pendingPercent * circumference;
  const lateDash = latePercent * circumference;
  const paidOffset = 0;
  const pendingOffset = paidDash;
  const lateOffset = paidDash + pendingDash;

  return (
    <div className="relative w-[100px] h-[100px]">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        {paid > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${paidDash} ${circumference - paidDash}`}
            strokeDashoffset={-paidOffset}
            strokeLinecap="round"
          />
        )}
        {pending > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${pendingDash} ${circumference - pendingDash}`}
            strokeDashoffset={-pendingOffset}
            strokeLinecap="round"
          />
        )}
        {late > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeDasharray={`${lateDash} ${circumference - lateDash}`}
            strokeDashoffset={-lateOffset}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900">
          {paid}/{total}
        </span>
        <span className="text-[9px] text-gray-500">
          {total > 0 ? Math.round((paid / total) * 100) : 0}%
        </span>
      </div>
    </div>
  );
}

export function TontineDetailStats({ tontine, contributions = [] }: TontineDetailStatsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const activeMembers = tontine.members?.filter((m) => m.status === 'ACTIVE') ?? [];
  const totalMembers = activeMembers.length || tontine.memberLimit;

  const paid = contributions.filter((c) => c.status === 'PAID').length;
  const pending = contributions.filter((c) => c.status === 'PENDING').length;
  const late = contributions.filter((c) => c.status === 'LATE').length;

  const nextDueDate = tontine.nextContributionAt
    ? new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const daysUntilDue = tontine.nextContributionAt
    ? Math.ceil(
        (new Date(tontine.nextContributionAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : null;

  const recentActivities = contributions
    .sort((a, b) => {
      const dateA = a.paidAt ?? a.dueDate;
      const dateB = b.paidAt ?? b.dueDate;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 4)
    .map((c) => {
      const memberName = c.member?.user
        ? `${c.member.user.prenom ?? ''} ${c.member.user.nom ?? ''}`.trim()
        : 'Membre';
      const isPaid = c.status === 'PAID';
      const isLate = c.status === 'LATE';
      const dateStr = c.paidAt ?? c.dueDate;
      const timeAgo = getTimeAgo(dateStr);
      const amount = new Intl.NumberFormat('fr-FR').format(Number(c.amount));

      let action: string;
      let type: 'paid' | 'pending' | 'late';
      if (isPaid) {
        action = `a cotisé ${amount} ${tontine.currency ?? 'XAF'}`;
        type = 'paid';
      } else if (isLate) {
        action = `n'a pas encore cotisé (en retard)`;
        type = 'late';
      } else {
        action = `en attente de cotisation`;
        type = 'pending';
      }

      return {
        name: memberName,
        action,
        time: isPaid ? timeAgo : `Échéance : ${new Date(c.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        type,
      };
    });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {/* État des versements */}
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">{t('tontines.paymentStatus')}</h3>
        <div className="flex items-center gap-4">
          <DonutChart paid={paid} pending={pending} late={late} total={totalMembers} />
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-gray-600">{t('tontines.paid')}</span>
              <span className="ml-auto font-medium text-gray-800">
                {paid} ({totalMembers > 0 ? Math.round((paid / totalMembers) * 100) : 0}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-gray-600">{t('tontines.waiting')}</span>
              <span className="ml-auto font-medium text-gray-800">
                {pending} ({totalMembers > 0 ? Math.round((pending / totalMembers) * 100) : 0}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <span className="text-gray-600">{t('tontines.late')}</span>
              <span className="ml-auto font-medium text-gray-800">
                {late} ({totalMembers > 0 ? Math.round((late / totalMembers) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/dashboard/tontines/${tontine.id}/history`)}
          className="mt-4 w-full h-9 rounded-lg border border-gray-200 text-xs text-gray-700 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
        >
          {t('tontines.viewAllPayments')} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ma prochaine contribution */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col">
        <h3 className="text-xs font-semibold text-gray-900 mb-2">{t('tontines.myNextContribution')}</h3>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('fr-FR').format(Number(tontine.contributionAmount))}{' '}
            <span className="text-sm font-medium text-gray-500">{tontine.currency ?? 'XAF'}</span>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-gray-600">{t('tontines.dueDate')} : {nextDueDate}</p>
            {daysUntilDue !== null && daysUntilDue >= 0 && (
              <span className="inline-flex items-center text-[11px] font-medium bg-allness-orange/10 text-allness-orange px-2 py-0.5 rounded-full">
                {t('tontines.payWithin')} {daysUntilDue} {daysUntilDue > 1 ? t('tontines.days') : t('tontines.day')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(`/dashboard/tontines/${tontine.id}/contribute`)}
          className="mt-3 w-full h-9 rounded-xl bg-allness-green hover:bg-allness-greenHover text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {t('tontines.makePayment')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Activité récente */}
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-900">{t('tontines.recentActivity')}</h3>
          <button
            onClick={() => navigate(`/dashboard/tontines/${tontine.id}/history`)}
            className="text-xs text-allness-green font-medium hover:underline"
          >
            Voir tout →
          </button>
        </div>

        <div className="space-y-2">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {activity.type === 'paid' ? (
                <ArrowUpCircle className="w-6 h-6 text-allness-green shrink-0" />
              ) : activity.type === 'late' ? (
                <Clock className="w-6 h-6 text-red-500 shrink-0" />
              ) : (
                <Clock className="w-6 h-6 text-allness-orange shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-[13px] text-gray-800">
                  <span className="font-medium">{activity.name}</span>{' '}
                  <span className="text-gray-600">{activity.action}</span>
                </p>
                <p className="text-[11px] text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate(`/dashboard/tontines/${tontine.id}/history`)}
          className="mt-4 w-full h-9 rounded-lg border border-gray-200 text-xs text-gray-700 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
        >
          {t('tontines.viewAllActivities')}
        </button>
      </div>
    </div>
  );
}
