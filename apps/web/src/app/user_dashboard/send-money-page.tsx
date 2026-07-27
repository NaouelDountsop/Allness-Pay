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
  const { hasPin, createPin, verifyPin } = usePin();

  const [form, setForm] = useState({
    beneficiaryContact: "",
    senderCountry: "CA",
    country: "CM",
    amount: "",
  });

  const [completedSteps, setCompletedSteps] = useState([false, false, false, false, false]);
  const [phase, setPhase] = useState<"form" | "review" | "success">("form");
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"toReview" | "toSend" | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);

    // Coche l'étape "Bénéficiaire" dès que le contact est rempli
    // Coche l'étape "Montant" dès qu'un montant valide est saisi
    setCompletedSteps((prev) => {
      const updated = [...prev];
      updated[0] = !!next.beneficiaryContact;
      updated[1] = parseFloat(next.amount) > 0;
      return updated;
    });
  };

  const handleFormSubmit = () => {
    // Étape "Confirmation" : nécessite le PIN
    if (!hasPin) {
      setPendingAction("toReview");
      setShowPinSetup(true);
    } else {
      setShowPinConfirm(true);
      setPendingAction("toReview");
    }
  };

  const handleSendClick = () => {
    setPendingAction("toSend");
    setShowPinConfirm(true);
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

      <div className="flex justify-center px-4 sm:px-8 pb-10">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-bold text-afrilink-dark mb-3">
            Transfert vers le Cameroun
          </h1>
          <p className="text-base md:text-lg text-gray-500 mb-8">
            Vérifiez les détails de votre transaction avant de confirmer.
          </p>

          <div className="rounded-3xl border border-gray-100 shadow-sm p-8">
            <StepIndicator
              steps={steps}
              currentStep={currentStepIndex}
              completedSteps={completedSteps}
            />

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
                amount={parseFloat(form.amount) || 0}
                onSend={handleSendClick}
              />
            )}

            {phase === "success" && (
              <div className="text-center py-10">
                <h2 className="text-lg font-bold text-afrilink-green mb-2">
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
