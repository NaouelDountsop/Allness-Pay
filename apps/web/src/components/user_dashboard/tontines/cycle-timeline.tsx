import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TontineMember } from '@/lib/api/tontine.service';

interface CycleTimelineProps {
  currentCycle: number;
  totalTurns: number;
  members: TontineMember[];
  currency?: string;
  contributionAmount?: number;
}

export function CycleTimeline({
  currentCycle,
  totalTurns,
  members,
  currency = 'XAF',
  contributionAmount = 0,
}: CycleTimelineProps) {
  const { t } = useTranslation();
  const sortedMembers = [...members].sort(
    (a, b) => (a.beneficiaryOrder ?? 0) - (b.beneficiaryOrder ?? 0),
  );

  const getMemberForTurn = (turn: number) =>
    sortedMembers.find((m) => m.beneficiaryOrder === turn);

  const formatAmount = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

  const visibleTurns = Array.from({ length: Math.min(totalTurns, 5) }, (_, i) => i + 1);
  const hasMore = totalTurns > 5;
  const expandNodes = totalTurns <= 5;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-5">{t('tontines.cycleTitle')}</h3>

      <div className="overflow-x-auto pb-2">
        <div className="flex items-start w-full">
          {visibleTurns.map((turn, idx) => {
            const member = getMemberForTurn(turn);
            const isCompleted = turn < currentCycle;
            const isCurrent = turn === currentCycle;
            const isFuture = turn > currentCycle;

            const memberName = member?.user
              ? `${member.user.prenom ?? ''} ${member.user.nom ?? ''}`.trim()
              : '';

            return (
              <div key={turn} className="flex items-start">
                {/* Node column */}
                <div className={`flex flex-col items-center min-w-[80px] ${expandNodes ? 'flex-1' : 'shrink-0'}`}>
                  {/* Circle */}
                  {isCompleted ? (
                    <div className="w-10 h-10 rounded-full bg-allness-green border-[2.5px] border-allness-orange flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-10 h-10 rounded-full bg-allness-green border-[2.5px] border-allness-orange flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full border-[2.5px] border-allness-orange bg-white shrink-0" />
                  )}

                  {/* Labels below circle */}
                  <div className="text-center mt-2 w-full">
                    <p
                      className={`text-[11px] font-semibold ${
                        isCompleted ? 'text-gray-800' : isCurrent ? 'text-allness-green' : 'text-gray-500'
                      }`}
                    >
                      {t('tontines.turn')} {turn}
                    </p>
                    {memberName && (
                      <p
                        className={`text-[10px] mt-0.5 truncate ${
                          isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-500'
                        }`}
                      >
                        {memberName}
                      </p>
                    )}
                    {isCompleted && contributionAmount > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {formatAmount(contributionAmount)} {currency}
                      </p>
                    )}
                    {isCurrent && (
                      <span className="inline-block mt-1 text-[9px] font-medium text-allness-green bg-allness-green/10 px-2 py-0.5 rounded-full">
                        {t('tontines.inProgress')}
                      </span>
                    )}
                    {isFuture && (
                      <p className="text-[10px] text-gray-500 mt-0.5">{t('tontines.upcoming')}</p>
                    )}
                  </div>
                </div>

                {/* Connector */}
                {idx < visibleTurns.length - 1 && (
                  <div className="flex items-start pt-[19px] flex-1 min-w-[40px]">
                    {turn < currentCycle ? (
                      <div className="w-full h-[2px] bg-allness-green/50" />
                    ) : turn === currentCycle ? (
                      <div className="w-full h-[2px] border-t-2 border-dashed border-gray-300" />
                    ) : (
                      <div className="w-full flex items-center justify-center">
                        <div className="flex gap-[3px]">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <span key={i} className="w-[3px] h-[3px] rounded-full bg-gray-300" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {hasMore && (
            <>
              {/* Dots separator */}
              <div className="flex items-start pt-[19px] flex-1 min-w-[40px]">
                <div className="w-full flex items-center justify-center">
                  <div className="flex gap-[3px]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="w-[3px] h-[3px] rounded-full bg-gray-300" />
                    ))}
                  </div>
                </div>
              </div>

              Last turn
              <div className="flex flex-col items-center" style={{ width: 110 }}>
                <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white shrink-0" />
                <div className="text-center mt-2">
                  <p className="text-[11px] font-semibold text-gray-500">Tour {totalTurns}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">À venir</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
