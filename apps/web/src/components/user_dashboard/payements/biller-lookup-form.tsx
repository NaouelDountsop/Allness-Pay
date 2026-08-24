import { useTranslation } from 'react-i18next';
import { Building2, Hash } from 'lucide-react';

interface BillerLookupFormProps {
  supplier: string;
  reference: string;
  onSupplierChange: (v: string) => void;
  onReferenceChange: (v: string) => void;
  onSearch: () => void;
}

export function BillerLookupForm({
  supplier,
  reference,
  onSupplierChange,
  onReferenceChange,
  onSearch,
}: BillerLookupFormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500">{t('payments.billerLookup.supplier')}</label>
        <div className="relative mt-1">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={supplier}
            onChange={(e) => onSupplierChange(e.target.value)}
            placeholder={t('payments.billerLookup.supplierPlaceholder')}
            className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-3 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500">{t('payments.billerLookup.reference')}</label>
        <div className="relative mt-1">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={reference}
            onChange={(e) => onReferenceChange(e.target.value)}
            placeholder={t('payments.billerLookup.referencePlaceholder')}
            className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-3 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
          />
        </div>
      </div>

      <button
        onClick={onSearch}
        className="w-full h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors"
      >
        {t('payments.billerLookup.search')}
      </button>
    </div>
  );
}
