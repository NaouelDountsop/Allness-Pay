import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { KycHeader } from "@/components/kyc/kyc-header";
import { KycIntro } from "@/components/kyc/kyc-intro";
import { KycDocumentStep } from "@/components/kyc/kyc-document-step";
import { KycFacialStep } from "@/components/kyc/kyc-facial-step";
import { KycAddressStep } from "@/components/kyc/kyc-address-step";
import { KycProcessing } from "@/components/kyc/kyc-processing";

type Step = 0 | 1 | 2 | 3 | 4;

const stepMeta: Record<Step, { title: string }> = {
  0: { title: "Vérification d'identité" },
  1: { title: "Téléverser votre document" },
  2: { title: "Vérification faciale" },
  3: { title: "Justificatif de domicile" },
  4: { title: "Validation en cours" },
};

const stepLabels = ["Document", "Visage", "Adresse", "Validation"];

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

      <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-20 md:pb-10">
        <div className="w-full max-w-7xl">
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

          {/* Carte principale */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
            <div className="p-4 sm:p-6 md:p-8 space-y-6">
              {step >= 1 && step <= 3 && (
                <div>
                  <KycHeader title={stepMeta[step].title} />
                  {/* Indicateur d'étapes — même style que le transfert */}
                  <div
                    className="rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-4"
                    style={{
                      backgroundColor: "#082B37",
                      boxShadow: "0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)",
                    }}
                  >
                    <div className="flex items-center min-w-max sm:min-w-0">
                      {stepLabels.slice(0, 3).map((label, i) => {
                        const idx = (i + 1) as Step;
                        const isDone = idx < step;
                        const isActive = idx === step;
                        const isLast = i === 2;
                        return (
                          <div key={label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                            <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 min-w-[56px] sm:min-w-[84px]">
                              <div
                                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shrink-0"
                                style={{
                                  backgroundColor: isDone || isActive ? "#D28E2F" : "rgba(255,255,255,0.08)",
                                  color: isDone || isActive ? "#082B37" : "rgba(255,255,255,0.4)",
                                  border: isDone || isActive ? "none" : "2px solid rgba(255,255,255,0.25)",
                                  boxShadow: isActive ? "0 0 0 4px rgba(210,142,47,0.25)" : "none",
                                }}
                              >
                                {isDone ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} /> : i + 1}
                              </div>
                              <span
                                className="text-[9px] sm:text-xs md:text-sm text-center leading-tight whitespace-nowrap transition-colors duration-300 px-0.5"
                                style={{
                                  color: isActive ? "#FFFFFF" : isDone ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)",
                                  fontWeight: isActive ? 700 : 500,
                                }}
                              >
                                {label}
                              </span>
                            </div>
                            {!isLast && (
                              <div
                                className="flex-1 mx-1 sm:mx-1.5 -mt-5 sm:-mt-6"
                                style={{
                                  borderTop: "2px dashed rgba(255,255,255,0.5)",
                                  minWidth: "20px",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Contenu de l'étape */}
              <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {step === 0 && (
                  <KycIntro onStart={() => setStep(1)} onLater={() => navigate("/dashboard")} />
                )}
                {step === 1 && <KycDocumentStep onNext={() => setStep(2)} />}
                {step === 2 && <KycFacialStep onNext={() => setStep(3)} />}
                {step === 3 && <KycAddressStep onNext={() => setStep(4)} />}
                {step === 4 && <KycProcessing />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}