import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { tontineService } from '@/lib/api/tontine.service';
import { CountrySelect } from '@/components/common/country-select';
import type { Country } from '@/data/countries';

type Tab = 'general' | 'finances' | 'regles' | 'membres';

const COUNTRY_CURRENCY_MAP: Record<string, 'XAF' | 'USD' | 'EUR' | 'GBP' | 'CAD'> = {
  CM: 'XAF',
  SN: 'XAF',
  CI: 'XAF',
  FR: 'EUR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
};

const MIN_CONTRIBUTION_BY_CURRENCY: Record<string, number> = {
  XAF: 500,
  USD: 1,
  EUR: 1,
  GBP: 1,
  CAD: 1,
};

const generalSchema = (t: (key: string) => string, currency: string = 'XAF') =>
  z.object({
    name: z
      .string()
      .min(3, t('tontines.validationNameMin'))
      .max(100, t('tontines.validationNameMax'))
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        t('tontines.validationNamePattern'),
      ),
    description: z.string().min(10, t('tontines.validationDescriptionMin')).max(500, t('tontines.validationDescriptionMax')),
    contribution: z.string().refine((val) => {
      const num = Number(val);
      const min = MIN_CONTRIBUTION_BY_CURRENCY[currency] ?? 500;
      return !isNaN(num) && num >= min;
    }, t('tontines.validationContributionMin')),
    memberLimit: z.string().refine((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num >= 2 && num <= 50;
    }, t('tontines.validationMemberLimit')),
    currency: z.enum(['XAF', 'USD', 'EUR', 'GBP', 'CAD']),
  });

type GeneralFormData = {
  name: string;
  description: string;
  contribution: string;
  memberLimit: string;
  currency: 'XAF' | 'USD' | 'EUR' | 'GBP' | 'CAD';
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  XAF: 'FCFA',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
};

