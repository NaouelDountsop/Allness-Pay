import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";

export const DEPOSIT_STEPS = [
  { step: 1, label: "Initier le dépôt", href: "/deposit" },
  { step: 2, label: "Demande envoyée", href: "/deposit/request-sent" },
  { step: 3, label: "Notification utilisateur", href: "/deposit/confirm" },
  { step: 4, label: "Traitement en cours", href: "/deposit/processing" },
  { step: 5, label: "Dépôt réussi", href: "/deposit/success" },
];

export function DepositStepper({ current }: { current: number }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8 flex-wrap gap-y-3">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-afrilink-dark shrink-0 mr-4 sm:mr-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour
      </button>

      <div className="flex items-center flex-1 min-w-0 sm:min-w-[280px]">
        {DEPOSIT_STEPS.map((s, i) => {
          const isDone = s.step < current;
          const isActive = s.step === current;
          return (
            <div key={s.step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 shrink-0">
                <span
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0 ${
                    isDone
                      ? "bg-afrilink-green text-white"
                      : isActive
                        ? "bg-afrilink-orange text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : s.step}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] text-center max-w-[60px] sm:max-w-[90px] leading-tight hidden sm:block ${
                    isActive ? "text-afrilink-dark font-medium" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < DEPOSIT_STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-1 sm:mx-2 mb-4 ${isDone ? "bg-afrilink-green" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
