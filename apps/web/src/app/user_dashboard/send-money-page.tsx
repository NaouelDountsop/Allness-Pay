import { useState } from "react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { StepIndicator } from "@/components/user_dashboard/send/step-indicator";
import { BeneficiaryAmountForm } from "@/components/user_dashboard/send/beneficiary-amount-form";
import { ReviewStep } from "@/components/user_dashboard/send/review-step";
import { PinSetupModal } from "@/components/user_dashboard/send/pin-setup-modal";
import { PinConfirmModal } from "@/components/user_dashboard/send/pin-confirm-modal";
import { usePin } from "@/hooks/use-pin";

const steps = [
  { label: "Bénéficiaire" },
  { label: "Montant" },
  { label: "Confirmation" },
  { label: "Révision" },
  { label: "Envoi" },
];

export default function SendMoneyPage() {
  const { hasPin, createPin, verifyPin } = usePin(null);

  const [form, setForm] = useState({
    beneficiaryContact: "",
    senderCountry: "CA",
    country: "CM",
    amount: "",
    receptionMode: "wallet" as string,
  });

  const [completedSteps, setCompletedSteps] = useState([false, false, false, false, false]);
  const [phase, setPhase] = useState<"form" | "review" | "success">("form");
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"toReview" | "toSend" | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      setCompletedSteps((s) => {
        const updated = [...s];
        updated[0] = !!next.beneficiaryContact;
        updated[1] = parseFloat(next.amount) > 0;
        return updated;
      });

      return next;
    });
  };

  const handleFormSubmit = () => {
    // Avancer vers l'étape "Révision" sans exiger le PIN.
    setCompletedSteps((prev) => {
      const updated = [...prev];
      updated[2] = true; // confirmation
      return updated;
    });
    setPhase("review");
  };

  const handleSendClick = () => {
    // Lors de l'envoi, exiger le PIN (ou proposer de le créer si absent)
    setPendingAction("toSend");
    if (!hasPin) {
      setShowPinSetup(true);
    } else {
      setShowPinConfirm(true);
    }
  };

  const handlePinConfirm = (pin: string): boolean => {
    const ok = verifyPin(pin);
    if (!ok) return false;

    setShowPinConfirm(false);
    setCompletedSteps((prev) => {
      const updated = [...prev];
      updated[2] = true;
      if (pendingAction === "toSend") updated[3] = true;
      return updated;
    });

    if (pendingAction === "toReview") {
      setPhase("review");
    } else if (pendingAction === "toSend") {
      setCompletedSteps((prev) => {
        const updated = [...prev];
        updated[4] = true;
        return updated;
      });
      setPhase("success");
    }
    return true;
  };

  const handlePinSetupComplete = (pin: string) => {
    createPin(pin);
    setShowPinSetup(false);
    // Une fois le PIN créé, on demande directement de confirmer la transaction avec
    setShowPinConfirm(true);
  };

  const currentStepIndex = phase === "form" ? (completedSteps[1] ? 1 : 0) : phase === "review" ? 3 : 4;

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-20 md:pb-10">
        <div className="w-full max-w-7xl">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-afrilink-dark mb-2 sm:mb-3 leading-tight">
            Transfert vers le Cameroun
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-5 sm:mb-8">
            Vérifiez les détails de votre transaction avant de confirmer.
          </p>

          {/* Bloc Step Indicator : fond marine plein */}
          <div
            className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6"
            style={{
              backgroundColor: "#082B37",
              boxShadow:
                "0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)",
            }}
          >
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <StepIndicator
                steps={steps}
                currentStep={currentStepIndex}
                completedSteps={completedSteps}
              />
            </div>
          </div>

          {/* Bloc formulaire : carte distincte */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="p-4 sm:p-6 md:p-8">
              {/* Petit en-tête de section pour ancrer visuellement l'étape en cours */}
              <div className="flex items-center gap-2 mb-5 sm:mb-6">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: "#D28E2F" }}
                />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-400">
                  {steps[currentStepIndex]?.label}
                </span>
              </div>

              {phase === "form" && (
                <BeneficiaryAmountForm
                  form={form}
                  onChange={handleChange}
                  onSubmit={handleFormSubmit}
                />
              )}

              {phase === "review" && (
                <ReviewStep
                  beneficiaryContact={form.beneficiaryContact}
                  senderCountryCode={form.senderCountry}
                  countryCode={form.country}
                  receptionMode={form.receptionMode}
                  amount={parseFloat(form.amount) || 0}
                  onSend={handleSendClick}
                  onBack={() => setPhase("form")}
                />  
              )}

              {phase === "success" && (
                <div className="text-center py-8 sm:py-10 px-2">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(210,142,47,0.12)" }}
                  >
                    <span className="text-2xl" style={{ color: "#D28E2F" }}>✓</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-afrilink-green mb-2">
                    Transfert envoyé avec succès !
                  </h2>
                  <p className="text-sm text-gray-500">
                    Le bénéficiaire recevra les fonds sous quelques minutes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPinSetup && (
        <PinSetupModal
          onComplete={handlePinSetupComplete}
          onClose={() => setShowPinSetup(false)}
        />
      )}

      {showPinConfirm && (
        <PinConfirmModal
          onConfirm={handlePinConfirm}
          onClose={() => setShowPinConfirm(false)}
        />
      )}
    </DashboardLayout>
  );
}