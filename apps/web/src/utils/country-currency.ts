import type { Currency } from "@/context/deposit-flow.constants";

export interface CountryCurrency {
  country: string;
  countryCode: string;
  currency: Currency;
  currencyLabel: string;
}

export const COUNTRY_CURRENCIES: CountryCurrency[] = [
  { country: 'Cameroun', countryCode: 'CM', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Gabon', countryCode: 'GA', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Congo', countryCode: 'CG', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Tchad', countryCode: 'TD', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'République Centrafricaine', countryCode: 'CF', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Guinée Équatoriale', countryCode: 'GQ', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Sénégal', countryCode: 'SN', currency: 'XOF', currencyLabel: 'CFA' },
  { country: "Côte d'Ivoire", countryCode: 'CI', currency: 'XOF', currencyLabel: 'CFA' },
  { country: 'Niger', countryCode: 'NE', currency: 'XOF', currencyLabel: 'CFA' },
  { country: 'Mali', countryCode: 'ML', currency: 'XOF', currencyLabel: 'CFA' },
  { country: 'Burkina Faso', countryCode: 'BF', currency: 'XOF', currencyLabel: 'CFA' },
  { country: 'Togo', countryCode: 'TG', currency: 'XOF', currencyLabel: 'CFA' },
  { country: 'Bénin', countryCode: 'BJ', currency: 'XOF', currencyLabel: 'CFA' },
  { country: 'Canada', countryCode: 'CA', currency: 'CAD', currencyLabel: 'CA$ Dollar canadien' },
  { country: 'France', countryCode: 'FR', currency: 'EUR', currencyLabel: '€ Euro' },
  { country: 'Belgique', countryCode: 'BE', currency: 'EUR', currencyLabel: '€ Euro' },
  { country: 'Suisse', countryCode: 'CH', currency: 'EUR', currencyLabel: '€ Euro' },
  { country: 'Allemagne', countryCode: 'DE', currency: 'EUR', currencyLabel: '€ Euro' },
];

export function getCurrenciesForCountry(_countryCode: string): { key: Currency; label: string }[] {
  return [
    { key: 'XAF', label: 'FCFA' },
    { key: 'XOF', label: 'CFA' },
    { key: 'CAD', label: 'CA$' },
    { key: 'EUR', label: '€ Euro' },
  ];
}
