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
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-brand-text-secondary hover:text-gray-600 dark:hover:text-brand-text hover:bg-gray-100 dark:hover:bg-brand-hover transition-colors"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-brand-card rounded-xl shadow-lg dark:shadow-lg border border-gray-100 dark:border-brand-border py-1 z-50">
          {onView && (
            <button
              onClick={() => {
                setOpen(false);
                onView();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-brand-text hover:bg-gray-50 dark:hover:bg-brand-hover transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-400 dark:text-brand-text-secondary" />
              {viewLabel}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-brand-text hover:bg-gray-50 dark:hover:bg-brand-hover transition-colors"
            >
              <Pencil className="w-4 h-4 text-gray-400 dark:text-brand-text-secondary" />
              {editLabel}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-brand-red hover:bg-red-50 dark:hover:bg-brand-bg-red-light transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400 dark:text-brand-red" />
              {deleteLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
