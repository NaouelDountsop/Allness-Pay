import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { WalletBalanceCard } from '@/components/user_dashboard/wallet/wallet-balance-card';
import { WalletActions } from '@/components/user_dashboard/wallet/wallet-actions';
import { AccountList } from '@/components/user_dashboard/wallet/account-list';
import { QuickActionsGrid } from '@/components/user_dashboard/wallet/quick-actions-grid';
import { MonthlySummary } from '@/components/user_dashboard/wallet/monthly-summary';
import { SecurityCard } from '@/components/user_dashboard/wallet/security-card';
import { AddLinkedAccountModal } from '@/components/user_dashboard/wallet/add-linked-account-modal';
import { CreateWalletModal } from '@/components/user_dashboard/wallet/create-wallet-modal';
import { walletService } from '@/lib/api/wallet.service';
import { Plus } from 'lucide-react';

export default function WalletPage() {
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [createWalletOpen, setCreateWalletOpen] = useState(false);
  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.list,
  });

  const primaryWallet = wallets.find((w) => w.isPrimary) ?? wallets[0] ?? null;
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
          <button
            onClick={() => setCreateWalletOpen(true)}
            className="h-10 px-3 sm:px-5 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Créer un portefeuille</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <WalletBalanceCard
                walletId={primaryWallet?.walletNumber ?? '—'}
                balance={totalBalance}
                currency={primaryWallet?.currency ?? 'FCFA'}
                status={primaryWallet?.status === 'active' ? 'Actif' : 'En attente'}
              />
              <WalletActions />
            </div>
            <AccountList wallets={wallets} onAddAccount={() => setAddAccountOpen(true)} />
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
              month="Juin 2026"
              incomePercent={65}
              expensePercent={35}
              netAmount={totalBalance}
              data={[]}
            />
            <SecurityCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
