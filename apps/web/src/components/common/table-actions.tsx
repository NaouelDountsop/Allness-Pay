import { Eye, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'Voir',
  editLabel = 'Modifier',
  deleteLabel = 'Supprimer',
}: TableActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActions = onView || onEdit || onDelete;

  if (!hasActions) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {onView && (
            <button
              onClick={() => {
                setOpen(false);
                onView();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-400" />
              {viewLabel}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-4 h-4 text-gray-400" />
              {editLabel}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              {deleteLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
