import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { WalletBalanceCard } from '@/components/user_dashboard/wallet/wallet-balance-card';
import { WalletActions } from '@/components/user_dashboard/wallet/wallet-actions';
import { AccountList } from '@/components/user_dashboard/wallet/account-list';
import { QuickActionsGrid } from '@/components/user_dashboard/wallet/quick-actions-grid';
import { MonthlySummary } from '@/components/user_dashboard/spending-charts';
import { SecurityCard } from '@/components/user_dashboard/wallet/security-card';
import { AddLinkedAccountModal } from '@/components/user_dashboard/wallet/add-linked-account-modal';
import { CreateWalletModal } from '@/components/user_dashboard/wallet/create-wallet-modal';
import { walletService } from '@/lib/api/wallet.service';
import { Plus} from 'lucide-react';

const mockWalletMonthlyData = [
  { label: 'Avr', revenus: 120000, depenses: 90000, epargne: 30000, solde: 60000 },
  { label: 'Mai', revenus: 140000, depenses: 95000, epargne: 45000, solde: 85000 },
  { label: 'Juin', revenus: 155000, depenses: 100000, epargne: 55000, solde: 100000 },
  { label: 'Juil', revenus: 185000, depenses: 110000, epargne: 75000, solde: 150000 },
];

export default function WalletPage() {
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [createWalletOpen, setCreateWalletOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.list,
  });

  const primaryWallet = wallets.find((w) => w.isPrimary) ?? wallets[0] ?? null;
  const displayWallet = selectedWalletId
    ? wallets.find((w) => w.id === selectedWalletId) ?? primaryWallet
    : primaryWallet;
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  if (walletsLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400 text-sm">Chargement des portefeuilles...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-afrilink-dark">Portefeuille</h1>
          <div className="flex items-center gap-3">
            {/* {displayWallet && (
              <Button
                onClick={() => navigate('/dashboard/payments')}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payer
              </Button>
            )} */}
            <button
              onClick={() => setCreateWalletOpen(true)}
              className="h-10 px-3 sm:px-5 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Créer un portefeuille</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <WalletBalanceCard
                walletId={displayWallet?.walletNumber ?? '—'}
                balance={selectedWalletId ? Number(displayWallet?.balance ?? 0) : totalBalance}
                currency={displayWallet?.currency ?? 'FCFA'}
                status={displayWallet?.status === 'active' ? 'Actif' : 'En attente'}
              />
              <WalletActions />
            </div>
            <AccountList
              wallets={wallets}
              onAddAccount={() => setAddAccountOpen(true)}
              onSelectWallet={(w) => setSelectedWalletId(w.id)}
              selectedWalletId={selectedWalletId}
            />
            <AddLinkedAccountModal
              open={addAccountOpen}
              onOpenChange={setAddAccountOpen}
              wallets={wallets}
            />
            <CreateWalletModal open={createWalletOpen} onOpenChange={setCreateWalletOpen} />
          </div>

          <div className="space-y-6">
            <QuickActionsGrid />
            <MonthlySummary
              month="Juillet 2026"
              incomePercent={62}
              expensePercent={38}
              netAmount={displayWallet ? Number(displayWallet.balance) : totalBalance}
              data={mockWalletMonthlyData}
            />
            <SecurityCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
