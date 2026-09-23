import { X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KycGuardPopupProps {
  onClose: () => void;
}

export function KycGuardPopup({ onClose }: KycGuardPopupProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </span>
            <p className="text-sm font-semibold text-gray-900">Vérification requise</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="text-sm text-gray-600 mb-2">
            Vous devez compléter votre vérification d'identité (KYC) avant d'accéder aux tontines.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Cette étape est nécessaire pour garantir la sécurité de tous les membres du groupe.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Plus tard
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/dashboard/kyc');
              }}
              className="h-10 px-5 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="hidden sm:inline">Compléter mon KYC</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
