import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  children,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Contenu */}
      <div className="relative z-10 flex w-full justify-center">
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogContent({
  className,
  children,
  hideHeader,
}: {
  className?: string;
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'relative z-10 w-full max-w-lg rounded-2xl overflow-hidden bg-white shadow-xl',
        className,
      )}
    >
      {!hideHeader && (
        <div className="bg-allness-dark px-6 py-5 flex items-center justify-center relative">
          <div className="flex flex-col items-center">
            <img src="/allnesspay_logo1.png" alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-white text-sm font-semibold">
              Allness<span className="text-allness-orange">Pay</span>
            </span>
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 space-y-1.5">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-allness-dark">{children}</h2>;
}

export function DialogDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-gray-500">
      {children}
    </p>
  );
}

export function DialogFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      {children}
    </div>
  );
}

export function DialogClose({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className="absolute right-5 top-5 z-10 rounded-full p-1 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
      aria-label="Fermer"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
