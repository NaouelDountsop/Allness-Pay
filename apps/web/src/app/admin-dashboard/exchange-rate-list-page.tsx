import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Pencil,
  CircleCheck,
  Search,
  ChevronDown,
  RotateCcw,
  Upload,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  Power,
  Star,
  Clock,
  AlertTriangle,
  Grid2x2,
  RefreshCw,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin-dashboard/admin-layout';

const TABS = ['Tous les taux', 'Taux actifs', 'Taux inactifs', 'Historique'];

interface Rate {
  id: string;
  base: string;
  baseLabel: string;
  baseFlag: string;
  target: string;
  targetLabel: string;
  targetFlag: string;
  rate: string;
  change: string;
  isUp: boolean;
  source: string;
  mode: 'Automatique' | 'Manuel';
  updatedAt: string;
  status: 'Actif' | 'Inactif';
}

const RATES: Rate[] = [
  {
    id: '1',
    base: 'EUR',
    baseLabel: 'Euro',
    baseFlag: '\u{1F1EA}\u{1F1FA}',
    target: 'XAF',
    targetLabel: 'Franc CFA',
    targetFlag: '\u{1F30D}',
    rate: '655,9578',
    change: '+0,45%',
    isUp: true,
    source: 'Banque Centrale',
    mode: 'Automatique',
    updatedAt: '08:45',
    status: 'Actif',
  },
  {
    id: '2',
    base: 'USD',
    baseLabel: 'Dollar US',
    baseFlag: '\u{1F1FA}\u{1F1F8}',
    target: 'XAF',
    targetLabel: 'Franc CFA',
    targetFlag: '\u{1F30D}',
    rate: '603,2500',
    change: '-0,12%',
    isUp: false,
    source: 'Banque Centrale',
    mode: 'Automatique',
    updatedAt: '08:45',
    status: 'Actif',
  },
  {
    id: '3',
    base: 'GBP',
    baseLabel: 'Livre Sterling',
    baseFlag: '\u{1F1EC}\u{1F1E7}',
    target: 'XAF',
    targetLabel: 'Franc CFA',
    targetFlag: '\u{1F30D}',
    rate: '787,6543',
    change: '+0,32%',
    isUp: true,
    source: 'API Forex',
    mode: 'Automatique',
    updatedAt: '08:45',
    status: 'Actif',
  },
  {
    id: '4',
    base: 'EUR',
    baseLabel: 'Euro',
    baseFlag: '\u{1F1EA}\u{1F1FA}',
    target: 'USD',
    targetLabel: 'Dollar US',
    targetFlag: '\u{1F1FA}\u{1F1F8}',
    rate: '1,0876',
    change: '+0,18%',
    isUp: true,
    source: 'API Forex',
    mode: 'Automatique',
    updatedAt: '08:45',
    status: 'Actif',
  },
  {
    id: '5',
    base: 'USD',
    baseLabel: 'Dollar US',
    baseFlag: '\u{1F1FA}\u{1F1F8}',
    target: 'EUR',
    targetLabel: 'Euro',
    targetFlag: '\u{1F1EA}\u{1F1FA}',
    rate: '0,9194',
    change: '-0,20%',
    isUp: false,
    source: 'API Forex',
    mode: 'Automatique',
    updatedAt: '08:45',
    status: 'Actif',
  },
  {
    id: '6',
    base: 'XAF',
    baseLabel: 'Franc CFA',
    baseFlag: '\u{1F30D}',
    target: 'NGN',
    targetLabel: 'Naira',
    targetFlag: '\u{1F1F3}\u{1F1EC}',
    rate: '2,5789',
    change: '+0,78%',
    isUp: true,
    source: 'Manuel',
    mode: 'Manuel',
    updatedAt: '07:30',
    status: 'Actif',
  },
  {
    id: '7',
    base: 'XAF',
    baseLabel: 'Franc CFA',
    baseFlag: '\u{1F30D}',
    target: 'GHS',
    targetLabel: 'Cedi',
    targetFlag: '\u{1F1EC}\u{1F1ED}',
    rate: '3,1254',
    change: '+0,15%',
    isUp: true,
    source: 'API Forex',
    mode: 'Automatique',
    updatedAt: '08:45',
    status: 'Actif',
  },
  {
    id: '8',
    base: 'XAF',
    baseLabel: 'Franc CFA',
    baseFlag: '\u{1F30D}',
    target: 'USD',
    targetLabel: 'Dollar US',
    targetFlag: '\u{1F1FA}\u{1F1F8}',
    rate: '0,001658',
    change: '-0,10%',
    isUp: false,
    source: 'Banque Centrale',
    mode: 'Automatique',
    updatedAt: '08:45',
    status: 'Actif',
  },
];

