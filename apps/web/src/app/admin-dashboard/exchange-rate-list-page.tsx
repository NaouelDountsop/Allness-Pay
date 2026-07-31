import { useNavigate } from "react-router-dom";
import { Plus, Settings, History, TrendingDown, TrendingUp } from "lucide-react";
import { AdminLayout } from "../../components/admin-dashboard/admin-layout";

const RATES = [
  { pair: "USD → XAF", rate: "607.25", change: "+0.12%", up: true },
  { pair: "EUR → XAF", rate: "655.96", change: "+0.02%", up: true },
  { pair: "GBP → XAF", rate: "768.40", change: "-0.31%", up: false },
  { pair: "CAD → XAF", rate: "441.80", change: "-0.18%", up: false },
];

export default function ExchangeRatesListPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout active="parametres">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-afrilink-dark mb-1">Taux de Change</h1>
          <p className="text-sm text-gray-400">Gérez les taux appliqués sur la plateforme.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/taux-de-change/parametres")}
            className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Paramètres
          </button>
          <button
            onClick={() => navigate("/admin/taux-de-change/historique")}
            className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Historique
          </button>
          <button
            onClick={() => navigate("/admin/taux-de-change/nouveau")}
            className="h-9 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un taux
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3">Paire de devises</th>
              <th className="font-medium pb-3">Taux</th>
              <th className="font-medium pb-3">Variation (24h)</th>
              <th className="font-medium pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {RATES.map((r) => (
              <tr key={r.pair} className="border-b border-gray-50 last:border-0">
                <td className="py-3.5 text-xs font-medium text-afrilink-dark">{r.pair}</td>
                <td className="text-xs text-gray-600">{r.rate}</td>
                <td>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      r.up ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {r.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {r.change}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => navigate("/admin/taux-de-change/1/modifier")}
                    className="h-8 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
