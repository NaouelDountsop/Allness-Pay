import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { WalletBalanceCard } from "@/components/user_dashboard/wallet/wallet-balance-card";
import { WalletActions } from "@/components/user_dashboard/wallet/wallet-actions";
import { AccountList } from "@/components/user_dashboard/wallet/account-list";
import { QuickActionsGrid } from "@/components/user_dashboard/wallet/quick-actions-grid";
import { MonthlySummary } from "@/components/user_dashboard/wallet/monthly-summary";
import { SecurityCard } from "@/components/user_dashboard/wallet/security-card";
import { mockWalletAccounts } from "@/lib/mock/wallet-data";
import { Plus } from "lucide-react";

export default function WalletPage() {
  const totalBalance = mockWalletAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-20 md:pb-10">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-afrilink-dark">Portefeuille</h1>
            <button className="h-10 px-3 sm:px-5 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Créer un portefeuille</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                data={[
                  { label: "Mars", revenus: 950000, depenses: 620000, epargne: 180000, solde: 330000 },
                  { label: "Avr", revenus: 1020000, depenses: 640000, epargne: 210000, solde: 380000 },
                  { label: "Mai", revenus: 1150000, depenses: 700000, epargne: 260000, solde: 450000 },
                  { label: "Juin", revenus: 1780000, depenses: 900000, epargne: 340000, solde: 880000 },
                ]}
              />
              <SecurityCard />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}