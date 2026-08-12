import type { Dispatch, SetStateAction } from 'react';

interface Cycle {
  id: string;
  label: string;
  range: string;
  active: boolean;
}

interface CycleSelectorProps {
  cycles: Cycle[];
  selected: string;
  onSelect: Dispatch<SetStateAction<string>>;
}

export function CycleSelector({ cycles, selected, onSelect }: CycleSelectorProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-500 mb-2">Sélectionner un cycle</p>
      <div className="flex gap-3 overflow-x-auto">
        {cycles.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-left border transition-colors ${
              selected === c.id
                ? 'bg-afrilink-orange border-afrilink-orange text-white'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <p className="text-xs font-medium">{c.label}</p>
            <p className={`text-[10px] ${selected === c.id ? 'text-white/80' : 'text-gray-400'}`}>
              {c.range}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
