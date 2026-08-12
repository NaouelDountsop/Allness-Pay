import { useState } from 'react';
import { X, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tontineService } from '@/lib/api/tontine.service';

interface InviteMemberModalProps {
  tontineId: string;
  tontineName: string;
  onClose: () => void;
}

export function InviteMemberModal({ tontineId, tontineName, onClose }: InviteMemberModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const inviteMutation = useMutation({
    mutationFn: () =>
      tontineService.invite(tontineId, { inviteeEmail: email.trim().toLowerCase() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tontine', tontineId] });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-afrilink-orange/10 flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-afrilink-orange" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Inviter un membre</p>
              <p className="text-[11px] text-gray-400">{tontineName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {success ? (
            <div className="text-center py-6">
              <span className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-afrilink-green" />
              </span>
              <p className="text-sm font-semibold text-gray-900 mb-1">Invitation envoyée</p>
              <p className="text-xs text-gray-500 mb-5">
                Un email d'invitation a été envoyé à{' '}
                <span className="font-medium text-gray-700">{email}</span>.
                <br />
                Le lien expire dans 7 jours.
              </p>
              <button
                onClick={onClose}
                className="h-10 px-6 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-xs text-gray-500 mb-4">
                Entrez l'adresse email de la personne à inviter. Elle recevra un email avec un lien
                pour rejoindre la tontine.
              </p>

              {errMsg && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 mb-4">
                  {errMsg}
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  required
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 mt-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!email.trim() || inviteMutation.isPending}
                  className="h-10 px-5 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Envoyer l'invitation
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
