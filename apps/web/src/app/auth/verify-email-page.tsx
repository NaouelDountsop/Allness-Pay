import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { authService } from '@/lib/api/auth.service';

const RESEND_DELAY = 58;

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');

  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailFromState = (location.state as { email?: string })?.email || '';
    const queryEmail = new URLSearchParams(location.search).get('email') || '';
    const resolvedEmail = emailFromState || queryEmail;

    if (!resolvedEmail) {
      navigate('/signup', { replace: true });
      return;
    }

    setEmail(resolvedEmail);
  }, [location.search, location.state, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill('');
    pasted.split('').forEach((digit, i) => (next[i] = digit));
    setCode(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Veuillez saisir les 6 chiffres du code');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authService.verifyEmail(email, fullCode);
      navigate('/login');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } }; message?: string };
      const msg =
        err?.response?.data?.message || err?.message || 'Code invalide, veuillez réessayer';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await authService.resendCode(email);
      setCountdown(RESEND_DELAY);
      setCode(Array(6).fill(''));
      inputsRef.current[0]?.focus();
      setError('');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message || 'Impossible de renvoyer le code pour le moment';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  useEffect(() => {
    const emailFromState = (location.state as { email?: string })?.email || '';

    if (!emailFromState) {
      navigate('/signup', { replace: true });
      return;
    }

    setEmail(emailFromState);
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Panneau gauche */}
        <div className="w-full md:w-[45%] bg-gradient-to-b from-allness-dark to-allness-darker text-white p-8 sm:p-10 flex flex-col">
          <div className="flex items-center gap-2 mb-10">
            <img src="/allnesspay_logo1.png" alt="" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold">
              Allness<span className="text-allness-orange">Pay</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight mb-4">
            Sécurité
            <br />
            renforcée.
          </h1>

          <p className="text-sm text-white/70 leading-relaxed mb-10">
            Votre sécurité est notre priorité absolue. Vérifiez votre identité pour accéder à la
            gestion de vos finances mondiales.
          </p>

          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-allness-orange/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-allness-orange" />
              </div>
              <div>
                <p className="text-sm font-semibold">Vérification en 2 étapes</p>
                <p className="text-xs text-white/60">
                  Une couche de sécurité supplémentaire pour protéger votre compte.
                </p>
              </div>
            </div>

            <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4 relative">
              <p className="text-xs text-white/70 italic leading-relaxed">
                "En quelques secondes, mon compte était vérifié. Simple, rapide et rassurant."
              </p>
              <div className="w-2 h-2 rounded-full bg-allness-orange absolute -bottom-1 left-4" />
            </div>
          </div>
        </div>

        {/* Panneau droit */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-bold text-allness-dark mb-3">
            Vérifiez votre adresse e-mail
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Nous avons envoyé un code de vérification à 6 chiffres à{' '}
            <span className="font-medium text-gray-700">{email}</span>. Veuillez le saisir
            ci-dessous pour continuer.
          </p>

          <div className="flex gap-2 sm:gap-3 mb-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-lg border bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                  i === 0
                    ? 'border-allness-orange focus:ring-allness-orange/40'
                    : 'border-allness-orange/50 focus:ring-allness-orange/40'
                }`}
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

          <div className="h-px bg-gray-100 my-4" />

          <p className="text-sm text-gray-500 mb-6">
            Ce n'est pas votre adresse ?{' '}
            <a href="/signup" className="text-blue-600 font-medium hover:underline">
              Modifier l'e-mail
            </a>
          </p>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full h-12 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Vérification...' : 'Vérifier le code'}
          </button>

          <div className="text-center mt-5">
            <button
              onClick={handleResend}
              disabled={countdown > 0}
              className={`text-sm ${
                countdown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-allness-green font-medium hover:underline'
              }`}
            >
              Renvoyer le code
            </button>
            {countdown > 0 && (
              <p className="text-xs text-gray-400 mt-1">Disponible dans {formatTime(countdown)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
