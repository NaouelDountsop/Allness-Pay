import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { RotationOrderList } from "@/components/user_dashboard/tontines/rotation-order-list";
import { CycleSummaryPanel } from "@/components/user_dashboard/tontines/cycle-summary-panel";
import { ScheduleCalendarModal } from "@/components/user_dashboard/tontines/schedule-calendar-modal";
import { mockTontines } from "@/lib/mock/tontines-data";

const rotationMembers = [
  { id: "r1", name: "Sophie Dubois", month: "Janvier" },
  { id: "r2", name: "Moussa Kone", month: "Février" },
  { id: "r3", name: "Jean Dupont", month: "Mars" },
];

export default function TontineSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tontine = mockTontines.find((t) => t.id === id) ?? mockTontines[0];
  const [showCalendar, setShowCalendar] = useState(false);
  const [name, setName] = useState(tontine.name);
  const [potAmount, setPotAmount] = useState(String(tontine.potAmount / 1000));
  const [contribution, setContribution] = useState("1000");

  // Garde-fou : seul l'administrateur (créateur) accède à cette page.
  if (!tontine.isAdmin) {
    return (
      <DashboardLayout>
        <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />
        <div className="px-4 sm:px-8 pb-10">
          <p className="text-sm text-gray-500">
            Vous n'avez pas les droits d'administrateur sur cette tontine.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="px-4 sm:px-8 pb-10">
        <button
          onClick={() => navigate(`/dashboard/tontines/${id}`)}
          className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Paramètres Généraux
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-medium text-gray-500">Nom de la Tontine</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Cagnotte</label>
                  <input
                    type="number"
                    value={potAmount}
                    onChange={(e) => setPotAmount(e.target.value)}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="text-xs font-medium text-gray-500">
                  Montant de la Contribution Mensuelle (EUR)
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  className="flex-1 accent-afrilink-orange"
                />
                <span className="text-sm font-semibold text-afrilink-orange whitespace-nowrap">
                  {contribution} €
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <RotationOrderList members={rotationMembers} />
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Règles de Participation
              </h3>
              <label className="text-xs font-medium text-gray-500">Logique de rotation</label>
              <select className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900">
                <option>Attribution Manuelle</option>
                <option>Tirage au sort</option>
                <option>Ordre d'inscription</option>
              </select>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Règles de Sanction</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Frais de retard (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Délai de Grâce (Jours)
                  </label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
                ⚠ Pénalité : Des frais de retard de 5% s'appliquent automatiquement après le
                délai de grâce. Les frais sont redistribués au dernier bénéficiaire de la
                tontine.
              </div>
            </div>
          </div>

          <CycleSummaryPanel
            durationMonths={12}
            totalPot={12000}
            membersCount={12}
            nextDrawDate="01 Janv. 2024"
            onShowCalendar={() => setShowCalendar(true)}
          />
        </div>
      </div>

      {showCalendar && <ScheduleCalendarModal onClose={() => setShowCalendar(false)} />}
    </DashboardLayout>
  );
}
