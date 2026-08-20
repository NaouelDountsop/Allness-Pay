import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tontineService } from '@/lib/api/tontine.service';
import { CountrySelect } from '@/components/common/country-select';
import type { Country } from '@/data/countries';

type Tab = 'general' | 'finances' | 'regles' | 'membres';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'general', label: 'Général', icon: '①' },
  { key: 'finances', label: 'Finances', icon: '💰' },
  { key: 'regles', label: 'Règles', icon: '📋' },
  { key: 'membres', label: 'Membres', icon: '👥' },
];

const COUNTRY_CURRENCY_MAP: Record<string, 'XAF' | 'USD' | 'EUR' | 'GBP' | 'CAD'> = {
  CM: 'XAF',
  SN: 'XAF',
  CI: 'XAF',
  FR: 'EUR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
};

const generalSchema = z.object({
  name: z
    .string()
    .min(3, 'Minimum 3 caractères')
    .max(100, 'Maximum 100 caractères')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Seules les lettres, espaces, tirets et apostrophes sont autorisés',
    ),
  description: z.string().min(10, 'Minimum 10 caractères').max(500, 'Maximum 500 caractères'),
  contribution: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 100;
  }, "La contribution doit être d'au moins 100"),
  memberLimit: z.string().refine((val) => {
    const num = Number(val);
    return Number.isInteger(num) && num >= 2 && num <= 50;
  }, 'Le nombre de membres doit être entre 2 et 50'),
  currency: z.enum(['XAF', 'USD', 'EUR', 'GBP', 'CAD']),
});

type GeneralFormData = z.infer<typeof generalSchema>;

const CURRENCY_SYMBOLS: Record<string, string> = {
  XAF: 'FCFA',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
};

export function CreateTontineForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<GeneralFormData>({
    resolver: zodResolver(generalSchema),
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
  const currency = watch('currency');
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
      setError('Impossible de créer la tontine. Merci de réessayer.');
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
      setValue('currency', mapped, { shouldValidate: true });
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-allness-green text-allness-dark'
                : 'border-transparent text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSubmit(onGeneralSubmit)} noValidate>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-allness-orange text-white text-[10px] font-semibold flex items-center justify-center">
              1
            </span>
            <p className="text-sm font-semibold text-gray-800">Informations Générales</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Nom de la tontine</label>
              <input
                type="text"
                placeholder="ex: Épargne Exécutive T4"
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
              <label className="text-xs font-medium text-gray-500">Devise</label>
              <select
                {...register('currency')}
                className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900"
              >
                <option value="XAF">XAF - Franc CFA</option>
                <option value="USD">USD - Dollar US</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - Livre Sterling</option>
                <option value="CAD">CAD - Dollar Canadien</option>
              </select>
              {errors.currency && (
                <p className="text-[11px] text-red-500 mt-1">{errors.currency.message}</p>
              )}
            </div>
            <div></div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-medium text-gray-500">Description</label>
            <textarea
              rows={3}
              placeholder="Décrivez brièvement le but de ce cercle d'épargne..."
              {...register('description')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange resize-none"
            />
            {errors.description && (
              <p className="text-[11px] text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-semibold flex items-center justify-center">
              ?
            </span>
            <p className="text-sm font-semibold text-gray-800">Paramètres Financiers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="text-xs font-medium text-gray-500">
                Montant de la contribution
              </label>
              <div className="flex items-center h-11 rounded-lg border border-gray-200 mt-1 px-3">
                <span className="text-sm text-gray-500 mr-1">{symbol}</span>
                <input
                  type="number"
                  {...register('contribution')}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-900"
                />
              </div>
              {errors.contribution && (
                <p className="text-[11px] text-red-500 mt-1">{errors.contribution.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Fréquence</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900"
              >
                <option value="MONTHLY">Mensuelle</option>
                <option value="WEEKLY">Hebdomadaire</option>
                <option value="BIWEEKLY">Bimensuelle</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">
                Nombre de membres de la tontine
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
              <p className="text-[11px] text-white/60">POT TOTAL ESTIMÉ</p>
              <p className="text-[10px] text-white/40">
                Basé sur {parseInt(memberLimit) || 0} membre{(parseInt(memberLimit) || 0) > 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-2xl font-bold">
              {symbol}
              {estimatedPot.toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-600"
            >
              Enregistrer le brouillon
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover disabled:cursor-not-allowed disabled:bg-green-200 text-white text-sm font-medium transition-colors"
            >
              Suivant
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
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <img
          src="/Finance app-cuate.svg"
          alt="Finance app"
          className="w-full max-w-[360px] object-contain"
        />
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-4 mb-6 text-xs text-blue-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Les fonds seront transférés automatiquement vers le compte du bénéficiaire selon l'ordre
          de passage défini à l'étape suivante.
        </p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

function ReglesTab({ onNext }: { onNext: () => void }) {
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
        <p>Des frais de retard de 5% s'appliquent automatiquement après le délai de grâce.</p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium"
        >
          Suivant
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
        Ajoutez les membres qui participeront à cette tontine. Vous pourrez aussi inviter des
        personnes après la création.
      </p>
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="flex justify-end gap-3">
        <button className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-600">
          Enregistrer le brouillon
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-10 px-5 rounded-lg bg-allness-green hover:bg-allness-greenHover disabled:cursor-not-allowed disabled:bg-green-200 text-white text-sm font-medium"
        >
          {isSubmitting ? 'Création en cours...' : 'Initialiser la Tontine'}
        </button>
      </div>
    </div>
  );
}
