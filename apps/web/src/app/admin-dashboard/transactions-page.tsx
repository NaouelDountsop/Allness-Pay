import { useState } from 'react';
import {
  Wallet,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  //Download,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Badge, Pagination } from '../../components/ui';
import { TransactionDetailModal, type TransactionDetail } from './TransactionDetailModal';

interface TransactionRow {
  reference: string;
  user: string;
  email: string;
  type: string;
  amount: string;
  status: 'Complété' | 'En attente' | 'Bloqué';
  location: string;
  date: string;
}

const STATUS_TONE = {
  Complété: 'green',
  'En attente': 'orange',
  Bloqué: 'red',
} as const;

const TRANSACTIONS: TransactionRow[] = [
  {
    reference: 'TXN-88213',
    user: 'Awa Njoya',
    email: 'a.njoya@mail.com',
    type: 'Dépôt Mobile Money',
    amount: '+ 65 000 XAF',
    status: 'Complété',
    location: 'Douala, CM',
    date: '27 Juil 2024, 19:40',
  },
  {
    reference: 'TXN-88214',
    user: 'Cissé Moktar',
    email: 'c.moktar@mail.com',
    type: 'Retrait Mobile Money',
    amount: '- 120 000 XAF',
    status: 'En attente',
    location: 'Yaoundé, CM',
    date: '27 Juil 2024, 18:12',
  },
  {
    reference: 'TXN-88215',
    user: 'Julie Moyo',
    email: 'j.moyo@mail.com',
    type: 'Transfert Tontine',
    amount: '- 25 000 XAF',
    status: 'Bloqué',
    location: 'Bafoussam, CM',
    date: '27 Juil 2024, 16:05',
  },
  {
    reference: 'TXN-88216',
    user: 'Ivan Tchoua',
    email: 'i.tchoua@mail.com',
    type: 'Paiement Marchand',
    amount: '- 8 400 XAF',
    status: 'Complété',
    location: 'Douala, CM',
    date: '27 Juil 2024, 14:51',
  },
];

const DETAIL: TransactionDetail = {
  reference: 'TXN-88214',
  date: '27 Juil 2024, 19:40',
  status: 'En attente',
  amount: '120 000 XAF',
  type: 'Retrait Mobile Money',
  fees: '1 200 XAF',
  device: 'iPhone 14 · CM-DLA-01',
  location: 'Douala, CM · 102.98.xx.xx',
  timeline: [
    { label: 'Requête initiée', meta: 'Utilisateur · 19:40' },
    { label: 'Vérification anti-fraude', meta: 'Système · 19:41' },
    { label: 'Requête traitée', meta: 'IVAN (agent support) · 19:52' },
  ],
};

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TransactionDetail | null>(null);

  const totalPages = Math.ceil(TRANSACTIONS.length / 10);

  return (
    <AdminLayout active="Transactions">
      <h1 className="text-xl font-bold text-afrilink-dark mb-1">Gestion des Transactions</h1>
      <p className="text-sm text-gray-400 mb-6">
        Surveillez, filtrez et intervenez sur l'ensemble des flux financiers.
      </p>

      {/* Stats cards - independent from table */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-sm text-gray-300">Volume total</span>
          </div>
          <p className="text-2xl font-bold text-white">218 000 XAF</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </span>
            <span className="text-sm text-gray-300">Complétées</span>
          </div>
          <p className="text-2xl font-bold text-white">2</p>
        </div>

        <div className="bg-afrilink-dark rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </span>
            <span className="text-sm text-gray-300">Total transactions</span>
          </div>
          <p className="text-2xl font-bold text-white">4</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              Type de transaction
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              Statut
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                <th className="font-medium pb-3">Utilisateur / Référence</th>
                <th className="font-medium pb-3">Type</th>
                <th className="font-medium pb-3">Montant</th>
                <th className="font-medium pb-3">Statut</th>
                <th className="font-medium pb-3 hidden lg:table-cell">Date</th>
                <th className="font-medium pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t) => (
                <tr key={t.reference} className="border-b border-gray-50 last:border-0">
                  <td className="py-3.5">
                    <p className="text-xs font-medium text-afrilink-dark">{t.user}</p>
                    <p className="text-[11px] text-gray-400">{t.reference}</p>
                  </td>
                  <td className="text-xs text-gray-600">{t.type}</td>
                  <td
                    className={`text-xs font-medium ${
                      t.amount.startsWith('+') ? 'text-afrilink-green' : 'text-afrilink-dark'
                    }`}
                  >
                    {t.amount}
                  </td>
                  <td>
                    <Badge tone={STATUS_TONE[t.status]} dot>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="text-xs text-gray-500">{t.location}</td>
                  <td className="text-xs text-gray-500">{t.date}</td>
                  <td className="text-right">
                    <button
                      onClick={() =>
                        setSelected({
                          ...DETAIL,
                          reference: t.reference,
                          date: t.date,
                          status: t.status,
                        })
                      }
                      className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark ml-auto"
                      aria-label="Voir"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm font-semibold text-red-600">Audit des Alertes</p>
        </div>
        <p className="text-xs text-gray-500">
          Les alertes de comportement suspect seront affichées ici une fois détectées par le
          système.
        </p>
      </div>

      {selected && (
        <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
      )}
    </AdminLayout>
  );
}
