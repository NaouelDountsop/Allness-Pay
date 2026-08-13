import { useState } from 'react';
import {
  Users,
  Receipt,
  Handshake,
  Search,
  ChevronDown,
  Plus,
  Eye,
  MoreVertical,
  Filter,
  Download,
  X,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, XAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin-dashboard/admin-layout';
//import { Avatar } from "@/components/ui/avatar";

// Données de démonstration

const STATS = [
  {
    label: 'Total partenaires',
    value: '28',
    change: '+12% vs mois dernier',
    changeColor: 'text-afrilink-green',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    icon: Users,
  },
  {
    label: 'Partenaires actifs',
    value: '24',
    change: '85.7% du total',
    changeColor: 'text-afrilink-green',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
    icon: Users,
  },
  {
    label: 'Volume total (Janvier)',
    value: '1 842 000 000 FCFA',
    change: '+18.6% vs Décembre',
    changeColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    icon: Handshake,
  },
  {
    label: 'Transactions (Janvier)',
    value: '128 540',
    change: '+21.4% vs Décembre',
    changeColor: 'text-afrilink-orange',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    icon: Receipt,
  },
];

interface Partner {
  id: string;
  name: string;
  short: string;
  logoBg: string;
  logoText: string;
  type: string;
  country: string;
  flag?: string;
  services: string[];
  status: 'Actif' | 'En maintenance' | 'Inactif' | 'Suspendu';
  volume: string;
  transactions: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    short: 'MTN',
    logoBg: 'bg-yellow-400',
    logoText: 'text-black',
    type: 'Opérateur Mobile',
    country: 'Cameroun',
    flag: '🇨🇲',
    services: ['Transfert', 'Paiement', 'Recharge'],
    status: 'Actif',
    volume: '620 500 000 FCFA',
    transactions: '45 230',
  },
  {
    id: 'orange',
    name: 'Orange Money',
    short: 'OM',
    logoBg: 'bg-orange-500',
    logoText: 'text-white',
    type: 'Opérateur Mobile',
    country: 'Cameroun',
    flag: '🇨🇲',
    services: ['Transfert', 'Paiement', 'Recharge'],
    status: 'Actif',
    volume: '510 250 000 FCFA',
    transactions: '32 845',
  },
  {
    id: 'ecobank',
    name: 'Ecobank Cameroun',
    short: 'ECO',
    logoBg: 'bg-blue-800',
    logoText: 'text-white',
    type: 'Banque',
    country: 'Cameroun',
    flag: '🇨🇲',
    services: ['Virement', 'Cash In', 'Cash Out'],
    status: 'Actif',
    volume: '420 100 000 FCFA',
    transactions: '18 765',
  },
  {
    id: 'uba',
    name: 'UBA Cameroun',
    short: 'UBA',
    logoBg: 'bg-red-600',
    logoText: 'text-white',
    type: 'Banque',
    country: 'Cameroun',
    flag: '🇨🇲',
    services: ['Virement', 'Cash In', 'Cash Out'],
    status: 'Actif',
    volume: '210 400 000 FCFA',
    transactions: '10 452',
  },
  {
    id: 'sonatel',
    name: 'Sonatel',
    short: 'SNT',
    logoBg: 'bg-orange-100',
    logoText: 'text-orange-600',
    type: 'Fournisseur Service',
    country: 'Sénégal',
    flag: '🇸🇳',
    services: ['Facture', 'Abonnement'],
    status: 'Actif',
    volume: '45 600 000 FCFA',
    transactions: '6 870',
  },
  {
    id: 'canal',
    name: 'CANAL+',
    short: 'C+',
    logoBg: 'bg-black',
    logoText: 'text-white',
    type: 'Fournisseur Service',
    country: 'Afrique (20 pays)',
    services: ['Abonnement', 'Paiement'],
    status: 'Actif',
    volume: '25 300 000 FCFA',
    transactions: '4 320',
  },
  {
    id: 'jumia',
    name: 'Jumia',
    short: 'JM',
    logoBg: 'bg-orange-500',
    logoText: 'text-white',
    type: 'Marchand',
    country: 'Afrique (10 pays)',
    services: ['Paiement', 'Remboursement'],
    status: 'Actif',
    volume: '8 750 000 FCFA',
    transactions: '2 150',
  },
  {
    id: 'total',
    name: 'TotalEnergies',
    short: 'TE',
    logoBg: 'bg-red-700',
    logoText: 'text-white',
    type: 'Fournisseur Service',
    country: 'Afrique (12 pays)',
    services: ['Facture', 'Paiement'],
    status: 'En maintenance',
    volume: '2 600 000 FCFA',
    transactions: '980',
  },
  {
    id: 'nestle',
    name: 'Nestlé Cameroon',
    short: 'NC',
    logoBg: 'bg-red-600',
    logoText: 'text-white',
    type: 'Marchand',
    country: 'Cameroun',
    flag: '🇨🇲',
    services: ['Paiement', 'Remboursement'],
    status: 'Inactif',
    volume: '0 FCFA',
    transactions: '0',
  },
  {
    id: 'nedj',
    name: 'NEDJ Energy',
    short: 'NE',
    logoBg: 'bg-green-600',
    logoText: 'text-white',
    type: 'Fournisseur Service',
    country: 'Cameroun',
    flag: '🇨🇲',
    services: ['Facture'],
    status: 'Suspendu',
    volume: '0 FCFA',
    transactions: '0',
  },
];

