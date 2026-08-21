import { RotateCcw, Trophy, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tontine } from '@/lib/api/tontine.service';

interface TontineDetailHeaderProps {
  tontine: Tontine;
  progressPercent?: number;
}

export function TontineDetailHeader({ tontine, progressPercent = 0 }: TontineDetailHeaderProps) {
  const navigate = useNavigate();
  const totalPot =
    Number(tontine.contributionAmount) * tontine.memberLimit;
  const formatAmount = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

  const currentMember = tontine.members?.find(
    (m) => (m.beneficiaryOrder ?? 0) === tontine.currentCycle,
  );
  const nextMember = tontine.members?.find(
    (m) => (m.beneficiaryOrder ?? 0) === tontine.currentCycle + 1,
  );

  const beneficiaryName = nextMember?.user
    ? `${nextMember.user.prenom ?? ''} ${nextMember.user.nom ?? ''}`.trim()
    : currentMember?.user
      ? `${currentMember.user.prenom ?? ''} ${currentMember.user.nom ?? ''}`.trim()
      : '—';

  const beneficiaryInitials = nextMember?.user
    ? `${nextMember.user.prenom?.charAt(0) ?? ''}${nextMember.user.nom?.charAt(0) ?? ''}`.toUpperCase()
    : currentMember?.user
      ? `${currentMember.user.prenom?.charAt(0) ?? ''}${currentMember.user.nom?.charAt(0) ?? ''}`.toUpperCase()
      : '?';

  const beneficiaryTurn = nextMember?.beneficiaryOrder ?? currentMember?.beneficiaryOrder ?? tontine.currentCycle;
  const beneficiaryAmount = Number(tontine.contributionAmount) * tontine.memberLimit;

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
              <stop offset="50%" stopColor="#D28E2F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D28E2F" stopOpacity="0.05" />
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
              <p className="text-xs text-white/60 tracking-wide">CAGNOTTE TONTINE</p>
              <p className="text-sm font-medium">{tontine.name}</p>
            </div>
          </div>
          <span className="text-[11px] font-medium bg-white/10 text-green-300 px-2.5 py-1 rounded-full">
            {tontine.frequency}
          </span>
        </div>

        <p className="text-xs text-white/60 mb-1 relative z-10">Cagnotte totale</p>
        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <p className="text-2xl sm:text-3xl font-bold truncate">
            {formatAmount(totalPot)}{' '}
            <span className="text-sm sm:text-base font-medium text-allness-orange">
              {tontine.currency ?? 'XAF'}
            </span>
          </p>
        </div>

        <p className="text-xs text-white/50 mt-2 relative z-10">
          Objectif : {formatAmount(Number(tontine.targetAmount) || totalPot)} {tontine.currency ?? 'XAF'}
        </p>

        <div className="flex items-center justify-between text-xs mt-4 relative z-10">
          <div>
            <p className="text-white/50">Contribution par membre</p>
            <p className="font-medium">
              {formatAmount(Number(tontine.contributionAmount))}{' '}
              <span className="text-allness-orange">{tontine.currency ?? 'XAF'}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/50">Fréquence</p>
            <p className="font-medium">{tontine.frequency}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
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
      <div className="rounded-xl bg-gradient-to-br from-[#F0FBF4] via-[#E6F7ED] to-[#C8EDD8] border border-[#B8E0CA] p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-[#0E7B52]/15 flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-[#0E7B52]" />
          </span>
          <p className="text-sm font-semibold text-gray-900">Cycle de la tontine</p>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-3xl font-bold text-gray-900">
            {tontine.currentCycle} <span className="text-base text-gray-500">/ {tontine.memberLimit}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">tours complétés</p>
        </div>

        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-white/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0E7B52]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">{progressPercent}% du cycle</p>
        </div>

        <button
          onClick={() => navigate(`/dashboard/tontines/${tontine.id}/history`)}
          className="mt-3 w-full h-8 rounded-lg border border-[#A8D5BA] text-[11px] text-[#0E7B52] font-medium flex items-center justify-center gap-1.5 hover:bg-white/50 transition-colors"
        >
          Voir le calendrier complet <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Prochain bénéficiaire */}
      <div className="rounded-xl bg-gradient-to-br from-[#FFF8F0] via-[#FFF3E6] to-[#FFE8CC] border border-[#F3D9B8] p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#FFF3E6] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#D28E2F]" />
            </span>
            <p className="text-sm font-semibold text-gray-900">Prochain bénéficiaire</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{beneficiaryName}</p>
            <p className="text-xs text-gray-400 mt-0.5">Tour {beneficiaryTurn}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FFF3E6] flex items-center justify-center text-sm font-bold text-[#C07A20] shrink-0">
            {beneficiaryInitials}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#E8C9A0]">
          <p className="text-xs text-gray-400">Montant à recevoir</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">
            {formatAmount(beneficiaryAmount)} <span className="text-sm font-medium text-gray-400">{tontine.currency ?? 'XAF'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
