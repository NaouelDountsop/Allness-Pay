import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

const KYC_STEPS = [
  { label: "Document" },
  { label: "Visage" },
  { label: "Domicile" },
];

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

const STEP_LABELS: Record<number, string> = {
  1: "Téléverser votre document",
  2: "Vérification faciale",
  3: "Justificatif de domicile",
};

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

  const completedSteps = [step > 1, step > 2, step > 3];
  const currentStepIdx = step >= 1 && step <= 3 ? step - 1 : 0;

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-20 md:pb-10">
        <div className="w-full max-w-7xl">
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-afrilink-dark" />
            </button>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-afrilink-dark leading-tight">
              Vérification KYC
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-5 sm:mb-8 ml-11">
            Complétez les étapes ci-dessous pour valider votre identité.
          </p>

          {step === 0 && (
            <>
              <KycIntro onStart={() => setStep(1)} onLater={() => navigate("/dashboard")} />
            </>
          )}

          {step >= 1 && step <= 3 && (
            <>
              <KycHeader
                steps={KYC_STEPS}
                currentStep={currentStepIdx}
                completedSteps={completedSteps}
              />

              <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-5 sm:mb-6">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: "#D28E2F" }}
                    />
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-400">
                      {STEP_LABELS[step]}
                    </span>
                  </div>

                  {step === 1 && <KycDocumentStep onNext={handleDocumentStep} />}

                  {step === 2 && <KycFacialStep onNext={handleFacialStep} />}

                  {step === 3 && (
                    isSubmitting ? (
                      <div className="flex flex-col items-center py-10">
                        <div className="w-8 h-8 border-4 border-afrilink-green border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm text-gray-500">Soumission en cours...</p>
                      </div>
                    ) : (
                      <KycAddressStep onNext={handleAddressStep} />
                    )
                  )}
                </div>
              </div>
            </>
          )}

          {step === 4 && <KycProcessing />}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
