import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Smartphone,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { StepIndicator } from '@/components/user_dashboard/send/step-indicator';
import { userService } from '@/lib/api/user.service';
import { walletService } from '@/lib/api/wallet.service';
import { transactionService } from '@/lib/api/transaction.service';
import { formatAmount, getCurrencySymbol } from '@/lib/utils';
import { getFlagUrl, getCountryByCode, type Country } from '@/data/countries';
import { CountrySelect } from '@/components/common/country-select';
import { PhoneInput, validatePhone } from '@/components/common/phone-input';
import { hasMobileMoney } from '@/utils/country-currency';

type DestinationType = 'mobile' | 'bank';

const BANKS_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
  CM: [
    { value: 'sgbc', label: 'SGBC (Société Générale Cameroun)' },
    { value: 'uba', label: 'UBA Cameroun' },
    { value: 'afriland', label: 'Afriland First Bank' },
    { value: 'beac', label: 'BEAC' },
    { value: 'ecobank', label: 'Ecobank Cameroun' },
    { value: 'bicec', label: 'BICEC' },
  ],
  SN: [
    { value: 'sgbao', label: 'SGBCI' },
    { value: 'uba', label: 'UBA Sénégal' },
    { value: 'bicis', label: 'BICIS' },
    { value: 'ecobank', label: 'Ecobank Sénégal' },
  ],
  CI: [
    { value: 'sgbci', label: 'SGBCI' },
    { value: 'boa', label: "BOA Côte d'Ivoire" },
    { value: 'bicici', label: 'BICICI' },
    { value: 'ecobank', label: "Ecobank Côte d'Ivoire" },
  ],
  GA: [
    { value: 'bgfi', label: 'BGFI Bank Gabon' },
    { value: 'ugb', label: 'UGB' },
    { value: 'ecobank', label: 'Ecobank Gabon' },
  ],
  CG: [
    { value: 'bgficg', label: 'BGFI Bank Congo' },
    { value: 'ecobank', label: 'Ecobank Congo' },
  ],
  FR: [
    { value: 'bnp', label: 'BNP Paribas' },
    { value: 'sg', label: 'Société Générale' },
    { value: 'ca', label: 'Crédit Agricole' },
    { value: 'lcl', label: 'LCL' },
  ],
  CA: [
    { value: 'rbc', label: 'RBC Royal Bank' },
    { value: 'td', label: 'TD Bank' },
    { value: 'bmo', label: 'BMO' },
    { value: 'scotia', label: 'Scotiabank' },
  ],
};

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  CM: 'XAF', SN: 'XAF', CI: 'XAF', GA: 'XAF', CG: 'XAF',
  NE: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF',
  FR: 'EUR', CA: 'CAD',
};

const STEPS = [
  'Informations de réception',
  'Montant et frais',
  'Confirmation',
  'Reçu',
];

