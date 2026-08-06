import { GripVertical, Plus } from "lucide-react";

interface RotationMember {
  id: string;
  name: string;
  month: string;
}

interface RotationOrderListProps {
  members: RotationMember[];
  onInvite?: () => void;
}

export function RotationOrderList({ members, onInvite }: RotationOrderListProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Ordre de Passage</h3>
      <div className="space-y-2 mb-3">
        {members.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-lg bg-blue-50/60 px-3 py-2.5"
          >
            <GripVertical className="w-4 h-4 text-gray-300" />
            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-medium text-blue-700">
              {m.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <div>
              <p className="text-sm text-gray-800">{m.name}</p>
              <p className="text-[11px] text-gray-400">
                Mois {i + 1} - {m.month}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onInvite}
        className="w-full h-10 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 flex items-center justify-center gap-2 hover:border-afrilink-orange hover:text-afrilink-orange transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter un membre
      </button>
    </div>
  );
}
