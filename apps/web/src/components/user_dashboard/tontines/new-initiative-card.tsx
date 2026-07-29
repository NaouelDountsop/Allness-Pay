import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export function NewInitiativeCard() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/dashboard/tontines/create")}
      className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-4 flex flex-col items-center justify-center gap-3 text-center hover:border-afrilink-green/40 transition-colors"
    >
      <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
        <Plus className="w-5 h-5 text-gray-400" />
      </span>
      <div>
        <p className="text-sm font-medium text-gray-800 mb-1">Nouvelle Initiative ?</p>
        <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
          Créez votre propre groupe de tontine et gérez vos finances entre amis.
        </p>
        <span className="inline-flex items-center h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 leading-8 gap-2">
          <Plus className="w-3 h-3 text-gray-600" />
          <span className="hidden md:inline">Lancer une Tontine</span>
        </span>
      </div>
    </button>
  );
}
