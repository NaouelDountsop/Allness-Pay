import { useState } from "react";
import { PiggyBank, Coins, ShieldAlert, Target, Download, AlertTriangle } from "lucide-react";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";
import { StatCard, Tabs, Badge } from "../../components/ui";

const TONTINES = [
  {
    name: "Cercle Bienvenue Ahidjo",
    admin: "Awa J.",
    members: 12,
    amount: "25,000",
    frequency: "Mensuel",
    next: "Demain (18/07)",
    progress: 65,
    status: "Actif",
  },
  {
    name: "Tontine Sunuxaley",
    admin: "Fatou D.",
    members: 8,
    amount: "12,000",
    frequency: "Hebdomadaire",
    next: "Aujourd'hui",
    progress: 40,
    status: "Actif",
  },
  {
    name: "Projet Immobilier Zamo",
    admin: "Cissé M.",
    members: 20,
    amount: "50,000",
    frequency: "Mensuel",
    next: "25/07",
    progress: 90,
    status: "Actif",
  },
];

export default function TontinesSupervisionPage() {
  const [tab, setTab] = useState("Toutes les Tontines");

  return (
    <AdminLayout active="tontines">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-afrilink-dark mb-1">Supervision des Tontines</h1>
          <p className="text-sm text-gray-400">
            Consultez l'activité, gérez les risques et intervenez si nécessaire.
          </p>
        </div>
        <button className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Exporter
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard icon={PiggyBank} label="Tontines Actives" value="1,284" />
        <StatCard icon={Coins} label="Volume Total Épargné" value="842,500 €" />
        <StatCard
          icon={ShieldAlert}
          iconTone="red"
          label="Alertes de Blocage"
          value="42"
          tag={{ label: "Urgent", tone: "red" }}
        />
        <StatCard icon={Target} label="Taux de Complétion" value="98.2%" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <Tabs tabs={["Toutes les Tontines", "Alertes Actives"]} active={tab} onChange={setTab} />

        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3">Nom de la Tontine</th>
              <th className="font-medium pb-3">Membres</th>
              <th className="font-medium pb-3">Montant</th>
              <th className="font-medium pb-3">Fréquence</th>
              <th className="font-medium pb-3">Prochain Tour</th>
              <th className="font-medium pb-3">Progression</th>
              <th className="font-medium pb-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {TONTINES.map((t) => (
              <tr key={t.name} className="border-b border-gray-50 last:border-0">
                <td className="py-3.5">
                  <p className="text-xs font-medium text-afrilink-dark">{t.name}</p>
                  <p className="text-[11px] text-gray-400">Admin: {t.admin}</p>
                </td>
                <td className="text-xs text-gray-600">{t.members}</td>
                <td className="text-xs text-gray-600">{t.amount} XAF</td>
                <td className="text-xs text-gray-600">{t.frequency}</td>
                <td className="text-xs text-gray-600">{t.next}</td>
                <td>
                  <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-afrilink-green rounded-full"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </td>
                <td>
                  <Badge tone="green" dot>
                    {t.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 rounded-xl bg-red-50 border border-red-100 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            </span>
            <div>
              <p className="text-xs font-semibold text-red-600">Détection d'activité suspecte</p>
              <p className="text-[11px] text-red-400">
                Comportement inhabituel détecté sur plusieurs cycles de cotisation.
              </p>
            </div>
          </div>
          <button className="h-9 px-4 rounded-lg bg-red-500 text-white text-xs font-medium hover:opacity-90 transition-opacity shrink-0">
            Lancer l'investigation
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
