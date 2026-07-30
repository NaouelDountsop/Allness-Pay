import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { InvoiceDetails } from "@/components/user_dashboard/payements/invoice-details";

interface QrPaymentState {
  merchant?: string;
  reference?: string;
  amount?: number;
}

export default function QrPaymentPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: QrPaymentState };

  const merchant = state?.merchant ?? "SuperMarket Bafoussam";
  const reference = state?.reference ?? "CMD123456";
  const amount = state?.amount ?? 15000;

  const handleConfirm = () => {
    navigate("/dashboard/payments", { state: { success: true } });
  };

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="px-4 sm:px-6 lg:px-8 pb-20 md:pb-10 max-w-3xl">
        <button
          onClick={() => navigate("/dashboard/payments")}
          className="flex items-center gap-2 text-base sm:text-lg font-semibold text-afrilink-dark mb-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Paiement par QR Code
        </button>
        <p className="text-sm text-gray-500 mb-6">
          Sélectionnez une catégorie pour régler vos factures en quelques clics.
        </p>

        <div className="flex justify-center mb-6">
          <div className="w-44 h-32 sm:w-56 sm:h-40 rounded-xl border-2 border-afrilink-orange p-3 sm:p-4 flex items-center justify-center">
            <img
              src="/socadel.svg"
              alt={merchant}
              className="max-h-20 sm:max-h-28 object-contain"
            />
          </div>
        </div>

        <InvoiceDetails
          clientName={merchant}
          reference={reference}
          amount={amount}
          serviceFee={0}
          total={442150}
          onConfirm={handleConfirm}
        />
      </div>
    </DashboardLayout>
  );
}
