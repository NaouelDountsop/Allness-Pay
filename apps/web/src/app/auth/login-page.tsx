import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AppButton } from "@/components/common/button";
import { authService } from "@/lib/api/auth.service";

const schema = z.object({
  email: z.string().min(1, "Ce champ est requis"),
  password: z.string().min(1, "Mot de passe requis"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError("");
      await authService.login(data.email, data.password);
      navigate("/dashboard");
    } catch (e: any) {
      setServerError(e?.response?.data?.message ?? "Identifiants incorrects");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 overflow-hidden px-4">
      {/* Logo en filigrane, arrière-plan */}
      <img
        src="/afrilinkpay_logo2.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] max-w-3xl opacity-10"
      />

      <div className="relative w-full max-w-md">
        {/* Logo + nom, au-dessus du formulaire */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/afrilinkpay_logo2.svg"
            alt="AfrilinkPay"
            className="w-32 h-32 object-contain"
          />
        </div>

        <h1 className="text-4xl font-bold text-center text-afrilink-dark mb-8">
          CONNEXION
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-base font-semibold text-gray-700">
              Nom complet ou Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-orange" />
              <input
                type="text"
                placeholder="jean.dupont@entreprise.com"
                className="w-full h-12 rounded-xl border border-afrilink-orange/40 pl-9 pr-3 text-base bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-base font-semibold text-gray-700">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-12 rounded-xl border border-gray-200 pl-9 pr-9 text-base bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-green"
                {...register("password")}
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
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="text-right">

             <a href="/forgot-password"
              className="text-base text-afrilink-green font-semibold hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div>

          {serverError && (
            <p className="text-base text-red-500 text-center">{serverError}</p>
          )}

          <AppButton type="submit" loading={isSubmitting} className="h-12 text-base">
            Se connecter →
          </AppButton>

          <p className="text-center text-base text-gray-500">
            Pas encore inscrit ?{" "}
            <a href="/signup" className="text-afrilink-green font-medium">
              S'inscrire
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