const PERFORMANCE_DATA = [
  { date: '01 Jan', value: 22 },
  { date: '04 Jan', value: 28 },
  { date: '08 Jan', value: 25 },
  { date: '11 Jan', value: 32 },
  { date: '15 Jan', value: 30 },
  { date: '18 Jan', value: 40 },
  { date: '22 Jan', value: 55 },
  { date: '25 Jan', value: 68 },
  { date: '28 Jan', value: 82 },
  { date: '31 Jan', value: 100 },
];

const DISTRIBUTION_DATA = [
  { name: 'Opérateurs Mobile', value: 10, pct: '35.7%', color: '#22c55e' },
  { name: 'Banques', value: 6, pct: '21.4%', color: '#3b82f6' },
  { name: 'Fournisseurs', value: 7, pct: '25.0%', color: '#a855f7' },
  { name: 'Marchands', value: 5, pct: '17.9%', color: '#f97316' },
];

const STATUS_STYLES: Record<Partner['status'], string> = {
  Actif: 'bg-afrilink-green/10 text-afrilink-green',
  'En maintenance': 'bg-orange-50 text-orange-500',
  Inactif: 'bg-red-50 text-red-500',
  Suspendu: 'bg-red-50 text-red-500',
};

function StatCard({ stat }: { stat: (typeof STATS)[number] }) {
  const Icon = stat.icon;
  return (
    <div className="bg-afrilink-dark rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.iconBg}`}>
          <Icon className={`w-4 h-4 ${stat.iconColor}`} />
        </span>
        <span className="text-[11px] text-gray-300">{stat.label}</span>
      </div>
      <p className="text-xl font-bold text-white">{stat.value}</p>
      <p className={`text-[10px] mt-1 ${stat.changeColor}`}>{stat.change}</p>
    </div>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-600 hover:border-gray-300">
      {label}
      <ChevronDown className="h-3 w-3 text-gray-400" />
    </button>
  );
}

function ServiceTag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
      {label}
    </span>
  );
}

