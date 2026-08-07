import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { MembersTable } from "@/components/user_dashboard/tontines/members-table";
import { tontineService } from "@/lib/api/tontine.service";

export default function TontineMembersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tontine, isLoading } = useQuery({
    queryKey: ["tontine", id],
    queryFn: () => tontineService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-afrilink-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

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
              onClick={() => navigate(`/dashboard/tontines/${tontine.id}`)}
              className="inline-flex items-center gap-2 text-lg font-semibold text-afrilink-dark"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à {tontine.name}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Membres de la tontine · {tontine.memberLimit} participants
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="rounded-2xl bg-white border border-gray-100 p-4 text-sm">
              <p className="text-gray-400">Fréquence</p>
              <p className="font-semibold text-afrilink-dark">{tontine.frequency}</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-4 text-sm">
              <p className="text-gray-400">Tour actuel</p>
              <p className="font-semibold text-afrilink-dark">{tontine.currentCycle} / {tontine.memberLimit}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">Tontine</p>
              <h2 className="text-xl font-semibold text-afrilink-dark">{tontine.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Devise</p>
              <p className="text-sm font-semibold text-afrilink-dark">{tontine.currency ?? "CFA"}</p>
            </div>
          </div>
        </div>

        <MembersTable members={tontine.membres ?? []} tontineId={tontine.id} />
      </div>
    </DashboardLayout>
  );
}
