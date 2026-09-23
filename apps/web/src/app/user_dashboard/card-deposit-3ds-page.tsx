import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, RefreshCcw, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { useCardDepositFlow } from '../../context/card-deposit-flow-context';

const RESEND_TIMEOUT = 45;

export default function CardDeposit3dsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { goToProcessing } = useCardDepositFlow();
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleResend = useCallback(() => {
    setCountdown(RESEND_TIMEOUT);
    setResent(true);
    setTimeout(() => setResent(false), 2000);
  }, []);

  const handleSubmit = () => {
    const code = otpDigits.join('');
    if (code.length !== 6 || submitting) return;
    setSubmitting(true);
    goToProcessing();
    navigate('/deposit/card/processing');
    setSubmitting(false);
  };

  const handleSkip = () => {
    goToProcessing();
    navigate('/deposit/card/processing');
  };

  const isComplete = otpDigits.every((d) => d !== '');

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
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">{t('cardDeposit.threeDsTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {t('cardDeposit.threeDsDescription')}
        </p>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-allness-dark">{t('cardDeposit.myBank')}</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">Verified by VISA</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-base font-semibold text-allness-dark mb-2">
                {t('cardDeposit.authRequired')}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                {t('cardDeposit.authMessage')}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {t('cardDeposit.otpSentTo')} +237 6XX XXX XXX
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  name={`otp-${i}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={1}
                  className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-allness-orange/30 focus:border-allness-orange transition-all text-allness-dark"
                />
              ))}
            </div>

            <div className="text-center mb-6">
              {countdown > 0 ? (
                <span className="text-xs text-gray-400">
                  {t('cardDeposit.resendCode')} ({countdown}s)
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-xs text-allness-green font-medium hover:underline flex items-center gap-1 mx-auto"
                >
                  <RefreshCcw className="w-3 h-3" />
                  {t('cardDeposit.resendCode')}
                </button>
              )}
              {resent && (
                <p className="text-[11px] text-allness-green mt-1">{t('cardDeposit.codeResent')}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isComplete || submitting}
              className="w-full h-12 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('cardDeposit.validating')}
                </>
              ) : (
                t('cardDeposit.validatePayment')
              )}
            </button>

            <button
              onClick={handleSkip}
              className="w-full h-11 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {t('cardDeposit.cancel')}
            </button>

            <p className="text-[11px] text-gray-400 text-center mt-4">
              {t('cardDeposit.noCodeHelp')}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
