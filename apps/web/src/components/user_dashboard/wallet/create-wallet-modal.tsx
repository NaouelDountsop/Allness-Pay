import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, ArrowLeft, Check, Loader2, WalletMinimal } from "lucide-react";
import { walletService } from "@/lib/api/wallet.service";
import { kycService } from "@/lib/api/kyc.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CURRENCIES = [
  { code: "XAF", label: "XAF - Franc CFA", symbol: "FCFA" },
  { code: "EUR", label: "EUR - Euro", symbol: "€" },
  { code: "USD", label: "USD - Dollar américain", symbol: "$" },
  { code: "XOF", label: "XOF - Franc CFA (UEMOA)", symbol: "FCFA" },
  { code: "NGN", label: "NGN - Naira", symbol: "₦" },
  { code: "GHS", label: "GHS - Cedi", symbol: "GH₵" },
  { code: "KES", label: "KES - Shilling kényan", symbol: "KSh" },
  { code: "ZAR", label: "ZAR - Rand sud-africain", symbol: "R" },
];

const STEP_LABELS = ["Devise", "Details", "Confirmation"];

export function CreateWalletModal({ open, onOpenChange }: CreateWalletModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currency, setCurrency] = useState("XAF");
  const [label, setLabel] = useState("");

  const queryClient = useQueryClient();

  const { data: kyc } = useQuery({
    queryKey: ["kyc-me"],
    queryFn: kycService.getMine,
    retry: false,
  });

  const kycApproved = kyc?.status === "APPROVED";

  const createMutation = useMutation({
    mutationFn: walletService.create,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setStep(1);
    setCurrency("XAF");
    setLabel("");
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
  const currencySymbol = selectedCurrency?.symbol ?? "FCFA";
  const canProceed = step === 1 ? !!currency : step === 2 ? label.trim().length >= 2 : true;

  const handleConfirm = () => {
    createMutation.mutate({
      currency,
      label: label.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogClose
          onOpenChange={(v) => {
            if (!v) resetForm();
            onOpenChange(v);
          }}
        />

        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-afrilink-green/10 flex items-center justify-center">
                <WalletMinimal className="w-4 h-4 text-afrilink-green" />
              </span>
              Nouveau portefeuille
            </div>
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Choisissez la devise de votre nouveau portefeuille."
              : step === 2
                ? "Ajoutez un libellé pour identifier ce portefeuille."
                : "Vérifiez les informations avant la création."}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-start my-4 px-2">
          {[1, 2, 3].map((s, i) => {
            const isDone = step > s;
            const isActive = step === s;
            const isLast = i === 2;

            return (
              <div key={s} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 min-w-[56px] sm:min-w-[84px]">
                  <div
                    className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shrink-0"
                    style={{
                      backgroundColor: isDone || isActive ? '#D28E2F' : 'transparent',
                      color: isDone || isActive ? '#082B37' : 'rgba(0,0,0,0.3)',
                      border: isDone || isActive ? 'none' : '2px solid rgba(0,0,0,0.2)',
                      boxShadow: isActive ? '0 0 0 4px rgba(210,142,47,0.2)' : 'none',
                    }}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} /> : s}
                  </div>
                  <span
                    className="text-[9px] sm:text-xs md:text-sm text-center leading-tight whitespace-nowrap transition-colors duration-300 px-0.5"
                    style={{
                      color: isActive ? '#082B37' : isDone ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.3)',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {STEP_LABELS[i]}
                  </span>
                </div>

                {!isLast && (
                  <div
                    className="flex-1 mx-1 sm:mx-1.5 -mt-5 sm:-mt-6"
                    style={{
                      borderTop: '2px dashed rgba(0,0,0,0.25)',
                      minWidth: '20px',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Currency */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              La devise détermine l'unité monétaire de vos transactions.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 text-left transition",
                    currency === c.code
                      ? "border-afrilink-green bg-afrilink-green/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {currency === c.code && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-afrilink-green flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <p className="text-lg font-bold text-afrilink-dark">{c.symbol}</p>
                  <p className="text-xs font-medium text-gray-600 mt-1">{c.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Label */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Libellé du portefeuille</Label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Épargne, Courant, Affaires..."
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afrilink-green/20 focus:border-afrilink-green"
                autoFocus
              />
              <p className="text-[11px] text-gray-400">
                Ce libellé vous aide à reconnaître ce portefeuille (min. 2 caractères).
              </p>
            </div>

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <Wallet className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-600 leading-relaxed">
                {kycApproved
                  ? "Votre KYC est déjà approuvé. Le portefeuille sera créé directement actif."
                  : "Votre portefeuille sera créé en statut Inactif. Il sera automatiquement activé après validation de votre KYC."}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Devise</span>
              <span className="font-medium">
                {currencySymbol} ({currency})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Libellé</span>
              <span className="font-medium">{label || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Statut initial</span>
              <span className={`font-medium ${kycApproved ? 'text-afrilink-green' : 'text-afrilink-orange'}`}>
                {kycApproved ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
              {kycApproved
                ? "Le portefeuille sera actif immédiatement."
                : "Le portefeuille sera activé automatiquement une fois votre KYC approuvé."}
            </p>
          </div>
        )}

        {/* Error */}
        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            Échec de la création. Veuillez réessayer.
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          )}
          {step < 3 ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Annuler
              </Button>
              <Button
                disabled={!canProceed}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="bg-afrilink-green hover:bg-afrilink-greenHover"
              >
                Suivant
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={createMutation.isPending}
                className="bg-afrilink-green hover:bg-afrilink-greenHover"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </span>
                ) : (
                  "Créer le portefeuille"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}