import { createContext, useContext, useState, useCallback } from 'react';
import { campayService } from '@/lib/api/campay.service';
import {
  type MobileMoneyOperator,
  type DepositMethod,
  type Currency,
  CURRENCY_SYMBOLS,
  BANK_LABELS,
} from './deposit-flow.constants';

export { type MobileMoneyOperator, type DepositMethod, type Currency, CURRENCY_SYMBOLS, BANK_LABELS };

const PENDING_DEPOSIT_KEY = 'afrilinkpay-pending-deposit';

export function savePendingDeposit(deposit: DepositState) {
  localStorage.setItem(PENDING_DEPOSIT_KEY, JSON.stringify(deposit));
}

export function getPendingDeposit(): DepositState | null {
  const raw = localStorage.getItem(PENDING_DEPOSIT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DepositState;
  } catch {
    return null;
  }
}

export function clearPendingDeposit() {
  localStorage.removeItem(PENDING_DEPOSIT_KEY);
}

export type DepositStatus = 'idle' | 'submitting' | 'pending' | 'success' | 'failed';

export interface DepositState {
  method: DepositMethod;
  operator: MobileMoneyOperator;
  phoneNumber: string;
  bankName: string;
  iban: string;
  accountHolder: string;
  amount: string;
  currency: Currency;
  description: string;
  reference: string;
  transactionId: string;
  createdAt: Date | null;
  walletNumber: string;
  status: DepositStatus;
  error: string | null;
}

interface DepositContextValue {
  deposit: DepositState;
  setMethod: (method: DepositMethod) => void;
  setOperator: (operator: MobileMoneyOperator) => void;
  setPhoneNumber: (phone: string) => void;
  setBankName: (bankName: string) => void;
  setIban: (iban: string) => void;
  setAccountHolder: (accountHolder: string) => void;
  setAmount: (amount: string) => void;
  setCurrency: (currency: Currency) => void;
  setDescription: (description: string) => void;
  setWalletNumber: (walletNumber: string) => void;
  submitDepositRequest: () => Promise<boolean>;
  reset: () => void;
}

const INITIAL_STATE: DepositState = {
  method: 'mobile_money',
  operator: 'mtn',
  phoneNumber: '',
  bankName: '',
  iban: '',
  accountHolder: '',
  amount: '',
  currency: 'XAF',
  description: '',
  reference: '',
  transactionId: '',
  createdAt: null,
  walletNumber: '',
  status: 'idle',
  error: null,
};

const DepositContext = createContext<DepositContextValue | null>(null);

export function DepositFlowProvider({ children }: { children: React.ReactNode }) {
  const [deposit, setDeposit] = useState<DepositState>(INITIAL_STATE);

  const setMethod = useCallback((method: DepositMethod) => {
    setDeposit((d) => ({ ...d, method }));
  }, []);

  const setOperator = useCallback((operator: MobileMoneyOperator) => {
    setDeposit((d) => ({ ...d, operator }));
  }, []);

  const setPhoneNumber = useCallback((phoneNumber: string) => {
    setDeposit((d) => ({ ...d, phoneNumber }));
  }, []);

  const setBankName = useCallback((bankName: string) => {
    setDeposit((d) => ({ ...d, bankName }));
  }, []);

  const setIban = useCallback((iban: string) => {
    setDeposit((d) => ({ ...d, iban }));
  }, []);

  const setAccountHolder = useCallback((accountHolder: string) => {
    setDeposit((d) => ({ ...d, accountHolder }));
  }, []);

  const setAmount = useCallback((amount: string) => {
    setDeposit((d) => ({ ...d, amount }));
  }, []);

  const setCurrency = useCallback((currency: Currency) => {
    setDeposit((d) => ({ ...d, currency }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setDeposit((d) => ({ ...d, description }));
  }, []);

  const setWalletNumber = useCallback((walletNumber: string) => {
    setDeposit((d) => ({ ...d, walletNumber }));
  }, []);

  const submitDepositRequest = useCallback(async (): Promise<boolean> => {
    clearPendingDeposit();

    if (deposit.method === 'bank') {
      const pending = { ...deposit, reference: crypto.randomUUID(), status: 'pending' as const, createdAt: new Date() };
      setDeposit(pending);
      savePendingDeposit(pending);
      return true;
    }

    setDeposit((d) => ({ ...d, status: 'submitting', error: null }));

    try {
      const phone = deposit.phoneNumber.replace(/[+\s]/g, '');
      const phoneWithPrefix = phone.startsWith('237') ? phone : `237${phone}`;

      const response = await campayService.initiatePayment({
        walletNumber: deposit.walletNumber,
        amount: deposit.amount,
        phone_number: phoneWithPrefix,
        description: deposit.description || 'Dépôt AllnessPay',
      });

      const pending = {
        ...deposit,
        transactionId: response.transactionId,
        reference: response.transactionId,
        status: 'pending' as const,
        createdAt: new Date(),
      };
      setDeposit(pending);
      savePendingDeposit(pending);
      return true;
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Une erreur est survenue lors de la initiation du paiement.';
      setDeposit((d) => ({ ...d, status: 'idle', error: message }));
      return false;
    }
  }, [deposit.method, deposit.walletNumber, deposit.amount, deposit.phoneNumber, deposit.description]);

  const reset = useCallback(() => {
    setDeposit(INITIAL_STATE);
    clearPendingDeposit();
  }, []);

  return (
    <DepositContext.Provider
      value={{
        deposit,
        setMethod,
        setOperator,
        setPhoneNumber,
        setBankName,
        setIban,
        setAccountHolder,
        setAmount,
        setCurrency,
        setDescription,
        setWalletNumber,
        submitDepositRequest,
        reset,
      }}
    >
      {children}
    </DepositContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDepositFlow() {
  const ctx = useContext(DepositContext);
  if (!ctx) throw new Error('useDepositFlow doit être utilisé sous <DepositFlowProvider>');
  return ctx;
}
