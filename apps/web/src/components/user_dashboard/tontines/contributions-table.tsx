import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { Contribution } from '@/lib/mock/tontines-data';

const statusStyles: Record<Contribution['status'], { label: string; className: string }> = {
  valide: { label: 'Validé', className: 'bg-green-50 text-afrilink-green' },
  en_attente: { label: 'En attente', className: 'bg-orange-50 text-afrilink-orange' },
  echoue: { label: 'Échoué', className: 'bg-red-50 text-red-600' },
};

interface ContributionsTableProps {
  contributions: Contribution[];
}

export function ContributionsTable({ contributions }: ContributionsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = contributions.filter((c) => {
    const matchesSearch = c.memberName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesDate = !dateFilter || c.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrer par nom de membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-200 pl-9 pr-3 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
        >
          <option value="all">Tous les statuts</option>
          <option value="valide">Validé</option>
          <option value="en_attente">En attente</option>
          <option value="echoue">Échoué</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
        />
        <button
          onClick={() => {
            setSearch('');
            setStatusFilter('all');
            setDateFilter('');
          }}
          className="h-10 px-3 rounded-lg border border-gray-200 text-gray-500 flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-green-50/60 text-gray-500 text-xs">
            <th className="text-left font-medium px-4 py-2.5">Date du Versement</th>
            <th className="text-left font-medium px-4 py-2.5">Nom du Membre</th>
            <th className="text-left font-medium px-4 py-2.5">Montant</th>
            <th className="text-left font-medium px-4 py-2.5">Statut</th>
            <th className="text-left font-medium px-4 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map((c) => {
            const status = statusStyles[c.status];
            return (
              <tr key={c.id}>
                <td className="px-4 py-3 text-gray-500">
                  {c.date}
                  <span className="block text-[11px] text-gray-400">{c.time}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-500">
                      {c.memberName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                    <span className="text-gray-800">{c.memberName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{c.amount.toFixed(2)} CFA</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.status !== 'echoue' ? (
                    <a href="#" className="text-xs text-afrilink-green font-medium">
                      View Receipt →
                    </a>
                  ) : (
                    <span className="text-xs text-gray-300">N/A</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-center gap-2 p-4 text-xs text-gray-500">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            className={`w-7 h-7 rounded-lg ${
              n === 1 ? 'bg-afrilink-orange text-white' : 'hover:bg-gray-50'
            }`}
          >
            {n}
          </button>
        ))}
        <span>...</span>
        <button className="w-7 h-7 rounded-lg hover:bg-gray-50">25</button>
      </div>
    </div>
  );
}
