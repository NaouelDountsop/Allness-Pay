import type { DataSource } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';

const FAKE_CURRENCIES: Partial<Currency>[] = [
  { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA', decimals: 0, country: 'Cameroun, Gabon, Congo', flag: '🇨🇲', isActive: true },
  { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'CFA', decimals: 0, country: 'Sénégal, Côte d\'Ivoire, Mali', flag: '🇸🇳', isActive: true },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'CA$', decimals: 2, country: 'Canada', flag: '🇨🇦', isActive: true },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, country: 'France, zone euro', flag: '🇪🇺', isActive: true },
];

const FAKE_EXCHANGE_RATES: Partial<ExchangeRate>[] = [
  // CAD
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'XAF', rate: 442.15, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'XOF', rate: 442.15, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'EUR', rate: 0.68, isActive: true },
  // EUR
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'CAD', rate: 1.47, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'XAF', rate: 654.5, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'XOF', rate: 654.5, isActive: true },
  // XAF
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'CAD', rate: 0.00226, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'EUR', rate: 0.00153, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'XOF', rate: 1.0, isActive: true },
  // XOF
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'CAD', rate: 0.00226, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'EUR', rate: 0.00153, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'XAF', rate: 1.0, isActive: true },
];

export async function seedCurrencies(dataSource: DataSource): Promise<void> {
  const currencyRepo = dataSource.getRepository(Currency);
  const exchangeRateRepo = dataSource.getRepository(ExchangeRate);

  //console.log('💱 Seeding currencies...');
  for (const data of FAKE_CURRENCIES) {
    const existing = await currencyRepo.findOne({ where: { code: data.code! } });
    if (!existing) {
      await currencyRepo.save(currencyRepo.create(data));
      //console.log(`  ✓ Currency ${data.code} created`);
    } else {
      //console.log(`  – Currency ${data.code} already exists, skipping`);
    }
  }

 // console.log('📊 Seeding exchange rates...');
  for (const data of FAKE_EXCHANGE_RATES) {
    const existing = await exchangeRateRepo.findOne({
      where: {
        fromCurrencyCode: data.fromCurrencyCode!,
        toCurrencyCode: data.toCurrencyCode!,
      },
    });
    if (!existing) {
      await exchangeRateRepo.save(exchangeRateRepo.create(data));
    }
  }
  }
