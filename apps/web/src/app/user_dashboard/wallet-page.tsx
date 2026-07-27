import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { WalletBalanceCard } from "@/components/user_dashboard/wallet/wallet-balance-card";
import { WalletActions } from "@/components/user_dashboard/wallet/wallet-actions";
import { AccountList } from "@/components/user_dashboard/wallet/account-list";
import { QuickActionsGrid } from "@/components/user_dashboard/wallet/quick-actions-grid";
import { MonthlySummary } from "@/components/user_dashboard/wallet/monthly-summary";
import { SecurityCard } from "@/components/user_dashboard/wallet/security-card";
import { mockWalletAccounts } from "@/lib/mock/wallet-data";

export default function WalletPage() {
  const totalBalance = mockWalletAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="flex justify-center px-4 sm:px-8 pb-10">
        <div className="w-full max-w-[90vw]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold text-afrilink-dark">Portefeuille</h1>
            <button className="h-10 px-5 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors">
              Créer un portefeuille
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <WalletBalanceCard
                  walletId="WAL-00001258"
                  balance={totalBalance}
                  currency="FCFA"
                />
                <WalletActions />
              </div>
              <AccountList accounts={mockWalletAccounts} />
            </div>

            <div className="space-y-6">
              <QuickActionsGrid />
              <MonthlySummary
                month="Juin 2026"
                incomePercent={65}
                expensePercent={35}
                netAmount={1780000}
              />
              <SecurityCard />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
