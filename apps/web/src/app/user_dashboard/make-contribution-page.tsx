import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Info, Loader2, CheckCircle, CircleCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import {
  PaymentMethodsGrid,
  type PaymentMethod,
} from '@/components/user_dashboard/tontines/payment-methods-grid';
import { TontineSummaryCard } from '@/components/user_dashboard/tontines/tontine-summary-card';
import { PinConfirmModal } from '@/components/user_dashboard/send/pin-confirm-modal';
import { tontineService } from '@/lib/api/tontine.service';
import { walletService } from '@/lib/api/wallet.service';
import { currencyService } from '@/lib/api/currency.service';

const contributionSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 100 && Number.isInteger(num);
  }, "Le montant doit être un nombre entier d'au moins 100"),
  method: z.enum(['wallet', 'mtn_momo', 'orange_money', 'card']),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

const PAYMENT_TO_METHOD: Record<PaymentMethod, ContributionFormData['method']> = {
  wallet: 'wallet',
  card: 'card',
  mobile_money: 'mtn_momo',
  orange_money: 'orange_money',
};

export default function MakeContributionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: tontine,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['tontine', id],
    queryFn: () => tontineService.getById(id!),
    enabled: !!id,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet-primary'],
    queryFn: walletService.getPrimary,
  });

  const tontineCurrency = tontine?.currency ?? 'XAF';
  const walletCurrency = wallet?.currency ?? 'XAF';
  const hasDifferentCurrencies = walletCurrency !== tontineCurrency;

  const { data: exchangeRate } = useQuery({
    queryKey: ['exchange-rate', walletCurrency, tontineCurrency],
    queryFn: () => currencyService.getExchangeRate(walletCurrency, tontineCurrency),
    enabled: hasDifferentCurrencies,
  });

  const { data: contributionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['contribution-status', id],
    queryFn: () => tontineService.checkMyContributionStatus(id!),
    enabled: !!id,
  });

  const suggestedAmount = tontine ? String(tontine.contributionAmount) : '500';
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('wallet');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tontine) {
      setAmount(String(tontine.contributionAmount));
    }
  }, [tontine]);

  const effectiveAmount = amount || suggestedAmount;

  const currencyLabels: Record<string, string> = {
    XAF: 'FCFA',
    XOF: 'CFA',
    CAD: 'CA$',
    EUR: '€',
    USD: '$',
  };
  const displayCurrency = currencyLabels[tontineCurrency] ?? tontineCurrency;

  const formValidation = contributionSchema.safeParse({
    amount: effectiveAmount,
    method: PAYMENT_TO_METHOD[method],
  });
  const isFormValid = formValidation.success;

  const contributionMutation = useMutation({
    mutationFn: (pin: string) =>
      tontineService.contribute(id!, {
        amount: effectiveAmount,
        walletId: wallet!.id,
        pin,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontine', id] });
      queryClient.invalidateQueries({ queryKey: ['tontines'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-primary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', wallet?.id] });
      queryClient.invalidateQueries({ queryKey: ['tontine-contributions', id] });
      queryClient.invalidateQueries({ queryKey: ['contribution-status', id] });
      setSuccess(true);
    },
  });

  const needsExternalInfo = method !== 'wallet';
  const hasExternalInfo = !needsExternalInfo || phoneNumber.trim().length > 0 || cardNumber.trim().length > 0;

  const handleConfirm = () => {
    if (!isFormValid || !wallet) return;
    if (needsExternalInfo && !hasExternalInfo) return;
    setShowPinConfirm(true);
  };

  const handlePinConfirm = async (pin: string): Promise<string | null> => {
    try {
      await contributionMutation.mutateAsync(pin);
      return null;
    } catch (err: unknown) {
      const axiosData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const msg = axiosData?.message;
      if (typeof msg === 'string' && msg.length > 0) return msg;
      if (Array.isArray(msg) && msg.length > 0) return msg[0];
      return 'Une erreur est survenue. Réessayez.';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-allness-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (fetchError || !tontine) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="px-4 sm:px-8 pb-10">
          <button
            onClick={() => navigate('/dashboard/tontines')}
            className="flex items-center gap-2 text-lg font-semibold text-allness-dark mb-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Effectuer un versement
          </button>
          <p className="text-sm text-gray-500 mt-6">Tontine introuvable.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="px-4 sm:px-8 pb-10">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="w-10 h-10 text-allness-green" />
            </div>
            <h2 className="text-xl font-bold text-allness-dark mb-2">Versement effectué !</h2>
            <p className="text-sm text-gray-500 mb-8">
              Votre contribution de{' '}
              <span className="font-semibold text-allness-dark">
                {new Intl.NumberFormat('fr-FR').format(Number(effectiveAmount))} {displayCurrency}
              </span>{' '}
              a été débitée de votre portefeuille.
            </p>
            <button
              onClick={() => navigate(`/dashboard/tontines/${id}`)}
              className="h-11 px-6 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Retour à la tontine
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (statusLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-allness-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (contributionStatus?.hasPaid) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="px-4 sm:px-8 pb-10">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10">
              <CircleCheck className="w-10 h-10 text-allness-green" />
            </div>
            <h2 className="text-xl font-bold text-allness-dark dark:text-[#F1F5F5] mb-2">Déjà cotisé</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Vous avez déjà cotisé pour le tour {contributionStatus.cycleNumber}.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Montant :{' '}
              <span className="font-semibold text-allness-dark dark:text-[#F1F5F5]">
                {new Intl.NumberFormat('fr-FR').format(Number(contributionStatus.amount))}{' '}
                {contributionStatus.currency ?? 'XAF'}
              </span>
            </p>
            <button
              onClick={() => navigate(`/dashboard/tontines/${id}`)}
              className="h-11 px-6 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Retour à la tontine
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const nextDueDate = tontine.nextContributionAt
    ? new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const activeMembers = tontine.members?.filter((m) => m.status === 'ACTIVE').length ?? 0;
  const walletBalance = wallet ? Number(wallet.balance) : 0;
  const walletDisplayCurrency = currencyLabels[walletCurrency] ?? walletCurrency;
  const insufficientBalance = method === 'wallet' && Number(effectiveAmount) > walletBalance;
  const totalPaid = Number(tontine.contributionAmount) * tontine.currentCycle;

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="px-4 sm:px-8 pb-10">
        <button
          onClick={() => navigate(`/dashboard/tontines/${id}`)}
          className="flex items-center gap-2 text-lg font-semibold text-allness-dark mb-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Effectuer un versement
        </button>
        <p className="text-sm text-gray-500 mb-6">
          Contribuez à la cagnotte collective de votre groupe.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 h-fit space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-500">Nom de la tontine</label>
              <div className="h-11 rounded-lg border border-gray-100 px-3 mt-1 flex items-center text-sm text-gray-700 bg-gray-50">
                {tontine.name}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500">
                Montant de cotisation ({displayCurrency})
              </label>
              <div className="h-11 rounded-lg border border-gray-100 px-3 mt-1 flex items-center text-sm text-gray-700 bg-gray-50">
                {new Intl.NumberFormat('fr-FR').format(Number(tontine.contributionAmount))} {displayCurrency}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Montant fixé par la tontine
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Mode de paiement
              </label>
              <PaymentMethodsGrid selected={method} onSelect={setMethod} />
            </div>

            {method === 'mobile_money' && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Numéro de téléphone Mobile Money
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: +237 6XX XXX XXX"
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Numéro associé à votre compte Mobile Money
                </p>
              </div>
            )}

            {method === 'orange_money' && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Numéro de téléphone Orange Money
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: +237 6XX XXX XXX"
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Numéro associé à votre compte Orange Money
                </p>
              </div>
            )}

            {method === 'card' && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Numéro de carte bancaire
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Entrez le numéro de votre carte bancaire
                </p>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 p-3 text-xs text-orange-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p>
                  Solde disponible Portefeuille :{' '}
                  <span className="font-semibold">
                    {new Intl.NumberFormat('fr-FR').format(walletBalance)} {walletDisplayCurrency}
                  </span>
                </p>
                {hasDifferentCurrencies && exchangeRate && (
                  <div className="mt-2 pt-2 border-t border-orange-200/60">
                    <p className="font-medium text-orange-800">Taux de change appliqué</p>
                    <p className="mt-1">
                      1 {walletDisplayCurrency} = {exchangeRate.rate} {displayCurrency}
                    </p>
                    <p className="mt-1 text-[11px] text-orange-600">
                      Vous paierez{' '}
                      <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR').format(Math.round(Number(effectiveAmount) / exchangeRate.rate))} {walletDisplayCurrency}
                      </span>{' '}
                      pour une cotisation de{' '}
                      <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR').format(Number(effectiveAmount))} {displayCurrency}
                      </span>
                    </p>
                  </div>
                )}
                {hasDifferentCurrencies && !exchangeRate && (
                  <p className="mt-1 text-[11px] text-orange-500">
                    Aucun taux de change disponible pour {walletDisplayCurrency} → {displayCurrency}
                  </p>
                )}
              </div>
            </div>

            {insufficientBalance && (
              <p className="text-xs text-red-500">
                Solde insuffisant. Veuillez recharger votre portefeuille ou choisir un autre mode de
                paiement.
              </p>
            )}

            <button
              onClick={handleConfirm}
              disabled={!isFormValid || contributionMutation.isPending || insufficientBalance || !wallet || (needsExternalInfo && !hasExternalInfo)}
              className="w-full h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:bg-green-200"
            >
              {contributionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{contributionMutation.isPending ? 'Versement en cours...' : 'Confirmer le versement'}</span>
            </button>
          </div>

          <TontineSummaryCard
            frequency={tontine.frequency}
            nextDueDate={nextDueDate}
            turnOrder={`${tontine.currentCycle} / ${tontine.memberLimit}`}
            totalPaid={totalPaid}
            currency={tontineCurrency}
            progressPercent={Math.round((tontine.currentCycle / tontine.memberLimit) * 100)}
            membersCount={activeMembers}
          />
        </div>
      </div>

      {showPinConfirm && (
        <PinConfirmModal
          walletId={wallet?.id ?? ''}
          onConfirm={handlePinConfirm}
          onClose={() => {
            setShowPinConfirm(false);
            if (contributionMutation.isError) {
              contributionMutation.reset();
            }
          }}
        />
      )}
    </DashboardLayout>
  );
}
