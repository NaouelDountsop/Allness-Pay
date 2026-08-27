import { RotateCcw, Trophy, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Tontine } from '@/lib/api/tontine.service';

interface TontineDetailHeaderProps {
  tontine: Tontine;
  progressPercent?: number;
  effectiveMemberCount?: number;
}

export function TontineDetailHeader({
  tontine,
  progressPercent = 0,
  effectiveMemberCount,
}: TontineDetailHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const activeMembers = tontine.members?.filter((m) => m.status === 'ACTIVE') ?? [];
  const memberCount = effectiveMemberCount ?? (activeMembers.length || tontine.memberLimit);
  const totalPot =
    Number(tontine.contributionAmount) * memberCount;
  const formatAmount = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

  const currentMember = tontine.members?.find(
    (m) => (m.beneficiaryOrder ?? 0) === tontine.currentCycle,
  );

  const beneficiaryName = currentMember?.user
    ? `${currentMember.user.prenom ?? ''} ${currentMember.user.nom ?? ''}`.trim()
    : '—';

  const beneficiaryInitials = currentMember?.user
    ? `${currentMember.user.prenom?.charAt(0) ?? ''}${currentMember.user.nom?.charAt(0) ?? ''}`.toUpperCase()
    : '?';

  const beneficiaryTurn = currentMember?.beneficiaryOrder ?? tontine.currentCycle;
  const beneficiaryAmount = Number(tontine.contributionAmount) * memberCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {/* Cagnotte actuelle */}
      <div className="rounded-2xl bg-gradient-to-br from-allness-dark to-allness-darker text-white p-4 relative overflow-hidden">
        <svg
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-6 -right-2 w-52 h-52 opacity-60"
          viewBox="0 0 200 200"
          fill="none"
        >
          <defs>
            <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="50%" stopColor="var(--brand-orange, #D28E2F)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--brand-orange, #D28E2F)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" stroke="url(#globeGradient)" strokeWidth="1.5" />
          <ellipse cx="100" cy="100" rx="35" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="65" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="90" ry="90" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="55" rx="90" ry="25" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="90" ry="8" stroke="url(#globeGradient)" strokeWidth="1" />
          <ellipse cx="100" cy="145" rx="90" ry="25" stroke="url(#globeGradient)" strokeWidth="1" />
        </svg>

        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-8 -right-8 w-56 h-56 bg-gradient-to-br from-white/40 via-allness-orange/35 to-allness-orange/10"
          style={{
            WebkitMaskImage: 'url(/allnesspay_logo1.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/allnesspay_logo1.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <img src="/allnesspay_logo1.png" alt="" className="w-9 h-9 object-contain" />
            <div>
              <p className="text-xs text-white/70 tracking-wide">{t('tontines.pot')} TONTINE</p>
              <p className="text-sm font-medium">{tontine.name}</p>
            </div>
          </div>
          <span className="text-[11px] font-medium bg-white/10 text-green-300 px-2.5 py-1 rounded-full">
            {tontine.frequency}
          </span>
        </div>

        <p className="text-xs text-white/70 mb-1 relative z-10">{t('tontines.totalPot')}</p>
        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <p className="text-2xl sm:text-3xl font-bold truncate">
            {formatAmount(totalPot)}{' '}
            <span className="text-sm sm:text-base font-medium text-allness-orange">
              {tontine.currency ?? 'XAF'}
            </span>
          </p>
        </div>

        <p className="text-xs text-white/70 mt-2 relative z-10">
          {t('tontines.goal')} : {formatAmount(Number(tontine.targetAmount) || totalPot)} {tontine.currency ?? 'XAF'}
        </p>

        <div className="flex items-center justify-between text-xs mt-4 relative z-10">
          <div>
            <p className="text-white/70">{t('tontines.contributionPerMember')}</p>
            <p className="font-medium">
              {formatAmount(Number(tontine.contributionAmount))}{' '}
              <span className="text-allness-orange">{tontine.currency ?? 'XAF'}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70">{t('tontines.frequency')}</p>
            <p className="font-medium">{tontine.frequency}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {tontine.nextContributionAt
                ? new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Cycle de la tontine */}
      <div className="rounded-xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-[#0B3028] dark:via-[#0B3028] dark:to-[#0B3028] border border-green-200 dark:border-[#18353B] p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-allness-green/15 dark:bg-[#20C98A]/15 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-allness-green dark:text-[#20C98A]" />
          </span>
          <p className="text-sm font-semibold text-gray-900">{t('tontines.cycleTitle')}</p>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-3xl font-bold text-gray-900">
            {tontine.currentCycle} <span className="text-base text-gray-600">/ {memberCount}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('tontines.completedTurns')}</p>
        </div>

        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-white/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-allness-green dark:bg-[#20C98A]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-600 mt-1">{progressPercent}% {t('tontines.cyclePercent')}</p>
        </div>

        <button
          onClick={() => navigate(`/dashboard/tontines/${tontine.id}/history`)}
          className="mt-3 w-full h-8 rounded-lg border border-allness-green/30 dark:border-[#20C98A]/30 text-[11px] text-allness-green dark:text-[#20C98A] font-medium flex items-center justify-center gap-1.5 hover:bg-white/50 dark:hover:bg-[#102A30] transition-colors"
        >
          {t('tontines.viewFullCalendar')} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Prochain bénéficiaire */}
      <div className="rounded-xl bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 dark:from-[#302515] dark:via-[#302515] dark:to-[#302515] border border-orange-200 dark:border-[#18353B] p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-50 dark:bg-[#302515] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-allness-orange dark:text-[#E0A23B]" />
            </span>
            <p className="text-sm font-semibold text-gray-900">{t('tontines.currentBeneficiary')}</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{beneficiaryName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('tontines.turnLabel')} {beneficiaryTurn}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-[#302515] flex items-center justify-center text-sm font-bold text-allness-orange dark:text-[#E0A23B] shrink-0">
            {beneficiaryInitials}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-orange-200 dark:border-[#18353B]">
          <p className="text-xs text-gray-500">{t('tontines.amountToReceive')}</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">
            {formatAmount(beneficiaryAmount)} <span className="text-sm font-medium text-gray-500">{tontine.currency ?? 'XAF'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
