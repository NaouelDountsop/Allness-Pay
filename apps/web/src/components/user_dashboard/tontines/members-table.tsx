import { MoreVertical } from "lucide-react";
import type { TontineMember } from "@/lib/mock/tontines-data";

const statusStyles: Record<TontineMember["status"], { label: string; className: string }> = {
  paid: { label: "Payé", className: "bg-green-50 text-afrilink-green" },
  pending: { label: "En attente", className: "bg-orange-50 text-afrilink-orange" },
  late: { label: "En retard", className: "bg-red-50 text-red-600" },
};

const avatarColors = [
  "bg-afrilink-green/15 text-afrilink-green",
  "bg-afrilink-orange/15 text-afrilink-orange",
  "bg-blue-50 text-blue-600",
  "bg-purple-50 text-purple-600",
  "bg-pink-50 text-pink-600",
  "bg-teal-50 text-teal-600",
];

interface MembersTableProps {
  members: TontineMember[];
}

export function MembersTable({ members }: MembersTableProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Membres</h3>
          <p className="text-xs text-gray-400 mt-0.5">{members.length} participant{members.length > 1 ? "s" : ""}</p>
        </div>
        <button className="text-xs text-afrilink-green font-medium hover:underline">
          Voir tout →
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-afrilink-dark text-white text-xs">
            <th className="text-left font-medium px-5 py-2.5">Nom du Membre</th>
            <th className="text-left font-medium px-5 py-2.5">Localisation</th>
            <th className="text-left font-medium px-5 py-2.5">Statut de Cotisation</th>
            <th className="text-left font-medium px-5 py-2.5">Tour de Rotation</th>
            <th className="px-5 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => {
            const status = statusStyles[m.status];
            return (
              <tr key={m.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold ${avatarColors[i % avatarColors.length]}`}
                    >
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="text-gray-800 font-medium">{m.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500">{m.location}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500">Mois {m.turnMonth}</td>
                <td className="px-5 py-3.5 text-right">
                  <button aria-label="Actions" className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
