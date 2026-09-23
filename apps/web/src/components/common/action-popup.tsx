import { X, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface ActionPopupField {
  label: string;
  value: React.ReactNode;
  hidden?: boolean;
}

interface ActionPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: ActionPopupField[];
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export function ActionPopup({
  open,
  onOpenChange,
  title,
  fields,
  onEdit,
  onDelete,
  editLabel = 'Modifier',
  deleteLabel = 'Supprimer',
}: ActionPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-allness-dark">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {fields.filter((f) => !f.hidden).map((field) => (
            <div key={field.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{field.label}</span>
              <span className="text-sm font-medium text-gray-900">{field.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
              className="flex-1 h-10 rounded-lg bg-allness-orange text-white text-sm font-medium hover:bg-allness-orange/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              {editLabel}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onOpenChange(false);
                onDelete();
              }}
              className="flex-1 h-10 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleteLabel}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
