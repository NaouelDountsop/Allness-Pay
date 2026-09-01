import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import type { UserProfile } from '@afrilinkpay/shared';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { StepIndicator } from '@/components/user_dashboard/send/step-indicator';
import { BeneficiaryAmountForm } from '@/components/user_dashboard/send/beneficiary-amount-form';
import { ReviewStep } from '@/components/user_dashboard/send/review-step';
import { PinSetupModal } from '@/components/user_dashboard/send/pin-setup-modal';
import { PinConfirmModal } from '@/components/user_dashboard/send/pin-confirm-modal';
import { usePin } from '@/hooks/use-pin';
import { usePreferences } from '@/hooks/use-preferences';
import { userService } from '@/lib/api/user.service';
import { walletService } from '@/lib/api/wallet.service';
import { currencyService } from '@/lib/api/currency.service';
import { transactionService } from '@/lib/api/transaction.service';
import { getCountryByCode } from '@/data/countries';

const getSteps = (t: (key: string) => string) => [
  { label: t('send.stepBeneficiary') },
  { label: t('send.stepAmount') },
  { label: t('send.stepConfirmation') },
  { label: t('send.stepReview') },
  { label: t('send.stepSending') },
];

const NETWORK_TO_MODE: Record<string, string> = {
  mtn_momo: 'mtn',
  MTN_MOMO: 'mtn',
  orange_money: 'orange',
  ORANGE_MONEY: 'orange',
  wave: 'wallet',
  WAVE: 'wallet',
};

