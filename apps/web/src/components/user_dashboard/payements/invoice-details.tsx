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
  const format = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Détails de la facture</h3>

      <dl className="space-y-3 text-sm mb-5">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Client</dt>
          <dd className="font-medium text-gray-800">{clientName}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Référence</dt>
          <dd className="font-medium text-gray-800">{reference}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Montant à payer</dt>
          <dd className="font-semibold text-allness-orange">{format(amount)} CFA</dd>
        </div>
        {dueDate && (
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Date d'échéance</dt>
            <dd className="font-medium text-red-500">{dueDate}</dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Frais de service</dt>
          <dd className="font-medium text-gray-800">{format(serviceFee)} CFA</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-5">
        <span className="text-sm font-semibold text-gray-800">Total à payer</span>
        <span className="text-lg font-bold text-gray-900">{format(total)} CFA</span>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-teal-50 p-3 mb-5 text-xs text-teal-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Votre paiement sera traité instantanément. Un reçu numérique sera envoyé à votre adresse
          email et disponible dans votre historique.
        </p>
      </div>

      <button
        onClick={onConfirm}
        className="w-full h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors"
      >
        Confirmer le paiement
      </button>
    </div>
  );
}
