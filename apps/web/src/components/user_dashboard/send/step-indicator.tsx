import { Check } from 'lucide-react';

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
          <div key={step.label} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 min-w-[56px] sm:min-w-[84px]">
              <div
                className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 shrink-0 ${
                  isDone || isActive
                    ? 'bg-allness-orange text-allness-dark'
                    : 'bg-white/10 text-white/40 border-2 border-white/25'
                } ${isActive ? 'ring-4 ring-allness-orange/25' : ''}`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`text-[9px] sm:text-xs md:text-sm text-center leading-tight whitespace-nowrap transition-colors duration-300 px-0.5 ${
                  isActive
                    ? 'text-white font-bold'
                    : isDone
                      ? 'text-white/75 font-medium'
                      : 'text-white/35 font-medium'
                }`}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                className="flex-1 mx-1 sm:mx-1.5 -mt-5 sm:-mt-6 border-t-2 border-dashed border-white/50 min-w-[20px]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