export default function SendMoneyPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const steps = useMemo(() => getSteps(t), [t]);
  const { theme } = usePreferences();

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.list,
  });

  const primaryWallet = wallets.find((w) => w.isPrimary) ?? wallets[0] ?? null;

  const { hasPin, createPin, checkPinStatus } = usePin(primaryWallet?.id ?? null);

  useEffect(() => {
    checkPinStatus();
  }, [checkPinStatus]);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const [form, setForm] = useState({
    beneficiaryContact: '',
    senderCountry: '',
    country: 'CM',
    amount: '',
    receptionMode: 'wallet' as string,
  });

  const senderCurrency = primaryWallet?.currency ?? 'XAF';

  const destCountry = useMemo(() => getCountryByCode(form.country), [form.country]);
  const destCountryName = destCountry?.name ?? t('send.abroad');

  const [completedSteps, setCompletedSteps] = useState([false, false, false, false, false]);
  const [phase, setPhase] = useState<'form' | 'review' | 'success'>('form');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'toReview' | 'toSend' | null>(null);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [preValidationError, setPreValidationError] = useState<string | null>(null);
  const [beneficiaryInfo, setBeneficiaryInfo] = useState<{ ownerName?: string; currency?: string } | null>(null);

  const receiverCurrency = useMemo(() => {
    if (form.receptionMode === 'wallet' && beneficiaryInfo?.currency) {
      return beneficiaryInfo.currency;
    }
    const COUNTRY_TO_CURRENCY: Record<string, string> = {
      CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
      SN: 'XOF', CI: 'XOF', NE: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF',
      CA: 'CAD',
      FR: 'EUR', BE: 'EUR', CH: 'EUR', DE: 'EUR',
    };
    return COUNTRY_TO_CURRENCY[form.country] ?? 'XAF';
  }, [form.country, form.receptionMode, beneficiaryInfo?.currency]);

  const hasBeneficiary = !!form.beneficiaryContact;
  const { data: exchangeRate, isLoading: exchangeRateLoading } = useQuery({
    queryKey: ['exchange-rate', senderCurrency, receiverCurrency],
    queryFn: () => currencyService.getExchangeRate(senderCurrency, receiverCurrency),
    enabled: hasBeneficiary && senderCurrency !== receiverCurrency,
  });

  const senderInfo = profile
    ? {
        fullName: `${profile.prenom} ${profile.nom}`,
        city: profile.ville,
        country: profile.pays,
        currency: senderCurrency,
        walletId: primaryWallet?.walletNumber,
      }
    : undefined;

  const [walletValidationError, setWalletValidationError] = useState<string | null>(null);

  // Set sender country from profile
  useEffect(() => {
    if (profile?.pays && !form.senderCountry) {
      setForm((prev) => ({ ...prev, senderCountry: profile.pays }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.pays]);

  // Fetch beneficiary info when wallet number changes in wallet mode
  useEffect(() => {
    if (form.receptionMode !== 'wallet' || !form.beneficiaryContact) {
      setBeneficiaryInfo(null);
      setWalletValidationError(null);
      return;
    }

    const fetchBeneficiary = async () => {
      try {
        const validation = await walletService.validateByNumber(form.beneficiaryContact);
        if (validation.valid) {
          setBeneficiaryInfo({ ownerName: validation.ownerName, currency: validation.currency });
          setWalletValidationError(null);
          if (validation.ownerName) {
            setBeneficiaryName(validation.ownerName);
          }
        } else {
          setBeneficiaryInfo(null);
          setWalletValidationError(validation.message ?? null);
        }
      } catch {
        setBeneficiaryInfo(null);
        setWalletValidationError(null);
      }
    };

    const timeoutId = setTimeout(fetchBeneficiary, 500);
    return () => clearTimeout(timeoutId);
  }, [form.receptionMode, form.beneficiaryContact]);

  // Pre-fill from URL params
  useEffect(() => {
    const name = searchParams.get('name') ?? '';
    const phone = searchParams.get('phone') ?? '';
    const walletNumber = searchParams.get('walletNumber') ?? '';
    const country = searchParams.get('country') ?? 'CM';
    const network = searchParams.get('network') ?? '';

    if (name || phone || walletNumber) {
      setBeneficiaryName(name);
      setForm((prev) => ({
        ...prev,
        beneficiaryContact: walletNumber || phone,
        country,
        receptionMode: walletNumber ? 'wallet' : (NETWORK_TO_MODE[network] ?? 'wallet'),
      }));
      setCompletedSteps((s) => {
        const updated = [...s];
        updated[0] = !!(walletNumber || phone);
        return updated;
      });
    }
  }, [searchParams]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      setCompletedSteps((s) => {
        const updated = [...s];
        updated[0] = !!next.beneficiaryContact;
        updated[1] = parseFloat(next.amount) > 0;
        return updated;
      });

      return next;
    });
  };

  const amountNum = parseFloat(form.amount) || 0;
  const fees = amountNum * 0.01;
  const totalDebit = amountNum + fees;
  const walletBalance = Number(primaryWallet?.balance) || 0;
  const isInsufficientBalance = amountNum > 0 && walletBalance < totalDebit;

  const handleFormSubmit = () => {
    setPreValidationError(null);

    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPreValidationError(t('send.amountGreaterThanZero'));
      return;
    }

    const fees = amountNum * 0.01;
    const totalDebit = amountNum + fees;
    const walletBalance = Number(primaryWallet?.balance) || 0;

    if (walletBalance < totalDebit) {
      setPreValidationError(
        t('send.insufficientBalance', {
          balance: new Intl.NumberFormat('fr-FR').format(walletBalance),
          currency: primaryWallet?.currency ?? 'XAF',
          total: new Intl.NumberFormat('fr-FR').format(totalDebit),
        }),
      );
      return;
    }

    setCompletedSteps((prev) => {
      const updated = [...prev];
      updated[2] = true;
      return updated;
    });
    setPhase('review');
  };

  const handleSendClick = async () => {
    setPreValidationError(null);

    if (!primaryWallet?.id || !form.beneficiaryContact || !form.amount) {
      setPreValidationError(t('send.walletOrBeneficiaryNotConfigured'));
      return;
    }

    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPreValidationError(t('send.amountGreaterThanZero'));
      return;
    }

    const fees = amountNum * 0.01;
    const totalDebit = amountNum + fees;
    const walletBalance = Number(primaryWallet.balance) || 0;

    if (walletBalance < totalDebit) {
      setPreValidationError(
        t('send.insufficientBalance', {
          balance: new Intl.NumberFormat('fr-FR').format(walletBalance),
          currency: primaryWallet.currency ?? 'XAF',
          total: new Intl.NumberFormat('fr-FR').format(totalDebit),
        }),
      );
      return;
    }

    if (form.receptionMode === 'wallet') {
      try {
        const validation = await walletService.validateByNumber(form.beneficiaryContact);
        if (!validation.valid) {
          setPreValidationError(validation.message ?? t('send.invalidBeneficiaryWallet'));
          return;
        }
      } catch {
        setPreValidationError(t('send.cannotVerifyBeneficiary'));
        return;
      }
    }

    setPendingAction('toSend');
    if (!hasPin) {
      setShowPinSetup(true);
    } else {
      setShowPinConfirm(true);
    }
  };

  const handlePinConfirm = async (pin: string): Promise<string | null> => {
    if (!primaryWallet?.id || !form.beneficiaryContact || !form.amount) {
      return t('send.walletOrBeneficiaryNotConfigured');
    }

    try {
      const isMobileMoney = form.receptionMode === 'mtn' || form.receptionMode === 'orange';

      if (isMobileMoney) {
        const phoneDigits = form.beneficiaryContact.replace(/\D/g, '');
        const phoneWithPrefix = phoneDigits.length === 9 ? `237${phoneDigits}` : phoneDigits;

        await transactionService.campayWithdraw({
          walletNumber: primaryWallet.walletNumber,
          amount: form.amount,
          phone_number: phoneWithPrefix,
          description: `Retrait via ${form.receptionMode === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}`,
        });
      } else {
        await transactionService.createTransfer(primaryWallet.id, {
          toWalletId: form.beneficiaryContact,
          amount: form.amount,
          description: form.receptionMode === 'wallet' ? 'Transfert' : undefined,
          pin,
        });
      }

      setShowPinConfirm(false);
      setCompletedSteps((prev) => {
        const updated = [...prev];
        updated[2] = true;
        if (pendingAction === 'toSend') updated[3] = true;
        if (pendingAction === 'toSend') updated[4] = true;
        return updated;
      });
      setPhase('success');
      return null;
    } catch (err: unknown) {
      const axiosData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const msg = axiosData?.message;
      if (typeof msg === 'string' && msg.length > 0) return msg;
      if (Array.isArray(msg) && msg.length > 0) return msg[0];
      return t('send.errorOccurred');
    }
  };

  const handlePinSetupComplete = async (pin: string) => {
    await createPin(pin);
    setShowPinSetup(false);
    setShowPinConfirm(true);
  };

  const currentStepIndex =
    phase === 'form' ? (completedSteps[1] ? 1 : 0) : phase === 'review' ? 3 : 4;

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <h1 className="text-2xl sm:text-2xl md:text-2xl font-bold text-allness-dark mb-2 sm:mb-3 leading-tight">
          {t('send.transferTo')} {destCountryName}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-5 sm:mb-8">
          {t('send.verifyDetails')}
        </p>

        <div
          className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6 bg-allness-dark"
          style={{
            boxShadow: '0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)',
          }}
        >
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <StepIndicator
              steps={steps}
              currentStep={currentStepIndex}
              completedSteps={completedSteps}
            />
          </div>
        </div>

        <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <span
                className="inline-block h-2 w-2 rounded-full bg-allness-orange"
              />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-400">
                {steps[currentStepIndex]?.label}
              </span>
            </div>

            {phase === 'form' && (
              <>
                {preValidationError && (
                  <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
                    <span className="text-red-500 text-lg shrink-0">⚠</span>
                    <div>
                      <p className="text-sm font-medium text-red-800">{preValidationError}</p>
                      <button
                        onClick={() => setPreValidationError(null)}
                        className="text-xs text-red-600 mt-1 hover:underline"
                      >
                        {t('send.retry')}
                      </button>
                    </div>
                  </div>
                )}
                {primaryWallet && (
                  <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-700 mb-3">{t('send.senderWallet')}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-allness-green/10 flex items-center justify-center overflow-hidden">
                        <img src={theme === 'dark' ? '/allnesspay_logo1.png' : '/allnesspay_logo2.png'} alt="AllnessPay" className="w-7 h-7 object-contain" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-allness-dark">
                          {primaryWallet.label ?? primaryWallet.walletNumber}
                        </p>
                                             </div>
                    </div>
                  </div>
                )}
                {form.receptionMode === 'wallet' && form.beneficiaryContact && beneficiaryInfo && (
                  <div className="mb-6 p-4 rounded-xl border border-allness-green/20 bg-allness-green/5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{t('Beneficiaire')}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-allness-green/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-allness-green">
                          {beneficiaryInfo.ownerName?.charAt(0) ?? '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-allness-dark">
                          {beneficiaryInfo.ownerName ?? t('send.unknownUser')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {form.beneficiaryContact} · {beneficiaryInfo.currency ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <BeneficiaryAmountForm
                  form={form}
                  onChange={handleChange}
                  onSubmit={handleFormSubmit}
                  sender={senderInfo}
                  exchangeRate={exchangeRate?.rate != null ? Number(exchangeRate.rate) : null}
                  exchangeRateLoading={exchangeRateLoading}
                  disabled={isInsufficientBalance}
                  insufficientBalance={isInsufficientBalance ? `${t('send.balance')}: ${new Intl.NumberFormat('fr-FR').format(walletBalance)} ${primaryWallet?.currency ?? 'XAF'}` : undefined}
                  walletError={walletValidationError ?? undefined}
                  beneficiaryCurrency={beneficiaryInfo?.currency}
                />
              </>
            )}

            {phase === 'review' && (
              <>
                {preValidationError && (
                  <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
                    <span className="text-red-500 text-lg shrink-0">⚠</span>
                    <div>
                      <p className="text-sm font-medium text-red-800">{preValidationError}</p>
                      <button
                        onClick={() => setPreValidationError(null)}
                        className="text-xs text-red-600 mt-1 hover:underline"
                      >
                        {t('send.retry')}
                      </button>
                    </div>
                  </div>
                )}
                <ReviewStep
                  beneficiaryContact={form.beneficiaryContact}
                  senderCountryCode={form.senderCountry}
                  countryCode={form.country}
                  receptionMode={form.receptionMode}
                  amount={parseFloat(form.amount) || 0}
                  exchangeRate={exchangeRate?.rate != null ? Number(exchangeRate.rate) : null}
                  onSend={handleSendClick}
                  onBack={() => setPhase('form')}
                  sender={senderInfo}
                  beneficiaryName={beneficiaryName}
                  beneficiaryCurrency={beneficiaryInfo?.currency}
                />
              </>
            )}

            {phase === 'success' && (
              <div className="text-center py-8 sm:py-10 px-2">
                <img
                  src="/thank you.svg"
                  alt={t('send.thankYou')}
                  className="mx-auto mb-4 h-56 w-auto"
                />
                <h2 className="text-base sm:text-lg font-bold text-allness-green mb-2">
                  {t('send.transferSentSuccess')}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  {t('send.beneficiaryReceivesInMinutes')}
                </p>
                <button
                  onClick={() => {
                    setPhase('form');
                    setForm({ beneficiaryContact: '', senderCountry: form.senderCountry, country: 'CM', amount: '', receptionMode: 'wallet' });
                    setCompletedSteps([false, false, false, false, false]);
                    setBeneficiaryName('');
                    setShowPinSetup(false);
                    setShowPinConfirm(false);
                    setPendingAction(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-allness-dark hover:bg-allness-darker transition-colors"
                >
                  {t('send.newTransfer')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPinSetup && (
        <PinSetupModal onComplete={handlePinSetupComplete} onClose={() => setShowPinSetup(false)} />
      )}

      {showPinConfirm && (
        <PinConfirmModal
          walletId={primaryWallet?.id ?? ''}
          onConfirm={handlePinConfirm}
          onClose={() => setShowPinConfirm(false)}
        />
      )}
    </DashboardLayout>
  );
}
