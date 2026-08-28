import { Check, Clock, AlertTriangle, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TontineMember } from '@/lib/api/tontine.service';

interface CycleTimelineProps {
  currentCycle: number;
  totalTurns: number;
  members: TontineMember[];
  currency?: string;
  contributionAmount?: number;
  frequency?: string;
  createdAt?: string;
}

interface CycleInfo {
  cycleNumber: number;
  startDate: Date;
  contributionEndDate: Date;
  lateDate: Date;
  payoutDate: Date;
  beneficiaryName: string;
  status: 'completed' | 'contribution_open' | 'late' | 'payout' | 'upcoming';
}

function getFrequencyDays(freq: string): { windowDays: number; lateDays: number; payoutDays: number } {
  const f = freq?.toLowerCase() ?? '';
  if (f.includes('hebdomad') || f.includes('weekly')) {
    return { windowDays: 7, lateDays: 1, payoutDays: 1 };
  }
  if (f.includes('bimensuel') || f.includes('bi-mensuel') || f.includes('biweekly') || f.includes('bimonthly')) {
    return { windowDays: 2, lateDays: 1, payoutDays: 1 };
  }
  return { windowDays: 0, lateDays: 3, payoutDays: 1 };
}

function addMonthsSafe(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addDaysSafe(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getCycleEndDateMonthly(startDate: Date): Date {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + 1);
  d.setDate(d.getDate() - 1);
  return d;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getCycleStatus(
  cycle: { contributionEndDate: Date; lateDate: Date; payoutDate: Date; startDate: Date },
  now: Date,
  currentCycle: number,
  cycleNumber: number,
): CycleInfo['status'] {
  if (cycleNumber < currentCycle) return 'completed';
  if (cycleNumber > currentCycle) return 'upcoming';
  if (now >= cycle.payoutDate) return 'payout';
  if (now > cycle.contributionEndDate) return 'late';
  if (now >= cycle.startDate && now <= cycle.contributionEndDate) return 'contribution_open';
  return 'upcoming';
}

export function CycleTimeline({
  currentCycle,
  totalTurns,
  members,
  frequency = '',
  createdAt = '',
}: CycleTimelineProps) {
  const { t } = useTranslation();
  const now = new Date();

  const sortedMembers = [...members].sort(
    (a, b) => (a.beneficiaryOrder ?? 0) - (b.beneficiaryOrder ?? 0),
  );

  const getMemberName = (order: number) => {
    const member = sortedMembers.find((m) => m.beneficiaryOrder === order);
    if (!member?.user) return '';
    return `${member.user.prenom ?? ''} ${member.user.nom ?? ''}`.trim();
  };

  const { windowDays, lateDays, payoutDays } = getFrequencyDays(frequency);
  const isMonthly = frequency?.toLowerCase().includes('mensuel') || frequency?.toLowerCase().includes('monthly');
  const startDate = createdAt ? new Date(createdAt) : new Date();

  const cycles: CycleInfo[] = Array.from({ length: totalTurns }, (_, i) => {
    const cycleNum = i + 1;
    let cycleStart: Date;
    if (isMonthly) {
      cycleStart = addMonthsSafe(startDate, i);
    } else {
      cycleStart = addDaysSafe(startDate, i * (windowDays + lateDays + payoutDays));
    }

    let contributionEnd: Date;
    let late: Date;
    let payout: Date;
    if (isMonthly) {
      contributionEnd = getCycleEndDateMonthly(cycleStart);
      late = addDaysSafe(contributionEnd, lateDays);
      payout = addDaysSafe(late, payoutDays);
    } else {
      contributionEnd = addDaysSafe(cycleStart, windowDays);
      late = addDaysSafe(contributionEnd, lateDays);
      payout = addDaysSafe(late, payoutDays);
    }

    return {
      cycleNumber: cycleNum,
      startDate: cycleStart,
      contributionEndDate: contributionEnd,
      lateDate: late,
      payoutDate: payout,
      beneficiaryName: getMemberName(cycleNum),
      status: getCycleStatus(
        { contributionEndDate: contributionEnd, lateDate: late, payoutDate: payout, startDate: cycleStart },
        now,
        currentCycle,
        cycleNum,
      ),
    };
  });

  const getStatusColor = (status: CycleInfo['status']) => {
    switch (status) {
      case 'completed': return 'bg-allness-green';
      case 'contribution_open': return 'bg-allness-orange';
      case 'late': return 'bg-red-500';
      case 'payout': return 'bg-allness-green/20';
      default: return 'bg-gray-200';
    }
  };

  const getIconColor = (status: CycleInfo['status']) => {
    switch (status) {
      case 'completed': return 'text-white';
      case 'contribution_open': return 'text-white';
      case 'late': return 'text-white';
      case 'payout': return 'text-allness-green';
      default: return 'text-gray-400';
    }
  };

  const getConnectorColor = (cycle: CycleInfo) => {
    if (cycle.status === 'completed' || cycle.status === 'payout') return 'bg-allness-green/50';
    return 'bg-gray-200';
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">{t('tontines.cycleTitle')}</h3>
        <span className="text-[11px] text-gray-500">
          {frequency} · {totalTurns} tours
        </span>
      </div>

      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex items-start w-max min-w-full">
          {cycles.map((cycle, idx) => {
            const isCompleted = cycle.status === 'completed';
            const isCurrent = cycle.status === 'contribution_open' || cycle.status === 'late';
            const isPayout = cycle.status === 'payout';
            const isFuture = cycle.status === 'upcoming';
            const isLast = idx === cycles.length - 1;

            return (
              <div key={cycle.cycleNumber} className="flex items-start">
                {/* Node */}
                <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getStatusColor(cycle.status)}`}
                  >
                    {isCompleted || isPayout ? (
                      <Check className={`w-5 h-5 ${getIconColor(cycle.status)}`} strokeWidth={3} />
                    ) : isCurrent ? (
                      <Clock className={`w-5 h-5 ${getIconColor(cycle.status)}`} strokeWidth={2.5} />
                    ) : isFuture ? (
                      <Circle className={`w-4 h-4 ${getIconColor(cycle.status)}`} />
                    ) : (
                      <AlertTriangle className={`w-4 h-4 ${getIconColor(cycle.status)}`} strokeWidth={2.5} />
                    )}
                  </div>

                  {/* Labels */}
                  <div className="text-center mt-2 w-full">
                    <p
                      className={`text-[11px] font-semibold ${
                        isCompleted || isPayout ? 'text-allness-green'
                          : isCurrent ? 'text-allness-orange'
                          : 'text-gray-400'
                      }`}
                    >
                      Tour {cycle.cycleNumber}
                    </p>
                    {cycle.beneficiaryName && (
                      <p
                        className={`text-[10px] mt-0.5 truncate max-w-[80px] ${
                          isCompleted || isPayout || isCurrent ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {cycle.beneficiaryName}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDateShort(cycle.startDate)}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-[9px] font-medium text-allness-orange bg-allness-orange/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {cycle.status === 'late' ? 'En retard' : t('tontines.inProgress')}
                      </span>
                    )}
                    {(isCompleted || isPayout) && (
                      <span className="inline-block mt-1 text-[9px] font-medium text-allness-green bg-allness-green/10 px-2 py-0.5 rounded-full">
                        {isPayout ? 'Versé' : 'Terminé'}
                      </span>
                    )}
                    {isFuture && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{t('tontines.upcoming')}</p>
                    )}
                  </div>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div className="flex items-start pt-[19px] flex-1" style={{ minWidth: 40 }}>
                    <div className={`w-full h-[2px] ${getConnectorColor(cycle)}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-allness-green" />
          <span className="text-[10px] text-gray-500">Terminé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-allness-orange" />
          <span className="text-[10px] text-gray-500">En cours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-[10px] text-gray-500">Retard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          <span className="text-[10px] text-gray-500">À venir</span>
        </div>
      </div>
    </div>
  );
}
