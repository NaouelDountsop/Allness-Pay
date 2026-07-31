import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";
import { SectionCard } from "../../components/ui/";
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

export default function ExchangeRateSettingsPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout active="parametres">
      <button
        onClick={() => navigate("/admin/taux-de-change")}
        className="flex items-center gap-2 text-sm font-semibold text-afrilink-dark mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Paramètres d'actualisation
      </button>

      <div className="max-w-2xl flex flex-col gap-5">
        <SectionCard title="Configuration de la mise à jour">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Fréquence de mise à jour</Label>
              <Select>
                <option>Chaque heure</option>
                <option>Toutes les 15 minutes</option>
                <option>Une fois par jour</option>
              </Select>
            </div>
            <div>
              <Label>Source de données</Label>
              <Select>
                <option>Bloomberg</option>
                <option>Banque Centrale</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Devises à surveiller</Label>
              <Select>
                <option>Sélectionner une source</option>
              </Select>
            </div>
            <div>
              <Label>Fuseau horaire</Label>
              <Select>
                <option>GMT+0 (UTC) Afrique de l'Ouest</option>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Plages horaires d'actualisation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Heure de début</Label>
              <Input defaultValue="00:00" />
            </div>
            <div>
              <Label>Heure de fin</Label>
              <Input defaultValue="23:59" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Alertes & Notifications">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-afrilink-dark">Alerter en cas d'échec de mise à jour</p>
              <p className="text-[11px] text-gray-400">Une notification est envoyée si une source ne répond pas.</p>
            </div>
            <Toggle checked />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-afrilink-dark">Alerter en cas de variation anormale</p>
              <p className="text-[11px] text-gray-400">Seuil de variation à définir ci-dessous.</p>
            </div>
            <Toggle checked />
          </div>
          <div className="max-w-xs">
            <Label>Seuil de variation (%)</Label>
            <Input defaultValue="5.00" />
          </div>
        </SectionCard>

        <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-600 leading-relaxed">
            Les paramètres de configuration affectent l'ensemble des paires de devises
            configurées et mises à jour automatiquement. Toute modification sera appliquée
            immédiatement à tout le système.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            onClick={() => navigate("/admin/taux-de-change")}
            className="h-10 px-5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button className="h-10 px-5 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity">
            Enregistrer les paramètres
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
