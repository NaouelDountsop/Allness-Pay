import { Search, Bell, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "../ui/avatar";
import { apiClient } from "@/lib/api-client";

interface AdminProfile {
  idutilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  profession: string;
  statut: string;
  role?: string;
}

async function fetchAdminProfile(): Promise<AdminProfile> {
  const res = await apiClient.get<AdminProfile>("/auth/profile");
  return res.data;
}

export function AdminTopbar() {
  const { data: admin } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: fetchAdminProfile,
    staleTime: 5 * 60 * 1000,
  });

  const displayName = admin
    ? `${admin.prenom || ""} ${admin.nom || ""}`.trim() || "Admin"
    : "Admin";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 md:h-16 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 gap-4 md:gap-6">
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur, ID, email..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <button className="sm:hidden text-gray-400 hover:text-afrilink-dark" aria-label="Rechercher">
          <Search className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-afrilink-dark" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-afrilink-dark" aria-label="Aide">
          <HelpCircle className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 pl-3 md:pl-4 border-l border-gray-100">
          <Avatar initials={initials} />
          <div className="leading-tight hidden sm:block">
            <p className="text-xs font-semibold text-afrilink-dark">{displayName}</p>
            <p className="text-[11px] text-gray-400">{admin?.profession || "Administrateur"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
