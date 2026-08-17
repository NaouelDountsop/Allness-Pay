import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, CheckCircle2, XCircle, Loader2, ArrowLeft, Wallet, Smartphone } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { useDepositFlow } from '../../context/deposit-flow-context';
import { campayService } from '@/lib/api/campay.service';

const VERIFY_INTERVAL = 3000;
const MAX_ATTEMPTS = 20;

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { deposit } = useDepositFlow();
  const isBank = deposit.method === 'bank';
  const steps = isBank
    ? [t('processing.stepBankRecorded'), t('processing.stepBankVerify'), t('processing.stepBankConfirm')]
    : [t('processing.stepRequest'), t('processing.stepVerification'), t('processing.stepOperator')];

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [stepIndex, setStepIndex] = useState(0);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (isBank || !deposit.transactionId) return;

    const interval = setInterval(() => {
      attemptsRef.current += 1;

      campayService.verifyPayment(deposit.transactionId).then((res) => {
        if (res.status === 'completed') {
          clearInterval(interval);
          setStatus('success');
        } else if (res.status === 'failed') {
          clearInterval(interval);
          setStatus('failed');
        } else {
          setStepIndex((i) => Math.min(i + 1, steps.length - 1));
          if (attemptsRef.current >= MAX_ATTEMPTS) {
            clearInterval(interval);
            setStatus('failed');
          }
        }
      }).catch(() => {
        setStepIndex((i) => Math.min(i + 1, steps.length - 1));
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus('failed');
        }
      });
    }, VERIFY_INTERVAL);

    return () => clearInterval(interval);
  }, [deposit.transactionId, isBank, steps.length]);

  useEffect(() => {
    if (!isBank) return;
    const timer = setTimeout(() => setStatus('success'), 5000);
    return () => clearTimeout(timer);
  }, [isBank]);

  const handleGoToWallet = () => {
    navigate('/dashboard/wallet');
  };

  const isDone = (i: number) => status === 'success' || i < stepIndex;
  const isCurrent = (i: number) => status === 'success' || status === 'failed' ? false : i === stepIndex;

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-afrilink-orange/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-afrilink-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark">{t('processing.pageTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {isBank
            ? t('processing.descriptionBank')
            : t('processing.descriptionMobile')}
        </p>

        {/* Banner USSD - style KYC banner */}
        {!isBank && status === 'verifying' && (
          <div className="mb-4 sm:mb-6 rounded-xl bg-orange-50 border border-orange-300 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-900 mb-0.5">
                  {t('processing.ussdBannerTitle')}
                </p>
                <p className="text-xs text-orange-700 leading-relaxed">
                  {t('processing.ussdBannerDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-orange-600 shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {t('processing.ussdBannerWaiting')}
            </div>
          </div>
        )}

        {/* Banner succès */}
        {status === 'success' && (
          <div className="mb-4 sm:mb-6 rounded-xl bg-green-50 border border-green-300 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900 mb-0.5">
                  {t('processing.successBannerTitle')}
                </p>
                <p className="text-xs text-green-700 leading-relaxed">
                  {t('processing.successMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Banner échec */}
        {status === 'failed' && (
          <div className="mb-4 sm:mb-6 rounded-xl bg-red-50 border border-red-300 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900 mb-0.5">
                  {t('processing.failedBannerTitle')}
                </p>
                <p className="text-xs text-red-700 leading-relaxed">
                  {t('processing.failedMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-10">
          <div className="flex justify-center mb-8">
            <span className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
              {status === 'success' ? (
                <CheckCircle2 className="w-10 h-10 text-afrilink-green" />
              ) : status === 'failed' ? (
                <XCircle className="w-10 h-10 text-red-500" />
              ) : (
                <RefreshCcw className="w-10 h-10 text-afrilink-green animate-spin [animation-duration:2.5s]" />
              )}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 p-5 mb-6">
            <p className="text-xs font-semibold text-afrilink-dark mb-4">
              {t('processing.statusTitle')}
            </p>
            <div className="flex flex-col gap-3">
              {steps.map((label, i) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{label}</span>
                  {isDone(i) ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-afrilink-green">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('processing.statusDone')}
                    </span>
                  ) : isCurrent(i) ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-afrilink-orange">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t('processing.statusInProgress')}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-300">{t('processing.statusPending')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGoToWallet}
            className="w-full h-12 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity
              bg-afrilink-green text-white hover:opacity-90"
          >
            <Wallet className="w-4 h-4" />
            {t('processing.goToWallet')}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
