import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {

  private readonly currencies: Record<string, string> = {
    CAMEROUN: 'XAF',
    GABON: 'XAF',
    CONGO: 'XAF',
    CANADA: 'CAD',

    'COTE DIVOIRE': 'XOF',
    SENEGAL: 'XOF',
    MALI: 'XOF',

    NIGERIA: 'NGN',
    GHANA: 'GHS',
    KENYA: 'KES',
  };


  getCurrencyByCountry(country: string): string {

    const normalizedCountry = country
      .trim()
      .toUpperCase();

    return this.currencies[normalizedCountry] ?? 'XAF';
  }
}