import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Plus, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { ContributionStats } from '@/components/user_dashboard/tontines/contribution-stats';
import { CycleSelector } from '@/components/user_dashboard/tontines/cycle-selector';
import { ContributionsTable } from '@/components/user_dashboard/tontines/contributions-table';
import { tontineService, type Tontine } from '@/lib/api/tontine.service';
import { walletService } from '@/lib/api/wallet.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

function generateCyclesFromTontine(tontine: {
  memberLimit: number;
  currentCycle: number;
}) {
  const cycles = [];
  const maxVisible = tontine.currentCycle > 0 ? tontine.currentCycle + 1 : 1;
  for (let i = 1; i <= Math.min(maxVisible, tontine.memberLimit); i++) {
    const isActive = i === tontine.currentCycle + 1;
    const isPast = i <= tontine.currentCycle;
    cycles.push({
      id: `cy${i}`,
      label: `Tour ${i}${isActive ? ' (en cours)' : isPast ? ' (terminé)' : ''}`,
      range: isPast ? 'Terminé' : isActive ? 'En cours' : 'À venir',
      active: isActive,
    });
  }
  return cycles.reverse();
}

export default function ContributionHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState('');
  const [tontineModalOpen, setTontineModalOpen] = useState(false);

  const { data: tontine, isLoading: tontineLoading } = useQuery({
    queryKey: ['tontine', id],
    queryFn: () => tontineService.getById(id!),
    enabled: !!id,
  });

  const { data: apiCycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['tontine-cycles', id],
    queryFn: () => tontineService.listCycles(id!),
    enabled: !!id,
  });

  const { data: apiContributions } = useQuery({
    queryKey: ['tontine-contributions', id, selectedCycle],
    queryFn: () => tontineService.listContributions(id!, selectedCycle || undefined),
    enabled: !!id,
  });

  const cycles = apiCycles
    ? apiCycles.map((c) => ({
        id: c.id,
        label: `Tour ${c.cycleNumber}${c.status === 'ACTIVE' ? ' (en cours)' : c.status === 'COMPLETED' ? ' (terminé)' : ''}`,
        range: c.status === 'COMPLETED'
          ? 'Terminé'
          : c.status === 'ACTIVE'
            ? `Échéance: ${new Date(c.dueDate).toLocaleDateString('fr-FR')}`
            : 'À venir',
        active: c.status === 'ACTIVE',
      }))
    : tontine
      ? generateCyclesFromTontine(tontine)
      : [];

  const currentCycleData = apiCycles?.find((c) => c.status === 'ACTIVE');

  const contributions = apiContributions
    ? apiContributions.map((c) => ({
        id: c.id,
        date: c.paidAt
          ? new Date(c.paidAt).toLocaleDateString('fr-FR')
          : new Date(c.dueDate).toLocaleDateString('fr-FR'),
        time: c.paidAt
          ? new Date(c.paidAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : undefined,
        memberName: c.member?.user
          ? `${c.member.user.prenom ?? ''} ${c.member.user.nom ?? ''}`.trim() || `Membre ${c.member.userId}`
          : `Membre`,
        amount: Number(c.amount),
        status: c.status as 'PENDING' | 'PAID' | 'LATE' | 'FAILED',
        currency: tontine?.currency ?? 'XAF',
      }))
    : [];

  if (tontineLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-allness-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const totalContributed = tontine
    ? currentCycleData
      ? Number(currentCycleData.collectedAmount)
      : Number(tontine.contributionAmount) * tontine.currentCycle
    : 0;

  const contributionsCount = contributions.length > 0
    ? contributions.length
    : tontine
      ? tontine.currentCycle
      : 0;

  const currencyLabels: Record<string, string> = {
    XAF: 'FCFA',
    XOF: 'CFA',
    CAD: 'CA$',
    EUR: '€',
    USD: '$',
  };
  const displayCurrency = currencyLabels[tontine?.currency ?? 'XAF'] ?? tontine?.currency ?? 'FCFA';

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <button
              onClick={() => navigate(id ? `/dashboard/tontines/${id}` : '/dashboard/tontines')}
              className="flex items-center gap-2 text-lg font-semibold text-allness-dark"
            >
              <ArrowLeft className="w-5 h-5" />
              Historique des Versements
            </button>
            {tontine && (
              <p className="text-sm text-gray-500 mt-1">{tontine.name}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="h-9 px-4 rounded-lg border border-allness-green text-allness-green text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <button
              onClick={() => setTontineModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Versement
            </button>
          </div>
        </div>

        {tontine && (
          <ContributionStats
            totalContributed={totalContributed}
            currency={displayCurrency}
            contributionsCount={contributionsCount}
            currentTurn={tontine.currentCycle}
            totalTurns={tontine.memberLimit}
          />
        )}

        {!cyclesLoading && (
          <CycleSelector
            cycles={cycles.length > 0 ? cycles : [{ id: '', label: 'Aucun tour', range: '', active: false }]}
            selected={selectedCycle || (cycles[0]?.id ?? '')}
            onSelect={setSelectedCycle}
          />
        )}

        <ContributionsTable
          contributions={contributions}
          currency={displayCurrency}
        />
      </div>

      <Dialog open={tontineModalOpen} onOpenChange={setTontineModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choisir une tontine</DialogTitle>
            <DialogDescription>
              Sélectionnez la tontine pour laquelle vous souhaitez effectuer un versement.
            </DialogDescription>
          </DialogHeader>

          <TontineSelector
            onSelect={(t) => {
              setTontineModalOpen(false);
              navigate(`/dashboard/tontines/${t.id}/contribute`);
            }}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function TontineSelector({ onSelect }: { onSelect: (t: Tontine) => void }) {
  const { data: tontines, isLoading } = useQuery({
    queryKey: ['tontines'],
    queryFn: tontineService.list,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet-primary'],
    queryFn: walletService.getPrimary,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 text-allness-orange animate-spin" />
      </div>
    );
  }

  const walletBalance = wallet ? Number(wallet.balance) : 0;
  const walletCurrency = wallet?.currency ?? 'XAF';

  return (
    <div className="space-y-4">
      {tontines && tontines.length > 0 ? (
        <div className="space-y-2">
          {tontines.map((t) => {
            const pot = Number(t.contributionAmount) * t.memberLimit;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                className="w-full text-left rounded-xl border border-gray-200 p-4 hover:border-allness-green hover:bg-allness-green/[0.02] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.frequency} · {t.memberLimit} membres · Tour {t.currentCycle}/{t.memberLimit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-allness-dark">
                      {new Intl.NumberFormat('fr-FR').format(pot)} {t.currency}
                    </p>
                    <p className="text-[10px] text-gray-400">Cagnotte</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-6">
          Aucune tontine trouvée.
        </p>
      )}

      <div className="rounded-xl bg-allness-dark p-4 text-white">
        <p className="text-xs text-white/60 mb-1">Solde portefeuille</p>
        <p className="text-lg font-bold">
          {new Intl.NumberFormat('fr-FR').format(walletBalance)}{' '}
          <span className="text-sm font-medium text-allness-orange">{walletCurrency}</span>
        </p>
      </div>
    </div>
  );
}
