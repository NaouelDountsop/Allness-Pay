import { useState, useMemo } from 'react';
import { ArrowRightLeft, TrendingUp, ChevronDown, ArrowRight, X } from 'lucide-react';

const CURRENCIES = [
  { code: 'EUR', label: 'Euro', flag: '/flags/fr.png' },
  { code: 'XAF', label: 'Franc CFA (CEMAC)', flag: '/flags/cm.png' },
  { code: 'XOF', label: 'Franc CFA (UEMOA)', flag: '/flags/sn.png' },
  { code: 'CAD', label: 'Dollar canadien', flag: '/flags/ca.png' },
];

const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  EUR: { XAF: 654.50, XOF: 654.50, CAD: 1.47 },
  XAF: { EUR: 0.00153, XOF: 1.0, CAD: 0.00226 },
  XOF: { EUR: 0.00153, XAF: 1.0, CAD: 0.00226 },
  CAD: { EUR: 0.68, XAF: 442.15, XOF: 442.15 },
};

const CURRENCY_LABELS: Record<string, string> = {
  XAF: 'FCFA',
  XOF: 'CFA',
  CAD: 'CA$',
  EUR: 'EUR',
};

function CurrencySelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = CURRENCIES.find((c) => c.code === value)!;

  return (
    <div className="relative">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
        {label}
      </label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-allness-green/40 transition-colors"
      >
        <img
          src={selected.flag}
          alt={selected.code}
          className="w-8 h-8 rounded-full object-cover shadow-sm"
        />
        <span className="text-base font-bold text-allness-dark flex-1 text-left">
          {selected.code}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden">
            {CURRENCIES.filter((c) => c.code !== value).map((c) => (
              <button
                key={c.code}
                onClick={() => { onChange(c.code); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-allness-green/5 transition-colors text-left"
              >
                <img src={c.flag} alt={c.code} className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-allness-dark">{c.code}</p>
                  <p className="text-[11px] text-gray-400">{c.label}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ExchangeRatePanel({ onClose }: { onClose: () => void }) {
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('XAF');
  const [amount, setAmount] = useState('1000');

  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency] ?? 1;

  const converted = useMemo(() => {
    const num = Number(amount.replace(/\s/g, ''));
    if (isNaN(num) || num <= 0) return 0;
    return Math.round(num * rate * 100) / 100;
  }, [amount, rate]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatNumber = (n: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-[0_8px_40px_rgba(8,43,55,0.06)] overflow-hidden w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-allness-dark flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5 text-allness-orange" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-allness-orange uppercase tracking-widest">
                Taux de change
              </p>
              <h3 className="text-lg sm:text-xl font-extrabold text-allness-dark font-heading mt-0.5">
                Convertissez vos devises en toute simplicité
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            Suivez les taux en temps réel et effectuez vos échanges de devises en toute sécurité, au meilleur taux.
          </p>
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-allness-green bg-allness-green/10 px-3 py-1.5 rounded-full shrink-0 ml-4">
            <span className="w-1.5 h-1.5 rounded-full bg-allness-green animate-pulse" />
            Taux en temps réel
          </span>
        </div>
      </div>

      {/* Converter */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 sm:p-6">
          <div className="flex items-end gap-3 sm:gap-4">
            {/* FROM */}
            <div className="flex-1 min-w-0">
              <CurrencySelect value={fromCurrency} onChange={setFromCurrency} label="De" />
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                  setAmount(raw);
                }}
                className="w-full mt-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-xl sm:text-2xl font-extrabold text-allness-dark focus:outline-none focus:border-allness-green focus:ring-1 focus:ring-allness-green transition-all"
              />
            </div>

            {/* Swap button */}
            <button
              onClick={handleSwap}
              className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center shrink-0 hover:bg-allness-green/10 hover:border-allness-green/40 transition-all mb-1.5"
            >
              <ArrowRightLeft className="w-4 h-4 text-allness-dark rotate-90" />
            </button>

            {/* TO */}
            <div className="flex-1 min-w-0">
              <CurrencySelect value={toCurrency} onChange={setToCurrency} label="Vers" />
              <div className="w-full mt-3 rounded-xl border border-allness-green/20 bg-allness-green/5 px-4 py-3.5">
                <p className="text-xl sm:text-2xl font-extrabold text-allness-dark">
                  {formatNumber(converted)}{' '}
                  <span className="text-sm sm:text-base font-bold text-allness-green">
                    {CURRENCY_LABELS[toCurrency] ?? toCurrency}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Rate info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-allness-green" />
              <p className="text-sm font-semibold text-allness-dark">
                1 {fromCurrency} = {formatNumber(rate)} {CURRENCY_LABELS[toCurrency] ?? toCurrency}
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              Le taux peut varier selon le mode de paiement.
            </p>
          </div>
        </div>

        {/* CTA */}
        <a
          href="/signup"
          className="mt-5 w-full h-13 sm:h-14 rounded-xl bg-allness-dark hover:bg-allness-dark/90 text-white text-base font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Utiliser ce taux
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

export function ExchangeRateFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Panel bottom-right */}
      {open && (
        <div className="fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-[999998] w-[calc(100vw-3rem)] max-w-[640px]">
          <ExchangeRatePanel onClose={() => setOpen(false)} />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[999999] group"
      >
        <div className="flex items-center gap-2.5 bg-allness-dark text-white pl-5 pr-6 py-3.5 rounded-full shadow-[0_8px_30px_rgba(8,43,55,0.35)] hover:shadow-[0_12px_40px_rgba(8,43,55,0.45)] hover:-translate-y-1 transition-all duration-300">
          <div className="w-9 h-9 rounded-full bg-allness-orange/20 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4 text-allness-orange" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-allness-orange uppercase tracking-widest leading-none">
              Taux de change
            </span>
            <span className="text-sm font-bold leading-tight mt-0.5">
              Consulter les taux
            </span>
          </div>
        </div>
      </button>
    </>
  );
}
