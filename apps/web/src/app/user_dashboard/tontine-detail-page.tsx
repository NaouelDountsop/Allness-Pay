import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Settings, MessageCircle } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { TontineDetailHeader } from "@/components/user_dashboard/tontines/tontine-detail-header";
import { TontineDetailStats } from "@/components/user_dashboard/tontines/tontine-detail-stats";
import { MembersTable } from "@/components/user_dashboard/tontines/members-table";
import { mockTontines } from "@/lib/mock/tontines-data";

export default function TontineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tontine = mockTontines.find((t) => t.id === id);

  if (!tontine) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="px-4 sm:px-8 pb-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700">
            <p className="text-lg font-semibold">Tontine introuvable</p>
            <p className="mt-2 text-sm text-gray-500">
              Le groupe d'épargne demandé est introuvable. Retournez à la liste des tontines.
            </p>
            <button
              onClick={() => navigate("/dashboard/tontines")}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-afrilink-green px-4 py-2 text-sm font-medium text-white hover:bg-afrilink-greenHover"
            >
              Retour aux tontines
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="px-4 sm:px-8 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/dashboard/tontines")}
              className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark"
            >
              <ArrowLeft className="w-5 h-5" />
              Tontine {tontine.name}
            </button>
            <p className="text-sm text-gray-500 mt-1">Groupe d'épargne collaborative · Cycle {tontine.frequency}</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => navigate(`/dashboard/tontines/${tontine.id}/history`)}
              className="h-10 px-4 rounded-lg border border-afrilink-green text-afrilink-green text-sm font-medium hover:bg-afrilink-green/10 transition"
            >
              Historique des versements
            </button>
            {tontine.isAdmin && (
              <button
                onClick={() => navigate(`/dashboard/tontines/${tontine.id}/settings`)}
                aria-label="Paramètres"
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => navigate(`/dashboard/tontines/${tontine.id}/contribute`)}
              className="h-10 px-4 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden md:inline">Nouveau versement</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6 -mt-4">
          Groupe d'épargne collaborative · Cycle {tontine.frequency}
        </p>

        <TontineDetailHeader tontine={tontine} />
        <TontineDetailStats tontine={tontine} />
        <MembersTable members={tontine.members} tontineId={tontine.id} />

        <button
          aria-label="Support"
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </DashboardLayout>
  );
}
