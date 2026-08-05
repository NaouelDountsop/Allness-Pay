import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search } from "lucide-react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
  };
}

interface AddressInputProps {
  countryCode: string;
  city: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function AddressInput({
  countryCode,
  city,
  value,
  onChange,
  error,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const countryFilter = countryCode ? `&countrycodes=${countryCode.toLowerCase()}` : "";
        const cityFilter = city ? ` ${city}` : "";
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + cityFilter)}${countryFilter}&format=json&addressdetails=1&limit=5`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "fr" },
        });
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [countryCode, city],
  );

  const handleChange = (val: string) => {
    onChange(val);
    setOpen(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

 const handleSelect = (s: Suggestion) => {
  const quartier =
    s.address?.neighbourhood ||
    s.address?.suburb ||
    s.address?.quarter ||
    "";

  onChange(quartier);

  setOpen(false);
  setSuggestions([]);
};

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full space-y-1">
      <label className="text-sm font-medium text-gray-700">Adresse complète</label>
      <div ref={ref} className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray z-10" />
        <input
          type="text"
          className={`w-full h-11 rounded-lg border pl-9 pr-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-afrilink-green ${
            error ? "!border-destructive" : "border-gray-200"
          }`}
          placeholder={
            countryCode === "CM" ? "Quartier, rue, numéro — Douala" :
            countryCode === "FR" ? "Numéro, rue — Paris" :
            countryCode === "CA" ? "Civic address — Toronto, ON" :
            "Adresse complète"
          }
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
        />

        {open && suggestions.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-hidden">
            {loading && (
              <div className="px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                <Search className="w-3 h-3 animate-spin" />
                Recherche...
              </div>
            )}
            {!loading &&
              suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-afrilink-gray mt-0.5 shrink-0" />
                  <span className="text-gray-700 line-clamp-2">
                  {
                    s.address?.neighbourhood ||
                    s.address?.suburb ||
                    s.address?.quarter
                  }
                </span>
                </button>
              ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
