import { useState } from "react";
//mport { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Globe,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AppInput } from "@/components/common/input";
import { AppButton } from "@/components/common/button";
import { SocialButtons } from "@/components/auth/social-buttons";
import { authService } from "@/services/auth.service";

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
  country: "",
  city: "",
  profession: "",
  phone: "",
  address: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  //const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

 const handleStep2Submit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (form.password.length < 8) {
    setError("Le mot de passe doit contenir au moins 8 caractères");
    return;
  }
  if (form.password !== form.confirmPassword) {
    setError("Les mots de passe ne correspondent pas");
    return;
  }
  if (!accepted) {
    setError("Vous devez accepter les conditions d'utilisation");
    return;
  }
  const cleanedPhone = form.phone.replace(/[\s-]/g, ""); // retire espaces et tirets
if (!cleanedPhone || !/^\+?\d{7,15}$/.test(cleanedPhone)) {
  setError("Veuillez fournir un numéro de téléphone valide (ex: +2376...).");
  return;
}

  try {
  const response = await authService.register({
    fullName: form.lastName + " " + form.firstName,
    email: form.email,
    password: form.password,
    phone: form.phone,
    birthDate: form.birthDate,
    city: form.city,
  });

  console.log("Inscription réussie :", response.data);
  // ... ton code de succès (redirection, etc.)
} catch (error: any) {
  // === C’EST ICI QUE TU VAS VOIR L’ERREUR ===
  console.error("===== ERREUR BACKEND =====");
  console.error(error.response?.data);
  console.error("==========================");

  // Affiche aussi une alerte pour que ce soit bien visible
  const messages = error.response?.data?.message;
  if (Array.isArray(messages)) {
    alert("Erreurs de validation :\n\n" + messages.join("\n"));
  } else {
    alert("Erreur : " + (error.response?.data?.message || error.message));
  }
} finally {
    setLoading(false);
  }
};

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-1">Créer un compte</h1>
      <p className="text-sm text-afrilink-gray mb-6">
        Rejoignez l'écosystème financier de nouvelle génération
      </p>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <AppInput
            label="Nom"
            icon={User}
            placeholder="Dupont"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
          <AppInput
            label="Prénom"
            icon={User}
            placeholder="Jean"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <AppInput
            label="Pays"
            icon={Globe}
            placeholder="Cameroun"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
          />

          <AppInput
            label="Ville"
            icon={MapPin}
            placeholder="Votre ville"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <AppButton type="submit">Continuer →</AppButton>

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
              <a href="/confidentialite" className="text-afrilink-green font-medium">
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
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <AppInput
            label="Numéro de téléphone"
            icon={Phone}
            placeholder="+237 6 00 00 00 00"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <AppInput
            label="Adresse complète"
            icon={MapPin}
            placeholder="Rue de ..."
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
          <AppInput
            label="Adresse email"
            icon={Mail}
            type="email"
            placeholder="jean.dupont@entreprise.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

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
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

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
              <a href="/confidentialite" className="text-afrilink-green font-medium">
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
        </form>
      )}
    </AuthLayout>
  );
}
