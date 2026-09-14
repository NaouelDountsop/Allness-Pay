import { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tontineService, type TontineCycle, type TontineContribution } from '@/lib/api/tontine.service';
import { getCycleClosingTime, formatClosingDate } from '@/lib/tontine-utils';

interface CycleCollectionsPanelProps {
  tontineId: string;
  currency: string;
  frequency?: string;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Payé', className: 'bg-emerald-50 text-emerald-600' },
  PENDING: { label: 'En attente', className: 'bg-orange-50 text-orange-600' },
  LATE: { label: 'En retard', className: 'bg-yellow-50 text-yellow-600' },
  FAILED: { label: 'Échoué', className: 'bg-red-50 text-red-600' },
  REFUNDED: { label: 'Remboursé', className: 'bg-blue-50 text-blue-600' },
};

const defaultStatus = { label: 'Non versé', className: 'bg-gray-50 text-gray-500' };

const cycleStatusStyles: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'En cours', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  COMPLETED: { label: 'Terminé', className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  PENDING: { label: 'À venir', className: 'bg-gray-50 text-gray-500 border-gray-200' },
  FAILED: { label: 'Échoué', className: 'bg-red-50 text-red-600 border-red-200' },
};

const defaultCycleStatus = { label: 'À venir', className: 'bg-gray-50 text-gray-500 border-gray-200' };

const currencyLabels: Record<string, string> = {
  XAF: 'FCFA',
  XOF: 'CFA',
  CAD: 'CA$',
  EUR: '€',
  USD: '$',
};

function CycleCard({
  cycle,
  contributions,
  currency,
  frequency,
  isOpen,
  onToggle,
}: {
  cycle: TontineCycle;
  contributions: TontineContribution[];
  currency: string;
  frequency?: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const displayCurrency = currencyLabels[currency] ?? currency;

  const paid = contributions.filter((c) => c.status === 'PAID').length;
  const total = contributions.length;
  const collected = Number(cycle.collectedAmount);
  const cs = cycleStatusStyles[cycle.status] ?? defaultCycleStatus;

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                Tour {cycle.cycleNumber}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cs.className}`}>
                {cs.label}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {formatClosingDate(
                getCycleClosingTime(
                  frequency ?? 'MONTHLY',
                  cycle.activatedAt,
                  cycle.createdAt ?? null,
                  cycle.dueDate,
                ),
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {new Intl.NumberFormat('fr-FR').format(collected)}{' '}
            <span className="text-xs font-normal text-gray-500">{displayCurrency}</span>
          </p>
          <p className="text-[11px] text-gray-500">
            {paid}/{total} payé{paid > 1 ? 's' : ''}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100">
          {contributions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Aucune cotisation pour ce tour
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {contributions.map((c) => {
                const memberName = c.member?.user
                  ? `${c.member.user.prenom ?? ''} ${c.member.user.nom ?? ''}`.trim() || `Membre ${c.member.userId}`
                  : 'Membre';
                const initials = memberName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2);
                const status = statusStyles[c.status] ?? defaultStatus;

                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600 shrink-0">
                        {initials}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{memberName}</p>
                        {c.paidAt && (
                          <p className="text-[10px] text-gray-400">
                            Payé le {new Date(c.paidAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-800">
                        {new Intl.NumberFormat('fr-FR').format(Number(c.amount))}{' '}
                        {displayCurrency}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CycleCollectionsPanel({ tontineId, currency, frequency }: CycleCollectionsPanelProps) {
  const [openCycleId, setOpenCycleId] = useState<string | null>(null);

  const { data: cycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['tontine-cycles', tontineId],
    queryFn: () => tontineService.listCycles(tontineId),
    enabled: !!tontineId,
  });

  const { data: contributions, isLoading: contributionsLoading } = useQuery({
    queryKey: ['tontine-contributions', tontineId],
    queryFn: () => tontineService.listContributions(tontineId),
    enabled: !!tontineId,
  });

  const isLoading = cyclesLoading || contributionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-allness-orange animate-spin" />
      </div>
    );
  }

  if (!cycles || cycles.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">
        Aucun cycle disponible
      </p>
    );
  }

  const contributionsByCycle = new Map<string, TontineContribution[]>();
  for (const c of contributions ?? []) {
    const list = contributionsByCycle.get(c.cycleId) ?? [];
    list.push(c);
    contributionsByCycle.set(c.cycleId, list);
  }

  return (
    <div className="space-y-3">
      {cycles.map((cycle) => (
        <CycleCard
          key={cycle.id}
          cycle={cycle}
          contributions={contributionsByCycle.get(cycle.id) ?? []}
          currency={currency}
          frequency={frequency}
          isOpen={openCycleId === cycle.id}
          onToggle={() => setOpenCycleId(openCycleId === cycle.id ? null : cycle.id)}
        />
      ))}
    </div>
  );
}
