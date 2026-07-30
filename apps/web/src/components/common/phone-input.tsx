import { Phone } from "lucide-react";
import { type Country } from "@/data/countries";

interface PhoneInputProps {
  country: Country | null;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({ country, value, onChange, error }: PhoneInputProps) {
  const digits = value.replace(/\D/g, "");

  return (
    <div className="w-full space-y-1">
      <label className="text-sm font-medium text-gray-700">
        Numéro de téléphone
      </label>
      <div className="relative flex items-center">
        {country ? (
          <div className="flex items-center h-11 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 shrink-0">
            <span className="text-sm font-medium text-gray-700">{country.dialCode}</span>
          </div>
        ) : (
          <div className="flex items-center h-11 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 shrink-0">
            <Phone className="w-4 h-4 text-afrilink-gray" />
          </div>
        )}
        <input
          type="tel"
          className={`flex-1 h-11 rounded-r-lg border text-sm text-gray-900 bg-white px-3 focus:outline-none focus:ring-1 focus:ring-afrilink-green ${
            error
              ? "!border-destructive"
              : "border-gray-200"
          }`}
          placeholder={country?.phonePlaceholder || "Numéro de téléphone"}
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d+\s-]/g, "");
            onChange(raw);
          }}
        />
      </div>
      {country && value && (
        <div className="flex items-center justify-between">
          {error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <span />
          )}
          <p className="text-[11px] text-gray-400">
            {digits.length}/{country.phoneDigits} chiffres
          </p>
        </div>
      )}
      {!country && <p className="text-xs text-gray-400">Sélectionnez d'abord un pays</p>}
    </div>
  );
}

export function validatePhone(phone: string, country: Country | null): string | null {
  if (!country) return "Sélectionnez un pays";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 0) return "Le numéro de téléphone est requis";
  if (cleaned.length < country.phoneDigits) {
    return `Numéro trop court (${cleaned.length}/${country.phoneDigits})`;
  }
  if (cleaned.length > country.phoneDigits) {
    return `Numéro trop long (${cleaned.length}/${country.phoneDigits})`;
  }
  if (!country.phonePattern.test(cleaned) && !country.phonePattern.test(country.dialCode + cleaned)) {
    return `Numéro invalide pour ${country.name}`;
  }
  return null;
}
