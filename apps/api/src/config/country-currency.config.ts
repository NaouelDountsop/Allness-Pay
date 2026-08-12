/**
 * Mapping pays → devise principale.
 * Les clés doivent correspondre exactement aux noms envoyés par le frontend
 * (cf. apps/web/src/data/countries.ts).
 */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  Cameroun: 'XAF',
  Gabon: 'XAF',
  Congo: 'XAF',
  'Rép. Dém. du Congo': 'CDF',
  Sénégal: 'XOF',
  "Côte d'Ivoire": 'XOF',
  Niger: 'XOF',
  Mali: 'XOF',
  'Burkina Faso': 'XOF',
  Togo: 'XOF',
  Bénin: 'XOF',
  Guinée: 'GNF',
  Rwanda: 'RWF',
  Kenya: 'KES',
  Ghana: 'GHS',
  Nigeria: 'NGN',
  'Afrique du Sud': 'ZAR',
  France: 'EUR',
  Canada: 'CAD',
  'États-Unis': 'USD',
};

export const DEFAULT_CURRENCY = 'XAF';

export function getCurrencyByCountry(pays: string): string {
  return COUNTRY_CURRENCY_MAP[pays] ?? DEFAULT_CURRENCY;
}
