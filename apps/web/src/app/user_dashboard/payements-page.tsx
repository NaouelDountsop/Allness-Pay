import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { History, Wallet, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { ServiceSearchBar } from '@/components/user_dashboard/payements/service-search-bar';
import { ServiceCategoriesGrid } from '@/components/user_dashboard/payements/service-categories-grid';
import { RecentPaymentsList } from '@/components/user_dashboard/payements/recent-payements-list';
import { PaymentStepper } from '@/components/user_dashboard/payements/payment-stepper';
import { serviceCategories, mockRecentPayments } from '@/lib/mock/payments-data';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = serviceCategories.filter(
    (cat) =>
      cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Left Panel - Services & Recent Payments */}
          <div className="lg:col-span-3 space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-allness-dark mb-1">
                {t('payments.title')}
              </h1>
              <p className="text-sm text-gray-500">
                Réglez vos factures et services en quelques secondes, en toute sécurité.
              </p>
            </div>

            {/* Search Bar */}
            <ServiceSearchBar value={searchQuery} onChange={setSearchQuery} />

            {/* Services Grid */}
            <ServiceCategoriesGrid
              categories={filteredCategories}
              onSelect={setSelectedCategory}
              selectedKey={selectedCategory}
            />

            {/* Recent Payments */}
            <RecentPaymentsList
              payments={mockRecentPayments}
              onViewAll={() => navigate('/dashboard/payments/history')}
            />

            {/* Bottom Banner */}
            <div className="rounded-2xl bg-allness-dark text-white p-5 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold mb-1">Plus de simplicité, plus de services</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-3">
                  Payez vos factures et services en toute sécurité avec AfriLinkPay.
                </p>
                <button className="text-xs text-allness-orange font-medium inline-flex items-center gap-1 hover:underline">
                  Découvrir tous les services
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-allness-orange/60" />
              </div>
            </div>
          </div>

          {/* Right Panel - Payment Form */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              {selectedCategory ? (
                <PaymentStepper
                  category={selectedCategory}
                  onBack={() => setSelectedCategory(null)}
                />
              ) : (
                <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Sélectionnez un service pour commencer
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
