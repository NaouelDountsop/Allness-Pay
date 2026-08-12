import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { ContributionStats } from '@/components/user_dashboard/tontines/contribution-stats';
import { CycleSelector } from '@/components/user_dashboard/tontines/cycle-selector';
import { ContributionsTable } from '@/components/user_dashboard/tontines/contributions-table';
import { mockContributions, mockCycles } from '@/lib/mock/tontines-data';

export default function ContributionHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState(mockCycles[0]?.id ?? '');

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="px-4 sm:px-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate(`/dashboard/tontines/${id}`)}
            className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark"
          >
            <ArrowLeft className="w-5 h-5" />
            Historique des Versements
          </button>
          <div className="flex gap-2">
            <button className="h-9 px-4 rounded-lg border border-afrilink-green text-afrilink-green text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <button className="h-9 px-4 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Versement
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6 -mt-4">Tontine Solidarité Diaspora</p>

        <ContributionStats
          totalContributed={45280000}
          currency="CFA"
          contributionsCount={124}
          currentTurn={8}
          totalTurns={12}
        />

        <CycleSelector cycles={mockCycles} selected={selectedCycle} onSelect={setSelectedCycle} />

        <ContributionsTable contributions={mockContributions} />
      </div>
    </DashboardLayout>
  );
}
