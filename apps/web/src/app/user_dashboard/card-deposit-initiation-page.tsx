import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { useCardDepositFlow } from '../../context/card-deposit-flow-context';
import { CURRENCY_SYMBOLS, type Currency } from '../../context/deposit-flow.constants';

export default function CardDepositInitiationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { state, setAmount, setDescription, goToCardInfo } = useCardDepositFlow();
  const [submitting, setSubmitting] = useState(false);

  const routeState = location.state as { amount?: string; description?: string; currency?: string } | null;

  useEffect(() => {
    if (routeState?.amount) {
      setAmount(routeState.amount);
    }
    if (routeState?.description) {
      setDescription(routeState.description);
    }
  }, [routeState, setAmount, setDescription]);

  const displayAmount = state.amount || routeState?.amount || '';
  const canSubmit = Number(displayAmount) > 0;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    goToCardInfo();
    navigate('/deposit/card/redirect');
    setSubmitting(false);
  };

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
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">{t('cardDeposit.initiationTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {t('cardDeposit.initiationDescription')}
        </p>

        <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <span className="inline-block h-2 w-2 rounded-full bg-allness-orange" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-400">
                {t('cardDeposit.depositMethod')}
              </span>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 gap-3">
                <div className="relative flex items-center gap-3 p-4 rounded-xl border-2 border-allness-green bg-allness-green/5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-allness-green/10 text-allness-green">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-allness-dark">{t('cardDeposit.bankCard')}</span>
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-allness-green" />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-6">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  {t('cardDeposit.secureMessage')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-allness-dark text-white px-5 py-4 mb-6">
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wide mb-2">
                {t('cardDeposit.summary')}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{t('cardDeposit.summaryAmount')}</span>
                <span className="font-bold text-allness-orange">
                  {Number(displayAmount) > 0
                    ? `${new Intl.NumberFormat('fr-FR').format(Number(displayAmount))} ${CURRENCY_SYMBOLS[(routeState?.currency || 'XAF') as Currency] || 'XAF'}`
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className="text-white/60">{t('cardDeposit.summaryMethod')}</span>
                <span className="font-medium text-white">{t('cardDeposit.bankCard')}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full h-14 rounded-2xl bg-allness-green hover:bg-allness-greenHover text-white text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('cardDeposit.submitting')}
                </>
              ) : (
                <>
                  {t('cardDeposit.confirmByCard')}
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
