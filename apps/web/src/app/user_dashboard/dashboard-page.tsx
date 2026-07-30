import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { KycBanner } from "@/components/user_dashboard/kyc-banner";
import { WalletBalanceCard } from "@/components/user_dashboard/wallet/wallet-balance-card";
import { QuickSend } from "@/components/user_dashboard/quick-send";
import { TransactionsList } from "@/components/user_dashboard/transactions-list";
import { MonthlySummary } from "@/components/user_dashboard/spending-charts";
import { mockMonthlyTrend, mockMonthlySummaryHeader } from "@/components/user_dashboard//mock-monthly-trend";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  mockTransactions,
  mockContacts,
  //mockSpendingChart,
  //mockSpendingBreakdown,
} from "@/lib/mock/dashboard-data";

const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export default function DashboardPage() {
  const income = 12450;
  const expense = 4210.8;

  return (
    <DashboardLayout>
      <DashboardHeader
        firstName="Jean"
        userName="Alex Sterling"
        memberLabel="Premium Member"
      />
      <KycBanner />

      <div className="relative isolate z-0 overflow-x-hidden flex justify-center px-4 sm:px-6 lg:px-8 pb-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <WalletBalanceCard
                walletId="WAL-00001258"
                balance={2450000}
                currency="CFA"
              />

              <div className="flex gap-3">
                <div className="flex-1 min-w-0 rounded-2xl bg-afrilink-dark px-3 sm:px-4 py-4 sm:py-5 flex flex-col items-center text-center gap-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#D28E2F]" />
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#D28E2F]/80 tracking-wide">ENTRÉES</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      <span className="text-white">+{formatNumber(income)}</span>{" "}
                      <span className="text-[#D28E2F]">FCFA</span>
                    </p>
                  </div>
                </div>
                <div className="flex-1 min-w-0 rounded-2xl bg-afrilink-dark px-3 sm:px-4 py-4 sm:py-5 flex flex-col items-center text-center gap-2">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#D28E2F]" />
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#D28E2F]/80 tracking-wide">SORTIES</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      <span className="text-white">-{formatNumber(expense)}</span>{" "}
                      <span className="text-[#D28E2F]">FCFA</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <TransactionsList transactions={mockTransactions} />
          </div>

          <div className="space-y-6">
            <QuickSend contacts={mockContacts} />
            <MonthlySummary
  month={mockMonthlySummaryHeader.month}
  incomePercent={mockMonthlySummaryHeader.incomePercent}
  expensePercent={mockMonthlySummaryHeader.expensePercent}
  netAmount={mockMonthlySummaryHeader.netAmount}
  data={mockMonthlyTrend}
/>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}