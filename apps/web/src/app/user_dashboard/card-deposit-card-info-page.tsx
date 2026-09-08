import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CardNumberElement } from '@stripe/react-stripe-js';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { PaymentCardForm } from '@/components/stripe/payment-card-form';
import { useCardDepositFlow } from '../../context/card-deposit-flow-context';
import { stripeService } from '@/lib/api/stripe.service';
import { walletService } from '@/lib/api/wallet.service';
import { CURRENCY_SYMBOLS, type Currency } from '../../context/deposit-flow.constants';

export default function CardDepositCardInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const {
    state,
    setAmount,
    setDescription,
    setWalletNumber,
    setCurrency,
    setPaymentIntentData,
    setStripeError,
    goToProcessing,
  } = useCardDepositFlow();

  const [holderName, setHolderName] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const routeState = location.state as {
    amount?: string;
    description?: string;
    walletNumber?: string;
    currency?: string;
  } | null;

  const amount = state.amount || routeState?.amount || '0';

  useEffect(() => {
    if (routeState?.amount && !state.amount) {
      setAmount(routeState.amount);
    }
    if (routeState?.description && !state.description) {
      setDescription(routeState.description);
    }
    if (routeState?.walletNumber && !state.walletNumber) {
      setWalletNumber(routeState.walletNumber);
    }
    if (routeState?.currency && routeState.currency !== state.currency) {
      setCurrency(routeState.currency);
    }
    if (!routeState?.walletNumber && !state.walletNumber) {
      walletService.getPrimary().then((w) => {
        if (w?.walletNumber) setWalletNumber(w.walletNumber);
        if (w?.currency) setCurrency(w.currency);
      });
    }
  }, [routeState, state.amount, state.description, state.walletNumber, state.currency, setAmount, setDescription, setWalletNumber, setCurrency]);

  const handleCardError = (message: string) => {
    setErrorMessage(message);
    setStripeError(message);
  };

  const handleSubmit = async () => {
    if (!stripe || !elements || submitting) return;

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const paymentIntent = await stripeService.createPaymentIntent({
        walletNumber: state.walletNumber || routeState?.walletNumber || '',
        amount,
        currency: state.currency || routeState?.currency || 'XAF',
        description: state.description || routeState?.description,
      });

      setPaymentIntentData({
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        transactionId: paymentIntent.transactionId,
      });

      // Diagnostic logs: vérifier que le backend renvoie bien un id Stripe (commence par "pi_")
      // et non un UUID interne. Utile pour déboguer les erreurs "No such payment_intent".
      // Ne pas laisser ces logs en production.
      // eslint-disable-next-line no-console
      console.log('createPaymentIntent response', paymentIntent);
      if (!paymentIntent.paymentIntentId || !paymentIntent.paymentIntentId.startsWith('pi_')) {
     
        console.warn('Identifiant Stripe inattendu reçu pour paymentIntentId:', paymentIntent.paymentIntentId, 'transactionId:', paymentIntent.transactionId);
      }

      const { error } = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: holderName },
        },
      });

      if (error) {
       
        console.warn('[Stripe] confirmCardPayment error (navigating to processing anyway):', error.message);
      }

      // Always navigate to processing — even if confirmCardPayment returns an error.
      // The webhook may still confirm the payment (e.g. 3D Secure redirects, bank delays).
      // The processing page polls both Stripe and the local DB for the real status.
      goToProcessing();
      navigate('/deposit/card/processing');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de paiement';
      setErrorMessage(message);
      setStripeError(message);
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">{t('cardDeposit.cardInfoTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {t('cardDeposit.cardInfoDescription')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <PaymentCardForm
                holderName={holderName}
                onHolderNameChange={setHolderName}
                onCardChange={setCardComplete}
                onError={handleCardError}
              />

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs text-red-600">{errorMessage}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!stripe || !elements || !cardComplete || !holderName.trim() || submitting}
                className="w-full h-14 rounded-2xl bg-allness-green hover:bg-allness-greenHover text-white text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('cardDeposit.processing')}
                  </>
                ) : (
                  <>
                    {t('cardDeposit.pay')} {new Intl.NumberFormat('fr-FR').format(Number(amount))} {CURRENCY_SYMBOLS[(state.currency || routeState?.currency || 'XAF') as Currency] || state.currency || 'XAF'}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                {t('cardDeposit.paymentDetails')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('cardDeposit.merchant')}</span>
                  <span className="text-xs font-medium text-allness-dark">Allness Pay</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('cardDeposit.description')}</span>
                  <span className="text-xs font-medium text-allness-dark">{state.description || routeState?.description || t('cardDeposit.cardDepositDefault')}</span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('cardDeposit.totalAmount')}</span>
                  <span className="text-sm font-bold text-allness-dark">
                    {Number(amount) > 0
                      ? `${new Intl.NumberFormat('fr-FR').format(Number(amount))} ${CURRENCY_SYMBOLS[(state.currency || routeState?.currency || '') as Currency] || state.currency || 'XAF'}`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
