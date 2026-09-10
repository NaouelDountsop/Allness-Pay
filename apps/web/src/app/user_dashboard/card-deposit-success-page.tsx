import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Eye, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { useCardDepositFlow } from '../../context/card-deposit-flow-context';
import { CURRENCY_SYMBOLS, type Currency } from '../../context/deposit-flow.constants';

function formatDate(date: Date | null) {
  if (!date) return '—';
  return (
    date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' à ' +
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function CardDepositSuccessPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, reset } = useCardDepositFlow();

  const handleBackToWallet = () => {
    reset();
    navigate('/dashboard/wallet');
  };

  const handleViewTransaction = () => {
    reset();
    navigate('/dashboard/transactions');
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
            {/* <ArrowRight className="w-5 h-5 text-allness-orange rotate-180" /> */}
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">{t('cardDeposit.successTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {t('cardDeposit.successDescription')}
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-10">
          <div className="flex justify-center mb-6">
            <span className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-11 h-11 text-allness-green" />
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-allness-dark mb-1">
              {t('cardDeposit.depositSuccessful')}
            </h2>
            <p className="text-sm text-gray-500">{t('cardDeposit.walletCredited')}</p>
          </div>

          <div className="rounded-xl border border-gray-100 p-5 mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              {t('cardDeposit.transactionDetails')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('cardDeposit.amountDeposited')}</span>
                <span className="text-sm font-bold text-allness-dark">
                  {new Intl.NumberFormat('fr-FR').format(Number(state.amount))} {CURRENCY_SYMBOLS[state.currency as Currency] || state.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('cardDeposit.transactionFees')}</span>
                <span className="text-sm font-medium text-allness-dark">0 {CURRENCY_SYMBOLS[state.currency as Currency] || state.currency}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('cardDeposit.amountCredited')}</span>
                <span className="text-sm font-bold text-allness-green">
                  {new Intl.NumberFormat('fr-FR').format(Number(state.amount))} {CURRENCY_SYMBOLS[state.currency as Currency] || state.currency}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('cardDeposit.reference')}</span>
                <span className="text-xs font-mono text-allness-dark">{state.transactionId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('cardDeposit.date')}</span>
                <span className="text-xs text-allness-dark">{formatDate(state.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-green-50 border border-green-100 p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] text-green-700 mb-1">{t('cardDeposit.amountDeposited')}</p>
              <p className="text-lg font-bold text-allness-dark">
                {new Intl.NumberFormat('fr-FR').format(Number(state.amount))} {CURRENCY_SYMBOLS[state.currency as Currency] || state.currency || 'XAF'}
              </p>
            </div>
            <Eye className="w-4 h-4 text-green-600" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleBackToWallet}
              className="h-12 rounded-lg bg-allness-green text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              {t('cardDeposit.viewWallet')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleViewTransaction}
              className="h-11 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              {t('cardDeposit.viewTransaction')}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-lg shrink-0">ℹ</span>
            <div>
              <p className="text-xs text-blue-800 leading-relaxed">
                {t('cardDeposit.remarkMessage')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
