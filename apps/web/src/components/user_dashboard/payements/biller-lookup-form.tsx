import { Building2, Hash } from "lucide-react";

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
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500">Fournisseur</label>
        <div className="relative mt-1">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={supplier}
            onChange={(e) => onSupplierChange(e.target.value)}
            placeholder="Sélectionner un fournisseur"
            className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-3 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500">Référence Client</label>
        <div className="relative mt-1">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={reference}
            onChange={(e) => onReferenceChange(e.target.value)}
            placeholder="Entrez votre référence client"
            className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-3 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
          />
        </div>
      </div>

      <button
        onClick={onSearch}
        className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors"
      >
        Rechercher la facture
      </button>
    </div>
  );
}
