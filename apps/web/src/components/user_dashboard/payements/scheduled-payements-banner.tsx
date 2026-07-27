import { CalendarClock } from "lucide-react";

export function ScheduledPaymentsBanner() {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <span className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <CalendarClock className="w-5 h-5 text-blue-600" />
      </span>
      <div>
        <p className="text-sm font-medium text-gray-800 mb-0.5">
          Paiements programmés
        </p>
        <p className="text-xs text-gray-500">
          Ne manquez plus jamais une échéance en activant le prélèvement automatique
          sur votre wallet AfrilinkPay.{" "}
          <a href="#" className="text-afrilink-green font-medium">
            En savoir plus
          </a>
        </p>
      </div>
    </div>
  );
}
