import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { KycBanner } from "@/components/user_dashboard/kyc-banner";
import { WalletBalanceCard } from "@/components/user_dashboard/wallet/wallet-balance-card";
import { QuickSend } from "@/components/user_dashboard/quick-send";
import { TransactionsList } from "@/components/user_dashboard/transactions-list";
import { SpendingChart } from "@/components/user_dashboard/spending-charts";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  mockTransactions,
  mockContacts,
  mockSpendingChart,
  mockSpendingBreakdown,
} from "@/lib/mock/dashboard-data";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardHeader
        firstName="Jean"
        userName="Alex Sterling"
        memberLabel="Premium Member"
      />
      <KycBanner />

      <div className="flex justify-center px-4 sm:px-8 pb-10">
        <div className="w-full max-w-[90vw] grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <WalletBalanceCard
                walletId="WAL-00001258"
                balance={2450000}
                currency="CFA"
              />

              <div className="flex gap-3">
                <div className="flex-1 rounded-xl bg-green-50 px-4 py-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-afrilink-green" />
                  <div>
                    <p className="text-[11px] text-gray-500">ENTRÉES</p>
                    <p className="text-sm font-semibold text-afrilink-green">
                      +12,450.00
                    </p>
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-red-50 px-4 py-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-[11px] text-gray-500">SORTIES</p>
                    <p className="text-sm font-semibold text-red-500">-4,210.80</p>
                  </div>
                </div>
              </div>
            </div>

            <TransactionsList transactions={mockTransactions} />
          </div>

          <div className="space-y-6">
            <QuickSend contacts={mockContacts} />
            <SpendingChart data={mockSpendingChart} breakdown={mockSpendingBreakdown} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
