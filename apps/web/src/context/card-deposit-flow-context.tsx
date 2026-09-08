import { createContext, useContext, useState, useCallback } from 'react';

export type CardDepositStep = 'initiation' | 'redirect' | 'card-info' | 'processing' | 'success';

export interface CardDepositState {
  amount: string;
  description: string;
  walletNumber: string;
  currency: string;
  step: CardDepositStep;
  clientSecret: string;
  paymentIntentId: string;
  transactionId: string;
  stripeError: string | null;
  createdAt: Date | null;
}

interface CardDepositContextValue {
  state: CardDepositState;
  setAmount: (amount: string) => void;
  setDescription: (description: string) => void;
  setWalletNumber: (walletNumber: string) => void;
  setCurrency: (currency: string) => void;
  setStep: (step: CardDepositStep) => void;
  setPaymentIntentData: (data: {
    clientSecret: string;
    paymentIntentId: string;
    transactionId: string;
  }) => void;
  setStripeError: (error: string | null) => void;
  goToCardInfo: () => void;
  goToProcessing: () => void;
  goToSuccess: () => void;
  reset: () => void;
}

const INITIAL_STATE: CardDepositState = {
  amount: '',
  description: '',
  walletNumber: '',
  currency: 'XAF',
  step: 'initiation',
  clientSecret: '',
  paymentIntentId: '',
  transactionId: '',
  stripeError: null,
  createdAt: null,
};

const CardDepositContext = createContext<CardDepositContextValue | null>(null);

export function CardDepositFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CardDepositState>(INITIAL_STATE);

  const setAmount = useCallback((amount: string) => {
    setState((s) => ({ ...s, amount }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setState((s) => ({ ...s, description }));
  }, []);

  const setWalletNumber = useCallback((walletNumber: string) => {
    setState((s) => ({ ...s, walletNumber }));
  }, []);

  const setCurrency = useCallback((currency: string) => {
    setState((s) => ({ ...s, currency }));
  }, []);

  const setStep = useCallback((step: CardDepositStep) => {
    setState((s) => ({ ...s, step }));
  }, []);

  const setPaymentIntentData = useCallback(
    (data: { clientSecret: string; paymentIntentId: string; transactionId: string }) => {
      setState((s) => ({
        ...s,
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        transactionId: data.transactionId,
      }));
    },
    [],
  );

  const setStripeError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, stripeError: error }));
  }, []);

  const goToCardInfo = useCallback(() => {
    setState((s) => ({ ...s, step: 'redirect' }));
  }, []);

  const goToProcessing = useCallback(() => {
    setState((s) => ({ ...s, step: 'processing', createdAt: new Date() }));
  }, []);

  const goToSuccess = useCallback(() => {
    setState((s) => ({ ...s, step: 'success' }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return (
    <CardDepositContext.Provider
      value={{
        state,
        setAmount,
        setDescription,
        setWalletNumber,
        setCurrency,
        setStep,
        setPaymentIntentData,
        setStripeError,
        goToCardInfo,
        goToProcessing,
        goToSuccess,
        reset,
      }}
    >
      {children}
    </CardDepositContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCardDepositFlow() {
  const ctx = useContext(CardDepositContext);
  if (!ctx) throw new Error('useCardDepositFlow doit être utilisé sous <CardDepositFlowProvider>');
  return ctx;
}
