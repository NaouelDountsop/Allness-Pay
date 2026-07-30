import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // index (0-based) de l'étape active
  completedSteps: boolean[]; // steps[i] coché ou non
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  const total = steps.length;
  const progressPercent = total > 1 ? (currentStep / (total - 1)) * 100 : 0;

  return (
    <div className="mb-6 sm:mb-10">
      {/* === Version mobile : barre de progression compacte === */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-afrilink-gray tracking-wide uppercase">
            Étape {currentStep + 1}/{total}
          </span>
          <span className="text-sm font-semibold text-afrilink-dark">
            {steps[currentStep]?.label}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-afrilink-green transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* === Version web : timeline complète avec labels === */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, i) => {
          const isDone = completedSteps[i];
          const isActive = i === currentStep;
          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                    isDone
                      ? "bg-afrilink-green border-afrilink-green text-white"
                      : isActive
                      ? "border-afrilink-orange text-afrilink-orange bg-white"
                      : "border-gray-200 text-gray-300 bg-white"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-sm md:text-base whitespace-nowrap ${
                    isActive ? "text-afrilink-dark font-semibold" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    completedSteps[i] ? "bg-afrilink-green" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}