import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

import { Currency } from '../modules/currency/entities/currency.entity';
import { ExchangeRate } from '../modules/currency/entities/exchange-rate.entity';
import { seedCurrencies } from '../modules/currency/seed-currency';

loadEnv({
  path: join(__dirname, '../../../.env'),
});

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'afrilinkpay',
  password: process.env.DB_PASSWORD ?? 'afrilinkpay',
  database: process.env.DB_DATABASE ?? 'afrilinkpay',
  entities: [
    Currency,
    ExchangeRate,
  ],
});

async function run() {
  await dataSource.initialize();

  await seedCurrencies(dataSource);

  await dataSource.destroy();

  

}

run().catch((error) => {
  console.error('Erreur:', error);
  process.exit(1);
});