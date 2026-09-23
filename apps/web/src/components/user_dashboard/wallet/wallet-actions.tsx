import { useNavigate } from 'react-router-dom';
import { Download, ArrowLeftRight, Upload, CreditCard } from 'lucide-react';

const actions = [
  { key: 'deposit', label: 'Déposer', icon: Download },
  { key: 'transfer', label: 'Transférer', icon: ArrowLeftRight },
  { key: 'withdraw', label: 'Retirer', icon: Upload },
  { key: 'pay', label: 'Payer', icon: CreditCard },
] as const;

export function WalletActions() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-around sm:justify-center sm:gap-10 py-4">
      {actions.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => {
            if (key === 'deposit') navigate('/deposit');
            else if (key === 'transfer') navigate('/dashboard/send');
            else if (key === 'withdraw') navigate('/dashboard/withdraw');
            else if (key === 'pay') navigate('/dashboard/payments');
          }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="w-11 h-11 rounded-full bg-allness-dark text-allness-orange flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </span>
          <span className="text-xs text-allness-dark">{label}</span>
        </button>
      ))}
    </div>
  );
}
