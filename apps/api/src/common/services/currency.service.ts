import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  private readonly currencies: Record<string, string> = {
    CAMEROUN: 'XAF',
    GABON: 'XAF',
    CONGO: 'XAF',
    TCHAD: 'XAF',
    'REPUBLIQUE CENTRAFRICAINE': 'XAF',
    'GUINEE EQUATORIALE': 'XAF',
    SENEGAL: 'XOF',
    'COTE DIVOIRE': 'XOF',
    NIGER: 'XOF',
    MALI: 'XOF',
    'BURKINA FASO': 'XOF',
    TOGO: 'XOF',
    BENIN: 'XOF',
    CANADA: 'CAD',
    FRANCE: 'EUR',
    BELGIQUE: 'EUR',
    SUISSE: 'EUR',
    ALLEMAGNE: 'EUR',
  };

  getCurrencyByCountry(country: string): string {
    const normalizedCountry = country.trim().toUpperCase();

    return this.currencies[normalizedCountry] ?? 'XAF';
  }
}
