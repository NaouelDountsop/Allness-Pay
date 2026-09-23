import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" hideHeader>
        <div className="flex flex-col items-center text-center py-2">
          <span
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              variant === 'danger' ? 'bg-red-100' : 'bg-gray-100'
            }`}
          >
            <AlertTriangle
              className={`w-6 h-6 ${variant === 'danger' ? 'text-red-500' : 'text-gray-500'}`}
            />
          </span>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gray-100 text-gray-500 hover:bg-gray-200" >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={
              variant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-allness-green text-white hover:bg-allness-green/90'
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
