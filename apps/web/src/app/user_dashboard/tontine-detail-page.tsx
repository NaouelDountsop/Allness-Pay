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
  const tontine = mockTontines.find((t) => t.id === id) ?? mockTontines[0];

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="px-4 sm:px-8 pb-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard/tontines")}
            className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark"
          >
            <ArrowLeft className="w-5 h-5" />
            Tontine {tontine.name}
          </button>

          <div className="flex items-center gap-2">
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
              <span className="hidden md:inline">Send Contribution</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6 -mt-4">
          Groupe d'épargne collaborative · Cycle {tontine.frequency}
        </p>

        <TontineDetailHeader tontine={tontine} />
        <TontineDetailStats tontine={tontine} />
        <MembersTable members={tontine.members} />

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
