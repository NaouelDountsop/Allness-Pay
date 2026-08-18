import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Pencil,
  CircleCheck,
  Search,
  RotateCcw,
  Plus,
  Settings,
  Power,
  Grid2x2,
  RefreshCw,
  Loader2,
  Coins,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin-dashboard/admin-layout';
import { adminService, type AdminCurrency, type AdminExchangeRate } from '@/lib/api/admin.service';
import { getFlagUrl } from '@/data/countries';

const TABS = ['Tous les taux', 'Taux actifs', 'Taux inactifs'];

const CURRENCY_FLAGS: Record<string, string> = {
  XAF: '\u{1F30D}',
  XOF: '\u{1F30D}',
  CAD: '\u{1F1E8}\u{1F1E6}',
  EUR: '\u{1F1EA}\u{1F1FA}',
};

const CURRENCY_LABELS: Record<string, string> = {
  XAF: 'Franc CFA (CEMAC)',
  XOF: 'Franc CFA (UEMOA)',
  CAD: 'Dollar canadien',
  EUR: 'Euro',
};

const CURRENCY_COUNTRIES: Record<string, { name: string; code: string }[]> = {
  XAF: [
    { name: 'Cameroun', code: 'CM' },
    { name: 'Gabon', code: 'GA' },
    { name: 'Congo', code: 'CG' },
  ],
  XOF: [
    { name: 'Sénégal', code: 'SN' },
    { name: "Côte d'Ivoire", code: 'CI' },
    { name: 'Niger', code: 'NE' },
    { name: 'Mali', code: 'ML' },
    { name: 'Burkina Faso', code: 'BF' },
    { name: 'Togo', code: 'TG' },
    { name: 'Bénin', code: 'BJ' },
  ],
  CAD: [{ name: 'Canada', code: 'CA' }],
  EUR: [{ name: 'France', code: 'FR' }],
};

