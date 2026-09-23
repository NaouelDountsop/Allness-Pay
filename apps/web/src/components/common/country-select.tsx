import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { countries, type Country, getFlagUrl } from '@/data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (country: Country) => void;
  placeholder?: string;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = 'Sélectionner un pays',
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = countries.find((c) => c.code === value);

  const filtered = countries.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div className="w-full space-y-1">
      <label className="text-sm font-medium text-gray-700">Pays</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 bg-white flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-allness-orange"
        >
          {selected ? (
            <>
              <img
                src={getFlagUrl(selected.code)}
                alt={selected.name}
                className="w-5 h-auto rounded-sm object-cover"
              />
              <span className="flex-1 text-left">{selected.name}</span>
              <span className="text-xs text-allness-gray">{selected.dialCode}</span>
            </>
          ) : (
            <span className="flex-1 text-left text-gray-400">{placeholder}</span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-allness-gray transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-hidden">
            <div className="sticky top-0 p-2 bg-white border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-allness-gray" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 rounded-md border border-gray-200 pl-8 pr-2 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-allness-orange"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {filtered.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors ${
                    country.code === value ? 'bg-allness-green/5 text-allness-green' : ''
                  }`}
                >
                  <img
                    src={getFlagUrl(country.code)}
                    alt={country.name}
                    className="w-5 h-auto rounded-sm object-cover"
                  />
                  <span className="flex-1 text-left">{country.name}</span>
                  <span className="text-xs text-allness-gray">{country.dialCode}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400 text-center">Aucun pays trouvé</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
