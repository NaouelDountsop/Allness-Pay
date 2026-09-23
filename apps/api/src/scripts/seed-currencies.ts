import dataSource from '../database/data-source';
import { seedCurrencies } from '../modules/currency/seed-currency';

async function run() {
  await dataSource.initialize();
  await seedCurrencies(dataSource);
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
