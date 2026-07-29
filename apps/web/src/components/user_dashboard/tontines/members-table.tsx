import { MoreVertical } from "lucide-react";
import type { TontineMember } from "@/lib/mock/tontines-data";

const statusStyles: Record<TontineMember["status"], { label: string; className: string }> = {
  paid: { label: "Payé", className: "bg-green-50 text-afrilink-green" },
  pending: { label: "En attente", className: "bg-orange-50 text-afrilink-orange" },
  late: { label: "En retard", className: "bg-red-50 text-red-600" },
};

interface MembersTableProps {
  members: TontineMember[];
}

export function MembersTable({ members }: MembersTableProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold text-gray-900">Membres</h3>
        <a href="#" className="text-xs text-afrilink-green font-medium">
          Voir plus →
        </a>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-afrilink-dark text-white text-xs">
            <th className="text-left font-medium px-4 py-2.5">Nom du Membre</th>
            <th className="text-left font-medium px-4 py-2.5">Localisation</th>
            <th className="text-left font-medium px-4 py-2.5">Statut de Cotisation</th>
            <th className="text-left font-medium px-4 py-2.5">Tour de Rotation</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {members.map((m) => {
            const status = statusStyles[m.status];
            return (
              <tr key={m.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span className="text-gray-800">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{m.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">Mois {m.turnMonth}</td>
                <td className="px-4 py-3 text-right">
                  <button aria-label="Actions" className="text-gray-400">
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
