import { createContext, useContext, useState, useCallback } from "react";

export type MobileMoneyOperator = "mtn" | "orange";

export interface DepositState {
  operator: MobileMoneyOperator;
  phoneNumber: string;
  amount: string;
  description: string;
  reference: string;
  transactionId: string;
  createdAt: Date | null;
}

interface DepositContextValue {
  deposit: DepositState;
  setOperator: (operator: MobileMoneyOperator) => void;
  setPhoneNumber: (phone: string) => void;
  setAmount: (amount: string) => void;
  setDescription: (description: string) => void;
  submitDepositRequest: () => void;
  reset: () => void;
}

const INITIAL_STATE: DepositState = {
  operator: "mtn",
  phoneNumber: "",
  amount: "",
  description: "",
  reference: "",
  transactionId: "",
  createdAt: null,
};

const DepositContext = createContext<DepositContextValue | null>(null);

export function DepositFlowProvider({ children }: { children: React.ReactNode }) {
  const [deposit, setDeposit] = useState<DepositState>(INITIAL_STATE);

  const setOperator = useCallback((operator: MobileMoneyOperator) => {
    setDeposit((d) => ({ ...d, operator }));
  }, []);

  const setPhoneNumber = useCallback((phoneNumber: string) => {
    setDeposit((d) => ({ ...d, phoneNumber }));
  }, []);

  const setAmount = useCallback((amount: string) => {
    setDeposit((d) => ({ ...d, amount }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setDeposit((d) => ({ ...d, description }));
  }, []);

  // Appelé au clic sur "Recevoir une demande de confirmation" :
  // à brancher sur POST /wallets/deposits (initiateDeposit côté API).
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
      value={{ deposit, setOperator, setPhoneNumber, setAmount, setDescription, submitDepositRequest, reset }}
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
