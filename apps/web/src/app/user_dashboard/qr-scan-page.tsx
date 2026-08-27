import { useNavigate } from 'react-router-dom';
import { QrScannerModal } from '@/components/user_dashboard/payements/qr-scanner-modal';

export default function QrScanPage() {
  const navigate = useNavigate();

  const handleScanSuccess = (data: { walletId: string; walletNumber: string; ownerName: string; currency: string }) => {
    const params = new URLSearchParams({
      walletNumber: data.walletNumber,
      name: data.ownerName,
    });
    navigate(`/dashboard/send-money?${params.toString()}`);
  };

  return (
    <QrScannerModal
      onClose={() => navigate('/dashboard/payments')}
      onScanSuccess={handleScanSuccess}
    />
  );
}