export default function WithdrawPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [destinationType, setDestinationType] = useState<DestinationType>('mobile');
  const [country, setCountry] = useState('CM');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ transactionId: string; reference: string } | null>(null);

  const { data: user } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userService.getProfile,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet-primary'],
    queryFn: walletService.getPrimary,
  });

  const selectedCountry: Country = getCountryByCode(country) ?? getCountryByCode('CM')!;
  const hasMobile = hasMobileMoney(country);
  const banks = BANKS_BY_COUNTRY[country] ?? [];
  const currency = CURRENCY_BY_COUNTRY[country] ?? 'XAF';

  const amountNumber = parseFloat(amount) || 0;
  const receivedEstimate = amountNumber;

  const phoneError = destinationType === 'mobile' ? validatePhone(phoneNumber, selectedCountry) : null;

  const canSubmitStep0 = useMemo(() => {
    if (destinationType === 'mobile') {
      return phoneError === null && amountNumber > 0;
    }
    return amountNumber > 0;
  }, [destinationType, phoneError, amountNumber]);

  const canSubmitStep1 = amountNumber > 0;
  const canSubmitStep2 = canSubmitStep1 && wallet?.walletNumber;

  const stepsConfig = useMemo(() => STEPS.map((label) => ({ label })), []);
  const completedSteps = useMemo(() => STEPS.map((_, i) => i < currentStep), [currentStep]);

  const handleConfirm = async () => {
    if (!wallet?.walletNumber || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const fullPhone = selectedCountry.dialCode.replace('+', '') + phoneNumber.replace(/\D/g, '');
      const res = await transactionService.campayWithdraw({
        walletNumber: wallet.walletNumber,
        amount: amountNumber.toFixed(2),
        phone_number: fullPhone,
        description: description || `Retrait ${selectedCountry.name}`,
      });
      setResult({ transactionId: res.transactionId, reference: res.reference });
      setCurrentStep(3);
    } catch (err: unknown) {
      const axiosData = (err as { response?: { data?: { message?: unknown } } })?.response?.data;
      const msg = axiosData?.message;
      if (typeof msg === 'string') setError(msg);
      else if (Array.isArray(msg) && typeof msg[0] === 'string') setError(msg[0]);
      else setError('Une erreur est survenue lors du retrait.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => currentStep > 0 ? setCurrentStep(0) : navigate(-1)}
            className="w-10 h-10 rounded-xl bg-allness-orange/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-allness-orange" />
          </button>
          <h1 className="text-2xl sm:text-2xl md:text-2xl font-bold text-allness-dark leading-tight">
            Retrait
          </h1>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-5 sm:mb-8 ml-[52px]">
          Retirez vos fonds vers un opérateur mobile ou une carte bancaire.
        </p>

        <div
          className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6 bg-allness-dark"
          style={{
            boxShadow: '0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)',
          }}
        >
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <StepIndicator
              steps={stepsConfig}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>
        </div>

        <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <span className="inline-block h-2 w-2 rounded-full bg-allness-orange" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-400">
                {STEPS[currentStep]}
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Step 0: Informations de réception */}
            {currentStep === 0 && (
              <>
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-allness-dark mb-4 flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    Informations supplémentaires
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Expéditeur (vous)
                      </p>
                      <p className="text-sm font-medium text-allness-dark">
                        {user ? `${user.prenom} ${user.nom}` : '---'}
                      </p>
                      {/* <p className="text-xs text-gray-500 mt-1">
                        {user?.walletNumber || '---'}
                      </p> */}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Pays de réception
                      </label>
                      <CountrySelect
                        value={country}
                        onChange={(c: Country) => {
                          setCountry(c.code);
                          setPhoneNumber('');
                          const countryHasMobile = hasMobileMoney(c.code);
                          if (!countryHasMobile) setDestinationType('bank');
                          else setDestinationType('mobile');
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-allness-dark mb-1 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-allness-orange" />
                    Destination du retrait
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Choisissez où vous souhaitez retirer vos fonds
                  </p>
                  <div className={`grid gap-3 mb-4 ${hasMobile ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {hasMobile && (
                      <button
                        onClick={() => setDestinationType('mobile')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          destinationType === 'mobile'
                            ? 'border-allness-green bg-allness-green/5 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Smartphone
                          className={`w-5 h-5 ${destinationType === 'mobile' ? 'text-allness-green' : 'text-gray-400'}`}
                        />
                        <span className={`text-sm font-medium ${destinationType === 'mobile' ? 'text-allness-dark' : 'text-gray-600'}`}>
                          Opérateur mobile
                        </span>
                      </button>
                    )}
                    {banks.length > 0 && (
                      <button
                        onClick={() => setDestinationType('bank')}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          destinationType === 'bank'
                            ? 'border-allness-green bg-allness-green/5 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <CreditCard
                          className={`w-5 h-5 ${destinationType === 'bank' ? 'text-allness-green' : 'text-gray-400'}`}
                        />
                        <span className={`text-sm font-medium ${destinationType === 'bank' ? 'text-allness-dark' : 'text-gray-600'}`}>
                          Carte bancaire
                        </span>
                      </button>
                    )}
                    {!hasMobile && banks.length === 0 && (
                      <div className="col-span-2 rounded-lg bg-orange-50 border border-orange-200 p-4 text-center">
                        <p className="text-sm text-gray-600">
                          Aucune option de retrait disponible pour {selectedCountry.name}.
                        </p>
                      </div>
                    )}
                  </div>

                  {destinationType === 'mobile' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <PhoneInput
                          country={selectedCountry}
                          value={phoneNumber}
                          onChange={setPhoneNumber}
                          error={phoneError ?? undefined}
                        />
                      </div>
                    </div>
                  )}

                  {destinationType === 'bank' && (
                    <div className="space-y-4">
                      {banks.length > 0 ? (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Numéro de carte
                            </label>
                            <input
                              type="text"
                              placeholder="Numéro de carte bancaire"
                              className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange uppercase"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 text-center">
                          <p className="text-sm text-gray-600">
                            Le retrait par carte bancaire n&apos;est pas encore disponible pour {selectedCountry.name}.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
                    <Check className="w-4 h-4 text-allness-green shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      Les fonds seront transférés directement sur le compte {destinationType === 'mobile' ? 'mobile' : 'bancaire'} sélectionné.
                    </p>
                  </div> */}
                </div>

                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-allness-dark mb-4 flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    Montant et frais
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Vous retirez
                      </label>
                      <div className="flex items-center h-12 rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-allness-orange/30 focus-within:border-allness-orange transition-all">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="100 000"
                          className="flex-1 h-full px-4 text-lg font-semibold text-allness-dark focus:outline-none"
                        />
                        <span className="px-3 h-full flex items-center text-sm font-medium text-gray-500 border-l border-gray-200 bg-gray-50 shrink-0 gap-1.5">
                          <img src={getFlagUrl(country)} alt="" className="w-4 h-auto rounded-sm object-cover" />
                          {getCurrencySymbol(currency)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Frais de retrait
                      </label>
                      <div className="flex items-center h-12 px-4 rounded-lg border border-gray-200 bg-gray-50">
                        <span className="text-lg font-semibold text-allness-green">0</span>
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-allness-green/10 text-allness-green text-[10px] font-semibold">
                          (gratuit)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Description <span className="text-gray-400 normal-case">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Retrait AllnessPay"
                      maxLength={255}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-2xl bg-allness-dark text-white px-5 py-4">
                      <span className="text-sm sm:text-base font-medium text-white/80">
                        Vous recevez (estimation)
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-allness-orange">
                        {amountNumber > 0
                          ? formatAmount(receivedEstimate, currency)
                          : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                    <p>
                      Le montant reçu est une estimation. Le montant final peut varier légèrement selon l&apos;opérateur.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => canSubmitStep0 && setCurrentStep(1)}
                    disabled={!canSubmitStep0}
                    className="w-full h-14 rounded-2xl bg-allness-green hover:bg-allness-greenHover text-white text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* Step 1: Montant et frais */}
            {currentStep === 1 && (
              <>
                <div className="space-y-4 mb-6">
                  <div className="rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Vous retirez</span>
                      <span className="text-sm font-semibold">{formatAmount(amountNumber, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Frais de retrait</span>
                      <span className="text-sm font-semibold text-allness-green">0 (gratuit)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Vous recevez (estimation)</span>
                      <span className="text-sm font-semibold">
                        {amountNumber > 0 ? formatAmount(receivedEstimate, currency) : '—'}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <span className="text-sm font-semibold text-allness-dark">Total débité</span>
                      <span className="text-lg font-bold text-allness-dark">{formatAmount(amountNumber, currency)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                  <button
                    onClick={() => canSubmitStep1 && setCurrentStep(2)}
                    disabled={!canSubmitStep1}
                    className="w-full h-14 rounded-2xl bg-allness-green hover:bg-allness-greenHover text-white text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:w-auto sm:px-8"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Confirmation */}
            {currentStep === 2 && (
              <>
                <div className="space-y-4 mb-6">
                  <div className="rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Destination</span>
                      <span className="text-sm font-medium">
                        {destinationType === 'mobile' ? 'Mobile Money' : 'Carte bancaire'}
                      </span>
                    </div>
                  {destinationType === 'mobile' && hasMobile && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Téléphone</span>
                        <span className="text-sm font-medium">{selectedCountry.dialCode} {phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Pays</span>
                      <span className="text-sm font-medium flex items-center gap-2">
                        <img src={getFlagUrl(country)} alt="" className="w-5 h-auto rounded-sm object-cover" />
                        {selectedCountry.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Montant</span>
                      <span className="text-sm font-semibold">{formatAmount(amountNumber, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Frais</span>
                      <span className="text-sm font-semibold text-allness-green">0 (gratuiy)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Vous recevez (estimation)</span>
                      <span className="text-sm font-semibold">
                        {amountNumber > 0 ? formatAmount(receivedEstimate, currency) : '—'}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <span className="text-sm font-semibold text-allness-dark">Total débité</span>
                      <span className="text-lg font-bold text-allness-dark">{formatAmount(amountNumber, currency)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!canSubmitStep2 || submitting}
                    className="w-full h-14 rounded-2xl bg-allness-green hover:bg-allness-greenHover text-white text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:w-auto sm:px-8"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        Confirmer
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Reçu */}
            {currentStep === 3 && (
              <div className="text-center py-8 sm:py-10 px-2">
                <div className="w-16 h-16 rounded-full bg-allness-green/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-allness-green" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-allness-green mb-2">
                  Retrait initié !
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Votre retrait est en cours de traitement. Vous recevrez une confirmation sous peu.
                </p>
                {result && (
                  <div className="rounded-xl border border-gray-200 p-4 mb-6 max-w-sm mx-auto">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-500">Référence</span>
                      <span className="text-xs font-medium text-allness-dark font-mono">{result.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Transaction ID</span>
                      <span className="text-xs font-medium text-allness-dark font-mono">{result.transactionId}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => navigate('/dashboard/wallet')}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-allness-dark hover:bg-allness-darker transition-colors"
                >
                  Retour au wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
