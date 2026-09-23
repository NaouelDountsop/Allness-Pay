import { useState, useEffect } from 'react';
import { X, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tontineService } from '@/lib/api/tontine.service';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tontineId: string;
  tontineName: string;
}

export function InviteMemberModal({ open, onOpenChange, tontineId, tontineName }: InviteMemberModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (open) {
      setEmail('');
      setSuccess(false);
      setErrMsg('');
    }
  }, [open]);

  const inviteMutation = useMutation({
    mutationFn: () =>
      tontineService.invite(tontineId, { inviteeEmail: email.trim().toLowerCase() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontine', tontineId] });
      queryClient.invalidateQueries({ queryKey: ['tontine-invitations', tontineId] });
      setSuccess(true);
      setErrMsg('');
    },
    onError: (err: { message?: string }) => {
      setErrMsg(err.message ?? "Erreur lors de l'envoi de l'invitation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    inviteMutation.mutate();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — matches PIN popup style */}
        <div className="bg-allness-dark px-6 py-5 flex items-center justify-between relative">
          <div className="flex flex-col items-center w-full">
            <img src="/allnesspay_logo1.png" alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-white text-sm font-semibold">
              Allness<span className="text-allness-orange">Pay</span>
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-5 top-5 text-white/70 hover:text-white"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center text-center">
              <span className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-allness-green" />
              </span>
              <h3 className="text-base font-semibold text-allness-dark mb-1">Invitation envoyée</h3>
              <p className="text-xs text-gray-500 mb-1">
                Un email a été envoyé à{' '}
                <span className="font-medium text-gray-700">{email}</span>.
              </p>
              <p className="text-[11px] text-orange-500 mb-5">
                Le lien expire dans 7 jours.
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="w-full h-11 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-4">
                <span className="w-12 h-12 rounded-full bg-allness-orange/10 flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-allness-orange" />
                </span>
                <h3 className="text-base font-semibold text-allness-dark mb-1">Inviter un membre</h3>
                <p className="text-xs text-orange-500">{tontineName}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <p className="text-xs text-gray-500 mb-4">
                  Entrez l'adresse email de la personne à inviter. Elle recevra un lien
                  pour rejoindre la tontine.
                </p>

                {errMsg && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 mb-4">
                    {errMsg}
                  </div>
                )}

                <div className="mb-5">
                  <label className="text-xs font-medium text-gray-500">Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    required
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-11 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!email.trim() || inviteMutation.isPending}
                    className="flex-1 h-11 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {inviteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Envoyer</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
