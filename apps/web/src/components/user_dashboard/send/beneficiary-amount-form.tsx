import { useState, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Banknote,
  ArrowRight,
  AlertCircle,
  Wallet,
  Building2,
  Smartphone,
} from 'lucide-react';
import { CountrySelect } from '@/components/common/country-select';
import { getCountryByCode, getFlagUrl, type Country } from '@/data/countries';
import {
  getExchangeRate,
  CURRENCY_SYMBOLS,
} from '@/lib/mock/send-money-data';

export type ReceptionMode = 'wallet' | 'mtn' | 'orange' | 'bank';

interface FormState {
  beneficiaryContact: string;
  country: string;
  amount: string;
  receptionMode: string;
}

export interface SenderInfo {
  fullName: string;
  city?: string;
  country?: string;
  currency?: string;
  walletId?: string;
  availableCurrencies?: string[];
}

interface BeneficiaryAmountFormProps {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: () => void;
  sender?: SenderInfo;
}

const RECEPTION_OPTIONS: {
  id: ReceptionMode;
  label: string;
  image?: string;
  icon: typeof Wallet;
  color: string;
}[] = [
  {
    id: 'wallet',
    label: 'Wallet AllnessPay',
    image: '/allnesspay_logo2.png',
    icon: Wallet,
    color: 'text-afrilink-green',
  },
  {
    id: 'mtn',
    label: 'MTN Mobile Money',
    image: '/mtn-momo.png',
    icon: Smartphone,
    color: 'text-yellow-500',
  },
  {
    id: 'orange',
    label: 'Orange Money',
    image: '/orange-money.png',
    icon: Smartphone,
    color: 'text-orange-50',
  },
  { id: 'bank', label: 'Compte bancaire', icon: Building2, color: 'text-blue-600' },
];

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
  SN: 'XOF', CI: 'XOF', NE: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF',
  CA: 'CAD',
  FR: 'EUR', BE: 'EUR', CH: 'EUR', DE: 'EUR',
};

const PHONE_MODES = ['mtn', 'orange', 'bank'];

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

