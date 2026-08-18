import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AppInput } from '@/components/common/input';
import { AppButton } from '@/components/common/button';
import { SocialButtons } from '@/components/auth/social-buttons';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';

const schema = z.object({
  email: z.string().min(1, 'Ce champ est requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
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
      const response = await authService.loginOrAdmin(data.email, data.password);
      const { access_token, refresh_token, role } = response.data;
      if (access_token) {
        authStorage.setToken(access_token);
      }
      if (refresh_token) {
        authStorage.setRefreshToken(refresh_token);
      }
      authStorage.setRole(role);

      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } }; message?: string };
      const msg = err?.response?.data?.message || err?.message || 'Identifiants incorrects';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-xl font-semibold mb-1">Connexion</h1>
      <p className="text-sm text-afrilink-gray mb-6">
        Ravi de vous revoir sur l'écosystème financier de nouvelle génération
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="w-full space-y-1">
          <AppInput
            label="Adresse email"
            icon={Mail}
            type="email"
            placeholder="naouel@entreprise.com"
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

        <div className="text-right">
          <a
            href="/forgot-password"
            className="text-sm text-afrilink-green font-medium hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>

        {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}

        <AppButton type="submit" loading={isSubmitting}>
          Se connecter →
        </AppButton>

        <p className="text-center text-sm text-gray-500 mt-4">
          Pas encore inscrit ?{' '}
          <a href="/signup" className="text-afrilink-green font-medium">
            S'inscrire
          </a>
        </p>

        <SocialButtons />
      </form>
    </AuthLayout>
  );
}
