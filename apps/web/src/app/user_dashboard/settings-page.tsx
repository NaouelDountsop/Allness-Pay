import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@afrilinkpay/shared";
import { Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { Button } from "@/components/ui/button";
import { userService } from "@/lib/api/user.service";

function SettingCard({ title, description, badge, children }: { title: string; description: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-afrilink-green/10 px-3 py-1 text-[11px] font-semibold text-afrilink-green">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl bg-gray-50 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: userService.getProfile,
  });

  const fullName = useMemo(() => (profile ? `${profile.prenom} ${profile.nom}` : "Utilisateur Afrilink"), [profile]);

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <aside className="space-y-6 xl:w-1/3">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-afrilink-dark text-3xl font-semibold text-white">
                  {fullName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-afrilink-orange">Paramètres</p>
                  <h1 className="mt-3 text-2xl font-semibold text-afrilink-dark">Compte Afrilink</h1>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-3xl bg-afrilink-orange/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Email principal</p>
                  <p className="mt-3 text-sm font-medium text-gray-900">{profile?.email ?? "-"}</p>
                </div>
                <div className="rounded-3xl bg-afrilink-green/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">2FA</p>
                  <p className="mt-3 text-sm font-medium text-gray-900">Activée</p>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-4 h-4 text-afrilink-orange" />
                  <p className="text-sm font-semibold text-afrilink-dark">Préférences rapides</p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Langue</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">Français</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Devise</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">CFA</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6 xl:w-2/3">


            <div className="grid gap-4 lg:grid-cols-1">


              <SettingCard
                title="Sécurité du compte"
                description="Verrouillez votre compte et activez les protections"
                badge="Activée"
              >
                <div className="space-y-3">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Authentification</p>
                    <p className="mt-2 text-sm font-medium text-afrilink-green">2FA activée</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Historique de connexion</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">Dernière connexion aujourd'hui</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full w-full">
                    Gérer la sécurité
                  </Button>
                </div>
              </SettingCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SettingCard
                title="Préférences de notifications"
                description="Recevez les alertes qui comptent pour vous"
              >
                <div className="space-y-3">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Email</p>
                    <p className="mt-2 text-sm font-medium text-afrilink-dark">Activées</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">SMS</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">Désactivées</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full w-full">
                    Modifier mes notifications
                  </Button>
                </div>
              </SettingCard>

              <SettingCard
                title="Préférences de compte"
                description="Paramètres d'affichage et de devise"
              >
                <div className="space-y-3">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Devise</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">CFA</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Thème</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">Clair</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full w-full">
                    Modifier mes préférences
                  </Button>
                </div>
              </SettingCard>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
