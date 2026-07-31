import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingDown } from "lucide-react";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";
import { SectionCard } from "../../components/ui/section-card";
import { Toggle } from "../../components/ui/toggle";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] text-gray-500 mb-1.5">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
    />
  );
}

function Select({ children }: { children: React.ReactNode }) {
  return (
    <select className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-1 focus:ring-afrilink-orange bg-white">
      {children}
    </select>
  );
}

export default function EditExchangeRatePage() {
  const navigate = useNavigate();

  return (
    <AdminLayout active="parametres">
      <button
        onClick={() => navigate("/admin/taux-de-change")}
        className="flex items-center gap-2 text-sm font-semibold text-afrilink-dark mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Modifier un taux de change
      </button>

      <div className="max-w-2xl flex flex-col gap-5">
        <SectionCard title="Informations générales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Paire de devises</Label>
              <Select>
                <option>USD - Dollar US</option>
              </Select>
            </div>
            <div>
              <Label>&nbsp;</Label>
              <Select>
                <option>XAF - Franc CFA</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Taux de change</Label>
              <Input defaultValue="607.25" />
            </div>
            <div>
              <Label>Volatilité (24h)</Label>
              <p className="h-10 flex items-center gap-1.5 text-sm font-semibold text-red-500">
                <TrendingDown className="w-3.5 h-3.5" />
                -0.40%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label>Source</Label>
              <Select>
                <option>Bloomberg</option>
              </Select>
            </div>
            <div className="flex items-center gap-3 h-10">
              <span className="text-xs text-gray-500">Statut</span>
              <Toggle checked />
              <span className="text-xs font-medium text-afrilink-green">Actif</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Informations supplémentaires">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Date de mise à jour</Label>
              <Input defaultValue="31/07/2026" />
            </div>
            <div>
              <Label>Heure de mise à jour</Label>
              <Input defaultValue="10:45" />
            </div>
          </div>
          <div className="mb-4">
            <Label>Fréquence de mise à jour</Label>
            <Select>
              <option>Manuel</option>
            </Select>
          </div>
          <div>
            <Label>Notes (optionnel)</Label>
            <textarea
              rows={3}
              placeholder="Ajouter une note sur ce taux..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-1 focus:ring-afrilink-orange resize-none"
            />
          </div>
        </SectionCard>

        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            onClick={() => navigate("/admin/taux-de-change")}
            className="h-10 px-5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button className="h-10 px-5 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