function detectNetwork(digits: string, country: string): string | null {
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

export function BeneficiaryAmountForm({ form, onChange, onSubmit, sender }: BeneficiaryAmountFormProps) {
  const amountNumber = parseFloat(form.amount) || 0;
  const senderCurrency = sender?.currency ?? 'CAD';

  const [senderCurrencyState, setSenderCurrencyState] = useState(senderCurrency);

  const availableCurrencies = sender?.availableCurrencies ?? [senderCurrency];
  const receiverCurrency = COUNTRY_TO_CURRENCY[form.country] ?? 'XAF';

  const exchangeRate = getExchangeRate(senderCurrencyState, receiverCurrency);
  const fees = amountNumber * 0.01;
  const totalDebit = amountNumber + fees;
  const received = amountNumber * exchangeRate;

  const selectedCountry = useMemo(
    () => getCountryByCode(form.country) ?? getCountryByCode('CM')!,
    [form.country],
  );
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPhoneMode = PHONE_MODES.includes(form.receptionMode);

  const groupLengths = useMemo(
    () => getGroupLengths(selectedCountry.phonePlaceholder),
    [selectedCountry],
  );
  const expectedDigitCount = useMemo(
    () => groupLengths.reduce((sum, n) => sum + n, 0),
    [groupLengths],
  );

  const localDigits = form.beneficiaryContact.replace(/\D/g, '');
  const isComplete = !isPhoneMode
    ? form.beneficiaryContact.length > 0
    : localDigits.length === expectedDigitCount;

  const isPhoneValid =
    form.beneficiaryContact.length === 0 ||
    (!isPhoneMode && form.beneficiaryContact.length > 0) ||
    localDigits.length === expectedDigitCount;

  const showPhoneError =
    touched && isPhoneMode && form.beneficiaryContact.length > 0 && !isPhoneValid;

  const handleCountryChange = (country: Country) => {
    onChange('country', country.code);
    onChange('beneficiaryContact', '');
    setTouched(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleContactChange = (raw: string) => {
    if (!isPhoneMode) {
      onChange('beneficiaryContact', raw);
      return;
    }
    const digitsOnly = raw.replace(/\D/g, '').slice(0, expectedDigitCount);
    onChange('beneficiaryContact', formatDigitsToPattern(digitsOnly, groupLengths));

    const detected = detectNetwork(digitsOnly, form.country);
    if (detected) {
      onChange('receptionMode', detected);
    }
  };

  const isBeneficiaryValid = isPhoneMode
    ? form.beneficiaryContact.length > 0 && isPhoneValid && isComplete
    : form.beneficiaryContact.length > 0;

  const canSubmit = form.beneficiaryContact && amountNumber > 0 && isBeneficiaryValid;

  return (
    <div className="text-base">
      {/* Mode de réception */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Mode de réception</p>
        <div className="grid grid-cols-2 gap-3">
          {RECEPTION_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = form.receptionMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange('receptionMode', option.id);
                  onChange('beneficiaryContact', '');
                  setTouched(false);
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-afrilink-green bg-afrilink-green/[0.05] shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-afrilink-green/10' : 'bg-gray-100'
                  }`}
                >
                  {option.image ? (
                    <img src={option.image} alt={option.label} className="w-6 h-6 object-contain" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isSelected ? option.color : 'text-gray-400'}`} />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${isSelected ? 'text-afrilink-dark' : 'text-gray-600'}`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Expéditeur */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/60">
          <p className="text-xs font-semibold text-afrilink-gray tracking-wider mb-2 uppercase">
            Expéditeur ({sender?.country ?? 'Canada'})
          </p>
          <p className="text-lg font-semibold text-afrilink-dark">
            {sender?.fullName ?? 'Utilisateur'}
          </p>
          <p className="text-sm text-gray-500">
            {senderCurrencyState} · {sender?.city ?? sender?.country ?? ''}
          </p>
        </div>

        {/* Bénéficiaire */}
        <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-afrilink-gray tracking-wider uppercase">
            Bénéficiaire
          </p>

          <div className="space-y-1.5">
            {isPhoneMode && <CountrySelect value={form.country} onChange={handleCountryChange} />}

            <div>
              <div
                className={`flex items-center w-full h-12 rounded-xl border bg-white overflow-hidden focus-within:ring-2 transition-colors ${
                  showPhoneError
                    ? 'border-red-300 focus-within:border-red-400 focus-within:ring-red-200'
                    : isComplete
                      ? 'border-afrilink-green focus-within:ring-afrilink-green/30'
                      : 'border-gray-200 focus-within:border-afrilink-green focus-within:ring-afrilink-green/30'
                }`}
              >
                {isPhoneMode && (
                  <span className="flex items-center gap-1.5 h-full pl-4 pr-2 shrink-0 border-r border-gray-100 bg-gray-50/80 text-sm sm:text-base font-medium text-afrilink-dark select-none">
                    <img
                      src={getFlagUrl(selectedCountry.code)}
                      alt={selectedCountry.name}
                      className="w-5 h-auto rounded-sm object-cover"
                    />
                    {selectedCountry.dialCode}
                  </span>
                )}
                {!isPhoneMode && (
                  <span className="flex items-center gap-1.5 h-full pl-4 pr-2 shrink-0 border-r border-gray-100 bg-gray-50/80 text-sm font-medium text-afrilink-dark select-none">
                    <Wallet className="w-4 h-4 text-afrilink-green" />
                  </span>
                )}
                <input
                  ref={inputRef}
                  type={isPhoneMode ? 'tel' : 'text'}
                  inputMode={isPhoneMode ? 'numeric' : 'text'}
                  placeholder={isPhoneMode ? selectedCountry.phonePlaceholder : 'Identifiant wallet'}
                  value={form.beneficiaryContact}
                  onChange={(e) => handleContactChange(e.target.value)}
                  onBlur={() => setTouched(true)}
                  className="flex-1 min-w-0 h-full px-3 text-sm sm:text-base bg-white text-afrilink-dark placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {showPhoneError && (
                <div className="flex items-start gap-1.5 mt-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Le numéro doit contenir {expectedDigitCount} chiffres pour{' '}
                    {selectedCountry.name} (ex. {selectedCountry.dialCode}{' '}
                    {selectedCountry.phonePlaceholder}).
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Montant - Vous envoyez */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Vous envoyez</label>

        {/* Sélecteur de devise visible */}
        {availableCurrencies.length > 1 && (
          <div className="flex items-center gap-2 mb-3">
            {availableCurrencies.map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setSenderCurrencyState(cur)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  cur === senderCurrencyState
                    ? 'bg-afrilink-green text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {CURRENCY_SYMBOLS[cur] ?? cur} {cur}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center rounded-2xl border-2 border-gray-200 bg-white overflow-hidden focus-within:border-afrilink-green transition-colors">
          <Banknote className="w-5 h-5 text-afrilink-orange ml-4 shrink-0" />
          <input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => onChange('amount', e.target.value)}
            className="flex-1 h-16 min-w-0 px-3 text-xl sm:text-2xl font-semibold text-afrilink-dark bg-white focus:outline-none"
          />
          <span className="px-4 sm:px-5 h-full flex items-center text-sm sm:text-base font-semibold text-gray-500 border-l border-gray-100 bg-gray-50 shrink-0">
            {CURRENCY_SYMBOLS[senderCurrencyState] ?? senderCurrencyState}
          </span>
        </div>
      </div>

      {/* Taux de change + frais */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">Taux de change</span>
          <span className="text-afrilink-dark font-semibold">
            1 {senderCurrencyState} = {exchangeRate.toFixed(4)} {receiverCurrency}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">Frais de transfert (1%)</span>
          <span className="text-afrilink-dark font-semibold">
            {new Intl.NumberFormat('fr-FR').format(fees)} {CURRENCY_SYMBOLS[senderCurrencyState] ?? senderCurrencyState}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-afrilink-dark">Total débité</span>
            <span className="text-xl font-bold text-afrilink-dark">
              {new Intl.NumberFormat('fr-FR').format(totalDebit)} {CURRENCY_SYMBOLS[senderCurrencyState] ?? senderCurrencyState}
            </span>
          </div>
        </div>
      </div>

      {/* Bénéficiaire reçoit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-2xl bg-afrilink-dark text-white px-5 py-4 mb-6">
        <span className="text-sm sm:text-base font-medium text-white/80">
          Le bénéficiaire reçoit
        </span>
        <span className="text-xl sm:text-2xl font-bold text-afrilink-orange">
          {new Intl.NumberFormat('fr-FR').format(received)} {receiverCurrency}
        </span>
      </div>

      <button
        onClick={() => {
          setTouched(true);
          if (canSubmit) {
            onSubmit();
          }
        }}
        disabled={!canSubmit}
        className="w-full h-14 rounded-2xl bg-afrilink-green hover:bg-afrilink-greenHover text-white text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2"
      >
        Confirmer
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
          <ShieldCheck className="w-4 h-4 text-afrilink-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-700">Fonds Protégés</p>
            <p className="text-[11px] text-gray-500">
              Vos fonds sont séquestrés et protégés par la réglementation financière.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
          <Lock className="w-4 h-4 text-afrilink-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-700">Transaction Sécurisée</p>
            <p className="text-[11px] text-gray-500">
              Chiffrement AES-256 de bout en bout pour toutes vos données transactionnelles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
