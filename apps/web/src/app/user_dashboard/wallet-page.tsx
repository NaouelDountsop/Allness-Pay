import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { WalletBalanceCard } from '@/components/user_dashboard/wallet/wallet-balance-card';
import { WalletActions } from '@/components/user_dashboard/wallet/wallet-actions';
import { AccountList } from '@/components/user_dashboard/wallet/account-list';
import { QuickActionsGrid } from '@/components/user_dashboard/wallet/quick-actions-grid';
import { MonthlySummary } from '@/components/user_dashboard/spending-charts';
import { SecurityCard } from '@/components/user_dashboard/wallet/security-card';
import { AddLinkedAccountModal } from '@/components/user_dashboard/wallet/add-linked-account-modal';
import { walletService } from '@/lib/api/wallet.service';
import { transactionService } from '@/lib/api/transaction.service';
import { campayService } from '@/lib/api/campay.service';
import { kycService } from '@/lib/api/kyc.service';
import { getPendingDeposit, clearPendingDeposit, type DepositState } from '../../context/deposit-flow-context';
import { Loader2, CheckCircle2, XCircle, X } from 'lucide-react';
import { Loader2, CheckCircle2, XCircle, X } from 'lucide-react';

export default function WalletPage() {
  const { t } = useTranslation();
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [depositStatus, setDepositStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [pendingDeposit, setPendingDeposit] = useState<DepositState | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!bannerDismissed) {
      setPendingDeposit(getPendingDeposit());
    }
  }, [bannerDismissed]);

  const isPendingDeposit = pendingDeposit?.status === 'pending' && pendingDeposit?.transactionId && !bannerDismissed;

  useEffect(() => {
    if (!isPendingDeposit || pendingDeposit?.method === 'bank') return;

    const interval = setInterval(() => {
      attemptsRef.current += 1;

      campayService.verifyPayment(pendingDeposit!.transactionId).then((res) => {
        if (res.status === 'completed') {
          clearInterval(interval);
          setDepositStatus('success');
        } else if (res.status === 'failed') {
          clearInterval(interval);
          setDepositStatus('failed');
        } else if (attemptsRef.current >= 20) {
          clearInterval(interval);
          setDepositStatus('failed');
        }
      }).catch(() => {
        if (attemptsRef.current >= 20) {
          clearInterval(interval);
          setDepositStatus('failed');
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPendingDeposit, pendingDeposit?.transactionId, pendingDeposit?.method]);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    clearPendingDeposit();
    setPendingDeposit(null);
  };

  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.list,
  });

  const primaryWallet = wallets.find((w) => w.isPrimary) ?? wallets[0] ?? null;
  const displayWallet = selectedWalletId
    ? wallets.find((w) => w.id === selectedWalletId) ?? primaryWallet
    : primaryWallet;
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  const { data: monthlySummary } = useQuery({
    queryKey: ['monthly-summary', displayWallet?.id],
    queryFn: () => transactionService.getMonthlySummary(displayWallet!.id),
    enabled: !!displayWallet?.id,
  });

  const { data: kyc } = useQuery({
    queryKey: ['kyc-me'],
    queryFn: () => kycService.getMine(),
    retry: false,
  });

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
        {/* Banner dépôt en cours - style KYC banner */}
        {isPendingDeposit && (
          <div
            className={`mb-4 sm:mb-6 rounded-xl border px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
              depositStatus === 'success'
                ? 'bg-green-50 border-green-300 text-green-900'
                : depositStatus === 'failed'
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-orange-50 border-orange-300 text-orange-900'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  depositStatus === 'success'
                    ? 'bg-green-100'
                    : depositStatus === 'failed'
                      ? 'bg-red-100'
                      : 'bg-orange-100'
                }`}
              >
                {depositStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : depositStatus === 'failed' ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-0.5">
                  {depositStatus === 'success'
                    ? t('wallet.depositSuccessTitle')
                    : depositStatus === 'failed'
                      ? t('wallet.depositFailedTitle')
                      : t('wallet.depositPendingTitle')}
                </p>
                <p className="text-xs leading-relaxed opacity-80">
                  {depositStatus === 'success'
                    ? t('wallet.depositSuccessDescription')
                    : depositStatus === 'failed'
                      ? t('wallet.depositFailedDescription')
                      : t('wallet.depositPendingDescription', {
                          amount: new Intl.NumberFormat('fr-FR').format(Number(pendingDeposit!.amount)),
                        })}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissBanner}
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors ${
                depositStatus === 'success'
                  ? 'text-green-600'
                  : depositStatus === 'failed'
                    ? 'text-red-600'
                    : 'text-orange-600'
              }`}
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-allness-dark">Portefeuille</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <WalletBalanceCard
                walletNumber={displayWallet?.walletNumber ?? '—'}
                walletInternalId={displayWallet?.id ?? ''}
                balance={selectedWalletId ? Number(displayWallet?.balance ?? 0) : totalBalance}
                currency={displayWallet?.currency ?? 'FCFA'}
                status={displayWallet?.status === 'active' ? 'Actif' : 'En attente'}
                kycApproved={kyc?.status === 'APPROVED'}
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
          </div>

          <div className="space-y-6">
            <QuickActionsGrid />
            {monthlySummary && (
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
            <SecurityCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
