import type { Currency } from "@/context/deposit-flow.constants";

export interface CountryCurrency {
  country: string;
  countryCode: string;
  currency: Currency;
  currencyLabel: string;
}

export const COUNTRY_CURRENCIES: CountryCurrency[] = [
  { country: 'Cameroun', countryCode: 'CM', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'France', countryCode: 'FR', currency: 'EUR', currencyLabel: '€ Euro' },
  { country: 'États-Unis', countryCode: 'US', currency: 'USD', currencyLabel: '$ Dollar' },
  { country: 'Canada', countryCode: 'CA', currency: 'USD', currencyLabel: '$ Dollar' },
  { country: 'Belgique', countryCode: 'BE', currency: 'EUR', currencyLabel: '€ Euro' },
  { country: 'Suisse', countryCode: 'CH', currency: 'EUR', currencyLabel: '€ Euro' },
  { country: 'Allemagne', countryCode: 'DE', currency: 'EUR', currencyLabel: '€ Euro' },
  { country: 'Royaume-Uni', countryCode: 'GB', currency: 'USD', currencyLabel: '$ Dollar' },
  { country: 'Sénégal', countryCode: 'SN', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: "Côte d'Ivoire", countryCode: 'CI', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Gabon', countryCode: 'GA', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Congo', countryCode: 'CG', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Tchad', countryCode: 'TD', currency: 'XAF', currencyLabel: 'FCFA' },
  {
    country: 'République Centrafricaine',
    countryCode: 'CF',
    currency: 'XAF',
    currencyLabel: 'FCFA',
  },
  { country: 'Guinée Équatoriale', countryCode: 'GQ', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Bénin', countryCode: 'BJ', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Togo', countryCode: 'TG', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Mali', countryCode: 'ML', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Burkina Faso', countryCode: 'BF', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Niger', countryCode: 'NE', currency: 'XAF', currencyLabel: 'FCFA' },
  { country: 'Guinée', countryCode: 'GN', currency: 'USD', currencyLabel: '$ Dollar' },
  { country: 'Maurice', countryCode: 'MU', currency: 'USD', currencyLabel: '$ Dollar' },
];

export function getCurrenciesForCountry(_countryCode: string): { key: Currency; label: string }[] {
  return [
    { key: 'XAF', label: 'FCFA' },
    { key: 'EUR', label: '€ Euro' },
    { key: 'USD', label: '$ Dollar' },
  ];
}
