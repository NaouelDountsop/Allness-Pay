import { Delete } from 'lucide-react';
import { useState } from 'react';

interface PinPadProps {
  value: string;
  length?: number;
  onChange: (value: string) => void;
  error?: boolean;
}

// Mélange les chiffres 0-9 (Fisher-Yates), "del" reste toujours en dernière position.
function shuffleDigits(): string[] {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = digits[i]!;
    digits[i] = digits[j]!;
    digits[j] = temp;
  }
  return digits;
}

export function PinPad({ value, length = 4, onChange, error }: PinPadProps) {
  // Le mélange est calculé une seule fois au montage du composant,
  // puis reste constant (ne change pas à chaque frappe ou rendu).
  const [keys] = useState<string[]>(() => {
  const digits = shuffleDigits();
  return [...digits.slice(0, 9), '', digits[9]!, 'del'];
});

  const handlePress = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else if (value.length < length) {
      onChange(value + key);
    }
  };

  return (
    <div>
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-11 h-11 rounded-lg border flex items-center justify-center text-lg font-semibold ${
              error
                ? 'border-red-400'
                : value[i]
                  ? 'border-allness-orange'
                  : 'border-allness-orange/40'
            }`}
          >
            {value[i] ? '•' : ''}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        {keys.map((key, i) =>
          key === '' ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => handlePress(key)}
              aria-label={key === 'del' ? 'Supprimer' : `Chiffre ${key}`}
              className="h-14 rounded-xl bg-allness-dark hover:bg-allness-darker text-white flex items-center justify-center text-lg font-medium transition-colors"
            >
              {key === 'del' ? <Delete className="w-4 h-4 text-allness-orange" /> : key}
            </button>
          ),
        )}
      </div>
    </div>
  );
}