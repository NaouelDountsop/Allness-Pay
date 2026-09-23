import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import {
  User,
  Calendar,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AppInput } from '@/components/common/input';
import { AppButton } from '@/components/common/button';
import { SocialButtons } from '@/components/auth/social-buttons';
import { CountrySelect } from '@/components/common/country-select';
import { CitySelect } from '@/components/common/city-select';
import { PhoneInput, validatePhone } from '@/components/common/phone-input';
import { AddressInput } from '@/components/common/address-input';
import { authService } from '@/lib/api/auth.service';
import { type Country, countries } from '@/data/countries';

interface SignupForm {
  lastName: string;
  firstName: string;
  birthDate: string;
  gender: string;
  country: string;
  city: string;
  profession: string;
  phone: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialForm: SignupForm = {
  lastName: '',
  firstName: '',
  birthDate: '',
  gender: '',
  country: 'CM',
  city: '',
  profession: '',
  phone: '',
  address: '',
  email: '',
  password: '',
  confirmPassword: '',
};

type FieldErrors = Partial<Record<keyof SignupForm, string>>;

// Zod schemas for validation
const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

const step1Schema = z.object({
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .regex(nameRegex, 'Le nom ne doit contenir que des lettres, espaces, tirets ou apostrophes'),
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .regex(nameRegex, 'Le prénom ne doit contenir que des lettres, espaces, tirets ou apostrophes'),
  birthDate: z.string().min(1, 'La date de naissance est requise'),
  gender: z.string().min(1, 'Le sexe est requis'),
  country: z.string().min(1, 'Le pays est requis'),
  city: z.string().min(3, 'La ville doit contenir au moins 3 caractères'),
});

const step2Schema = z.object({
  profession: z
    .string()
    .min(3, 'La profession doit contenir au moins 3 caractères')
    .regex(
      nameRegex,
      'La profession ne doit contenir que des lettres, espaces, tirets ou apostrophes',
    ),
  phone: z.string().min(1, 'Le numéro de téléphone est requis'),
  address: z.string().min(3, "L'adresse doit contenir au moins 3 caractères"),
  email: z.string().min(1, "L'email est requis").email('Adresse email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(32, 'Le mot de passe ne doit pas dépasser 32 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
});

// Map backend field names to frontend form field names
const FIELD_MAP: Record<string, keyof SignupForm> = {
  nom: 'lastName',
  prenom: 'firstName',
  datenaissance: 'birthDate',
  sexe: 'gender',
  pays: 'country',
  ville: 'city',
  telephone: 'phone',
  adresse: 'address',
  email: 'email',
  motdepasse: 'password',
  profession: 'profession',
};

interface ApiError {
  response?: {
    status?: number;
    data?: {
      code?: string;
      message?: string;
      details?: {
        errors?: Array<{ field: string; message: string }>;
        field?: string;
      };
    };
  };
  message?: string;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [phoneError, setPhoneError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const selectedCountry: Country | null = countries.find((c) => c.code === form.country) ?? null;

  const isFromGoogle = !!pendingToken;

  // Pré-remplir le formulaire avec le profil Google pending
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    setPendingToken(token);
    setPendingLoading(true);

    authService
      .getGooglePending(token)
      .then((response) => {
        setForm((prev) => ({
          ...prev,
          email: response.data.email,
          firstName: response.data.prenom,
          lastName: response.data.nom,
        }));
      })
      .catch(() => {
        setError("Le lien d'inscription Google a expiré ou est invalide. Veuillez recommencer.");
      })
      .finally(() => setPendingLoading(false));
  }, [searchParams]);

  const update = (field: keyof SignupForm, value: string) => {
    // Block commas in name fields
    const noCommaFields: (keyof SignupForm)[] = ['lastName', 'firstName', 'profession'];
    if (noCommaFields.includes(field)) {
      value = value.replace(/,/g, '');
    }
    setForm((f) => ({ ...f, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const result = step1Schema.safeParse(form);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupForm;
        if (field) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setStep(2);
  };

  if (pendingLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chargement des informations Google...
          </p>
        </div>
      </AuthLayout>
    );
  }

  const parseApiError = (err: unknown): { banner: string; fields: FieldErrors } => {
    const e = err as ApiError;
    const data = e.response?.data;
    const fields: FieldErrors = {};

    // Handle validation errors (field-level) from AllExceptionsFilter
    if (data?.details?.errors && Array.isArray(data.details.errors)) {
      for (const errItem of data.details.errors) {
        const frontendField = FIELD_MAP[errItem.field] ?? errItem.field;
        if (frontendField in initialForm) {
          fields[frontendField as keyof SignupForm] = errItem.message;
        }
      }
      return { banner: '', fields };
    }

    // Handle duplicate field errors (single field) from users.service
    if (data?.details?.field) {
      const frontendField = FIELD_MAP[data.details.field] ?? data.details.field;
      if (frontendField in initialForm) {
        fields[frontendField as keyof SignupForm] = data.message || 'Ce champ est déjà utilisé.';
        return { banner: '', fields };
      }
    }

    // Map backend error codes to specific messages
    const codeMessages: Record<string, string> = {
      DUPLICATE_EMAIL: 'Cette adresse email est déjà utilisée par un autre compte.',
      DUPLICATE_PHONE: 'Ce numéro de téléphone est déjà utilisé par un autre compte.',
      DUPLICATE_GOOGLE: 'Ce compte Google est déjà associé à un compte AllnessPay.',
      VALIDATION_FAILED: 'Les données fournies sont invalides. Veuillez vérifier vos informations.',
    };

    const code = data?.code;
    const banner =
      (code && codeMessages[code]) ||
      data?.message ||
      'Une erreur est survenue. Veuillez réessayer.';

    return { banner, fields };
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setPhoneError('');
    setLoading(true);

    if (!accepted) {
      setError("Vous devez accepter les conditions d'utilisation");
      setLoading(false);
      return;
    }

    const result = step2Schema.safeParse(form);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupForm;
        if (field) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
      setLoading(false);
      return;
    }

    const phoneErr = validatePhone(form.phone, selectedCountry);
    if (phoneErr) {
      setPhoneError(phoneErr);
      setLoading(false);
      return;
    }

    const cleanedPhone = form.phone.replace(/[\s-]/g, '');
    const fullPhone = selectedCountry ? selectedCountry.dialCode + cleanedPhone : cleanedPhone;

    try {
      if (isFromGoogle && pendingToken) {
        await authService.completeGoogleSignup(pendingToken, {
          nom: form.lastName,
          prenom: form.firstName,
          email: form.email,
          phone: fullPhone,
          birthDate: form.birthDate,
          country: selectedCountry?.name ?? '',
          city: form.city,
          profession: form.profession,
          address: form.address || form.city,
          gender: form.gender,
        });

        navigate('/verify-email', {
          state: { email: form.email.trim().toLowerCase() },
        });
      } else {
        await authService.register({
          fullName: form.lastName + ' ' + form.firstName,
          email: form.email,
          password: form.password,
          phone: fullPhone,
          birthDate: form.birthDate,
          country: selectedCountry?.name ?? '',
          city: form.city,
          profession: form.profession,
          gender: form.gender,
          address: form.address || form.city,
        });

        navigate('/verify-email', {
          state: { email: form.email.trim().toLowerCase() },
        });
      }
    } catch (err: unknown) {
      const { banner, fields } = parseApiError(err);
      if (banner) setError(banner);
      if (Object.keys(fields).length > 0) setFieldErrors(fields);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-1 dark:text-white">Créer un compte</h1>
      <p className="text-sm text-allness-gray dark:text-gray-400 mb-4">
        {isFromGoogle
          ? 'Finalisez votre inscription avec Google'
          : "Rejoignez l'écosystème financier de nouvelle génération"}
      </p>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            step === 1
              ? 'text-allness-green'
              : 'text-allness-gray dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {step === 2 && <ArrowLeft className="w-3.5 h-3.5" />}
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 1 ? 'bg-allness-green text-white' : 'bg-allness-green text-white'
            }`}
          >
            1
          </span>
          Informations
        </button>

        <div
          className={`flex-1 h-0.5 rounded-full ${
            step === 2 ? 'bg-allness-green' : 'bg-gray-200 dark:bg-[#18353B]'
          }`}
        />

        <span
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            step === 2 ? 'text-allness-green' : 'text-allness-gray dark:text-gray-400'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2
                ? 'bg-allness-green text-white'
                : 'bg-gray-200 dark:bg-[#18353B] text-gray-500 dark:text-gray-400'
            }`}
          >
            2
          </span>
          Sécurité
        </span>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div>
            <AppInput
              label="Nom"
              icon={User}
              placeholder="Dountsop"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
            />
            {fieldErrors.lastName && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.lastName}
              </p>
            )}
          </div>
          <div>
            <AppInput
              label="Prénom"
              icon={User}
              placeholder="Jean"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
            />
            {fieldErrors.firstName && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <AppInput
              label="Date de naissance"
              icon={Calendar}
              type="date"
              placeholder=""
              value={form.birthDate}
              onChange={(e) => update('birthDate', e.target.value)}
            />
            {fieldErrors.birthDate && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.birthDate}
              </p>
            )}
          </div>

          <div className="w-full space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sexe</label>
            <div className="relative">
              <select
                className="w-full h-11 rounded-lg border border-gray-200 dark:border-[#18353B] px-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#071418] appearance-none focus:outline-none focus:ring-1 focus:ring-allness-orange"
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-allness-gray pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {fieldErrors.gender && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.gender}
              </p>
            )}
          </div>

          <CountrySelect
            value={form.country}
            onChange={(c) => {
              setForm((f) => ({ ...f, country: c.code, phone: '', city: '' }));
              setPhoneError('');
            }}
          />

          <div>
            <CitySelect
              countryCode={form.country}
              value={form.city}
              onChange={(c) => update('city', c)}
            />
            {fieldErrors.city && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.city}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <AppButton type="submit">Continuer →</AppButton>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Déjà inscrit ?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-allness-green font-medium cursor-pointer hover:underline"
            >
              Se connecter
            </span>
          </p>

          <SocialButtons />
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <div>
            <AppInput
              label="Profession"
              icon={Briefcase}
              placeholder="Ex: Enseignant, Commerçant, Ingénieur..."
              value={form.profession}
              onChange={(e) => update('profession', e.target.value)}
            />
            {fieldErrors.profession && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.profession}
              </p>
            )}
          </div>
          <div>
            <PhoneInput
              country={selectedCountry}
              value={form.phone}
              onChange={(v) => {
                update('phone', v);
                setPhoneError('');
              }}
              error={phoneError || fieldErrors.phone}
            />
          </div>
          <AddressInput
            countryCode={form.country}
            city={form.city}
            value={form.address}
            onChange={(v) => update('address', v)}
          />

          {/* Email pré-rempli et en lecture seule si vient de Google */}
          <div>
            <AppInput
              label="Adresse email"
              icon={Mail}
              type="email"
              placeholder="jean.dountsop@entreprise.com"
              autoComplete="off"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              disabled={isFromGoogle}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {
            //!isFromGoogle && (
            <>
              <div className="w-full space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Créer un mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-allness-gray" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`w-full h-11 rounded-lg border pl-9 pr-9 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#071418] focus:outline-none focus:ring-1 ${
                      fieldErrors.password
                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 dark:border-[#18353B] focus:border-allness-orange focus:ring-allness-orange'
                    }`}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-allness-gray"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Minimum 8 caractères, incluant un chiffre et un symbole.
                </p>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="w-full space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-allness-gray" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="w-full h-11 rounded-lg border border-gray-200 dark:border-[#18353B] pl-9 pr-9 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#071418] focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                    value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-allness-gray"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          }

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <label className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border border-gray-300 dark:border-[#18353B] bg-white dark:bg-[#071418] accent-allness-green"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              J'accepte les{' '}
              <a href="/cgu" className="text-allness-green font-medium">
                Conditions d'utilisation
              </a>{' '}
              et la{' '}
              <a href="/confidentialite" className="text-allness-green font-medium">
                Politique de confidentialité
              </a>{' '}
              de AllnessPay.
            </span>
          </label>

          <AppButton type="submit" loading={loading}>
            Continuer →
          </AppButton>

          {!isFromGoogle && (
            <>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Déjà inscrit ?{' '}
                <a href="/login" className="text-allness-green font-medium">
                  Se connecter
                </a>
              </p>
              <SocialButtons />
            </>
          )}
        </form>
      )}
    </AuthLayout>
  );
}
