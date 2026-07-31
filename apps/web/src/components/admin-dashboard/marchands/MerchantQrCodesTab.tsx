import { QrCode, Download, RefreshCcw, Plus } from "lucide-react";
import { SectionCard } from "../../ui/section-card";

export function MerchantQrCodesTab() {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Codes Généraux">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {["Compte Principal", "Point de Vente 2"].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 p-5 flex flex-col items-center text-center"
            >
              <span className="w-28 h-28 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                <QrCode className="w-14 h-14 text-afrilink-dark" />
              </span>
              <p className="text-xs font-semibold text-afrilink-dark mb-3">{label}</p>
              <div className="flex items-center gap-2">
                <button className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] text-gray-600 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </button>
                <button className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] text-gray-600 flex items-center gap-1.5">
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Régénérer
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Gestion des Employés">
        <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 mb-3">
          <div>
            <p className="text-xs font-medium text-afrilink-dark">Employé #1</p>
            <p className="text-[11px] text-gray-400">ID: MER-88219</p>
          </div>
          <QrCode className="w-6 h-6 text-gray-300" />
        </div>
        <button className="h-9 px-4 rounded-lg bg-afrilink-dark text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" />
          Générer QR Employé
        </button>
      </SectionCard>
    </div>
  );
}
