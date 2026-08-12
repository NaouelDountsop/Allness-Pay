import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { getCitiesForCountry } from '@/data/cities';

interface CitySelectProps {
  countryCode: string;
  value: string;
  onChange: (city: string) => void;
  error?: string;
}

export function CitySelect({ countryCode, value, onChange, error }: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cities = getCitiesForCountry(countryCode);
  const filtered = cities.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

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

  if (!countryCode) {
    return (
      <div className="w-full space-y-1">
        <label className="text-sm font-medium text-gray-700">Ville</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray" />
          <input
            type="text"
            disabled
            placeholder="Sélectionnez d'abord un pays"
            className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      <label className="text-sm font-medium text-gray-700">Ville</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full h-11 rounded-lg border px-3 text-sm bg-white flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-afrilink-green ${
            error ? '!border-destructive' : 'border-gray-200'
          }`}
        >
          <MapPin className="w-4 h-4 text-afrilink-gray shrink-0" />
          {value ? (
            <span className="flex-1 text-left text-gray-900">{value}</span>
          ) : (
            <span className="flex-1 text-left text-gray-400">Choisir une ville</span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-afrilink-gray transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-hidden">
            <div className="sticky top-0 p-2 bg-white border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-afrilink-gray" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher une ville..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 rounded-md border border-gray-200 pl-8 pr-2 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-afrilink-green"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onChange(city);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    city === value ? 'bg-afrilink-green/5 text-afrilink-green' : ''
                  }`}
                >
                  {city}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400 text-center">Aucune ville trouvée</p>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
