import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Calendar,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AppInput } from "@/components/common/input";
import { AppButton } from "@/components/common/button";
import { SocialButtons } from "@/components/auth/social-buttons";
import { CountrySelect } from "@/components/common/country-select";
import { CitySelect } from "@/components/common/city-select";
import { PhoneInput, validatePhone } from "@/components/common/phone-input";
import { AddressInput } from "@/components/common/address-input";
import { authService } from "@/services/auth.service";
import { type Country, countries } from "@/data/countries";

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
  lastName: "",
  firstName: "",
  birthDate: "",
  gender: "",
  country: "CM",
  city: "",
  profession: "",
  phone: "",
  address: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const selectedCountry: Country | null =
    countries.find((c) => c.code === form.country) ?? null;

  const isFromGoogle = !!pendingToken;

  // Pré-remplir le formulaire avec le profil Google pending
  useEffect(() => {
    const token = searchParams.get("token");
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
        setError(
          "Le lien d'inscription Google a expiré ou est invalide. Veuillez recommencer.",
        );
      })
      .finally(() => setPendingLoading(false));
  }, [searchParams]);

  const update = (field: keyof SignupForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.lastName || !form.firstName) {
      setError("Merci de renseigner votre nom et prénom");
      return;
    }
    setStep(2);
  };

  if (pendingLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-sm text-gray-500">Chargement des informations Google...</p>
        </div>
      </AuthLayout>
    );
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPhoneError("");
    setLoading(true);

    if (!accepted) {
      setError("Vous devez accepter les conditions d'utilisation");
      setLoading(false);
      return;
    }

    const phoneErr = validatePhone(form.phone, selectedCountry);
    if (phoneErr) {
      setPhoneError(phoneErr);
      setLoading(false);
      return;
    }

    const cleanedPhone = form.phone.replace(/[\s-]/g, "");
    const fullPhone = selectedCountry
      ? selectedCountry.dialCode + cleanedPhone
      : cleanedPhone;

    try {
      if (isFromGoogle && pendingToken) {
        await authService.completeGoogleSignup(pendingToken, {
          email: form.email,
          phone: fullPhone,
          birthDate: form.birthDate,
          country: selectedCountry?.name ?? "",
          city: form.city,
          profession: form.profession,
          address: form.address || form.city,
          gender: form.gender,
        });

        navigate("/verify-email", {
          state: { email: form.email.trim().toLowerCase() },
        });
      } else {
        await authService.register({
          fullName: form.lastName + " " + form.firstName,
          email: form.email,
          password: form.password,
          phone: fullPhone,
          birthDate: form.birthDate,
          country: selectedCountry?.name ?? "",
          city: form.city,
          profession: form.profession,
        });

        navigate("/verify-email", {
          state: { email: form.email.trim().toLowerCase() },
        });
      }
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string | string[]; error?: string } };
      };
      const message =
        e.response?.data?.message ||
        e.response?.data?.error ||
        "Erreur lors de l'inscription";
      setError(Array.isArray(message) ? message.join("\n") : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-1">Créer un compte</h1>
      <p className="text-sm text-afrilink-gray mb-4">
        {isFromGoogle
          ? "Finalisez votre inscription avec Google"
          : "Rejoignez l'écosystème financier de nouvelle génération"}
      </p>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            step === 1
              ? "text-afrilink-green"
              : "text-afrilink-gray hover:text-gray-900"
          }`}
        >
          {step === 2 && <ArrowLeft className="w-3.5 h-3.5" />}
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 1
                ? "bg-afrilink-green text-white"
                : "bg-afrilink-green text-white"
            }`}
          >
            1
          </span>
          Informations
        </button>

        <div
          className={`flex-1 h-0.5 rounded-full ${
            step === 2 ? "bg-afrilink-green" : "bg-gray-200"
          }`}
        />

        <span
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            step === 2 ? "text-afrilink-green" : "text-afrilink-gray"
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2
                ? "bg-afrilink-green text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </span>
          Sécurité
        </span>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <AppInput
            label="Nom"
            icon={User}
            placeholder="Dupont"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            disabled={isFromGoogle}
          />
          <AppInput
            label="Prénom"
            icon={User}
            placeholder="Jean"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            disabled={isFromGoogle}
          />
          <AppInput
            label="Date de naissance"
            icon={Calendar}
            type="date"
            placeholder=""
            value={form.birthDate}
            onChange={(e) => update("birthDate", e.target.value)}
          />

          <div className="w-full space-y-1">
            <label className="text-sm font-medium text-gray-700">Sexe</label>
            <div className="relative">
              <select
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-afrilink-green"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray pointer-events-none"
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
          </div>

          <CountrySelect
            value={form.country}
            onChange={(c) => {
              setForm((f) => ({ ...f, country: c.code, phone: "", city: "" }));
              setPhoneError("");
            }}
          />

          <CitySelect
            countryCode={form.country}
            value={form.city}
            onChange={(c) => update("city", c)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <AppButton type="submit">Continuer →</AppButton>

          {!isFromGoogle && (
            <>
              <label className="flex items-start gap-2 text-xs text-gray-500 mt-2">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border border-gray-300 bg-white accent-afrilink-green"
                />
                <span>
                  J'accepte les{" "}
                  <a href="/cgu" className="text-afrilink-green font-medium">
                    Conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a
                    href="/confidentialite"
                    className="text-afrilink-green font-medium"
                  >
                    Politique de confidentialité
                  </a>{" "}
                  de AfrilinkPay.
                </span>
              </label>

              <p className="text-center text-sm text-gray-500 mt-4">
                Déjà inscrit ?{" "}
                <a href="/login" className="text-afrilink-green font-medium">
                  Se connecter
                </a>
              </p>

              <SocialButtons />
            </>
          )}
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <AppInput
            label="Profession"
            icon={Briefcase}
            placeholder="Ex: Enseignant, Commerçant, Ingénieur..."
            value={form.profession}
            onChange={(e) => update("profession", e.target.value)}
          />
          <PhoneInput
            country={selectedCountry}
            value={form.phone}
            onChange={(v) => {
              update("phone", v);
              setPhoneError("");
            }}
            error={phoneError}
          />
          <AddressInput
            countryCode={form.country}
            city={form.city}
            value={form.address}
            onChange={(v) => update("address", v)}
          />

          {/* Email pré-rempli et en lecture seule si vient de Google */}
          <AppInput
            label="Adresse email"
            icon={Mail}
            type="email"
            placeholder="jean.dupont@entreprise.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            disabled={isFromGoogle}
          />

          {!isFromGoogle && (
            <>
              <div className="w-full space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Créer un mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-9 text-sm text-gray-900 bg-white focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-afrilink-gray"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Minimum 8 caractères, incluant un chiffre et un symbole.
                </p>
              </div>

              <div className="w-full space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-9 text-sm text-gray-900 bg-white focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-afrilink-gray"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <AppButton type="submit" loading={loading}>
            Continuer →
          </AppButton>

          <label className="flex items-start gap-2 text-xs text-gray-500 mt-2">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border border-gray-300 bg-white accent-afrilink-green"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>
              J'accepte les{" "}
              <a href="/cgu" className="text-afrilink-green font-medium">
                Conditions d'utilisation
              </a>{" "}
              et la{" "}
              <a
                href="/confidentialite"
                className="text-afrilink-green font-medium"
              >
                Politique de confidentialité
              </a>{" "}
              de AfrilinkPay.
            </span>
          </label>

          {!isFromGoogle && (
            <>
              <p className="text-center text-sm text-gray-500 mt-4">
                Déjà inscrit ?{" "}
                <a href="/login" className="text-afrilink-green font-medium">
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