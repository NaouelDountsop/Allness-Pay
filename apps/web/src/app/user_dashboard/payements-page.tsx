import { useNavigate } from "react-router-dom";
import { Star, History } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { QrCodePanel } from "@/components/user_dashboard/payements/qr-code-panel";
import { HowToPay } from "@/components/user_dashboard/payements/how-to-pay";
import { ServiceCategoriesGrid } from "@/components/user_dashboard/payements/service-categories-grid";
import { WhyChooseCard } from "@/components/user_dashboard/payements/why-choose-card";
import { RecentPaymentsList } from "@/components/user_dashboard/payements/recent-payements-list";
import { ScheduledPaymentsBanner } from "@/components/user_dashboard/payements/scheduled-payements-banner";
import { serviceCategories, mockRecentPayments } from "@/lib/mock/payements-data";

export default function PaymentsPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="px-4 sm:px-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg font-semibold text-afrilink-dark">
              Paiements &amp; Services
            </h1>
            <p className="text-sm text-gray-500">
              Réglez vos factures, achetez du crédit et accédez à une multitude de
              services en quelques clics, en toute sécurité.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Favoris
            </button>
            <button className="h-9 px-4 rounded-lg border border-afrilink-orange text-afrilink-orange text-sm flex items-center gap-2">
              <History className="w-4 h-4" />
              Historique
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <QrCodePanel onScanClick={() => navigate("/dashboard/payments/scan")} />
          </div>
          <HowToPay />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ServiceCategoriesGrid categories={serviceCategories} />
          </div>
          <WhyChooseCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentPaymentsList payments={mockRecentPayments} />
          <ScheduledPaymentsBanner />
        </div>
      </div>
    </DashboardLayout>
  );
}
