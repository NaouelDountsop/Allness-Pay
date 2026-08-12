import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { StepIndicator } from '@/components/user_dashboard/send/step-indicator';
import { KycHeader } from '@/components/kyc/kyc-header';
import { KycIntro } from '@/components/kyc/kyc-intro';
import { KycDocumentStep } from '@/components/kyc/kyc-document-step';
import { KycFacialStep } from '@/components/kyc/kyc-facial-step';
import { KycAddressStep } from '@/components/kyc/kyc-address-step';
import { KycProcessing } from '@/components/kyc/kyc-processing';
import { kycService } from '@/lib/api/kyc.service';

type Step = 0 | 1 | 2 | 3 | 4;

const stepMeta: Record<Step, { title: string }> = {
  0: { title: "Vérification d'identité" },
  1: { title: 'Téléverser votre document' },
  2: { title: 'Vérification faciale' },
  3: { title: 'Justificatif de domicile' },
  4: { title: 'Validation en cours' },
};

const stepLabels = ['Document', 'Visage', 'Adresse', 'Validation'];

const DOC_TYPE_MAP: Record<string, string> = {
  passport: 'PASSPORT',
  national_id: 'NATIONAL_ID',
  license: 'DRIVER_LICENSE',
};

const ADDRESS_DOC_MAP: Record<string, string> = {
  utility_bill: 'UTILITY_BILL',
  bank_statement: 'BANK_STATEMENT',
  residence_certificate: 'RESIDENCE_CERTIFICATE',
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<KycFormData>({
    docType: 'passport',
    front: null,
    back: null,
    selfie: null,
    addressDocType: 'utility_bill',
    addressFile: null,
  });

  const handleBack = () => {
    if (step === 0) navigate('/dashboard');
    else setStep((s) => (s - 1) as Step);
  };

  const handleDocumentNext = (data: { docType: string; front: File | null; back: File | null }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleFacialNext = (selfie: File) => {
    setFormData((prev) => ({ ...prev, selfie }));
    setStep(3);
  };

  const handleAddressNext = async (data: { docType: string; file: File | null }) => {
    const updated = { ...formData, addressDocType: data.docType, addressFile: data.file };
    setFormData(updated);

    if (!updated.front || !updated.selfie || !updated.addressFile) {
      setSubmitError('Tous les documents sont requis.');
      return;
    }

    setStep(4);

    try {
      await kycService.submit({
        IdentityDocumentType: DOC_TYPE_MAP[updated.docType] as
          'PASSPORT' | 'NATIONAL_ID' | 'DRIVER_LICENSE',
        proofOfAddressType: ADDRESS_DOC_MAP[updated.addressDocType] as
          'UTILITY_BILL' | 'BANK_STATEMENT' | 'RESIDENCE_CERTIFICATE',
        documentFront: updated.front,
        documentBack: updated.back,
        selfie: updated.selfie,
        proofOfAddress: updated.addressFile,
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Une erreur est survenue lors de la soumission.';
      setSubmitError(message);
    }
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <h1 className="flex items-center gap-3 text-xl sm:text-3xl md:text-4xl font-bold text-afrilink-dark mb-2 sm:mb-3 leading-tight">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 hover:border-afrilink-green hover:bg-afrilink-green/5 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-afrilink-dark" />
          </button>
          Compléter mon KYC
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-5 sm:mb-8">
          Pour avoir accès à plus de fonctionnalités
        </p>

        {step === 4 && (
          <div className="w-full rounded-xl bg-green-50 border border-green-300 p-4 mb-5 flex items-start gap-3">
            <Bell className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-green-800">Etape suivante</p>
              <p className="text-xs text-green-600">
                Vous recevrez un e-mail dès que votre dossier aura été vérifié. Cela prend
                généralement moins de 24 heures.
              </p>
            </div>
          </div>
        )}

        {/* Carte principale */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {step >= 1 && step <= 4 && (
              <div>
                <KycHeader title={stepMeta[step].title} />
                <div
                  className="rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-4"
                  style={{
                    backgroundColor: '#082B37',
                    boxShadow: '0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)',
                  }}
                >
                  <StepIndicator
                    steps={stepLabels.map((label) => ({ label }))}
                    currentStep={step - 1}
                    completedSteps={[1, 2, 3, 4].map((s) => s < step)}
                  />
                </div>
              </div>
            )}

            {/* Contenu de l'étape */}
            <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {step === 0 && (
                <KycIntro onStart={() => setStep(1)} onLater={() => navigate('/dashboard')} />
              )}
              {step === 1 && (
                <KycDocumentStep
                  initialDocType={formData.docType as 'passport' | 'national_id' | 'license'}
                  initialFront={formData.front}
                  initialBack={formData.back}
                  onNext={handleDocumentNext}
                />
              )}
              {step === 2 && <KycFacialStep onNext={handleFacialNext} />}
              {step === 3 && (
                <KycAddressStep
                  initialDocType={
                    formData.addressDocType as
                      'utility_bill' | 'bank_statement' | 'residence_certificate'
                  }
                  initialFile={formData.addressFile}
                  onNext={handleAddressNext}
                />
              )}
              {step === 4 && <KycProcessing />}
            </div>

            {submitError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
