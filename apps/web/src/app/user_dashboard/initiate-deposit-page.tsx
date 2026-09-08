import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Phone, CreditCard, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import {
  type Currency,
  CURRENCY_SYMBOLS,
  useDepositFlow,
} from '../../context/deposit-flow-context';
import { walletService } from '@/lib/api/wallet.service';
import { useUserProfile } from '@/hooks/use-user-profile';
import { getCountryCode } from '@/utils/country-currency';
import { getAvailableDepositMethods, getAvailableMobileOperators } from '@/utils/payment-methods';

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000];
const MIN_DEPOSIT_AMOUNT = 10;

function isValidPhoneForOperator(phone: string, operator: string): boolean {
  const digits = phone.replace(/\s/g, '');
  if (digits.length !== 9 || !/^\d{9}$/.test(digits)) return false;

  const prefix = digits.substring(0, 3);

  if (operator === 'mtn') {
    return ['650', '651', '652', '653', '654', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683'].includes(prefix);
  }
  if (operator === 'orange') {
    return ['640', '655', '656', '657', '658', '659', '686', '687', '688', '689', '690', '691', '692', '693', '694', '695', '696', '697', '698', '699'].includes(prefix);
  }
  return false;
}

function getPhoneHint(operator: string, t: (key: string) => string): string {
  if (operator === 'mtn') return t('deposit.phoneHint.mtn');
  if (operator === 'orange') return t('deposit.phoneHint.orange');
  return t('deposit.phoneHint.default');
}

export default function InitiateDepositPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const {
    deposit,
    setMethod,
    setOperator,
    setPhoneNumber,
    setAmount,
    setCurrency,
    setDescription,
    setWalletNumber,
    submitDepositRequest,
  } = useDepositFlow();

  const countryCode = getCountryCode(profile?.pays ?? 'CM');
  const depositMethods = getAvailableDepositMethods(countryCode);
  const mobileOperators = getAvailableMobileOperators(countryCode);

  const DEPOSIT_METHOD_ICONS: Record<string, React.ReactNode> = {
    mobile_money: <Phone className="w-5 h-5" />,
    card: <CreditCard className="w-5 h-5" />,
  };

  const [submitting, setSubmitting] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const mmAvailable = mobileOperators.length > 0;
  const [selectedMethod, setSelectedMethod] = useState<'mobile_money' | 'card'>(mmAvailable ? 'mobile_money' : 'card');

  const isMobileMoney = selectedMethod === 'mobile_money';

  useEffect(() => {
    walletService.getPrimary().then((w) => {
      if (w?.walletNumber) setWalletNumber(w.walletNumber);
      if (w?.currency) setCurrency(w.currency as Currency);
    });
  }, [setWalletNumber, setCurrency]);

  useEffect(() => {
    if (!mmAvailable && selectedMethod === 'mobile_money') {
      setSelectedMethod('card');
    }
  }, [mmAvailable, selectedMethod]);

  useEffect(() => {
    const firstOp = mobileOperators[0];
    if (isMobileMoney && firstOp && !deposit.operator) {
      setOperator(firstOp.key);
    }
  }, [isMobileMoney, mobileOperators, deposit.operator, setOperator]);

  const phoneDigits = deposit.phoneNumber.replace(/\s/g, '');
  const phoneValid =
    phoneDigits.length === 9 && /^\d{9}$/.test(phoneDigits)
      ? isValidPhoneForOperator(deposit.phoneNumber, deposit.operator)
      : false;
  const phoneTouched = deposit.phoneNumber.trim().length > 0;

  const amountValue = Number(deposit.amount);
  const canSubmit = isMobileMoney
    ? deposit.operator && phoneValid && amountValue >= MIN_DEPOSIT_AMOUNT
    : amountValue > 0;

  const currencySymbol = CURRENCY_SYMBOLS[deposit.currency] || deposit.currency;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    if (!isMobileMoney) {
      setMethod('bank');
      navigate('/deposit/card/redirect', {
        state: { amount: deposit.amount, description: deposit.description, currency: deposit.currency, walletNumber: deposit.walletNumber },
      });
      setSubmitting(false);
      return;
    }

    setMethod('mobile_money');
    const success = await submitDepositRequest();
    setSubmitting(false);
    if (success) {
      navigate('/deposit/processing');
    }
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-allness-orange/10 dark:bg-allness-orange/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-allness-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark dark:text-white">{t('deposit.pageTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 ml-[52px]">
          {t('deposit.pageDescription')}
        </p>

        {deposit.error && !errorDismissed && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/20 dark:border-red-800/50 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-800/40 flex items-center justify-center shrink-0">
              <span className="text-red-500 text-lg">!</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-0.5">
                {t('deposit.errorTitle')}
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-300/70 leading-relaxed">
                {deposit.error}
              </p>
              <button
                onClick={() => setErrorDismissed(true)}
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors"
              >
                {t('deposit.dismiss')}
                <span className="text-[10px]">→</span>
              </button>
            </div>
          </div>
        )}

        <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-allness-dark">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <span className="inline-block h-2 w-2 rounded-full bg-allness-orange" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {t('deposit.method')}
              </span>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3">
                {depositMethods.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMethod(m.key)}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === m.key
                        ? 'border-allness-green bg-allness-green/5 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedMethod === m.key
                          ? 'bg-allness-green/10 text-allness-green'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {DEPOSIT_METHOD_ICONS[m.key]}
                    </div>
                    <span className="text-sm font-medium text-allness-dark dark:text-white">{t(m.labelKey)}</span>
                    {selectedMethod === m.key && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-allness-green" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {isMobileMoney ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {t('deposit.operator')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {mobileOperators.map((op) => (
                      <button
                        key={op.key}
                        onClick={() => setOperator(op.key)}
                        className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          deposit.operator === op.key
                            ? 'border-allness-green bg-allness-green/5 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <img src={op.image} alt={op.label} className="w-7 h-7 object-contain" />
                        <span className="text-sm font-medium text-allness-dark dark:text-white">{op.label}</span>
                        {deposit.operator === op.key && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-allness-green" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {t('deposit.phoneNumber')}
                  </label>
                  <div
                    className={`flex items-center h-12 rounded-lg border overflow-hidden transition-all ${
                      phoneTouched && !phoneValid
                        ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200'
                        : phoneTouched && phoneValid
                          ? 'border-allness-green focus-within:ring-2 focus-within:ring-green-200'
                          : 'border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-allness-orange/30 focus-within:border-allness-orange'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 px-3.5 h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">
                      🇨🇲 +237
                    </span>
                    <Phone className="w-4 h-4 text-gray-300 ml-3 shrink-0" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={deposit.phoneNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '');
                        if (digitsOnly.length > 9) return;
                        setPhoneNumber(digitsOnly);
                      }}
                      placeholder={deposit.operator === 'mtn' ? '670000000' : '690000000'}
                      maxLength={9}
                      className="flex-1 h-full px-2.5 text-sm text-allness-dark dark:text-white focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange tracking-widest"
                    />
                    {phoneTouched && (
                      <div className="pr-3 shrink-0">
                        {phoneValid ? (
                          <span className="text-allness-green text-xs font-medium">✓ Valide</span>
                        ) : phoneDigits.length === 9 ? (
                          <span className="text-red-500 text-xs font-medium">✗ Invalide</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-[11px] mt-1.5 ml-1 ${
                      phoneTouched && !phoneValid ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {phoneTouched && !phoneValid
                      ? phoneDigits.length < 9
                        ? `Entrez 9 chiffres (${phoneDigits.length}/9)`
                        : t('deposit.phoneError')
                      : getPhoneHint(deposit.operator, t)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      {t('deposit.cardNoticeTitle')}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      {t('deposit.cardNoticeDescription')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t('deposit.amountLabel')}
              </label>
              <div className="flex items-center h-12 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-3 focus-within:ring-2 focus-within:ring-allness-orange/30 focus-within:border-allness-orange transition-all">
                <input
                  type="number"
                  value={deposit.amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('deposit.amountPlaceholder')}
                  className="flex-1 h-full px-4 text-base font-semibold text-allness-dark dark:text-white focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange bg-white dark:bg-gray-800"
                />
                <span className="h-full px-3 text-xs font-medium text-gray-500 border-l border-gray-200 bg-gray-50 flex items-center shrink-0">
                  {currencySymbol}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(String(amt))}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                      Number(deposit.amount) === amt
                        ? 'bg-allness-orange text-white border-allness-orange'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {new Intl.NumberFormat('fr-FR').format(amt)} {currencySymbol}
                  </button>
                ))}
              </div>
              {isMobileMoney && amountValue > 0 && amountValue < MIN_DEPOSIT_AMOUNT && (
                <p className="text-[11px] text-red-500 mt-1.5 ml-1">
                  {t('deposit.minimumAmount', { min: MIN_DEPOSIT_AMOUNT, currency: currencySymbol })}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t('deposit.description')} <span className="text-gray-400 dark:text-gray-500 font-normal">{t('deposit.descriptionOptional')}</span>
              </label>
              <input
                type="text"
                value={deposit.description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('deposit.descriptionPlaceholder')}
                className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-allness-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-allness-orange/30 focus:border-allness-orange transition-all bg-white dark:bg-gray-800"
              />
            </div>

            {((isMobileMoney && deposit.operator && Number(deposit.amount) > 0) ||
              (!isMobileMoney && Number(deposit.amount) > 0)) && (
              <div className="rounded-2xl bg-allness-dark dark:bg-gray-800 text-white px-5 py-4 mb-6">
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wide mb-2">
                  {t('deposit.summary')}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{t('deposit.summaryAmount')}</span>
                  <span className="font-bold text-allness-orange">
                    {new Intl.NumberFormat('fr-FR').format(Number(deposit.amount))}{' '}
                    {currencySymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1.5">
                  <span className="text-white/60">{t('deposit.summaryMethod')}</span>
                  <span className="font-medium text-white">
                    {isMobileMoney
                      ? mobileOperators.find((o) => o.key === deposit.operator)?.label
                      : t('deposit.bankCard')}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full h-14 rounded-2xl bg-allness-green hover:bg-allness-greenHover text-white text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('deposit.submitting')}
                </>
              ) : (
                <>
                  {isMobileMoney ? t('deposit.submit') : t('deposit.confirmByCard')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
