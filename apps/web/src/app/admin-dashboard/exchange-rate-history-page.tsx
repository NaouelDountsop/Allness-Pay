import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Pagination } from '../../components/ui';
import { useState } from 'react';

const HISTORY = [
  {
    date: '30/07/2026 10:45',
    old: '605.10',
    next: '607.25',
    change: '+0.35%',
    up: true,
    by: 'Bloomberg',
    user: 'Système',
  },
  {
    date: '29/07/2026 09:30',
    old: '608.45',
    next: '605.10',
    change: '-0.55%',
    up: false,
    by: 'Bloomberg',
    user: 'Système',
  },
  {
    date: '28/07/2026 10:45',
    old: '607.60',
    next: '608.45',
    change: '+0.14%',
    up: true,
    by: 'Bloomberg',
    user: 'Système',
  },
  {
    date: '27/07/2026 10:45',
    old: '607.10',
    next: '607.60',
    change: '+0.08%',
    up: true,
    by: 'Bloomberg',
    user: 'Système',
  },
  {
    date: '26/07/2026 10:45',
    old: '608.90',
    next: '607.10',
    change: '-0.30%',
    up: false,
    by: 'Manuel',
    user: 'M. Traoré',
  },
];

export default function ExchangeRateHistoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pairFilter, setPairFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  return (
    <AdminLayout active="parametres">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/taux-de-change')}
            className="flex items-center gap-2 text-sm font-semibold text-allness-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Historique des mises à jour
          </button>
          <p className="text-[11px] text-gray-400 mt-1 ml-6">Taux de change &gt; Historique</p>
        </div>
        <button
          onClick={() => {
            const rows = [['Date / Heure', 'Ancien Taux', 'Nouveau Taux', 'Variation', 'Ajouté par', 'Utilisateur']];
            HISTORY.forEach((h) => {
              rows.push([h.date, h.old, h.next, h.change, h.by, h.user]);
            });
            const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `historique_taux_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="h-9 px-4 rounded-lg bg-allness-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Download className="w-3.5 h-3.5" />
          Exporter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <select
            value={pairFilter}
            onChange={(e) => setPairFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
          >
            <option value="all">Toutes les paires</option>
            <option value="USD/XAF">USD/XAF</option>
            <option value="EUR/XAF">EUR/XAF</option>
            <option value="GBP/XAF">GBP/XAF</option>
            <option value="EUR/USD">EUR/USD</option>
          </select>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
          >
            <option value="all">Toutes les périodes</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
          <button
            onClick={() => {
              setPairFilter('all');
              setPeriodFilter('all');
            }}
            className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3">Date / Heure</th>
              <th className="font-medium pb-3">Ancien Taux</th>
              <th className="font-medium pb-3">Nouveau Taux</th>
              <th className="font-medium pb-3">Variation</th>
              <th className="font-medium pb-3">Ajouté par</th>
              <th className="font-medium pb-3">Utilisateur</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((h, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-3 text-xs text-gray-500">{h.date}</td>
                <td className="text-xs text-gray-600">{h.old}</td>
                <td className="text-xs font-medium text-allness-dark">{h.next}</td>
                <td>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      h.up ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {h.up ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {h.change}
                  </span>
                </td>
                <td className="text-xs text-gray-600">{h.by}</td>
                <td className="text-xs text-gray-600">{h.user}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={page} totalPages={4} onChange={setPage} />
      </div>
    </AdminLayout>
  );
}
