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
  return (
    <div className="flex items-center mb-10">
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
  );
}
