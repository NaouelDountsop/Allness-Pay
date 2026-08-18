import { useState } from 'react';
import { GripVertical, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface RotationMember {
  id: string;
  name: string;
  month: string;
}

interface RotationOrderListProps {
  members: RotationMember[];
  onInvite?: () => void;
  onReorder?: (reorderedIds: string[]) => void;
}

export function RotationOrderList({ members, onInvite, onReorder }: RotationOrderListProps) {
  const [items, setItems] = useState<RotationMember[]>(members);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const prev = newItems[index - 1];
    const curr = newItems[index];
    if (prev && curr) {
      newItems[index - 1] = curr;
      newItems[index] = prev;
      setItems(newItems);
      onReorder?.(newItems.map((m) => m.id));
    }
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const curr = newItems[index];
    const next = newItems[index + 1];
    if (curr && next) {
      newItems[index] = next;
      newItems[index + 1] = curr;
      setItems(newItems);
      onReorder?.(newItems.map((m) => m.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedId === null) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else {
      const fromIdx = items.findIndex((m) => m.id === selectedId);
      const toIdx = items.findIndex((m) => m.id === id);
      if (fromIdx !== -1 && toIdx !== -1) {
        const newItems = [...items];
        const moved = newItems[fromIdx];
        if (moved) {
          newItems.splice(fromIdx, 1);
          newItems.splice(toIdx, 0, moved);
          setItems(newItems);
          onReorder?.(newItems.map((m) => m.id));
        }
      }
      setSelectedId(null);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Ordre de Passage</h3>
      {selectedId && (
        <p className="text-[11px] text-afrilink-orange mb-2">
          Cliquez sur un autre membre pour déplacer la sélection
        </p>
      )}
      <div className="space-y-2 mb-3">
        {items.map((m, i) => (
          <div
            key={m.id}
            onClick={() => handleSelect(m.id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
              selectedId === m.id
                ? 'bg-afrilink-orange/10 border border-afrilink-orange/30'
                : 'bg-blue-50/60 hover:bg-blue-50'
            }`}
          >
            <GripVertical className="w-4 h-4 text-gray-300" />
            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-medium text-blue-700">
              {m.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{m.name}</p>
              <p className="text-[11px] text-gray-400">
                Tour {i + 1} - {m.month}
              </p>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveUp(i);
                }}
                disabled={i === 0}
                className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveDown(i);
                }}
                disabled={i === items.length - 1}
                className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onInvite}
        className="w-full h-10 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 flex items-center justify-center gap-2 hover:border-afrilink-orange hover:text-afrilink-orange transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter un membre
      </button>
    </div>
  );
}
