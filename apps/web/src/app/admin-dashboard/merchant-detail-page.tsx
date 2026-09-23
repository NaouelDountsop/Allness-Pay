import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Badge, Tabs } from '../../components/ui';
import { MerchantCoordonneesTab } from '../../components/admin-dashboard/marchands/MerchantCoordonneesTab';
import { MerchantTransactionsTab } from '../../components/admin-dashboard/marchands/MerchantTransactionsTab';
import { MerchantQrCodesTab } from '../../components/admin-dashboard/marchands/MerchantQrCodesTab';
import { MerchantPaymentIdTab } from '../../components/admin-dashboard/marchands/MerchantPaymentIdTab';

const TABS = ['Coordonnées', 'Transactions', 'QR Codes', 'Paiement par Identifiant'];

export default function MerchantDetailPage() {
  const [tab, setTab] = useState('Coordonnées');
  const navigate = useNavigate();

  return (
    <AdminLayout active="marchands">
      <button
        onClick={() => navigate('/admin/marchands')}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-allness-dark mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Détails Marchand
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-allness-dark flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-allness-dark">Boutique Horizon</p>
              <Badge tone="green" dot>
                Actif
              </Badge>
            </div>
            <p className="text-[11px] text-gray-400">Marché Central • Actif depuis Jan 2022</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
            Modifier Profil
          </button>
          <button className="h-9 px-4 rounded-lg bg-red-500 text-white text-xs font-medium hover:opacity-90 transition-opacity">
            Suspendre
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === 'Coordonnées' && <MerchantCoordonneesTab />}
      {tab === 'Transactions' && <MerchantTransactionsTab />}
      {tab === 'QR Codes' && <MerchantQrCodesTab />}
      {tab === 'Paiement par Identifiant' && <MerchantPaymentIdTab />}
    </AdminLayout>
  );
}
