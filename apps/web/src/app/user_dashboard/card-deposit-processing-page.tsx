import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Wallet } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { useCardDepositFlow } from '../../context/card-deposit-flow-context';
import { stripeService } from '@/lib/api/stripe.service';

const STEPS_KEYS = ['authorization', 'verification', 'confirmation'] as const;
const POLL_INTERVAL = 2000;
const MAX_ATTEMPTS = 20;

export default function CardDepositProcessingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, goToSuccess } = useCardDepositFlow();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!state.paymentIntentId) {
      setStatus('failed');
      return;
    }

    // Defensive diagnostic: if paymentIntentId in state is not a Stripe id (pi_...), warn and fail early.
    if (!state.paymentIntentId.startsWith('pi_')) {
      // eslint-disable-next-line no-console
      console.warn('paymentIntentId invalide dans le state:', state.paymentIntentId);
      setStatus('failed');
      return;
    }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;

      if (attempts <= 3) {
        setStepIndex(Math.min(attempts, 2));
      }

      try {
        const result = await stripeService.getPaymentStatus(state.paymentIntentId);
        if (result.status === 'succeeded') {
          clearInterval(interval);
          setStepIndex(2);
          setStatus('success');
          goToSuccess();
          navigate('/deposit/card/success');
          return;
        }
        if (result.status === 'requires_payment_method' || result.status === 'canceled' || result.status === 'failed') {
          clearInterval(interval);
          setStatus('failed');
          return;
        }
      } catch {
        // Polling error — will retry
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        setStatus('failed');
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [state.paymentIntentId, goToSuccess, navigate]);

  const steps = STEPS_KEYS.map((key) => t(`cardDeposit.step${key.charAt(0).toUpperCase() + key.slice(1)}`));

  const isDone = (i: number) => status === 'success' || i < stepIndex;
  const isCurrent = (i: number) =>
    status === 'success' || status === 'failed' ? false : i === stepIndex;

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-allness-orange/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-allness-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">{t('cardDeposit.processingTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {t('cardDeposit.processingDescription')}
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-10">
          <div className="flex justify-center mb-8">
            <span className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
              {status === 'success' ? (
                <CheckCircle2 className="w-10 h-10 text-allness-green" />
              ) : status === 'failed' ? (
                <XCircle className="w-10 h-10 text-red-500" />
              ) : (
                <Loader2 className="w-10 h-10 text-allness-green animate-spin [animation-duration:2.5s]" />
              )}
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-allness-dark mb-2">
              {status === 'failed'
                ? t('cardDeposit.paymentFailed')
                : t('cardDeposit.paymentInProgress')}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              {status === 'failed'
                ? t('cardDeposit.paymentFailedMessage')
                : t('cardDeposit.paymentInProgressMessage')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone(i)
                    ? 'bg-allness-green text-white'
                    : isCurrent(i)
                      ? 'bg-allness-orange text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {isDone(i) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent(i) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${
                  isDone(i) ? 'text-allness-green' : isCurrent(i) ? 'text-allness-orange' : 'text-gray-400'
                }`}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 rounded-full ${
                    isDone(i) ? 'bg-allness-green' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard/wallet')}
            className="w-full h-12 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity bg-allness-green text-white hover:opacity-90"
          >
            <Wallet className="w-4 h-4" />
            {t('cardDeposit.goToWallet')}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
