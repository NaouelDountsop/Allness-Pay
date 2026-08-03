import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { KycBanner } from "@/components/user_dashboard/kyc-banner";
import { WalletBalanceCard } from "@/components/user_dashboard/wallet/wallet-balance-card";
import { QuickSend } from "@/components/user_dashboard/quick-send";
import { TransactionsList } from "@/components/user_dashboard/transactions-list";
import { MonthlySummary } from "@/components/user_dashboard/spending-charts";
import { mockMonthlyTrend, mockMonthlySummaryHeader } from "@/components/user_dashboard//mock-monthly-trend";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { mockContacts } from "@/lib/mock/dashboard-data";
import { userService } from "@/lib/api/user.service";
import { walletService } from "@/lib/api/wallet.service";

const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getProfile,
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet-primary"],
    queryFn: walletService.getPrimary,
  });

  const isLoading = userLoading || walletLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const firstName = user?.prenom || "Utilisateur";
  const fullName = user ? `${user.prenom} ${user.nom}` : "Utilisateur";
  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? "XAF";
  const walletNumber = wallet?.walletNumber ?? "---";
  const walletStatus = wallet?.status === "active" ? "Actif" : wallet?.status === "suspended" ? "Suspendu" : "Fermé";

  return (
    <DashboardLayout>
      <DashboardHeader
        firstName={firstName}
        userName={fullName}
        memberLabel={user?.profession || "Membre"}
      />
      <KycBanner />

      <div className="relative isolate z-0 overflow-x-hidden flex justify-center px-4 sm:px-6 lg:px-8 pb-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <WalletBalanceCard
                walletId={walletNumber}
                balance={balance}
                currency={currency}
                status={walletStatus}
              />

              <div className="flex gap-3">
                <div className="flex-1 min-w-0 rounded-2xl bg-afrilink-dark px-3 sm:px-4 py-4 sm:py-5 flex flex-col items-center text-center gap-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#D28E2F]" />
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#D28E2F]/80 tracking-wide">ENTRÉES</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      <span className="text-white">+{formatNumber(0)}</span>{" "}
                      <span className="text-[#D28E2F]">{currency}</span>
                    </p>
                  </div>
                </div>
                <div className="flex-1 min-w-0 rounded-2xl bg-afrilink-dark px-3 sm:px-4 py-4 sm:py-5 flex flex-col items-center text-center gap-2">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#D28E2F]" />
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#D28E2F]/80 tracking-wide">SORTIES</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      <span className="text-white">-{formatNumber(0)}</span>{" "}
                      <span className="text-[#D28E2F]">{currency}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <TransactionsList transactions={[]} />
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
