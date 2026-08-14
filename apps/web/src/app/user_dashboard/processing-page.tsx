import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, CheckCircle2, XCircle, Loader2, Info, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { useDepositFlow } from '../../context/deposit-flow-context';
import { tranzakService } from '@/lib/api/tranzak.service';

const MOBILE_MONEY_STEPS = [
  'Requête envoyée à Tranzak',
  'Vérification Tranzak',
  'Confirmation opérateur',
];

const BANK_STEPS = [
  'Virement enregistré',
  'Vérification bancaire',
  'Confirmation réception',
];

const VERIFY_INTERVAL = 3000;
const MAX_ATTEMPTS = 20;

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { deposit, reset } = useDepositFlow();
  const isBank = deposit.method === 'bank';
  const steps = isBank ? BANK_STEPS : MOBILE_MONEY_STEPS;

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [stepIndex, setStepIndex] = useState(0);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (isBank || !deposit.transactionId) return;

    const interval = setInterval(() => {
      attemptsRef.current += 1;

      tranzakService.verifyPayment(deposit.transactionId).then((res) => {
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

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => { reset(); navigate('/dashboard/wallet'); }, 1500);
      return () => clearTimeout(t);
    }
    if (status === 'failed') {
      const t = setTimeout(() => { reset(); navigate('/deposit'); }, 3000);
      return () => clearTimeout(t);
    }
  }, [status, navigate, reset]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark">Traitement en cours</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {isBank
            ? 'Nous vérifions la réception de votre virement bancaire. Veuillez patienter quelques instants.'
            : 'Nous vérifions votre paiement auprès de Tranzak et de votre opérateur. Veuillez patienter quelques instants.'}
        </p>

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

          {status === 'success' && (
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-center mb-6">
              <p className="text-sm font-medium text-green-600">
                Paiement confirmé ! Votre wallet a été crédité.
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-center mb-6">
              <p className="text-sm font-medium text-red-600">
                Le paiement a échoué. Vous allez être redirigé.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 p-5 mb-6">
            <p className="text-xs font-semibold text-afrilink-dark mb-4">
              Vérification de la transaction
            </p>
            <div className="flex flex-col gap-3">
              {steps.map((label, i) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{label}</span>
                  {isDone(i) ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-afrilink-green">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complétée
                    </span>
                  ) : isCurrent(i) ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-afrilink-orange">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      En cours...
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-300">En attente</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed">
              {isBank
                ? 'Ne fermez pas cette page. La vérification bancaire peut prendre quelques minutes.'
                : 'Ne fermez pas cette page. La confirmation peut prendre quelques secondes.'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
