import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Phone, ShieldCheck, Landmark, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { AlertBanner } from '@/components/common/alert-banner';
import {
  type DepositMethod,
  type Currency,
  CURRENCY_SYMBOLS,
  useDepositFlow,
} from '../../context/deposit-flow-context';
import { useUserProfile } from '../../hooks/use-user-profile';
import { walletService } from '@/lib/api/wallet.service';
import { getCurrenciesForCountry } from '../../utils/country-currency';

const DEPOSIT_METHODS: { key: DepositMethod; labelKey: string; icon: React.ReactNode }[] = [
  { key: 'mobile_money', labelKey: 'deposit.mobileMoney', icon: <Phone className="w-5 h-5" /> },
  { key: 'bank', labelKey: 'deposit.bankAccount', icon: <Landmark className="w-5 h-5" /> },
];

const MOBILE_OPERATORS = [
  { key: 'mtn' as const, label: 'MTN Mobile Money', image: '/mtn-momo.png' },
  { key: 'orange' as const, label: 'Orange Money', image: '/orange-money.png' },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000];

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
    setBankName,
    setIban,
    setAccountHolder,
    setAmount,
    setCurrency,
    setDescription,
    setWalletNumber,
    submitDepositRequest,
  } = useDepositFlow();

  const [submitting, setSubmitting] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  useEffect(() => {
    walletService.getPrimary().then((w) => {
      if (w?.walletNumber) setWalletNumber(w.walletNumber);
    });
  }, [setWalletNumber]);

  const isMobileMoney = deposit.method === 'mobile_money';
  const phoneValid =
    deposit.phoneNumber.trim().length >= 9
      ? isValidPhoneForOperator(deposit.phoneNumber, deposit.operator)
      : false;
  const phoneTouched = deposit.phoneNumber.trim().length > 0;

  const canSubmit = isMobileMoney
    ? deposit.operator && phoneValid && Number(deposit.amount) > 0
    : deposit.bankName &&
      deposit.iban.trim().length >= 8 &&
      deposit.accountHolder.trim().length >= 2 &&
      Number(deposit.amount) > 0;

  const countryCode = profile?.pays || 'CM';
  const currencies = getCurrenciesForCountry(countryCode);
  const currencySymbol = CURRENCY_SYMBOLS[deposit.currency];

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
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
        {/* Header de page */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-afrilink-orange/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-afrilink-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark">{t('deposit.pageTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {t('deposit.pageDescription')}
        </p>

        {/* Banner d'erreur en haut */}
        {deposit.error && !errorDismissed && (
          <AlertBanner
            variant="error"
            title={t('deposit.errorTitle')}
            message={deposit.error}
            onDismiss={() => setErrorDismissed(true)}
          />
        )}

        {/* Encart sécurité */}
        <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 p-4 mb-6">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-afrilink-green" />
          </div>
          <p className="text-xs text-green-700 leading-relaxed">
            {t('deposit.securityNotice')}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8">
          {/* Sélecteur de méthode de dépôt */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t('deposit.method')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DEPOSIT_METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`relative flex items-center gap-2.5 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                    deposit.method === m.key
                      ? 'border-afrilink-green bg-green-50/50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      deposit.method === m.key
                        ? 'bg-afrilink-green/10 text-afrilink-green'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {m.icon}
                  </div>
                  <span className="text-xs font-semibold text-afrilink-dark">{t(m.labelKey)}</span>
                  {deposit.method === m.key && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-afrilink-green" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {/* Colonne gauche : Formulaire selon la méthode */}
            <div className="space-y-6">
              {isMobileMoney ? (
                <>
                  {/* Section Opérateur */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {t('deposit.operator')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {MOBILE_OPERATORS.map((op) => (
                        <button
                          key={op.key}
                          onClick={() => setOperator(op.key)}
                          className={`relative flex items-center gap-2.5 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                            deposit.operator === op.key
                              ? 'border-afrilink-green bg-green-50/50 shadow-sm'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <img src={op.image} alt={op.label} className="w-7 h-7 object-contain" />
                          <span className="text-xs font-semibold text-afrilink-dark">
                            {op.label}
                          </span>
                          {deposit.operator === op.key && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-afrilink-green" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Numéro de téléphone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {t('deposit.phoneNumber')}
                    </label>
                    <div
                      className={`flex items-center h-12 rounded-lg border overflow-hidden transition-all ${
                        phoneTouched && !phoneValid
                          ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200'
                          : 'border-gray-200 focus-within:ring-2 focus-within:ring-afrilink-orange/30 focus-within:border-afrilink-orange'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 px-3.5 h-full bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-600 shrink-0">
                        🇨🇲 +237
                      </span>
                      <Phone className="w-4 h-4 text-gray-300 ml-3 shrink-0" />
                      <input
                        type="tel"
                        value={deposit.phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={deposit.operator === 'mtn' ? '670 00 00 00' : '690 00 00 00'}
                        className="flex-1 h-full px-2.5 text-sm text-afrilink-dark focus:outline-none"
                      />
                    </div>
                    <p
                      className={`text-[11px] mt-1.5 ml-1 ${
                        phoneTouched && !phoneValid ? 'text-red-500' : 'text-gray-400'
                      }`}
                    >
                      {phoneTouched && !phoneValid
                        ? t('deposit.phoneError')
                        : getPhoneHint(deposit.operator, t)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Banque */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {t('deposit.bank')}
                    </label>
                    <select
                      value={deposit.bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-2 focus:ring-afrilink-orange/30 focus:border-afrilink-orange transition-all bg-white"
                    >
                      <option value="">{t('deposit.selectBank')}</option>
                      <option value="sgbc">SGBC (Société Générale Cameroun)</option>
                      <option value="uba">UBA Cameroun</option>
                      <option value="afriland">Afriland First Bank</option>
                      <option value="beac">BEAC</option>
                      <option value="ecobank">Ecobank Cameroun</option>
                      <option value="bicec">BICEC</option>
                      <option value="btc">BTCI (Banque Camerounaise des Travailleurs)</option>
                      <option value="autres">Autres</option>
                    </select>
                  </div>

                  {/* IBAN / Numéro de compte */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {t('deposit.iban')}
                    </label>
                    <input
                      type="text"
                      value={deposit.iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder={t('deposit.ibanPlaceholder')}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-2 focus:ring-afrilink-orange/30 focus:border-afrilink-orange transition-all uppercase"
                    />
                  </div>

                  {/* Titulaire du compte */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {t('deposit.accountHolder')}
                    </label>
                    <input
                      type="text"
                      value={deposit.accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder={t('deposit.accountHolderPlaceholder')}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-2 focus:ring-afrilink-orange/30 focus:border-afrilink-orange transition-all"
                    />
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('deposit.description')} <span className="text-gray-400 font-normal">{t('deposit.descriptionOptional')}</span>
                </label>
                <input
                  type="text"
                  value={deposit.description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('deposit.descriptionPlaceholder')}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-2 focus:ring-afrilink-orange/30 focus:border-afrilink-orange transition-all"
                />
              </div>
            </div>

            {/* Colonne droite : Montant + Récapitulatif + CTA */}
            <div className="space-y-6">
              {/* Montant */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('deposit.amountLabel')}
                </label>
                <div className="flex items-center h-12 rounded-lg border border-gray-200 overflow-hidden mb-3 focus-within:ring-2 focus-within:ring-afrilink-orange/30 focus-within:border-afrilink-orange transition-all">
                  <input
                    type="number"
                    value={deposit.amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t('deposit.amountPlaceholder')}
                    className="flex-1 h-full px-4 text-base font-semibold text-afrilink-dark focus:outline-none"
                  />
                  <select
                    value={deposit.currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="h-full px-2 text-xs font-medium text-gray-500 border-l border-gray-200 bg-gray-50 focus:outline-none cursor-pointer"
                  >
                    {currencies.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(String(amt))}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                        Number(deposit.amount) === amt
                          ? 'bg-afrilink-orange text-white border-afrilink-orange'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {new Intl.NumberFormat('fr-FR').format(amt)} {currencySymbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Récapitulatif */}
              {(isMobileMoney
                ? deposit.operator && Number(deposit.amount) > 0
                : deposit.bankName && Number(deposit.amount) > 0) && (
                <div className="rounded-xl p-4" style={{ backgroundColor: '#082B37' }}>
                  <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wide mb-2">
                    {t('deposit.summary')}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{t('deposit.summaryAmount')}</span>
                    <span className="font-bold text-white">
                      {new Intl.NumberFormat('fr-FR').format(Number(deposit.amount))}{' '}
                      {currencySymbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1.5">
                    <span className="text-white/60">{t('deposit.summaryCurrency')}</span>
                    <span className="font-medium text-white">{deposit.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1.5">
                    <span className="text-white/60">{t('deposit.summaryMethod')}</span>
                    <span className="font-medium text-white">
                      {isMobileMoney
                        ? MOBILE_OPERATORS.find((o) => o.key === deposit.operator)?.label
                        : deposit.bankName}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full h-12 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity
                  bg-afrilink-green text-white hover:opacity-90
                  disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-100"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('deposit.submitting')}
                  </>
                ) : (
                  <>
                    {t('deposit.submit')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
