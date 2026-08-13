import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import type { Tontine } from '@/lib/api/tontine.service';

interface TontineCardProps {
  tontine: Tontine;
}

const avatarColors = [
  'bg-afrilink-green/10 text-afrilink-green',
  'bg-afrilink-orange/10 text-afrilink-orange',
  'bg-blue-50 text-blue-500',
  'bg-purple-50 text-purple-500',
];

export function TontineCard({ tontine }: TontineCardProps) {
  const navigate = useNavigate();
  const members = tontine.members ?? [];
  const extraMembers = tontine.memberLimit - 3;
  const progressPercent =
    tontine.memberLimit > 0 ? Math.round((tontine.currentCycle / tontine.memberLimit) * 100) : 0;

  return (
    <div className="min-h-[420px] flex flex-col rounded-xl border border-gray-100 bg-white p-6 hover:shadow-md hover:border-gray-200 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-gray-900 truncate pr-2">{tontine.name}</p>
        <span className="flex-shrink-0 text-[10px] font-medium bg-green-50 text-afrilink-green px-2 py-0.5 rounded-full whitespace-nowrap">
          {tontine.frequency}
        </span>
      </div>

      {/* Cagnotte — style wallet */}
      <div className="rounded-2xl bg-gradient-to-br from-afrilink-dark to-afrilink-darker text-white p-5 relative overflow-hidden mb-6">
        <svg
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-4 -right-2 w-32 h-32 opacity-60"
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
          className="pointer-events-none select-none absolute -top-6 -right-6 w-36 h-36 bg-gradient-to-br from-white/40 via-afrilink-orange/35 to-afrilink-orange/10"
          style={{
            WebkitMaskImage: 'url(/afrilinkpay_logo1.svg)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/afrilinkpay_logo1.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />

        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <img src="/afrilinkpay_logo1.svg" alt="" className="w-7 h-7 object-contain" />
            <p className="text-xs text-white/60 tracking-wide">CAGNOTTE</p>
          </div>
          <span className="text-[10px] font-medium bg-white/10 text-green-300 px-2 py-0.5 rounded-full">
            {tontine.frequency}
          </span>
        </div>

        <p className="text-2xl font-bold relative z-10">
          {new Intl.NumberFormat('fr-FR').format(Number(tontine.contributionAmount) * tontine.memberLimit)}{' '}
          <span className="text-sm font-medium text-afrilink-orange">
            {tontine.currency ?? 'CFA'}
          </span>
        </p>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span>{tontine.memberLimit} membres</span>
        </div>
        <div className="flex -space-x-2">
          {members.slice(0, 3).map((m, i) => (
            <span
              key={m.id}
              className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-semibold ${avatarColors[i % avatarColors.length]}`}
              title={m.user?.prenom}
            >
              {m.user?.prenom?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          ))}
          {extraMembers > 0 && (
            <span className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-medium text-gray-500">
              +{extraMembers}
            </span>
          )}
        </div>
      </div>

      {/* Spacer pour pousser progression + bouton en bas */}
      <div className="flex-1" />

      {/* Progression */}
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="text-gray-400">
          Tour <span className="font-medium text-gray-600">{tontine.currentCycle}</span> /{' '}
          {tontine.memberLimit}
        </span>
        <span className="text-afrilink-green font-semibold">{progressPercent}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-afrilink-orange transition-all"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>

      <button
        onClick={() => navigate(`/dashboard/tontines/${tontine.id}`)}
        className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-xs font-medium transition-colors"
      >
        Voir les détails
      </button>
    </div>
  );
}
