import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AppInput } from '@/components/common/input';
import { AppButton } from '@/components/common/button';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';

const schema = z.object({
  email: z.string().min(1, 'Ce champ est requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('');
      const response = await authService.loginAdmin(data.email, data.password);
      const { access_token, refresh_token } = response.data;
      if (access_token) {
        authStorage.setToken(access_token);
      }
      if (refresh_token) {
        authStorage.setRefreshToken(refresh_token);
      }
      authStorage.setRole('admin');
      navigate('/admin');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } }; message?: string };
      const msg = err?.response?.data?.message || err?.message || 'Identifiants incorrects';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden bg-white">
        <div className="bg-afrilink-dark p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-afrilink-orange/20 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-afrilink-orange" />
          </div>
          <h1 className="text-xl font-bold text-white">Espace Administrateur</h1>
          <p className="text-sm text-white/60 mt-1">Accès sécurisé réservé aux administrateurs</p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="w-full space-y-1">
              <AppInput
                label="Adresse email"
                icon={Mail}
                type="email"
                placeholder="admin@afrilinkpay.com"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="w-full space-y-1">
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-9 text-sm text-gray-900 bg-white focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-afrilink-gray"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}

            <AppButton type="submit" loading={isSubmitting}>
              Connexion Admin →
            </AppButton>

            <p className="text-center text-xs text-gray-400 mt-4">
              <a href="/login" className="text-afrilink-green font-medium hover:underline">
                Retour à la connexion utilisateur
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
