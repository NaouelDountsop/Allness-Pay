import { useState } from 'react';
import { beneficiaryService, type CreateBeneficiaryPayload } from '@/lib/api/beneficiary.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, ArrowLeft, Check } from 'lucide-react';
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
import { Label } from '@/components/ui/label';

interface AddBeneficiaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NETWORKS = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'wave', label: 'Wave' },
];

const COUNTRIES = [
  { value: 'CM', label: 'Cameroun', dialCode: '+237', placeholder: '6XX XXX XXX' },
  { value: 'SN', label: 'Sénégal', dialCode: '+221', placeholder: '7X XXX XX XX' },
  { value: 'CI', label: "Côte d'Ivoire", dialCode: '+225', placeholder: 'XX XX XX XX XX' },
  { value: 'GA', label: 'Gabon', dialCode: '+241', placeholder: 'XX XX XX XX' },
  { value: 'CG', label: 'Congo', dialCode: '+242', placeholder: 'XX XXX XXXX' },
];

export function AddBeneficiaryModal({ open, onOpenChange }: AddBeneficiaryModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('mtn_momo');
  const [country, setCountry] = useState('CM');
  const [nickname, setNickname] = useState('');

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
    setName('');
    setPhone('');
    setNetwork('mtn_momo');
    setCountry('CM');
    setNickname('');
  };

  const selectedCountry = COUNTRIES.find((c) => c.value === country) ?? COUNTRIES[0]!;
  const isStep1Valid = name.length > 0 && phone.length > 0;

  const handleConfirm = () => {
    createMutation.mutate({
      name,
      phone: `${selectedCountry.dialCode} ${phone}`,
      network,
      country: selectedCountry.label,
      nickname: nickname || undefined,
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
              <span className="w-8 h-8 rounded-full bg-afrilink-orange/10 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-afrilink-orange" />
              </span>
              Ajouter un bénéficiaire
            </div>
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Renseignez les informations de votre bénéficiaire'
              : 'Confirmez les informations'}
          </DialogDescription>
        </DialogHeader>

        <div
          className="rounded-2xl p-3 my-4"
          style={{
            backgroundColor: '#082B37',
            boxShadow: '0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)',
          }}
        >
          <div className="flex items-center">
            {[
              { label: 'Informations', num: 1 },
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

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afrilink-orange/20 focus:border-afrilink-orange"
              />
            </div>

            <div className="space-y-2">
              <Label>Pays</Label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPhone('');
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afrilink-orange/20 focus:border-afrilink-orange appearance-none bg-white"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Numéro de téléphone</Label>
              <div className="flex">
                <span className="flex items-center gap-1 px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-600">
                  {selectedCountry.dialCode}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={selectedCountry.placeholder}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-afrilink-orange/20 focus:border-afrilink-orange"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Réseau</Label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afrilink-orange/20 focus:border-afrilink-orange appearance-none bg-white"
              >
                {NETWORKS.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Surnom (optionnel)</Label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Maman, Frère, etc."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afrilink-orange/20 focus:border-afrilink-orange"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nom</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Téléphone</span>
              <span className="font-medium">
                {selectedCountry.dialCode} {phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Réseau</span>
              <span className="font-medium">
                {NETWORKS.find((n) => n.value === network)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pays</span>
              <span className="font-medium">{selectedCountry.label}</span>
            </div>
            {nickname && (
              <div className="flex justify-between">
                <span className="text-gray-500">Surnom</span>
                <span className="font-medium">{nickname}</span>
              </div>
            )}
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
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="bg-afrilink-orange hover:bg-afrilink-orange/90"
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
                className="bg-afrilink-orange hover:bg-afrilink-orange/90"
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
