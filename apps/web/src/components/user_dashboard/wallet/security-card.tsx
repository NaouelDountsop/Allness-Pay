import { ShieldCheck, ChevronRight } from "lucide-react";

export function SecurityCard() {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Sécurité</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-afrilink-green" />
          </span>
          <div>
            <p className="text-xs text-gray-500">Authentification 2 facteurs</p>
            <p className="text-xs font-medium text-afrilink-green">Activée</p>
          </div>
        </div>
      </div>
      <a
        href="/dashboard/settings"
        className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100"
      >
        Gérer ma sécurité
        <ChevronRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
