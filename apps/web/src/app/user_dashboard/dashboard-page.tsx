import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { KycBanner } from "@/components/user_dashboard/kyc-banner";
import { BalanceCard } from "@/components/user_dashboard/wallet";
import { QuickSend } from "@/components/user_dashboard/quick-send";
import { TransactionsList } from "@/components/user_dashboard/transactions-list";
import { SpendingChart } from "@/components/user_dashboard/spending-charts";
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
            <BalanceCard
              balance={2450000}
              currency="CFA"
              ownerName="John Doe"
              incomeToday={12450.0}
              expenseToday={-4210.8}
            />
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
