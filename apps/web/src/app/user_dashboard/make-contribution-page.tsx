import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Info, Loader2, CheckCircle, CircleCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { CardNumberElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import {
  PaymentMethodsGrid,
  type PaymentMethod,
} from '@/components/user_dashboard/tontines/payment-methods-grid';
import { TontineSummaryCard } from '@/components/user_dashboard/tontines/tontine-summary-card';
import { PinConfirmModal } from '@/components/user_dashboard/send/pin-confirm-modal';
import { PaymentCardForm } from '@/components/stripe/payment-card-form';
import { StripeProvider } from '@/components/stripe/stripe-provider';
import { tontineService } from '@/lib/api/tontine.service';
import { walletService } from '@/lib/api/wallet.service';
import { currencyService } from '@/lib/api/currency.service';
import { stripeService } from '@/lib/api/stripe.service';
import { useUserProfile } from '@/hooks/use-user-profile';
import { CURRENCY_SYMBOLS, type Currency } from '@/context/deposit-flow.constants';
import { getCountryByCode } from '@/data/countries';

function getGroupLengths(placeholder: string): number[] {
  return placeholder.split(' ').map((group) => group.length);
}

function formatDigitsToPattern(digits: string, groupLengths: number[]): string {
  const parts: string[] = [];
  let cursor = 0;
  for (const len of groupLengths) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + len));
    cursor += len;
  }
  return parts.join(' ');
}

function detectNetwork(digits: string, country: string): 'mtn' | 'orange' | null {
  const clean = digits.replace(/\D/g, '');
  if (clean.length < 2) return null;

  if (country === 'CM') {
    if (clean.startsWith('67') || clean.startsWith('65') || clean.startsWith('68')) return 'mtn';
    if (clean.startsWith('69')) return 'orange';
  }
  if (country === 'SN') {
    if (clean.startsWith('77') || clean.startsWith('78')) return 'orange';
    if (clean.startsWith('76') || clean.startsWith('75')) return 'mtn';
  }
  if (country === 'CI') {
    if (clean.startsWith('07') || clean.startsWith('08') || clean.startsWith('09') || clean.startsWith('05') || clean.startsWith('06')) return 'orange';
  }
  if (country === 'GA' || country === 'CG') {
    if (clean.startsWith('06') || clean.startsWith('07')) return 'mtn';
    if (clean.startsWith('05')) return 'orange';
  }

  return null;
}

const contributionSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
  }, "Le montant doit être un nombre entier positif"),
  method: z.enum(['wallet', 'mtn_momo', 'orange_money', 'card']),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

const PAYMENT_TO_METHOD: Record<PaymentMethod, ContributionFormData['method']> = {
  wallet: 'wallet',
  card: 'card',
  mobile_money: 'mtn_momo',
  orange_money: 'orange_money',
};

interface CardPaymentFormProps {
  walletNumber: string;
  amount: string;
  currency: string;
  tontineName: string;
  tontineId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  onSubmitting: (submitting: boolean) => void;
}

function CardPaymentFormInner({
  walletNumber,
  amount,
  currency,
  tontineName,
  tontineId,
  onSuccess,
  onError,
  onSubmitting,
}: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [holderName, setHolderName] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements || submitting) return;

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) return;

    setSubmitting(true);
    onSubmitting(true);
    setErrorMessage(null);

    try {
      const paymentIntent = await stripeService.createPaymentIntent({
        walletNumber,
        amount,
        currency,
        description: `Cotisation tontine - ${tontineName}`,
        tontineId,
      });

      const { error } = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: holderName },
        },
      });

      if (error) {
        const errorMsg = error.message ?? 'Erreur de paiement';
        setErrorMessage(errorMsg);
        onError(errorMsg);
        setSubmitting(false);
        onSubmitting(false);
        return;
      }

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de paiement';
      setErrorMessage(message);
      onError(message);
    } finally {
      setSubmitting(false);
      onSubmitting(false);
    }
  };

  return (
    <div>
      <PaymentCardForm
        holderName={holderName}
        onHolderNameChange={setHolderName}
        onCardChange={setCardComplete}
        onError={(msg) => {
          setErrorMessage(msg);
          onError(msg);
        }}
      />
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600">{errorMessage}</p>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!stripe || !elements || !cardComplete || !holderName.trim() || submitting}
        className="w-full h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:bg-green-200"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {submitting
            ? 'Paiement en cours...'
            : `Payer ${new Intl.NumberFormat('fr-FR').format(Number(amount))} ${CURRENCY_SYMBOLS[currency as Currency] || currency}`}
        </span>
      </button>
    </div>
  );
}

