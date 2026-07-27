import { useNavigate } from "react-router-dom";
import { QrScannerModal } from "@/components/user_dashboard/payements/qr-scanner-modal";

export default function QrScanPage() {
  const navigate = useNavigate();

  return (
    <QrScannerModal
      onClose={() => navigate("/dashboard/payments")}
      onScanSuccess={(data) =>
        navigate("/dashboard/payments/qr-result", { state: data })
      }
    />
  );
}
