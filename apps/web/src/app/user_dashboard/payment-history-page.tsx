import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Search, X, Receipt, CheckCircle2, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { Pagination } from '@/components/ui/pagination';
import { mockRecentPayments } from '@/lib/mock/payments-data';
import type { RecentPayment } from '@/lib/mock/payments-data';

const PAGE_SIZE = 10;

function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

export default function PaymentHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const allPayments = useMemo<RecentPayment[]>(() => {
    return mockRecentPayments;
  }, []);

  const filteredPayments = useMemo(() => {
    let result = allPayments;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  }, [allPayments, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPaid = allPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = allPayments.filter((p) => p.status === 'pending').length;
  const successRate = allPayments.length > 0
    ? Math.round((allPayments.filter((p) => p.status === 'paid').length / allPayments.length) * 100)
    : 0;

  const handleExport = () => {
    const headers = ['Label', 'Reference', 'Date', 'Montant', 'Statut'];
    const rows = filteredPayments.map((p) => [
      p.label,
      p.reference,
      p.date,
      String(p.amount),
      p.status === 'paid' ? 'Payé' : 'En attente',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historique-paiements.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <button
              onClick={() => navigate('/dashboard/payments')}
              className="flex items-center gap-2 text-lg font-semibold text-allness-dark"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('paymentHistory.title')}
            </button>
            <p className="text-sm text-gray-500 mt-1">{t('paymentHistory.subtitle')}</p>
          </div>
          <button
            onClick={handleExport}
            className="h-9 px-4 rounded-lg border border-allness-green text-allness-green text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('paymentHistory.exportCsv')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-allness-dark p-5 text-white">
            <p className="text-xs text-white/60 mb-1">{t('paymentHistory.totalPaid')}</p>
            <p className="text-2xl font-bold">
              {formatAmount(totalPaid)} <span className="text-sm text-allness-orange">FCFA</span>
            </p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-brand-text-secondary">{t('paymentHistory.pending')}</p>
                <p className="text-xl font-bold text-brand-text">{totalPending}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-allness-green/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-allness-green" />
              </div>
              <div>
                <p className="text-xs text-brand-text-secondary">{t('paymentHistory.successRate')}</p>
                <p className="text-xl font-bold text-brand-text">{successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-card p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t('paymentHistory.searchPlaceholder')}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-allness-orange"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-allness-orange"
            >
              <option value="all">{t('paymentHistory.allStatuses')}</option>
              <option value="paid">{t('paymentHistory.paid')}</option>
              <option value="pending">{t('paymentHistory.pendingStatus')}</option>
            </select>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 flex items-center gap-1 hover:bg-gray-50"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('paymentHistory.reset')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-hover">
                  <th className="text-left px-5 py-3 font-medium text-brand-text-secondary">{t('paymentHistory.paymentLabel')}</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-text-secondary">{t('paymentHistory.reference')}</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-text-secondary">{t('paymentHistory.amount')}</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-text-secondary">{t('paymentHistory.status')}</th>
                  <th className="text-left px-5 py-3 font-medium text-brand-text-secondary">{t('paymentHistory.date')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      {t('paymentHistory.noPayments')}
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-brand-border last:border-0 hover:bg-brand-hover/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-allness-orange/10 flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4 text-allness-orange" />
                          </div>
                          <span className="font-medium text-brand-text">{payment.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-brand-text-secondary">{payment.reference}</td>
                      <td className="px-5 py-3.5 font-semibold text-brand-text">
                        {formatAmount(payment.amount)} <span className="text-xs text-brand-text-secondary">FCFA</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid'
                              ? 'bg-green-50 text-allness-green'
                              : 'bg-yellow-50 text-yellow-600'
                          }`}
                        >
                          {payment.status === 'paid' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {payment.status === 'paid' ? t('paymentHistory.paid') : t('paymentHistory.pendingStatus')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-brand-text-secondary">{payment.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-brand-border flex items-center justify-between">
              <p className="text-xs text-brand-text-secondary">
                {t('paymentHistory.showing')} {(currentPage - 1) * PAGE_SIZE + 1}
                {' - '}
                {Math.min(currentPage * PAGE_SIZE, filteredPayments.length)}{' '}
                {t('paymentHistory.on')} {filteredPayments.length}
              </p>
              <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
