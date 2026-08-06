import { createContext, useContext, useState, useCallback } from "react";

export type MobileMoneyOperator = "mtn" | "orange";
export type DepositMethod = "mobile_money" | "bank";
export type Currency = "XAF" | "EUR" | "USD";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  XAF: "FCFA",
  EUR: "€",
  USD: "$",
};

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
  submitDepositRequest: () => void;
  reset: () => void;
}

const INITIAL_STATE: DepositState = {
  method: "mobile_money",
  operator: "mtn",
  phoneNumber: "",
  bankName: "",
  iban: "",
  accountHolder: "",
  amount: "",
  currency: "XAF",
  description: "",
  reference: "",
  transactionId: "",
  createdAt: null,
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

  const submitDepositRequest = useCallback(() => {
    setDeposit((d) => ({
      ...d,
      reference: crypto.randomUUID(),
      transactionId: crypto.randomUUID(),
      createdAt: new Date(),
    }));
  }, []);

  const reset = useCallback(() => setDeposit(INITIAL_STATE), []);

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
        submitDepositRequest,
        reset,
      }}
    >
      {children}
    </DepositContext.Provider>
  );
}

export function useDepositFlow() {
  const ctx = useContext(DepositContext);
  if (!ctx) throw new Error("useDepositFlow doit être utilisé sous <DepositFlowProvider>");
  return ctx;
}
