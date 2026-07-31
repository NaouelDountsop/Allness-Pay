import { useState } from "react";
import { Globe, IdCard, Car, Info } from "lucide-react";
import { DocumentDropzone } from "./document-dropzone";

type DocType = "passport" | "national_id" | "license";

interface KycDocumentStepProps {
  onNext: (data: { docType: DocType; front: File | null; back: File | null }) => void;
}

const docTypes: { value: DocType; label: string; icon: typeof Globe }[] = [
  { value: "passport", label: "Passeport", icon: Globe },
  { value: "national_id", label: "Carte Nationale", icon: IdCard },
  { value: "license", label: "Permis de conduire", icon: Car },
];

export function KycDocumentStep({ onNext }: KycDocumentStepProps) {
  const [docType, setDocType] = useState<DocType>("passport");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);

  return (
    <div>
      {/* <h2 className="text-xl font-bold text-afrilink-dark mb-1">
        Téléverser votre document
      </h2> */}
      <p className="text-sm text-gray-500 mb-5">
        Veuillez sélectionner le type de document que vous souhaitez utiliser pour
        confirmer votre identité.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {docTypes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setDocType(value)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors ${
              docType === value
                ? "bg-afrilink-orange/10 text-afrilink-orange border-afrilink-orange"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-4 mb-6 text-xs text-blue-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium">Conseils pour une vérification rapide</p>
          <p>Assurez-vous qu'il n'y a pas de reflets ou d'éblouissement.</p>
          <p>L'image doit être nette et non floue.</p>
          <p>Toutes les informations doivent être parfaitement lisibles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Recto du document</p>
          <DocumentDropzone
            label="Cliquez ou glissez-déposez"
            file={front}
            onFileSelect={setFront}
          />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Verso du document</p>
          <DocumentDropzone
            label="Cliquez ou glissez-déposez"
            file={back}
            onFileSelect={setBack}
          />
        </div>
      </div>

      <button
        onClick={() => onNext({ docType, front, back })}
        disabled={!front || !back}
        className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        Suivant →
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        En continuant, vous acceptez que Afrilink pay traite vos données personnelles
        conformément à notre{" "}
        <a href="/confidentialite" className="text-afrilink-green font-medium">
          Politique de Confidentialité
        </a>
        .
      </p>
    </div>
  );
}
