import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

interface InvoiceDetailsProps {
  clientName: string;
  reference: string;
  amount: number;
  dueDate?: string;
  serviceFee: number;
  total: number;
  onConfirm: () => void;
}

export function InvoiceDetails({
  clientName,
  reference,
  amount,
  dueDate,
  serviceFee,
  total,
  onConfirm,
}: InvoiceDetailsProps) {
  const { t } = useTranslation();
  const format = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('payments.invoice.title')}</h3>

      <dl className="space-y-3 text-sm mb-5">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">{t('payments.invoice.client')}</dt>
          <dd className="font-medium text-gray-800">{clientName}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">{t('payments.invoice.reference')}</dt>
          <dd className="font-medium text-gray-800">{reference}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">{t('payments.invoice.amountDue')}</dt>
          <dd className="font-semibold text-allness-orange">{format(amount)} CFA</dd>
        </div>
        {dueDate && (
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">{t('payments.invoice.dueDate')}</dt>
            <dd className="font-medium text-red-500">{dueDate}</dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">{t('payments.invoice.serviceFee')}</dt>
          <dd className="font-medium text-gray-800">{format(serviceFee)} CFA</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-5">
        <span className="text-sm font-semibold text-gray-800">{t('payments.invoice.totalDue')}</span>
        <span className="text-lg font-bold text-gray-900">{format(total)} CFA</span>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-teal-50 p-3 mb-5 text-xs text-teal-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          {t('payments.invoice.info')}
        </p>
      </div>

      <button
        onClick={onConfirm}
        className="w-full h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors"
      >
        {t('payments.invoice.confirm')}
      </button>
    </div>
  );
}
