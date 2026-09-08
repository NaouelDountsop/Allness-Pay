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

const MOBILE_MONEY_COUNTRIES: Record<string, { mtn: boolean; orange: boolean }> = {
  CM: { mtn: true, orange: true },
  SN: { mtn: false, orange: true },
  CI: { mtn: false, orange: true },
  GA: { mtn: true, orange: false },
  CG: { mtn: true, orange: false },
  TD: { mtn: true, orange: false },
  NE: { mtn: false, orange: true },
  ML: { mtn: false, orange: true },
  BF: { mtn: false, orange: true },
  TG: { mtn: false, orange: true },
  BJ: { mtn: false, orange: true },
};

export function hasMobileMoney(countryCode: string): boolean {
  const config = MOBILE_MONEY_COUNTRIES[countryCode];
  return config ? config.mtn || config.orange : false;
}

export function hasMtn(countryCode: string): boolean {
  return MOBILE_MONEY_COUNTRIES[countryCode]?.mtn ?? false;
}

export function hasOrange(countryCode: string): boolean {
  return MOBILE_MONEY_COUNTRIES[countryCode]?.orange ?? false;
}

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  COUNTRY_CURRENCIES.map((c) => [c.country, c.countryCode])
);

export function getCountryCode(pays: string): string {
  if (!pays) return 'CM';
  if (pays.length === 2 && pays === pays.toUpperCase()) return pays;
  return NAME_TO_CODE[pays] ?? 'CM';
}

export function getCurrenciesForCountry(_countryCode: string): { key: Currency; label: string }[] {
  return [
    { key: 'XAF', label: 'FCFA' },
    { key: 'XOF', label: 'CFA' },
    { key: 'CAD', label: 'CA$' },
    { key: 'EUR', label: '€ Euro' },
  ];
}
