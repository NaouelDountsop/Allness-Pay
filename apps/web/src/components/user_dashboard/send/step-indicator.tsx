import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: boolean[];
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-start min-w-max sm:min-w-0">
      {steps.map((step, i) => {
        const isDone = completedSteps[i];
        const isActive = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
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
                {step.label}
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
  );
}