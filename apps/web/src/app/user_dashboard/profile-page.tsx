import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@afrilinkpay/shared";
import { CheckCircle2, Mail, MapPin, Phone, User, CalendarDays, Briefcase, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { Button } from "@/components/ui/button";
import { userService } from "@/lib/api/user.service";

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-gray-900">{value || "Non renseigné"}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: userService.getProfile,
  });

  const fullName = useMemo(
    () => (profile ? `${profile.prenom} ${profile.nom}` : "Utilisateur Afrilink"),
    [profile],
  );

  const initials = useMemo(() => {
    if (!profile) return "UA";
    return `${profile.prenom?.[0] ?? "U"}${profile.nom?.[0] ?? "A"}`.toUpperCase();
  }, [profile]);

  return (
    <DashboardLayout>
      <DashboardHeader
        firstName={profile?.prenom ?? "Utilisateur"}
        userName={fullName}
        memberLabel="Premium Member"
      />

      <div>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <aside className="space-y-6 xl:w-2/5">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-afrilink-dark text-3xl font-semibold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-afrilink-orange">
                    Mon profil
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold text-afrilink-dark truncate">{fullName}</h1>
                  <p className="mt-2 text-sm text-gray-500">{profile?.profession ?? "Client Afrilink"}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl border border-afrilink-green/10 bg-afrilink-green/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Statut</p>
                      <p className="mt-2 text-lg font-semibold text-afrilink-dark">{profile?.statut || "Actif"}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-afrilink-green/10 px-3 py-1 text-xs font-semibold text-afrilink-green">
                      <CheckCircle2 className="w-4 h-4" /> Vérifié
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button className="w-full rounded-full" variant="default" size="sm">
                    Modifier le profil
                  </Button>
                  <Button className="w-full rounded-full" variant="outline" size="sm">
                    Voir les détails
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-sm font-semibold text-gray-800">Coordonnées</p>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Modifier
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-afrilink-orange" />
                    <span className="text-sm">{profile?.email ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-afrilink-orange" />
                    <span className="text-sm">{profile?.telephone ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-4 h-4 text-afrilink-orange" />
                    <span className="text-sm">{profile ? `${profile.ville}, ${profile.pays}` : "-"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-sm font-semibold text-gray-800">Activité</p>
                  <span className="text-xs text-gray-400">Mise à jour récente</span>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Inscription</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{profile?.dateinscription ?? "-"}</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Dernière modification</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{profile?.datemodification ?? "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6 xl:w-3/5">
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Données utilisateur</p>
                  <h2 className="mt-3 text-2xl font-semibold text-afrilink-dark">Informations personnelles</h2>
                </div>
                <Button variant="secondary" size="sm" className="rounded-full px-4">
                  Exporter le PDF
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ProfileField label="Nom complet" value={fullName} />
                <ProfileField label="Date de naissance" value={profile?.datenaissance ?? "-"} />
                <ProfileField label="Sexe" value={profile?.sexe ?? "-"} />
                <ProfileField label="Profession" value={profile?.profession ?? "-"} />
                <ProfileField label="Adresse" value={profile?.adresse ?? "-"} />
                <ProfileField label="Statut compte" value={profile?.statut ?? "-"} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Mes options</p>
                  <p className="text-xs text-gray-500">Gestion des accès et des préférences</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Voir l'activité
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-afrilink-orange/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-4 h-4 text-afrilink-orange" />
                    <p className="text-sm font-semibold text-afrilink-dark">Profil</p>
                  </div>
                  <p className="text-sm text-gray-500">Modifiez vos informations personnelles et votre avatar.</p>
                </div>
                <div className="rounded-3xl bg-afrilink-green/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-4 h-4 text-afrilink-green" />
                    <p className="text-sm font-semibold text-afrilink-dark">Sécurité</p>
                  </div>
                  <p className="text-sm text-gray-500">Activez l’authentification à deux facteurs et gérez vos accès.</p>
                </div>
                <div className="rounded-3xl bg-afrilink-dark/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CalendarDays className="w-4 h-4 text-afrilink-dark" />
                    <p className="text-sm font-semibold text-afrilink-dark">Notifications</p>
                  </div>
                  <p className="text-sm text-gray-500">Recevez les alertes de transactions et les rappels.</p>
                </div>
                <div className="rounded-3xl bg-gray-50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase className="w-4 h-4 text-afrilink-orange" />
                    <p className="text-sm font-semibold text-afrilink-dark">Préférences</p>
                  </div>
                  <p className="text-sm text-gray-500">Choisissez votre devise et vos options d’interface.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
