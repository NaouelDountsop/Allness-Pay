import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { KycBanner } from '@/components/user_dashboard/kyc-banner';
import { TontineInvitationBanner } from '@/components/user_dashboard/tontine-invitation-banner';
import { WalletBalanceCard } from '@/components/user_dashboard/wallet/wallet-balance-card';
import { QuickSend } from '@/components/user_dashboard/quick-send';
import { TransactionsList } from '@/components/user_dashboard/transactions-list';
import { MonthlySummary } from '@/components/user_dashboard/spending-charts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { walletService } from '@/lib/api/wallet.service';
import { kycService } from '@/lib/api/kyc.service';
import { transactionService } from '@/lib/api/transaction.service';
import { beneficiaryService } from '@/lib/api/beneficiary.service';
import { tontineService } from '@/lib/api/tontine.service';

const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

export default function DashboardPage() {
  const {
    data: wallet,
    isLoading: walletLoading,
    isError: walletError,
  } = useQuery({
    queryKey: ['wallet-primary'],
    queryFn: walletService.getPrimary,
    retry: 1,
  });

  const { data: kyc } = useQuery({
    queryKey: ['kyc-me'],
    queryFn: () => kycService.getMine(),
    retry: false,
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions', wallet?.id],
    queryFn: () => transactionService.listByWallet(wallet!.id),
    enabled: !!wallet?.id,
  });

  const { data: beneficiaries = [], isLoading: beneficiariesLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: beneficiaryService.list,
    select: (res) => res.data,
  });

  const { data: monthlySummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['monthly-summary', wallet?.id],
    queryFn: () => transactionService.getMonthlySummary(wallet!.id),
    enabled: !!wallet?.id,
  });

  const { data: pendingInvitations } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: tontineService.listPendingInvitations,
    enabled: kyc?.status === 'APPROVED',
  });

  const lastFiveTransactions = transactions.slice(0, 5);

  const totalIncome = transactions.reduce((sum, t) => {
    if (t.status !== 'completed') return sum;
    const credit = transactionService.isCredit(t.type);
    return credit ? sum + Number(t.amount) : sum;
  }, 0);

  const totalExpense = transactions.reduce((sum, t) => {
    if (t.status !== 'completed') return sum;
    const credit = transactionService.isCredit(t.type);
    return credit ? sum : sum + Number(t.amount);
  }, 0);

  if (walletLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (walletError) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-sm text-gray-500">
            Impossible de charger votre portefeuille.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="h-10 px-6 rounded-lg bg-afrilink-orange text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const balance = Number(wallet?.balance) || 0;
  const currency = wallet?.currency ?? 'XAF';
  const walletNumber = wallet?.walletNumber ?? '---';
  const walletStatus =
    wallet?.status === 'active' ? 'Actif' : wallet?.status === 'suspended' ? 'Suspendu' : 'Fermé';

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <KycBanner status={kyc?.status ?? null} />
        {kyc?.status === 'APPROVED' && (
          <TontineInvitationBanner
            count={pendingInvitations?.filter((inv) => inv.status === 'PENDING').length ?? 0}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    <p className="text-[10px] sm:text-[11px] text-[#D28E2F]/80 tracking-wide">
                      ENTRÉES
                    </p>
                    <p className="text-xs sm:text-sm font-semibold">
                      <span className="text-white">+{formatNumber(totalIncome)}</span>{' '}
                      <span className="text-[#D28E2F]">{currency}</span>
                    </p>
                  </div>
                </div>
                <div className="flex-1 min-w-0 rounded-2xl bg-afrilink-dark px-3 sm:px-4 py-4 sm:py-5 flex flex-col items-center text-center gap-2">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#D28E2F]" />
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-[#D28E2F]/80 tracking-wide">
                      SORTIES
                    </p>
                    <p className="text-xs sm:text-sm font-semibold">
                      <span className="text-white">-{formatNumber(totalExpense)}</span>{' '}
                      <span className="text-[#D28E2F]">{currency}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <TransactionsList transactions={lastFiveTransactions} isLoading={txLoading} />
          </div>

          <div className="space-y-6">
            <QuickSend
              contacts={beneficiaries.map((b) => ({
                id: b.id,
                name: b.name,
                avatarUrl: null,
              }))}
              walletId={wallet?.id}
              isLoading={beneficiariesLoading}
            />
            {!summaryLoading && monthlySummary && (
              <MonthlySummary
                month={monthlySummary.month}
                incomePercent={monthlySummary.incomePercent}
                expensePercent={monthlySummary.expensePercent}
                netAmount={monthlySummary.net}
                data={monthlySummary.trend.map((t) => ({
                  label: t.month,
                  revenus: t.income,
                  depenses: t.expense,
                  epargne: 0,
                  solde: t.income - t.expense,
                }))}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
