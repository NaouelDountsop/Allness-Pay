import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { CreateTontineForm } from "@/components/user_dashboard/tontines/create-tontine-form";

export default function CreateTontinePage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="px-4 sm:px-6 lg:px-8 pb-10 max-w-7xl">
        <button
          onClick={() => navigate("/dashboard/tontines")}
          className="flex items-center gap-2 text-base sm:text-lg font-semibold text-afrilink-dark mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Créer une tontine
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6">
          <CreateTontineForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
