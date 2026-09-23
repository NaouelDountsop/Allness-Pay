import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { WalletQrCodeDisplay } from '@/components/user_dashboard/wallet/wallet-qr-code';

export default function WalletQrCodePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="text-center py-10 text-gray-500 text-sm">Wallet introuvable.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-allness-dark hover:text-allness-orange transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <h1 className="text-2xl font-bold text-allness-dark mb-2">QR Code du Wallet</h1>
        <p className="text-sm text-gray-500 mb-6">
          Montrez ce QR Code pour recevoir des fonds.
        </p>

        <div className="max-w-sm mx-auto rounded-2xl border border-gray-100 shadow-sm p-6 bg-white">
          <WalletQrCodeDisplay walletId={id} walletNumber="" />
        </div>
      </div>
    </DashboardLayout>
  );
}
