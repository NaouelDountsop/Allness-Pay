import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Plus, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { ContributionStats } from '@/components/user_dashboard/tontines/contribution-stats';
import { CycleSelector } from '@/components/user_dashboard/tontines/cycle-selector';
import { ContributionsTable } from '@/components/user_dashboard/tontines/contributions-table';
import { mockContributions, mockCycles } from '@/lib/mock/tontines-data';
import { tontineService, type Tontine } from '@/lib/api/tontine.service';
import { walletService } from '@/lib/api/wallet.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function ContributionHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState(mockCycles[0]?.id ?? '');
  const [tontineModalOpen, setTontineModalOpen] = useState(false);

  const { data: tontine, isLoading: tontineLoading } = useQuery({
    queryKey: ['tontine', id],
    queryFn: () => tontineService.getById(id!),
    enabled: !!id,
  });

  if (tontineLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const totalContributed = tontine
    ? Number(tontine.contributionAmount) * tontine.currentCycle
    : 0;

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <button
              onClick={() => navigate(id ? `/dashboard/tontines/${id}` : '/dashboard/tontines')}
              className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark"
            >
              <ArrowLeft className="w-5 h-5" />
              Historique des Versements
            </button>
            {tontine && (
              <p className="text-sm text-gray-500 mt-1">{tontine.name}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="h-9 px-4 rounded-lg border border-afrilink-green text-afrilink-green text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <button
              onClick={() => setTontineModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Versement
            </button>
          </div>
        </div>

        {tontine && (
          <ContributionStats
            totalContributed={totalContributed}
            currency={tontine.currency ?? 'CFA'}
            contributionsCount={mockContributions.length}
            currentTurn={tontine.currentCycle}
            totalTurns={tontine.memberLimit}
          />
        )}

        <CycleSelector cycles={mockCycles} selected={selectedCycle} onSelect={setSelectedCycle} />

        <ContributionsTable contributions={mockContributions} />
      </div>

      {/* Popup sélection tontine */}
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
        <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
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
                className="w-full text-left rounded-xl border border-gray-200 p-4 hover:border-afrilink-green hover:bg-afrilink-green/[0.02] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.frequency} · {t.memberLimit} membres · Tour {t.currentCycle}/{t.memberLimit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-afrilink-dark">
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

      <div className="rounded-xl bg-afrilink-dark p-4 text-white">
        <p className="text-xs text-white/60 mb-1">Solde portefeuille</p>
        <p className="text-lg font-bold">
          {new Intl.NumberFormat('fr-FR').format(walletBalance)}{' '}
          <span className="text-sm font-medium text-afrilink-orange">{walletCurrency}</span>
        </p>
      </div>
    </div>
  );
}