const EVOLUTION_DATA = [
  { day: '21', value: 645 },
  { day: '22', value: 649 },
  { day: '23', value: 644 },
  { day: '24', value: 652 },
  { day: '25', value: 648 },
  { day: '26', value: 654 },
  { day: '27', value: 655.9578 },
];

const STATS = [
  { label: 'Paires', value: '132', change: '+12 ce mois', icon: Grid2x2, color: 'text-green-400' },
  {
    label: 'Mis \u00e0 jour',
    value: '08:45',
    change: 'Derni\u00e8re mise \u00e0 jour',
    icon: RefreshCw,
    color: 'text-blue-400',
  },
  {
    label: 'Taux actifs',
    value: '128',
    change: '97% du total',
    icon: ArrowLeftRight,
    color: 'text-purple-400',
  },
  {
    label: 'Taux manuels',
    value: '24',
    change: '18% du total',
    icon: Pencil,
    color: 'text-amber-400',
  },
  {
    label: 'Statut',
    value: 'Actif',
    change: 'March\u00e9 ouvert',
    icon: CircleCheck,
    color: 'text-green-400',
  },
];

export default function ExchangeRatesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [selectedRate, setSelectedRate] = useState<Rate>(RATES[0]!);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [baseFilter, setBaseFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const totalRates = 132;
  const pageSize = 10;

  const filteredRates = RATES.filter((rate) => {
    const matchesSearch =
      rate.base.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.baseLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.targetLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBase = baseFilter === 'all' || rate.base === baseFilter;
    const matchesTarget = targetFilter === 'all' || rate.target === targetFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Actif' && rate.status === 'Actif') ||
      (statusFilter === 'Inactif' && rate.status === 'Inactif');
    return matchesSearch && matchesBase && matchesTarget && matchesStatus;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-afrilink-dark">Taux de change</h1>
            <p className="text-xs text-gray-400">G\u00e9rez les taux de change de la plateforme.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs"
            onClick={() => navigate('/admin/taux-de-change/parametres')}
          >
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Param\u00e8tres
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg text-xs">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Importer
          </Button>
          <Button
            size="sm"
            className="rounded-lg bg-afrilink-dark text-white hover:bg-afrilink-dark/90 text-xs"
            onClick={() => navigate('/admin/taux-de-change/nouveau')}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Dark stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-afrilink-dark rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </span>
                <span className="text-xs text-gray-300">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-3 min-w-0">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 pb-2 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-afrilink-orange text-afrilink-orange'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                  <input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={baseFilter}
                onChange={(e) => setBaseFilter(e.target.value)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
              >
                <option value="all">Base</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="XAF">XAF</option>
              </select>
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
              >
                <option value="all">Cible</option>
                <option value="XAF">XAF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="NGN">NGN</option>
                <option value="GHS">GHS</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
              >
                <option value="all">Statut</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setBaseFilter('all');
                  setTargetFilter('all');
                  setStatusFilter('all');
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="h-3 w-3" />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[11px] font-medium text-gray-400">
                    <th className="px-3 py-2">Base</th>
                    <th className="px-3 py-2">Cible</th>
                    <th className="px-3 py-2">Taux</th>
                    <th className="px-3 py-2">Var.</th>
                    <th className="px-3 py-2 hidden lg:table-cell">Source</th>
                    <th className="px-3 py-2 hidden lg:table-cell">Mode</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map((rate) => (
                    <tr
                      key={rate.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => setSelectedRate(rate)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{rate.baseFlag}</span>
                          <span className="font-medium text-gray-900">{rate.base}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{rate.targetFlag}</span>
                          <span className="font-medium text-gray-900">{rate.target}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900">{rate.rate}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-0.5 font-medium ${rate.isUp ? 'text-afrilink-green' : 'text-red-500'}`}
                        >
                          {rate.change}
                          {rate.isUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 hidden lg:table-cell">
                        {rate.source}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 hidden lg:table-cell">
                        {rate.mode}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-afrilink-green/10 px-2 py-0.5 text-[10px] font-semibold text-afrilink-green">
                          {rate.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/taux-de-change/${rate.id}/modifier`);
                          }}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
              <p className="text-[11px] text-gray-400">
                {(page - 1) * pageSize + 1}\u2013{Math.min(page * pageSize, totalRates)} /{' '}
                {totalRates}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50"
                >
                  Prev
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`rounded px-2 py-1 text-[11px] font-medium ${page === n ? 'bg-afrilink-dark text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {n}
                  </button>
                ))}
                <span className="px-1 text-[11px] text-gray-400">...</span>
                <button
                  onClick={() => setPage(14)}
                  className={`rounded px-2 py-1 text-[11px] font-medium ${page === 14 ? 'bg-afrilink-dark text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  14
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(14, p + 1))}
                  className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          {/* Details */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-900 mb-3">D\u00e9tails</p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedRate.baseFlag}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{selectedRate.base}</p>
                  <p className="text-[10px] text-gray-400">{selectedRate.baseLabel}</p>
                </div>
              </div>
              <ArrowLeftRight className="h-3.5 w-3.5 text-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedRate.targetFlag}</span>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-900">{selectedRate.target}</p>
                  <p className="text-[10px] text-gray-400">{selectedRate.targetLabel}</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100 border-y border-gray-100 text-xs">
              {[
                ['Taux', `${selectedRate.rate} ${selectedRate.target}`],
                ['Variation', selectedRate.change],
                ['Source', selectedRate.source],
                ['Mode', selectedRate.mode],
                ['Derni\u00e8re MAJ', `Aujourd'hui ${selectedRate.updatedAt}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <Button
                className="w-full rounded-lg bg-afrilink-dark text-white hover:bg-afrilink-dark/90 text-xs"
                onClick={() => navigate(`/admin/taux-de-change/${selectedRate.id}/modifier`)}
              >
                Modifier le taux
              </Button>
              <Button variant="outline" className="w-full rounded-lg text-xs">
                <Power className="mr-1.5 h-3.5 w-3.5" />
                D\u00e9sactiver
              </Button>
            </div>
          </div>

          {/* Evolution chart */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-900">
                \u00c9volution ({selectedRate.base}/{selectedRate.target})
              </p>
              <button className="flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-[10px] text-gray-600">
                7J <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={EVOLUTION_DATA}
                  margin={{ left: -20, right: 5, top: 5, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[640, 660]}
                    tick={{ fontSize: 9, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 11, border: '1px solid #e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, fill: '#22c55e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-900 mb-2">Stats rapides</p>
            <div className="space-y-2">
              {[
                {
                  icon: Star,
                  color: 'text-amber-400',
                  label: 'Taux populaires',
                  value: 'EUR/XAF, USD/XAF',
                },
                { icon: Clock, color: 'text-blue-400', label: "MAJ aujourd'hui", value: '18' },
                {
                  icon: AlertTriangle,
                  color: 'text-red-400',
                  label: 'Alertes actives',
                  value: '2',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2 rounded-lg bg-gray-50 p-2">
                  <item.icon className={`mt-0.5 h-3.5 w-3.5 ${item.color}`} />
                  <div>
                    <p className="text-[11px] font-medium text-gray-900">{item.label}</p>
                    <p className="text-[10px] text-gray-500">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
