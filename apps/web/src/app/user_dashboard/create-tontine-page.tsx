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

      <div className="px-4 sm:px-8 pb-10 max-w-4xl">
        <button
          onClick={() => navigate("/dashboard/tontines")}
          className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Créer une tontine
        </button>

        <div className="rounded-2xl border border-gray-100 shadow-sm p-6">
          <CreateTontineForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
