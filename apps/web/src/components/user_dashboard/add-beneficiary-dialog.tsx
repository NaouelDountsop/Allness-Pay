import { useRef, useState } from 'react';
import { User, ChevronDown, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';

type BeneficiaryType = 'Particulier' | 'Entreprise';

interface Country {
  code: string;
  dialCode: string;
  flag: string;
  phoneDigits: number;
}

const COUNTRIES: Country[] = [
  { code: 'CM', dialCode: '+237', flag: '🇨🇲', phoneDigits: 9 },
  { code: 'SN', dialCode: '+221', flag: '🇸🇳', phoneDigits: 9 },
  { code: 'CI', dialCode: '+225', flag: '🇨🇮', phoneDigits: 10 },
  { code: 'GA', dialCode: '+241', flag: '🇬🇦', phoneDigits: 8 },
  { code: 'CG', dialCode: '+242', flag: '🇨🇬', phoneDigits: 9 },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', phoneDigits: 9 },
];

const nameSchema = z
  .string()
  .min(1, 'Le nom est requis')
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    'Seules les lettres, espaces, tirets et apostrophes sont autorisés',
  );

function createPhoneSchema(phoneDigits: number) {
  return z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(/^\d+$/, 'Seuls les chiffres sont autorisés')
    .length(phoneDigits, `Le numéro doit contenir exactement ${phoneDigits} chiffres`);
}

export interface BeneficiaryFormValues {
  type: BeneficiaryType;
  fullName: string;
  nickname: string;
  dialCode: string;
  phoneNumber: string;
  email: string;
  notes: string;
}

interface AddBeneficiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: BeneficiaryFormValues) => void;
}

const NOTES_MAX_LENGTH = 100;

export function AddBeneficiaryDialog({ open, onOpenChange, onSubmit }: AddBeneficiaryDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const [type, setType] = useState<BeneficiaryType>('Particulier');
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  const [country, setCountry] = useState<Country>(() => COUNTRIES[0]!);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const typeMenuRef = useRef<HTMLDivElement>(null);
  const countryMenuRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setStep(1);
    setType('Particulier');
    setFullName('');
    setNickname('');
    setPhoneNumber('');
    setEmail('');
    setNotes('');
    setNameError('');
    setPhoneError('');
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const isStep1Valid = nameSchema.safeParse(fullName).success &&
    createPhoneSchema(country.phoneDigits).safeParse(phoneNumber.replace(/\D/g, '')).success;

  const handleSubmit = () => {
    onSubmit?.({
      type,
      fullName,
      nickname,
      dialCode: country.dialCode,
      phoneNumber,
      email,
      notes,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogClose
          onOpenChange={(v) => {
            if (!v) resetForm();
            onOpenChange(v);
          }}
        />

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-100">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ajouter un bénéficiaire</h2>
            <p className="mt-1 text-sm text-gray-500">
              {step === 1
                ? 'Renseignez les informations de base'
                : 'Ajoutez les coordonnées du bénéficiaire'}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-3 mb-6"
          style={{
            backgroundColor: '#082B37',
            boxShadow: '0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)',
          }}
        >
          <div className="flex items-center">
            {[
              { label: 'Informations', num: 1 },
              { label: 'Contact', num: 2 },
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
          <div className="space-y-5">
            <div ref={typeMenuRef} className="relative space-y-2">
              <Label>Type de bénéficiaire</Label>
              <button
                type="button"
                onClick={() => setTypeMenuOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 hover:border-gray-300"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {type}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {typeMenuOpen ? (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  {(['Particulier', 'Entreprise'] as BeneficiaryType[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setType(option);
                        setTypeMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="beneficiary-name">Nom complet</Label>
                <Input
                  id="beneficiary-name"
                  placeholder="Ex: Jean Dupont"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  onBlur={() => {
                    const result = nameSchema.safeParse(fullName);
                    if (!result.success) setNameError(result.error.errors[0]?.message ?? 'Nom invalide');
                    else setNameError('');
                  }}
                />
                {nameError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {nameError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiary-nickname">Surnom (facultatif)</Label>
                <Input
                  id="beneficiary-nickname"
                  placeholder="Ex: Frère Jean"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary-notes">Notes (facultatif)</Label>
              <div className="relative">
                <textarea
                  id="beneficiary-notes"
                  rows={3}
                  maxLength={NOTES_MAX_LENGTH}
                  placeholder="Ajouter une note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-allness-orange focus:outline-none focus:ring-1 focus:ring-allness-orange"
                />
                <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs text-gray-400">
                  {notes.length}/{NOTES_MAX_LENGTH}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div ref={countryMenuRef} className="space-y-2">
              <Label htmlFor="beneficiary-phone">Numéro de téléphone *</Label>
              <div className="flex items-stretch overflow-visible rounded-xl border border-gray-200 focus-within:border-gray-300">
                <button
                  type="button"
                  onClick={() => setCountryMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 border-r border-gray-200 px-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="text-base leading-none">{country.flag}</span>
                  <span>{country.dialCode}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
                <input
                  id="beneficiary-phone"
                  type="tel"
                  placeholder="6 12 34 56 78"
                  value={phoneNumber}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const digitsOnly = raw.replace(/\D/g, '');
                    if (digitsOnly.length > country.phoneDigits) return;
                    setPhoneNumber(digitsOnly);
                    if (phoneError) setPhoneError('');
                  }}
                  onBlur={() => {
                    const result = createPhoneSchema(country.phoneDigits).safeParse(phoneNumber);
                    if (!result.success) setPhoneError(result.error.errors[0]?.message ?? 'Numéro invalide');
                    else setPhoneError('');
                  }}
                  maxLength={country.phoneDigits}
                  className="w-full rounded-r-xl border-0 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                />
              </div>
              <div className="flex items-center justify-between">
                {phoneError ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {phoneError}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-[11px] text-gray-400">
                  {phoneNumber.length}/{country.phoneDigits} chiffres
                </p>
              </div>
              {countryMenuOpen ? (
                <div className="absolute z-10 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCountry(c);
                        setPhoneNumber('');
                        setCountryMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      {c.dialCode}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary-email">Email (facultatif)</Label>
              <Input
                id="beneficiary-email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="bg-allness-green text-white hover:bg-allness-green/90"
              >
                Suivant
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button
                className="rounded-full bg-allness-green text-white hover:bg-allness-green/90"
                onClick={handleSubmit}
              >
                Ajouter le bénéficiaire
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
