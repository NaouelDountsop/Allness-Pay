import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowLeftRight, Upload, CreditCard, Wallet, Send } from 'lucide-react';

const actions = [
  { key: 'deposit', label: 'Déposer', icon: Download },
  { key: 'transfer', label: 'Transférer', icon: ArrowLeftRight },
  { key: 'withdraw', label: 'Retirer', icon: Upload },
  { key: 'pay', label: 'Payer', icon: CreditCard },
] as const;

export function WalletActions() {
  const navigate = useNavigate();
  const [showTransferMenu, setShowTransferMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTransferMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex justify-around sm:justify-center sm:gap-10 py-4" ref={containerRef}>
      {actions.map(({ key, label, icon: Icon }) => (
        <div key={key} className="relative">
          <button
            onClick={() => {
              if (key === 'deposit') navigate('/deposit');
              else if (key === 'transfer') setShowTransferMenu((v) => !v);
              else if (key === 'pay') navigate('/dashboard/payments');
            }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="w-11 h-11 rounded-full bg-afrilink-dark text-afrilink-orange flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-xs text-afrilink-dark">{label}</span>
          </button>

          {key === 'transfer' && showTransferMenu && (
            <div className="absolute z-20 top-full mt-3 left-1/2 -translate-x-1/2 w-64 rounded-xl border border-afrilink-green/30 bg-white shadow-lg p-3">
              <p className="text-xs font-medium text-gray-500 px-1 mb-2">Types de transactions</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowTransferMenu(false)}
                  className="flex flex-col items-center gap-2 rounded-lg bg-afrilink-dark text-white p-3 hover:bg-afrilink-darker transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-[11px] text-center leading-tight">Wallet Interne</span>
                </button>
                <button
                  onClick={() => setShowTransferMenu(false)}
                  className="flex flex-col items-center gap-2 rounded-lg bg-afrilink-dark text-white p-3 hover:bg-afrilink-darker transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-[11px] text-center leading-tight">Transfert Externe</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