export default function MakeContributionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useUserProfile();

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

  const country = useMemo(() => getCountryByCode(profile?.pays ?? 'CM') ?? getCountryByCode('CM')!, [profile?.pays]);
  const phoneGroupLengths = useMemo(() => getGroupLengths(country.phonePlaceholder), [country]);
  const expectedDigitCount = useMemo(() => phoneGroupLengths.reduce((sum, n) => sum + n, 0), [phoneGroupLengths]);

  const handlePhoneChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, expectedDigitCount);
    setPhoneNumber(formatDigitsToPattern(digitsOnly, phoneGroupLengths));
  };

  const detectedNetwork = useMemo(() => {
    if (!phoneNumber) return null;
    return detectNetwork(phoneNumber, country.code);
  }, [phoneNumber, country.code]);

  const networkMismatch = useMemo(() => {
    if (!detectedNetwork) return false;
    if (method === 'mobile_money' && detectedNetwork === 'orange') return true;
    if (method === 'orange_money' && detectedNetwork === 'mtn') return true;
    return false;
  }, [detectedNetwork, method]);

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
  const walletDisplayCurrency = currencyLabels[walletCurrency] ?? walletCurrency;
  const walletAmountNeeded = hasDifferentCurrencies && exchangeRate?.rate
    ? Math.round(Number(effectiveAmount) / Number(exchangeRate.rate))
    : Number(effectiveAmount);

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

  const needsExternalInfo = method === 'mobile_money' || method === 'orange_money';
  const hasExternalInfo = !needsExternalInfo || (phoneNumber.trim().length > 0 && !networkMismatch);

  const handleConfirm = () => {
    if (!isFormValid) return;
    if (method === 'wallet' && !wallet) return;
    if (method === 'card') {
      return;
    }
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
        <div>
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
        <div>
          <div className="max-w-md mx-auto text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="w-10 h-10 text-allness-green" />
            </div>
            <h2 className="text-xl font-bold text-allness-dark mb-2">Versement effectué !</h2>
            <p className="text-sm text-gray-500 mb-8">
              Votre contribution de{' '}
              <span className="font-semibold text-allness-dark">
                {new Intl.NumberFormat('fr-FR').format(Number(tontine.contributionAmount))} {displayCurrency}
              </span>{' '}
              ({new Intl.NumberFormat('fr-FR').format(walletAmountNeeded)} {walletDisplayCurrency})
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
        <div>
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
  const insufficientBalance = method === 'wallet' && walletAmountNeeded > walletBalance;
  const totalPaid = Number(tontine.contributionAmount) * tontine.currentCycle;

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="pb-10">
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
              <PaymentMethodsGrid selected={method} onSelect={setMethod} countryCode={profile?.pays} />
            </div>

            {method === 'mobile_money' && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Numéro de téléphone MTN Mobile Money
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={country.phonePlaceholder}
                  className={`w-full h-11 rounded-lg border px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 ${
                    networkMismatch
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-allness-orange focus:ring-allness-orange'
                  }`}
                />
                {networkMismatch && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Ce numéro semble être Orange. Veuillez sélectionner Orange Money ou entrer un numéro MTN.
                  </p>
                )}
                {!networkMismatch && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Numéro associé à votre compte MTN MoMo ({country.dialCode})
                  </p>
                )}
              </div>
            )}

            {method === 'orange_money' && (
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Numéro de téléphone Orange Money
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={country.phonePlaceholder}
                  className={`w-full h-11 rounded-lg border px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 ${
                    networkMismatch
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-allness-orange focus:ring-allness-orange'
                  }`}
                />
                {networkMismatch && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Ce numéro semble être MTN. Veuillez sélectionner MTN MoMo ou entrer un numéro Orange.
                  </p>
                )}
                {!networkMismatch && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Numéro associé à votre compte Orange Money ({country.dialCode})
                  </p>
                )}
              </div>
            )}

            {method === 'card' && wallet && (
              <div>
                <StripeProvider>
                  <CardPaymentFormInner
                    walletNumber={wallet.walletNumber}
                    amount={effectiveAmount}
                    currency={tontineCurrency}
                    tontineName={tontine?.name ?? 'Tontine'}
                    tontineId={id ?? ''}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ['tontine', id] });
                      queryClient.invalidateQueries({ queryKey: ['tontines'] });
                      queryClient.invalidateQueries({ queryKey: ['wallet-primary'] });
                      queryClient.invalidateQueries({ queryKey: ['wallets'] });
                      queryClient.invalidateQueries({ queryKey: ['transactions', wallet?.id] });
                      queryClient.invalidateQueries({ queryKey: ['tontine-contributions', id] });
                      queryClient.invalidateQueries({ queryKey: ['contribution-status', id] });
                      setSuccess(true);
                    }}
                    onError={() => {}}
                    onSubmitting={() => {}}
                  />
                </StripeProvider>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 p-3 text-xs text-orange-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                {method === 'wallet' && (
                  <p>
                    Solde disponible Portefeuille :{' '}
                    <span className="font-semibold">
                      {new Intl.NumberFormat('fr-FR').format(walletBalance)} {walletDisplayCurrency}
                    </span>
                  </p>
                )}
                {(method === 'mobile_money' || method === 'orange_money') && hasDifferentCurrencies && exchangeRate && (
                  <div>
                    <p className="font-medium text-orange-800">Taux de change appliqué</p>
                    <p className="mt-1">
                      1 {displayCurrency} = {new Intl.NumberFormat('fr-FR').format(1 / Number(exchangeRate.rate))} {walletDisplayCurrency}
                    </p>
                    <p className="mt-1 text-[11px] text-orange-600">
                      Vous devrez payer{' '}
                      <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR').format(walletAmountNeeded)} {walletDisplayCurrency}
                      </span>{' '}
                      via Mobile Money pour une cotisation de{' '}
                      <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR').format(Number(effectiveAmount))} {displayCurrency}
                      </span>
                    </p>
                  </div>
                )}
                {(method === 'mobile_money' || method === 'orange_money') && hasDifferentCurrencies && !exchangeRate && (
                  <p className="text-[11px] text-orange-500">
                    Aucun taux de change disponible pour {displayCurrency} → {walletDisplayCurrency}
                  </p>
                )}
                {method === 'wallet' && hasDifferentCurrencies && exchangeRate && (
                  <div className="mt-2 pt-2 border-t border-orange-200/60">
                    <p className="font-medium text-orange-800">Taux de change appliqué</p>
                    <p className="mt-1">
                      1 {walletDisplayCurrency} = {exchangeRate.rate} {displayCurrency}
                    </p>
                    <p className="mt-1 text-[11px] text-orange-600">
                      Vous paierez{' '}
                      <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR').format(walletAmountNeeded)} {walletDisplayCurrency}
                      </span>{' '}
                      pour une cotisation de{' '}
                      <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR').format(Number(effectiveAmount))} {displayCurrency}
                      </span>
                    </p>
                  </div>
                )}
                {method === 'wallet' && hasDifferentCurrencies && !exchangeRate && (
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

            {method !== 'card' && (
              <button
                onClick={handleConfirm}
                disabled={!isFormValid || contributionMutation.isPending || insufficientBalance || (method === 'wallet' && !wallet) || (needsExternalInfo && !hasExternalInfo)}
                className="w-full h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:bg-green-200"
              >
                {contributionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {contributionMutation.isPending ? 'Versement en cours...' : 'Confirmer le versement'}
                </span>
              </button>
            )}
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
