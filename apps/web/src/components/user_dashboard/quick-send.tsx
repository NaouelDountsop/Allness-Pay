import { useState, useRef, useEffect } from 'react';
import { Send, Plus, ChevronDown, Check } from 'lucide-react';
import type { QuickContact } from '@/lib/mock/dashboard-data';

interface QuickSendProps {
  contacts: QuickContact[];
}

const CURRENCIES = ['USD', 'XAF', 'EUR'];

export function QuickSend({ contacts }: QuickSendProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="rounded-2xl border border-[#082B37]/10 shadow-sm p-4 sm:p-5 bg-white">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold text-[#082B37]">Envoi rapide</h3>
        <a
          href="/dashboard/beneficiaries"
          className="shrink-0 whitespace-nowrap text-xs text-[#D28E2F] font-semibold hover:text-[#082B37] hover:underline underline-offset-2 transition-colors"
        >
          Voir tout
        </a>
      </div>

      {/* Contacts: scroll horizontal sur petits écrans au lieu de déborder ou de s'écraser */}
      <div className="flex gap-3 mb-5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {contacts.map((c) => (
          <button
            key={c.id}
            type="button"
            className="flex flex-col items-center gap-1 group shrink-0 snap-start"
          >
            <div className="w-11 h-11 rounded-full bg-[#082B37]/10 flex items-center justify-center text-xs font-medium text-[#082B37] overflow-hidden ring-2 ring-transparent group-hover:ring-[#D28E2F]/50 transition-all">
              {c.avatarUrl ? (
                <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                c.name.charAt(0)
              )}
            </div>
            <span className="text-[11px] text-[#082B37]/60 max-w-[52px] truncate">{c.name}</span>
          </button>
        ))}
        <div className="flex flex-col items-center gap-1 shrink-0 snap-start">
          <button
            type="button"
            aria-label="Ajouter un bénéficiaire"
            className="w-11 h-11 rounded-full border border-dashed border-[#082B37]/25 flex items-center justify-center text-[#082B37]/40 hover:border-[#D28E2F] hover:text-[#D28E2F] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-[#082B37]/40">New</span>
        </div>
      </div>

      {/* Montant + devise: min-w-0 empêche l'input de forcer un débordement horizontal,
          et le tout passe sur deux lignes plutôt que d'être coupé en dessous de ~340px */}
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="number"
          placeholder="Entrez le montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 min-w-[140px] h-11 rounded-lg border border-[#082B37]/15 px-3 text-sm bg-white text-[#082B37] placeholder:text-[#082B37]/40 focus:outline-none focus:ring-2 focus:ring-[#D28E2F]/40 focus:border-[#D28E2F]/50"
        />

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="h-11 min-w-[92px] rounded-lg border border-[#082B37]/15 px-3 flex items-center justify-between gap-2 text-sm font-medium text-[#082B37] bg-white hover:border-[#D28E2F]/50 focus:outline-none focus:ring-2 focus:ring-[#D28E2F]/40 transition-colors"
          >
            {currency}
            <ChevronDown
              className={`w-4 h-4 text-[#082B37]/50 transition-transform ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>

          {open && (
            <ul
              role="listbox"
              className="absolute right-0 mt-1.5 w-28 rounded-lg border border-[#082B37]/10 bg-white shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {CURRENCIES.map((cur) => (
                <li key={cur} role="option" aria-selected={currency === cur}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency(cur);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#082B37] hover:bg-[#082B37]/[0.05] transition-colors"
                  >
                    {cur}
                    {currency === cur && <Check className="w-3.5 h-3.5 text-[#D28E2F]" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button className="w-full h-11 rounded-lg bg-[#082B37] hover:bg-[#082B37]/90 active:scale-[0.98] text-[#D28E2F] text-sm font-semibold flex items-center justify-center gap-2 transition-all">
        <Send className="w-4 h-4" />
        Envoyer maintenant
      </button>
    </div>
  );
}
