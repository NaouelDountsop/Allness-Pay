import { useState } from "react";
import { Send, Plus } from "lucide-react";
import type { QuickContact } from "@/lib/mock/dashboard-data";

interface QuickSendProps {
  contacts: QuickContact[];
}

export function QuickSend({ contacts }: QuickSendProps) {
  const [amount, setAmount] = useState("");

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Envoi rapide</h3>
        <a href="/dashboard/beneficiaries" className="text-xs text-afrilink-green font-medium">
          Voir tout
        </a>
      </div>

      <div className="flex gap-3 mb-5">
        {contacts.map((c) => (
          <div key={c.id} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 overflow-hidden">
              {c.avatarUrl ? (
                <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                c.name.charAt(0)
              )}
            </div>
            <span className="text-[11px] text-gray-500">{c.name}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <button
            aria-label="Ajouter un bénéficiaire"
            className="w-11 h-11 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-afrilink-green hover:text-afrilink-green transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-gray-400">New</span>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          placeholder="Entrez le montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 h-11 rounded-lg border border-gray-200 px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-afrilink-green"
        />
        <select className="h-11 rounded-lg border border-gray-200 px-2 text-sm bg-white text-gray-900">
          <option>USD</option>
          <option>XAF</option>
          <option>EUR</option>
        </select>
      </div>

      <button className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
        <Send className="w-4 h-4" />
        Envoyer maintenant
      </button>
    </div>
  );
}
