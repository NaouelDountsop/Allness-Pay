import { useState } from 'react';
import { beneficiaryService, type CreateBeneficiaryPayload } from '@/lib/api/beneficiary.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, ArrowLeft, Check, AlertCircle, Search, QrCode, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AddBeneficiaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBeneficiaryModal({ open, onOpenChange }: AddBeneficiaryModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [foundUser, setFoundUser] = useState<{ name: string; walletId: string; phone?: string } | null>(null);
  const [searching, setSearching] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateBeneficiaryPayload) => beneficiaryService.create(data),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setStep(1);
    setSearchQuery('');
    setSearchError('');
    setFoundUser(null);
    setSearching(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Veuillez entrer un identifiant, e-mail ou numéro de téléphone');
      return;
    }
    setSearchError('');
    setSearching(true);
    try {
      const results = await beneficiaryService.searchUser(searchQuery.trim());
      const first = results[0];
      if (first) {
        setFoundUser(first);
      } else {
        setSearchError('Aucun utilisateur trouvé avec cet identifiant');
        setFoundUser(null);
      }
    } catch {
      setSearchError('Erreur lors de la recherche. Réessayez.');
      setFoundUser(null);
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!foundUser) return;
    createMutation.mutate({
      nom: foundUser.name,
      numero: foundUser.walletId,
      reseau: 'ALLNESS WALLET',
      pays: 'CM',
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogClose
          onOpenChange={(v) => {
            if (!v) resetForm();
            onOpenChange(v);
          }}
        />

        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-allness-orange/10 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-allness-orange" />
              </span>
              Ajouter un bénéficiaire interne
            </div>
          </DialogTitle>
          <DialogDescription>
            Ajoutez un utilisateur AfriLinkPay pour un transfert instantané.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div
          className="rounded-2xl p-3 my-2"
          style={{
            backgroundColor: '#082B37',
            boxShadow: '0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)',
          }}
        >
          <div className="flex items-center">
            {[
              { label: 'Rechercher l\'utilisateur', num: 1 },
              { label: 'Confirmation', num: 2 },
            ].map(({ label, num }, i) => {
              const isDone = step > num;
              const isActive = step === num;
              const isLast = i === 1;
              return (
                <div key={num} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                  <div className="flex flex-col items-center gap-1.5 min-w-[56px]">
                    <div
                      className="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0"
                      style={{
                        backgroundColor: isDone || isActive ? '#D28E2F' : 'rgba(255,255,255,0.08)',
                        color: isDone || isActive ? '#082B37' : 'rgba(255,255,255,0.4)',
                        border: isDone || isActive ? 'none' : '2px solid rgba(255,255,255,0.25)',
                        boxShadow: isActive ? '0 0 0 4px rgba(210,142,47,0.25)' : 'none',
                      }}
                    >
                      {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : num}
                    </div>
                    <span
                      className="text-[10px] text-center leading-tight whitespace-nowrap transition-colors duration-300"
                      style={{
                        color: isActive
                          ? '#FFFFFF'
                          : isDone
                            ? 'rgba(255,255,255,0.75)'
                            : 'rgba(255,255,255,0.35)',
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className="flex-1 mx-1.5 -mt-5"
                      style={{
                        borderTop: '2px dashed rgba(255,255,255,0.5)',
                        minWidth: '20px',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* API Error Display */}
        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              {(createMutation.error as Error)?.message || "Erreur lors de l'ajout du bénéficiaire"}
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {/* Info banner */}
            <div className="rounded-lg bg-orange-50 border p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-500">
                Le bénéficiaire doit être un utilisateur AfriLinkPay.
              </p>
            </div>

            {/* Search section */}
            <div>
              <h3 className="text-sm font-semibold text-allness-dark mb-1">
                Rechercher un utilisateur AfriLinkPay
              </h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Identifiant wallet ou  e-mail "
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-5 py-2.5 rounded-xl bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
                >
                  {searching ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
              {searchError && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {searchError}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">ou</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* QR Scanner section */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-gray-600" />
                </span>
                <div>
                  <p className="text-sm font-medium text-allness-dark">Scanner le QR code</p>
                  <p className="text-[11px] text-gray-500">
                    Scannez le QR code du wallet AfriLinkPay de l'utilisateur.
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Scanner
              </button>
            </div>

            {/* Selected user */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Utilisateur sélectionné
              </p>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200">
                <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-gray-400" />
                </span>
                {foundUser ? (
                  <div>
                    <p className="text-sm font-medium text-allness-dark">{foundUser.name}</p>
                    <p className="text-xs text-gray-500">{foundUser.walletId}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Recherchez un utilisateur pour afficher ses informations.
                  </p>
                )}
              </div>
            </div>

            
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nom</span>
              <span className="font-medium">{foundUser?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Wallet ID</span>
              <span className="font-medium">{foundUser?.walletId}</span>
            </div>
            {foundUser?.phone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Téléphone</span>
                <span className="font-medium">{foundUser.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium">Bénéficiaire interne</span>
            </div>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          )}
          {step < 2 ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Annuler
              </Button>
              <Button
                disabled={!foundUser}
                onClick={() => setStep(2)}
                className="bg-allness-green  hover:bg-allness-green/90"
              >
                Suivant
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={createMutation.isPending}
                className="bg-allness-orange hover:bg-allness-orange/90"
              >
                {createMutation.isPending ? 'Ajout...' : 'Confirmer'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
