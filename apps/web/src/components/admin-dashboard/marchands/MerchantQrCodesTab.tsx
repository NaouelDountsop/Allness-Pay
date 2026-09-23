import { QrCode, Download, RefreshCcw, Plus } from 'lucide-react';
import { SectionCard } from '../../ui/section-card';

function downloadQr(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="white"/>
    <rect x="20" y="20" width="60" height="60" rx="4" fill="#0D343A"/>
    <rect x="30" y="30" width="40" height="40" rx="2" fill="white"/>
    <rect x="38" y="38" width="24" height="24" rx="1" fill="#0D343A"/>
    <rect x="120" y="20" width="60" height="60" rx="4" fill="#0D343A"/>
    <rect x="130" y="30" width="40" height="40" rx="2" fill="white"/>
    <rect x="138" y="38" width="24" height="24" rx="1" fill="#0D343A"/>
    <rect x="20" y="120" width="60" height="60" rx="4" fill="#0D343A"/>
    <rect x="30" y="130" width="40" height="40" rx="2" fill="white"/>
    <rect x="38" y="138" width="24" height="24" rx="1" fill="#0D343A"/>
    <rect x="90" y="90" width="20" height="20" fill="#D28E2F"/>
    <text x="100" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#666">${label}</text>
  </svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qr-${label.toLowerCase().replace(/\s+/g, '-')}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export function MerchantQrCodesTab() {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Codes Généraux">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {['Compte Principal', 'Point de Vente 2'].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 p-5 flex flex-col items-center text-center"
            >
              <span className="w-28 h-28 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                <QrCode className="w-14 h-14 text-allness-dark" />
              </span>
              <p className="text-xs font-semibold text-allness-dark mb-3">{label}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadQr(label)}
                  className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] text-gray-600 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </button>
                <button className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] text-gray-600 flex items-center gap-1.5">
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Régénérer
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Gestion des Employés">
        <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 mb-3">
          <div>
            <p className="text-xs font-medium text-allness-dark">Employé #1</p>
            <p className="text-[11px] text-gray-400">ID: MER-88219</p>
          </div>
          <QrCode className="w-6 h-6 text-gray-300" />
        </div>
        <button className="h-9 px-4 rounded-lg bg-allness-dark text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" />
          Générer QR Employé
        </button>
      </SectionCard>
    </div>
  );
}
