import { useState } from 'react';
import { Zap, Landmark, MapPin, Lightbulb } from 'lucide-react';
import { DocumentDropzone } from './document-dropzone';

type AddressDocType = 'utility_bill' | 'bank_statement' | 'residence_certificate';

interface KycAddressStepProps {
  initialDocType?: AddressDocType;
  initialFile?: File | null;
  onNext: (data: { docType: AddressDocType; file: File | null }) => void;
}

const docTypes: { value: AddressDocType; label: string; icon: typeof Zap }[] = [
  { value: 'utility_bill', label: 'Facture de services publics', icon: Zap },
  { value: 'bank_statement', label: 'Relevé bancaire', icon: Landmark },
  { value: 'residence_certificate', label: 'Certificat de résidence', icon: MapPin },
];

export function KycAddressStep({
  initialDocType = 'utility_bill',
  initialFile = null,
  onNext,
}: KycAddressStepProps) {
  const [docType, setDocType] = useState<AddressDocType>(initialDocType);
  const [file, setFile] = useState<File | null>(initialFile);

  return (
    <div>
      <h2 className="text-xl font-bold text-allness-dark mb-1">Justificatif de domicile</h2>
      <p className="text-sm text-gray-500 mb-5">
        Veuillez fournir un document de moins de 3 mois (facture d'électricité, eau, gaz ou relevé
        bancaire) pour confirmer votre adresse.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {docTypes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setDocType(value)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm text-center transition-colors ${
              docType === value
                ? 'bg-allness-orange/10 text-allness-orange border-allness-orange'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-purple-50 p-4 mb-6 text-xs text-purple-700">
        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium">Conseils d'expert</p>
          <p>Assurez-vous que l'adresse est parfaitement visible.</p>
          <p>Le document doit correspondre exactement aux informations de votre profil.</p>
          <p>Toutes les bordures du document doivent être visibles sur la photo/scan.</p>
        </div>
      </div>

      <p className="text-xs font-medium text-gray-500 mb-2">DOCUMENT (PDF, JPG, PNG)</p>
      <div className="mb-6">
        <DocumentDropzone
          label="Glissez-déposez votre document ici"
          hint="ou parcourez vos fichiers · Taille max : 5 Mo"
          file={file}
          onFileSelect={setFile}
        />
      </div>

      <button
        onClick={() => onNext({ docType, file })}
        disabled={!file}
        className="w-full h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        Suivant →
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        En continuant, vous acceptez que Allness pay traite vos données personnelles conformément à
        notre{' '}
        <a href="/confidentialite" className="text-allness-green font-medium">
          Politique de Confidentialité
        </a>
        .
      </p>
    </div>
  );
}
