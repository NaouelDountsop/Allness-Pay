import { DataSource } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { ExchangeRate } from './entities/exchange-rate.entity';

const FAKE_CURRENCIES: Partial<Currency>[] = [
  { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA', decimals: 0, country: 'Cameroun, Gabon, Congo', flag: '🇨🇲', isActive: true },
  { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'CFA', decimals: 0, country: 'Sénégal, Côte d\'Ivoire, Mali', flag: '🇸🇳', isActive: true },
  { code: 'CDF', name: 'Franc congolais', symbol: 'FC', decimals: 2, country: 'Rép. Dém. du Congo', flag: '🇨🇩', isActive: true },
  { code: 'GNF', name: 'Franc guinéen', symbol: 'FG', decimals: 0, country: 'Guinée', flag: '🇬🇳', isActive: true },
  { code: 'RWF', name: 'Franc rwandais', symbol: 'FRw', decimals: 0, country: 'Rwanda', flag: '🇷🇼', isActive: true },
  { code: 'KES', name: 'Shilling kényan', symbol: 'KSh', decimals: 2, country: 'Kenya', flag: '🇰🇪', isActive: true },
  { code: 'GHS', name: 'Cedi ghanéen', symbol: 'GH₵', decimals: 2, country: 'Ghana', flag: '🇬🇭', isActive: true },
  { code: 'NGN', name: 'Naira nigérian', symbol: '₦', decimals: 2, country: 'Nigeria', flag: '🇳🇬', isActive: true },
  { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R', decimals: 2, country: 'Afrique du Sud', flag: '🇿🇦', isActive: true },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, country: 'France, zone euro', flag: '🇪🇺', isActive: true },
  { code: 'USD', name: 'Dollar américain', symbol: '$', decimals: 2, country: 'États-Unis', flag: '🇺🇸', isActive: true },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'CA$', decimals: 2, country: 'Canada', flag: '🇨🇦', isActive: true },
];

const FAKE_EXCHANGE_RATES: Partial<ExchangeRate>[] = [
  // CAD
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'XAF', rate: 442.15, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'XOF', rate: 442.15, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'EUR', rate: 0.68, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'USD', rate: 0.74, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'GHS', rate: 8.92, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'NGN', rate: 1145.50, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'KES', rate: 98.30, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'ZAR', rate: 13.85, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'RWF', rate: 1050.0, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'CDF', rate: 2100.0, isActive: true },
  { fromCurrencyCode: 'CAD', toCurrencyCode: 'GNF', rate: 5650.0, isActive: true },
  // EUR
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'CAD', rate: 1.47, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'XAF', rate: 654.5, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'XOF', rate: 654.5, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'USD', rate: 1.09, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'GHS', rate: 13.12, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'NGN', rate: 1685.0, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'KES', rate: 144.6, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'ZAR', rate: 20.37, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'RWF', rate: 1545.0, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'CDF', rate: 3090.0, isActive: true },
  { fromCurrencyCode: 'EUR', toCurrencyCode: 'GNF', rate: 8310.0, isActive: true },
  // USD
  { fromCurrencyCode: 'USD', toCurrencyCode: 'CAD', rate: 1.35, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'XAF', rate: 600.0, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'XOF', rate: 600.0, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'EUR', rate: 0.92, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'GHS', rate: 12.05, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'NGN', rate: 1545.0, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'KES', rate: 132.6, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'ZAR', rate: 18.7, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'RWF', rate: 1415.0, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'CDF', rate: 2830.0, isActive: true },
  { fromCurrencyCode: 'USD', toCurrencyCode: 'GNF', rate: 7610.0, isActive: true },
  // XAF
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'CAD', rate: 0.00226, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'EUR', rate: 0.00153, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'USD', rate: 0.00167, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'XOF', rate: 1.0, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'GHS', rate: 0.0201, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'NGN', rate: 2.58, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'KES', rate: 0.222, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'ZAR', rate: 0.0314, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'RWF', rate: 2.38, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'CDF', rate: 4.75, isActive: true },
  { fromCurrencyCode: 'XAF', toCurrencyCode: 'GNF', rate: 12.7, isActive: true },
  // XOF
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'CAD', rate: 0.00226, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'EUR', rate: 0.00153, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'USD', rate: 0.00167, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'XAF', rate: 1.0, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'GHS', rate: 0.0201, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'NGN', rate: 2.58, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'KES', rate: 0.222, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'ZAR', rate: 0.0314, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'RWF', rate: 2.38, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'CDF', rate: 4.75, isActive: true },
  { fromCurrencyCode: 'XOF', toCurrencyCode: 'GNF', rate: 12.7, isActive: true },
  // GHS
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'CAD', rate: 0.112, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'EUR', rate: 0.076, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'USD', rate: 0.083, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'XAF', rate: 49.75, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'XOF', rate: 49.75, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'NGN', rate: 128.5, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'KES', rate: 11.03, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'ZAR', rate: 1.56, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'RWF', rate: 117.5, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'CDF', rate: 235.0, isActive: true },
  { fromCurrencyCode: 'GHS', toCurrencyCode: 'GNF', rate: 630.0, isActive: true },
  // NGN
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'CAD', rate: 0.000873, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'EUR', rate: 0.000593, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'USD', rate: 0.000647, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'XAF', rate: 0.388, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'XOF', rate: 0.388, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'GHS', rate: 0.00778, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'KES', rate: 0.0858, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'ZAR', rate: 0.0121, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'RWF', rate: 0.914, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'CDF', rate: 1.83, isActive: true },
  { fromCurrencyCode: 'NGN', toCurrencyCode: 'GNF', rate: 4.91, isActive: true },
  // KES
  { fromCurrencyCode: 'KES', toCurrencyCode: 'CAD', rate: 0.0102, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'EUR', rate: 0.00691, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'USD', rate: 0.00754, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'XAF', rate: 4.5, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'XOF', rate: 4.5, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'GHS', rate: 0.0907, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'NGN', rate: 11.66, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'ZAR', rate: 0.141, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'RWF', rate: 10.68, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'CDF', rate: 21.35, isActive: true },
  { fromCurrencyCode: 'KES', toCurrencyCode: 'GNF', rate: 57.2, isActive: true },
  // ZAR
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'CAD', rate: 0.0722, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'EUR', rate: 0.0491, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'USD', rate: 0.0535, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'XAF', rate: 31.85, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'XOF', rate: 31.85, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'GHS', rate: 0.641, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'NGN', rate: 82.65, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'KES', rate: 7.1, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'RWF', rate: 75.8, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'CDF', rate: 151.5, isActive: true },
  { fromCurrencyCode: 'ZAR', toCurrencyCode: 'GNF', rate: 405.5, isActive: true },
  // RWF
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'CAD', rate: 0.000952, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'EUR', rate: 0.000647, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'USD', rate: 0.000707, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'XAF', rate: 0.42, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'XOF', rate: 0.42, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'GHS', rate: 0.00851, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'NGN', rate: 1.09, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'KES', rate: 0.0936, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'ZAR', rate: 0.0132, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'CDF', rate: 2.0, isActive: true },
  { fromCurrencyCode: 'RWF', toCurrencyCode: 'GNF', rate: 5.35, isActive: true },
  // CDF
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'CAD', rate: 0.000476, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'EUR', rate: 0.000324, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'USD', rate: 0.000353, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'XAF', rate: 0.21, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'XOF', rate: 0.21, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'GHS', rate: 0.00426, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'NGN', rate: 0.547, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'KES', rate: 0.0468, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'ZAR', rate: 0.0066, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'RWF', rate: 0.5, isActive: true },
  { fromCurrencyCode: 'CDF', toCurrencyCode: 'GNF', rate: 2.68, isActive: true },
  // GNF
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'CAD', rate: 0.000177, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'EUR', rate: 0.00012, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'USD', rate: 0.000131, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'XAF', rate: 0.0787, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'XOF', rate: 0.0787, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'GHS', rate: 0.00159, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'NGN', rate: 0.204, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'KES', rate: 0.0175, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'ZAR', rate: 0.00247, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'RWF', rate: 0.187, isActive: true },
  { fromCurrencyCode: 'GNF', toCurrencyCode: 'CDF', rate: 0.373, isActive: true },
];

export async function seedCurrencies(dataSource: DataSource): Promise<void> {
  const currencyRepo = dataSource.getRepository(Currency);
  const exchangeRateRepo = dataSource.getRepository(ExchangeRate);

  console.log('💱 Seeding currencies...');
  for (const data of FAKE_CURRENCIES) {
    const existing = await currencyRepo.findOne({ where: { code: data.code! } });
    if (!existing) {
      await currencyRepo.save(currencyRepo.create(data));
      console.log(`  ✓ Currency ${data.code} created`);
    } else {
      console.log(`  – Currency ${data.code} already exists, skipping`);
    }
  }

  console.log('📊 Seeding exchange rates...');
  let count = 0;
  for (const data of FAKE_EXCHANGE_RATES) {
    const existing = await exchangeRateRepo.findOne({
      where: {
        fromCurrencyCode: data.fromCurrencyCode!,
        toCurrencyCode: data.toCurrencyCode!,
      },
    });
    if (!existing) {
      await exchangeRateRepo.save(exchangeRateRepo.create(data));
      count++;
    }
  }
  console.log(`  ✓ ${count} exchange rates created`);
  console.log('💱 Seed complete!');
}