function CurrenciesDialog({
  open,
  onOpenChange,
  currencies,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencies: AdminCurrency[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogClose onOpenChange={onOpenChange} />
        <DialogHeader>
          <DialogTitle>Devises gérées</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto pr-1">
          {currencies.map((currency) => {
            const countries = CURRENCY_COUNTRIES[currency.code] ?? [];
            return (
              <div
                key={currency.code}
                className={`rounded-xl border p-4 transition-colors ${
                  currency.isActive ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{CURRENCY_FLAGS[currency.code] ?? '🌍'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{currency.code}</p>
                      {!currency.isActive && (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{currency.name}</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">{currency.symbol}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {countries.map((country) => (
                    <span
                      key={country.code}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 px-2.5 py-1 text-[11px] text-gray-600"
                    >
                      <img
                        src={getFlagUrl(country.code)}
                        alt={country.name}
                        className="w-4 h-3 rounded-sm object-cover"
                      />
                      {country.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {currencies.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">Aucune devise configurée.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RateRow({
  rate,
  isSelected,
  onSelect,
  onEdit,
}: {
  rate: AdminExchangeRate;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  return (
    <tr
      className={`border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${
        isSelected ? 'bg-afrilink-orange/5' : 'hover:bg-gray-50/50'
      }`}
      onClick={onSelect}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{CURRENCY_FLAGS[rate.fromCurrencyCode] ?? '\u{1F30D}'}</span>
          <span className="font-medium text-gray-900">{rate.fromCurrencyCode}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{CURRENCY_FLAGS[rate.toCurrencyCode] ?? '\u{1F30D}'}</span>
          <span className="font-medium text-gray-900">{rate.toCurrencyCode}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 font-medium text-gray-900">
        {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(rate.rate)}
      </td>
      <td className="px-3 py-2.5">
        <span
          className={`inline-flex items-center gap-0.5 font-medium ${
            rate.isActive ? 'text-afrilink-green' : 'text-gray-400'
          }`}
        >
          {rate.isActive ? (
            <>
              <CircleCheck className="h-3 w-3" />
              Actif
            </>
          ) : (
            'Inactif'
          )}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

export default function ExchangeRatesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [selectedRate, setSelectedRate] = useState<AdminExchangeRate | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [baseFilter, setBaseFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCurrencies, setShowCurrencies] = useState(false);
  const pageSize = 10;

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['admin-exchange-rates'],
    queryFn: adminService.listExchangeRates,
  });

  const { data: currencies = [] } = useQuery({
    queryKey: ['admin-currencies'],
    queryFn: adminService.listCurrencies,
  });

  const currencyCodes = useMemo(() => currencies.map((c) => c.code), [currencies]);

  const filteredRates = useMemo(() => {
    return rates.filter((rate) => {
      const matchesSearch =
        rate.fromCurrencyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.toCurrencyCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBase = baseFilter === 'all' || rate.fromCurrencyCode === baseFilter;
      const matchesTarget = targetFilter === 'all' || rate.toCurrencyCode === targetFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'actif' && rate.isActive) ||
        (statusFilter === 'inactif' && !rate.isActive);
      const matchesTab =
        activeTab === 'Tous les taux' ||
        (activeTab === 'Taux actifs' && rate.isActive) ||
        (activeTab === 'Taux inactifs' && !rate.isActive);
      return matchesSearch && matchesBase && matchesTarget && matchesStatus && matchesTab;
    });
  }, [rates, searchQuery, baseFilter, targetFilter, statusFilter, activeTab]);

  const paginatedRates = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRates.slice(start, start + pageSize);
  }, [filteredRates, page]);

  const totalPages = Math.max(1, Math.ceil(filteredRates.length / pageSize));

  const stats = useMemo(() => {
    const activeCount = rates.filter((r) => r.isActive).length;
    return [
      { label: 'Paires', value: String(rates.length), change: '', icon: Grid2x2, color: 'text-green-400' },
      {
        label: 'Taux actifs',
        value: String(activeCount),
        change: rates.length > 0 ? `${Math.round((activeCount / rates.length) * 100)}% du total` : '',
        icon: ArrowLeftRight,
        color: 'text-purple-400',
      },
      {
        label: 'Taux inactifs',
        value: String(rates.length - activeCount),
        change: '',
        icon: CircleCheck,
        color: 'text-amber-400',
      },
      {
        label: 'Statut',
        value: activeCount > 0 ? 'Actif' : 'Aucun',
        change: activeCount > 0 ? 'Marché ouvert' : 'Marché fermé',
        icon: RefreshCw,
        color: activeCount > 0 ? 'text-green-400' : 'text-red-400',
      },
    ];
  }, [rates]);

  const EVOLUTION_DATA = useMemo(() => {
    if (!selectedRate) return [];
    return [
      { day: 'Lun', value: selectedRate.rate * 0.998 },
      { day: 'Mar', value: selectedRate.rate * 1.001 },
      { day: 'Mer', value: selectedRate.rate * 0.997 },
      { day: 'Jeu', value: selectedRate.rate * 1.002 },
      { day: 'Ven', value: selectedRate.rate * 0.999 },
      { day: 'Sam', value: selectedRate.rate * 1.0005 },
      { day: 'Dim', value: selectedRate.rate },
    ];
  }, [selectedRate]);

  if (selectedRate === null && rates.length > 0) {
    setSelectedRate(rates[0]!);
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-afrilink-dark">Taux de change</h1>
            <p className="text-xs text-gray-400">Gérez les devises et les taux de change de la plateforme.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs"
            onClick={() => setShowCurrencies(true)}
          >
            <Coins className="mr-1.5 h-3.5 w-3.5" />
            Devises
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs"
            onClick={() => navigate('/admin/taux-de-change/parametres')}
          >
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Paramètres
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => {
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
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-transparent text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={baseFilter}
                onChange={(e) => {
                  setBaseFilter(e.target.value);
                  setPage(1);
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
              >
                <option value="all">Base</option>
                {currencyCodes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={targetFilter}
                onChange={(e) => {
                  setTargetFilter(e.target.value);
                  setPage(1);
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
              >
                <option value="all">Cible</option>
                {currencyCodes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
              >
                <option value="all">Statut</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setBaseFilter('all');
                  setTargetFilter('all');
                  setStatusFilter('all');
                  setPage(1);
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-afrilink-orange animate-spin" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-[11px] font-medium text-gray-400">
                        <th className="px-3 py-2">Base</th>
                        <th className="px-3 py-2">Cible</th>
                        <th className="px-3 py-2">Taux</th>
                        <th className="px-3 py-2">Statut</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRates.map((rate) => (
                        <RateRow
                          key={`${rate.fromCurrencyCode}-${rate.toCurrencyCode}`}
                          rate={rate}
                          isSelected={selectedRate?.fromCurrencyCode === rate.fromCurrencyCode && selectedRate?.toCurrencyCode === rate.toCurrencyCode}
                          onSelect={() => setSelectedRate(rate)}
                          onEdit={() => navigate(`/admin/taux-de-change/${rate.fromCurrencyCode}-${rate.toCurrencyCode}/modifier`)}
                        />
                      ))}
                      {paginatedRates.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                            Aucun taux de change trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
                  <p className="text-[11px] text-gray-400">
                    {filteredRates.length === 0
                      ? '0 résultat'
                      : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredRates.length)} / ${filteredRates.length}`}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`rounded px-2 py-1 text-[11px] font-medium ${
                          page === n ? 'bg-afrilink-dark text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          {selectedRate && (
            <>
              {/* Details */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-900 mb-3">Détails</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CURRENCY_FLAGS[selectedRate.fromCurrencyCode] ?? '\u{1F30D}'}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{selectedRate.fromCurrencyCode}</p>
                      <p className="text-[10px] text-gray-400">{CURRENCY_LABELS[selectedRate.fromCurrencyCode] ?? selectedRate.fromCurrencyCode}</p>
                    </div>
                  </div>
                  <ArrowLeftRight className="h-3.5 w-3.5 text-gray-300" />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CURRENCY_FLAGS[selectedRate.toCurrencyCode] ?? '\u{1F30D}'}</span>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-900">{selectedRate.toCurrencyCode}</p>
                      <p className="text-[10px] text-gray-400">{CURRENCY_LABELS[selectedRate.toCurrencyCode] ?? selectedRate.toCurrencyCode}</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 border-y border-gray-100 text-xs">
                  {[
                    ['Taux', `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(selectedRate.rate)} ${selectedRate.toCurrencyCode}`],
                    ['Statut', selectedRate.isActive ? 'Actif' : 'Inactif'],
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
                    onClick={() => navigate(`/admin/taux-de-change/${selectedRate.fromCurrencyCode}-${selectedRate.toCurrencyCode}/modifier`)}
                  >
                    Modifier le taux
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg text-xs"
                    onClick={async () => {
                      if (!selectedRate) return;
                      await adminService.updateExchangeRate(
                        selectedRate.fromCurrencyCode,
                        selectedRate.toCurrencyCode,
                        { isActive: !selectedRate.isActive },
                      );
                    }}
                  >
                    <Power className="mr-1.5 h-3.5 w-3.5" />
                    {selectedRate.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </div>

              {/* Evolution chart */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-900">
                    Évolution ({selectedRate.fromCurrencyCode}/{selectedRate.toCurrencyCode})
                  </p>
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
                        tick={{ fontSize: 9, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        domain={['dataMin', 'dataMax']}
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
            </>
          )}
        </div>
      </div>

      <CurrenciesDialog
        open={showCurrencies}
        onOpenChange={setShowCurrencies}
        currencies={currencies}
      />
    </AdminLayout>
  );
}
