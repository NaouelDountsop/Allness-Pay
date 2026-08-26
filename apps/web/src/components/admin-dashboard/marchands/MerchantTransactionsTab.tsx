import { useState } from 'react';
import { Coins, Repeat, Percent, Search, Download } from 'lucide-react';
import { StatCard, Badge } from '../../../components/ui';

const TRANSACTIONS = [
  {
    date: '30/07/2026',
    client: 'Client #4821',
    amount: '125,000 XAF',
    status: 'Réussi',
    tone: 'green' as const,
  },
  {
    date: '29/07/2026',
    client: 'Client #3390',
    amount: '48,500 XAF',
    status: 'Réussi',
    tone: 'green' as const,
  },
  {
    date: '29/07/2026',
    client: 'Client #1187',
    amount: '12,000 XAF',
    status: 'En attente',
    tone: 'orange' as const,
  },
];

export function MerchantTransactionsTab() {
  const [search, setSearch] = useState('');

  const filtered = TRANSACTIONS.filter(
    (t) =>
      t.client.toLowerCase().includes(search.toLowerCase()) ||
      t.amount.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-5">
        <StatCard icon={Coins} label="Volume Total" value="24.5 M XAF" />
        <StatCard icon={Repeat} label="Transactions" value="1,248" />
        <StatCard icon={Percent} label="Taux de Frais" value="0.45%" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <p className="text-sm font-semibold text-allness-dark">Historique des Transactions</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                const rows = [['Date', 'Client', 'Montant', 'Statut']];
                filtered.forEach((t) => {
                  rows.push([t.date, t.client, t.amount, t.status]);
                });
                const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transactions_marchand_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
              <th className="font-medium pb-3">Date</th>
              <th className="font-medium pb-3">Client</th>
              <th className="font-medium pb-3">Montant</th>
              <th className="font-medium pb-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-3 text-xs text-gray-500">{t.date}</td>
                <td className="text-xs text-gray-600">{t.client}</td>
                <td className="text-xs font-medium text-allness-dark">{t.amount}</td>
                <td>
                  <Badge tone={t.tone} dot>
                    {t.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
