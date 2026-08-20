import { Copy, Hash, Smartphone } from 'lucide-react';
import { SectionCard } from '../../ui/section-card';

export function MerchantPaymentIdTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard title="Paiement par Identifiant">
        <div className="flex flex-col items-center py-8">
          <p className="text-[11px] text-gray-400 mb-2">Identifiant marchand</p>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-2xl font-bold tracking-widest text-allness-dark">MER-88219</p>
            <button
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-allness-dark"
              aria-label="Copier"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center max-w-xs">
            Ce code permet aux clients de payer directement ce marchand depuis l'application.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Autres modes de paiement">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 border border-gray-100 rounded-lg px-4 py-3">
            <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <Hash className="w-4 h-4 text-allness-green" />
            </span>
            <div>
              <p className="text-xs font-medium text-allness-dark">Numéro Marchand</p>
              <p className="text-[11px] text-gray-400">88219</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-gray-100 rounded-lg px-4 py-3">
            <span className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-allness-orange" />
            </span>
            <div>
              <p className="text-xs font-medium text-allness-dark">Code USSD</p>
              <p className="text-[11px] text-gray-400">*123*88219#</p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
