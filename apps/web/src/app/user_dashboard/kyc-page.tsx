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
import { kycService } from "@/lib/api/kyc.service";
import type {
  IdentityDocumentType,
  ProofOfAddressType,
} from "@afrilinkpay/shared";

type Step = 0 | 1 | 2 | 3 | 4;

const stepMeta: Record<Step, { title: string; progress: number }> = {
  0: { title: "Vérification d'identité", progress: 5 },
  1: { title: "Téléverser votre document", progress: 25 },
  2: { title: "Vérification Faciale", progress: 55 },
  3: { title: "Justificatif de domicile", progress: 80 },
  4: { title: "Validation en cours", progress: 100 },
};

const DOC_TYPE_MAP: Record<string, IdentityDocumentType> = {
  passport: "PASSPORT",
  national_id: "NATIONAL_ID",
  license: "DRIVER_LICENSE",
};

const ADDRESS_DOC_MAP: Record<string, ProofOfAddressType> = {
  utility_bill: "UTILITY_BILL",
  bank_statement: "BANK_STATEMENT",
  residence_certificate: "RESIDENCE_CERTIFICATE",
};

interface KycFormData {
  docType: string;
  front: File | null;
  back: File | null;
  selfie: File | null;
  addressDocType: string;
  addressFile: File | null;
}

export default function KycPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<KycFormData>({
    docType: "passport",
    front: null,
    back: null,
    selfie: null,
    addressDocType: "utility_bill",
    addressFile: null,
  });

  const handleBack = () => {
    if (step === 0) navigate("/dashboard");
    else setStep((s) => (s - 1) as Step);
  };

  const handleDocumentStep = (data: {
    docType: string;
    front: File | null;
    back: File | null;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleFacialStep = (selfie: File) => {
    setFormData((prev) => ({ ...prev, selfie }));
    setStep(3);
  };

  const handleAddressStep = (data: {
    docType: string;
    file: File | null;
  }) => {
    const updated = { ...formData, addressDocType: data.docType, addressFile: data.file };
    setFormData(updated);
    submitKyc(updated);
  };

  const submitKyc = async (data: KycFormData) => {
    if (!data.front || !data.selfie || !data.addressFile) {
      setError("Tous les documents sont requis.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await kycService.submit({
        IdentityDocumentType: DOC_TYPE_MAP[data.docType] || "PASSPORT",
        proofOfAddressType: ADDRESS_DOC_MAP[data.addressDocType] || "UTILITY_BILL",
        documentFront: data.front,
        documentBack: data.back,
        selfie: data.selfie,
        proofOfAddress: data.addressFile,
      });
      setStep(4);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Une erreur est survenue lors de la soumission.";
      setError(message);
      setIsSubmitting(false);
    }
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
                <KycDocumentStep onNext={handleDocumentStep} />
              </>
            )}

            {step === 2 && (
              <>
                <KycHeader
                  title=""
                  progress={stepMeta[2].progress}
                  onBack={handleBack}
                />
                <KycFacialStep onNext={handleFacialStep} />
              </>
            )}

            {step === 3 && (
              <>
                <KycHeader
                  title=""
                  progress={stepMeta[3].progress}
                  onBack={handleBack}
                />
                {isSubmitting ? (
                  <div className="flex flex-col items-center py-10">
                    <div className="w-8 h-8 border-4 border-afrilink-green border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-gray-500">Soumission en cours...</p>
                  </div>
                ) : (
                  <KycAddressStep onNext={handleAddressStep} />
                )}
              </>
            )}

            {step === 4 && <KycProcessing />}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
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
