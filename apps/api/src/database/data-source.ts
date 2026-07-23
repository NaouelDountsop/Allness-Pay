import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'node:path';

// Charge le `.env` de la racine du monorepo, pour que la CLI TypeORM ait la
// meme configuration que l'application.
loadEnv({ path: join(__dirname, '../../../../.env') });

/**
 * Source de donnees utilisee **uniquement par la CLI TypeORM** (generation et
 * execution des migrations). L'application, elle, se configure via
 * `DatabaseModule`.
 */
export const dataSourceOptions = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'afrilinkpay',
  password: process.env.DB_PASSWORD ?? 'afrilinkpay',
  database: process.env.DB_DATABASE ?? 'afrilinkpay',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Toujours false : le schema est pilote par les migrations. Activer la
  // synchronisation sur une base contenant des soldes est une perte de donnees
  // en puissance.
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  migrationsTableName: 'typeorm_migrations',
};

export default new DataSource(dataSourceOptions);
