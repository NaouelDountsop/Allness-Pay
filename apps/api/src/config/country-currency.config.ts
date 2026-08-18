/**
 * Mapping pays → devise principale.
 * Les clés doivent correspondre exactement aux noms envoyés par le frontend
 * (cf. apps/web/src/data/countries.ts).
 */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  Cameroun: 'XAF',
  Gabon: 'XAF',
  Congo: 'XAF',
  Tchad: 'XAF',
  'République Centrafricaine': 'XAF',
  'Guinée Équatoriale': 'XAF',
  Sénégal: 'XOF',
  "Côte d'Ivoire": 'XOF',
  Niger: 'XOF',
  Mali: 'XOF',
  'Burkina Faso': 'XOF',
  Togo: 'XOF',
  Bénin: 'XOF',
  Canada: 'CAD',
  France: 'EUR',
  Belgique: 'EUR',
  Suisse: 'EUR',
  Allemagne: 'EUR',
};

export const DEFAULT_CURRENCY = 'XAF';

export function getCurrencyByCountry(pays: string): string {
  return COUNTRY_CURRENCY_MAP[pays] ?? DEFAULT_CURRENCY;
}