export function CreateTontineForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currency, setCurrency] = useState<'XAF' | 'USD' | 'EUR' | 'GBP' | 'CAD'>('XAF');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'general', label: t('tontines.tabGeneral'), icon: '①' },
    { key: 'finances', label: t('tontines.tabFinances'), icon: '💰' },
    { key: 'regles', label: t('tontines.tabRules'), icon: '📋' },
    { key: 'membres', label: t('tontines.tabMembers'), icon: '👥' },
  ];

  const schema = useMemo(() => generalSchema(t, currency), [t, currency]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<GeneralFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      contribution: '500',
      memberLimit: '12',
      currency: 'XAF',
    },
  });

  const contribution = watch('contribution');
  const memberLimit = watch('memberLimit');
  const estimatedPot = (parseFloat(contribution) || 0) * (parseInt(memberLimit) || 0);
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const handleInitialize = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const data = watch();
      await tontineService.create({
        name: data.name,
        description: data.description,
        contributionAmount: Number(data.contribution),
        frequency,
        memberLimit: Number(data.memberLimit),
        currency: data.currency,
      });
      navigate('/dashboard/tontines');
    } catch (createError) {
      setError(t('tontines.errorCreate'));
      console.error(createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGeneralSubmit = () => {
    setActiveTab('finances');
  };

  const onCountryChange = (country: Country) => {
    setSelectedCountry(country.code);
    const mapped = COUNTRY_CURRENCY_MAP[country.code];
    if (mapped) {
      setCurrency(mapped);
      setValue('currency', mapped, { shouldValidate: true });
      trigger('contribution');
    }
  };

  return (
    <div>
      <div className="flex gap-1 sm:gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-allness-green text-allness-dark dark:text-white'
                : 'border-transparent text-gray-400 dark:text-gray-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSubmit(onGeneralSubmit)} noValidate>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-allness-orange text-white text-[10px] font-semibold flex items-center justify-center">
              1
            </span>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{t('tontines.generalInfo')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500">{t('tontines.tontineNameLabel')}</label>
              <input
                type="text"
                placeholder={t('tontines.placeholderName')}
                {...register('name')}
                className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div className="mt-1">
              <CountrySelect value={selectedCountry} onChange={onCountryChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500">{t('tontines.currencyLabel')}</label>
              <select
                {...register('currency')}
                onChange={(e) => {
                  register('currency').onChange(e);
                  setCurrency(e.target.value as 'XAF' | 'USD' | 'EUR' | 'GBP' | 'CAD');
                  trigger('contribution');
                }}
                className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
              >
                <option value="XAF">{t('tontines.currencyXAF')}</option>
                <option value="USD">{t('tontines.currencyUSD')}</option>
                <option value="EUR">{t('tontines.currencyEUR')}</option>
                <option value="GBP">{t('tontines.currencyGBP')}</option>
                <option value="CAD">{t('tontines.currencyCAD')}</option>
              </select>
              {errors.currency && (
                <p className="text-[11px] text-red-500 mt-1">{errors.currency.message}</p>
              )}
            </div>
            <div></div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-medium text-gray-500">{t('tontines.descriptionLabel')}</label>
            <textarea
              rows={3}
              placeholder={t('tontines.placeholderDescription')}
              {...register('description')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange resize-none"
            />
            {errors.description && (
              <p className="text-[11px] text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-allness-orange text-white text-[10px] font-semibold flex items-center justify-center">
              2
            </span>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{t('tontines.financialParams')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="text-xs font-medium text-gray-500">
                {t('tontines.contributionAmount')}
              </label>
              <div className="flex items-center h-11 rounded-lg border border-gray-200 mt-1 px-3">
                <span className="text-sm text-gray-500 mr-1">{symbol}</span>
                <input
                  type="number"
                  {...register('contribution')}
                  className="flex-1 text-sm bg-transparent focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange text-gray-900"
                />
              </div>
              {errors.contribution && (
                <p className="text-[11px] text-red-500 mt-1">{errors.contribution.message}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">
                Min. {new Intl.NumberFormat('fr-FR').format(MIN_CONTRIBUTION_BY_CURRENCY[currency] ?? 500)} {symbol}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">{t('tontines.frequency')}</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
              >
                <option value="MONTHLY">{t('tontines.frequencyMonthly')}</option>
                <option value="WEEKLY">{t('tontines.frequencyWeekly')}</option>
                <option value="BIWEEKLY">{t('tontines.frequencyBiweekly')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">
                {t('tontines.memberCount')}
              </label>
              <input
                type="number"
                min={2}
                placeholder="ex: 25"
                {...register('memberLimit')}
                className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
              />
              {errors.memberLimit && (
                <p className="text-[11px] text-red-500 mt-1">{errors.memberLimit.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-allness-dark text-white p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] text-white/60">{t('tontines.estimatedPot')}</p>
              <p className="text-[10px] text-white/40">
                {t('tontines.basedOn', { count: parseInt(memberLimit) || 0 })}
              </p>
            </div>
            <p className="text-2xl font-bold">
              {symbol}
              {estimatedPot.toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            {/* <button
              type="button"
              className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-600"
            >
              {t('tontines.saveDraft')}
            </button> */}
            <button
              type="submit"
              disabled={!isValid}
              className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover disabled:cursor-not-allowed disabled:bg-green-200 text-white text-sm font-medium transition-colors"
            >
              {t('tontines.next')}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'finances' && <FinancesTab onNext={() => setActiveTab('regles')} />}

      {activeTab === 'regles' && <ReglesTab onNext={() => setActiveTab('membres')} />}

      {activeTab === 'membres' && (
        <MembresTab onSubmit={handleInitialize} isSubmitting={isSubmitting} error={error} />
      )}
    </div>
  );
}

function FinancesTab({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <img
          src="/Finance app-cuate.svg"
          alt="Finance app"
          className="w-full max-w-[360px] object-contain"
        />
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-orange-50 p-4 mb-6 text-xs text-orange-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          {t('tontines.financesInfo')}
        </p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium"
        >
          {t('tontines.next')}
        </button>
      </div>
    </div>
  );
}

function ReglesTab({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <img
          src="/Accept terms-cuate.svg"
          alt="Accept terms"
          className="w-full max-w-[360px] object-contain"
        />
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-orange-50 p-4 mb-6 text-xs text-allness-orange">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{t('tontines.rulesInfo')}</p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium"
        >
          {t('tontines.next')}
        </button>
      </div>
    </div>
  );
}

function MembresTab({
  onSubmit,
  isSubmitting,
  error,
}: {
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <img
          src="/New team members-pana.svg"
          alt="New team members"
          className="w-full max-w-[360px] object-contain"
        />
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {t('tontines.membersDescription')}
      </p>
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="flex justify-end gap-3">
        {/* <button className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-600">
          {t('tontines.saveDraft')}
        </button> */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover disabled:cursor-not-allowed disabled:bg-green-200 text-white text-sm font-medium"
        >
          {isSubmitting ? t('tontines.creating') : t('tontines.initializeTontine')}
        </button>
      </div>
    </div>
  );
}