function PartnerRow({ partner, onSelect }: { partner: Partner; onSelect: () => void }) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
      <td className="whitespace-nowrap px-3 py-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold shrink-0 ${partner.logoBg} ${partner.logoText}`}
          >
            {partner.short}
          </div>
          <span className="text-xs font-medium text-gray-900 truncate">{partner.name}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-2 hidden sm:table-cell">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
          {partner.type}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2 hidden md:table-cell">
        <span className="flex items-center gap-1 text-xs text-gray-700">
          {partner.flag ? partner.flag : <Globe className="h-3 w-3 text-gray-400" />}
          {partner.country}
        </span>
      </td>
      <td className="px-3 py-2 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {partner.services.map((s) => (
            <ServiceTag key={s} label={s} />
          ))}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[partner.status]}`}
        >
          {partner.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-gray-900 hidden xl:table-cell">
        {partner.volume}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-700 hidden xl:table-cell">{partner.transactions}</td>
      <td className="whitespace-nowrap px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onSelect}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Voir le détail"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Plus d'options"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function DetailsPanel({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-900">Détails du partenaire</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${partner.logoBg} ${partner.logoText}`}
        >
          {partner.short}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900">{partner.name}</p>
          <span
            className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_STYLES[partner.status]}`}
          >
            {partner.status}
          </span>
        </div>
      </div>

      <div className="mt-2 divide-y divide-gray-100 border-y border-gray-100 text-xs">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-gray-500">Type</span>
          <span className="font-medium text-gray-900">{partner.type}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-gray-500">Pays</span>
          <span className="font-medium text-gray-900">{partner.country}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-gray-500">Date d'intégration</span>
          <span className="font-medium text-gray-900">12 Avr 2023</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-gray-500">Email</span>
          <span className="font-medium text-gray-900">partenariats@mtn.com</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-gray-500">Référent</span>
          <div className="text-right">
            <p className="text-[11px] font-medium text-gray-900">Marie Douala</p>
            <p className="text-[10px] text-gray-400">marie@mtn.com</p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full justify-center rounded-lg text-[11px]"
      >
        Voir le profil complet
        <ArrowRight className="ml-1.5 h-3 w-3" />
      </Button>
    </div>
  );
}

function PerformanceCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-900">Performance (Janvier 2026)</p>
        <button className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[10px] text-gray-600">
          Janvier 2026
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>
      </div>
      <div className="mt-2 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={PERFORMANCE_DATA} margin={{ left: -20, right: 0, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f97316"
              strokeWidth={1.5}
              fill="url(#perfGradient)"
              dot={{ r: 2, fill: '#f97316', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DistributionCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <p className="text-xs font-semibold text-gray-900">Répartition par type</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-20 w-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DISTRIBUTION_DATA}
                dataKey="value"
                nameKey="name"
                innerRadius={24}
                outerRadius={38}
                paddingAngle={2}
              >
                {DISTRIBUTION_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1">
          {DISTRIBUTION_DATA.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600">{entry.name}</span>
              <span className="font-medium text-gray-900">
                {entry.value} ({entry.pct})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PartnersPage() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(PARTNERS[0]!);
  const [page, setPage] = useState(1);
  const totalPartners = 28;
  const pageSize = 10;

  return (
    <AdminLayout>
      <main className="p-0">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Gestion des Partenaires</h2>
            <p className="text-xs text-gray-500">
              Ajoutez, configurez et suivez vos partenaires.
            </p>
          </div>
          <Button className="h-8 rounded-lg bg-afrilink-green px-3 text-xs text-white hover:bg-afrilink-green/90 shrink-0">
            <Plus className="mr-1 h-3 w-3" />
            Ajouter un partenaire
          </Button>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_260px]">
          {/* Colonne principale : filtres + tableau */}
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      placeholder="Rechercher..."
                      className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>
                </div>
                <FilterSelect label="Type" />
                <FilterSelect label="Statut" />
                <FilterSelect label="Pays" />
                <Button variant="outline" className="h-8 rounded-lg px-2 text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  Filtres
                </Button>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label="Exporter"
                >
                  <Download className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-[10px] font-medium text-gray-400">
                      <th className="px-3 py-2">Partenaire</th>
                      <th className="px-3 py-2 hidden sm:table-cell">Type</th>
                      <th className="px-3 py-2 hidden md:table-cell">Pays</th>
                      <th className="px-3 py-2 hidden lg:table-cell">Services</th>
                      <th className="px-3 py-2">Statut</th>
                      <th className="px-3 py-2 hidden xl:table-cell">Volume</th>
                      <th className="px-3 py-2 hidden xl:table-cell">Tx</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PARTNERS.map((partner) => (
                      <PartnerRow
                        key={partner.id}
                        partner={partner}
                        onSelect={() => setSelectedPartner(partner)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-3 py-2">
                <p className="text-[10px] text-gray-500">
                  Affichage de {(page - 1) * pageSize + 1} à{' '}
                  {Math.min(page * pageSize, totalPartners)} sur {totalPartners} partenaires
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-gray-50"
                  >
                    ‹
                  </button>
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`rounded-lg px-1.5 py-0.5 text-[10px] font-medium ${
                        page === n
                          ? 'bg-afrilink-dark text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(28, p + 1))}
                    className="rounded-lg border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-gray-50"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale : détails + graphiques */}
          <div className="space-y-3">
            {selectedPartner ? (
              <DetailsPanel partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
            ) : null}
            <PerformanceCard />
            <DistributionCard />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
