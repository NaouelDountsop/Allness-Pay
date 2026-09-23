import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { useCardDepositFlow } from '../../context/card-deposit-flow-context';

export default function CardDepositRedirectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { state, setStep } = useCardDepositFlow();
  const routeState = location.state as { amount?: string; description?: string; currency?: string; walletNumber?: string } | null;

  useEffect(() => {
    if (state.step !== 'redirect') {
      setStep('redirect');
    }
    const timer = setTimeout(() => {
      navigate('/deposit/card/card-info', { state: routeState });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate, setStep, state.step, routeState]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">{t('cardDeposit.redirectTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {t('cardDeposit.redirectDescription')}
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-10">
          <div className="flex justify-center mb-8">
            <span className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
              <Send className="w-10 h-10 text-allness-green animate-pulse" />
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-allness-dark mb-2">
              {t('cardDeposit.redirectingTitle')}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              {t('cardDeposit.redirectingMessage')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <Loader2 className="w-5 h-5 text-allness-green animate-spin" />
            <span className="text-sm font-medium text-allness-green">{t('cardDeposit.redirectInProgress')}</span>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-400">
              {t('cardDeposit.doNotClose')}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
