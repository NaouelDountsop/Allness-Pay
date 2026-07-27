import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { KycHeader } from "@/components/kyc/kyc-header";
import { KycIntro } from "@/components/kyc/kyc-intro";
import { KycDocumentStep } from "@/components/kyc/kyc-document-step";
import { KycFacialStep } from "@/components/kyc/kyc-facial-step";
import { KycAddressStep } from "@/components/kyc/kyc-address-step";
import { KycProcessing } from "@/components/kyc/kyc-processing";

type Step = 0 | 1 | 2 | 3 | 4;

const stepMeta: Record<Step, { title: string; progress: number }> = {
  0: { title: "Vérification d'identité", progress: 5 },
  1: { title: "Téléverser votre document", progress: 25 },
  2: { title: "Vérification Faciale", progress: 55 },
  3: { title: "Justificatif de domicile", progress: 80 },
  4: { title: "Validation en cours", progress: 100 },
};

export default function KycPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);

  const handleBack = () => {
    if (step === 0) navigate("/dashboard");
    else setStep((s) => (s - 1) as Step);
  };

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-8">
        <div className="w-full max-w-[80vw] min-w-[80vw] lg:min-w-[70vw] xl:min-w-[60vw]">
          <div className="space-y-6 text-lg">
            {step === 0 && (
              <>
                <KycHeaderMinimal onBack={handleBack} />
                <KycIntro onStart={() => setStep(1)} onLater={() => navigate("/dashboard")} />
              </>
            )}

            {step === 1 && (
              <>
                <KycHeader
                  title=""
                  progress={stepMeta[1].progress}
                  onBack={handleBack}
                />
                <KycDocumentStep onNext={() => setStep(2)} />
              </>
            )}

            {step === 2 && (
              <>
                <KycHeader
                  title=""
                  progress={stepMeta[2].progress}
                  onBack={handleBack}
                />
                <KycFacialStep onNext={() => setStep(3)} />
              </>
            )}

            {step === 3 && (
              <>
                <KycHeader
                  title=""
                  progress={stepMeta[3].progress}
                  onBack={handleBack}
                />
                <KycAddressStep onNext={() => setStep(4)} />
              </>
            )}

            {step === 4 && <KycProcessing />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function KycHeaderMinimal({ onBack }: { onBack: () => void }) {
  return (
    <div className="mb-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark mb-1"
      >
        ← Compléter mon KYC
      </button>
      <p className="text-sm text-gray-500">Pour avoir accès à plus de fonctionnalités</p>
    </div>
  );
}
