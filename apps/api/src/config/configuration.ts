import { registerAs } from '@nestjs/config';

/**
 * Configuration typee, chargee une seule fois au demarrage.
 * Aucune lecture directe de `process.env` ailleurs dans l'application.
 */

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.API_PORT ?? '3000', 10),
  prefix: process.env.API_PREFIX ?? 'api',
  version: process.env.API_VERSION ?? '1',
  corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').filter(Boolean),
  defaultCurrency: process.env.DEFAULT_CURRENCY ?? 'XAF',
  idempotencyTtl: parseInt(process.env.IDEMPOTENCY_TTL ?? '86400', 10),
  logLevel: process.env.LOG_LEVEL ?? 'info',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: (process.env.DB_USERNAME ?? 'afrilinkpay').trim(),
  password: (process.env.DB_PASSWORD ?? 'afrilinkpay').trim(),
  database: (process.env.DB_DATABASE ?? 'afrilinkpay').trim(),
  ssl: process.env.DB_SSL === 'true',
  // Volontairement non configurable a `true` ailleurs qu'en test : le schema
  // de production est pilote exclusivement par les migrations.
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
}));

export const authConfig = registerAs('auth', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET as string,
  accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  hashRounds: parseInt(process.env.PASSWORD_HASH_ROUNDS ?? '12', 10),
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}));

export const throttleConfig = registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
}));

export const providersConfig = registerAs('providers', () => ({
  mtnMomo: {
    baseUrl: process.env.MTN_MOMO_BASE_URL ?? '',
    subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? '',
    apiUser: process.env.MTN_MOMO_API_USER ?? '',
    apiKey: process.env.MTN_MOMO_API_KEY ?? '',
  },
  orangeMoney: {
    baseUrl: process.env.ORANGE_MONEY_BASE_URL ?? '',
    clientId: process.env.ORANGE_MONEY_CLIENT_ID ?? '',
    clientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET ?? '',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/api/v1/auth/google/callback',
  },
  tranzak: {
    baseUrl: process.env.TRANZAK_BASE_URL ?? '',
    appId: process.env.TRANZAK_APP_ID ?? '',
    appKey: process.env.TRANZAK_APP_KEY ?? '',
    callbackUrl: process.env.TRANZAK_CALLBACK_URL ?? '',
  },
}));

export const mailConfig = registerAs('mail', () => ({
  host: process.env.SMTP_HOST ?? 'localhost',
  port: parseInt(process.env.SMTP_PORT ?? '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER ?? '',
  pass: process.env.SMTP_PASS ?? '',
  from: process.env.SMTP_FROM ?? 'noreply@afrilinkpay.com',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}));

export const configurations = [
  appConfig,
  databaseConfig,
  authConfig,
  redisConfig,
  throttleConfig,
  providersConfig,
  mailConfig,
];


export type AppConfig = ReturnType<typeof appConfig>;
export type DatabaseConfig = ReturnType<typeof databaseConfig>;
export type AuthConfig = ReturnType<typeof authConfig>;
export type RedisConfig = ReturnType<typeof redisConfig>;
export type ThrottleConfig = ReturnType<typeof throttleConfig>;
export type ProvidersConfig = ReturnType<typeof providersConfig>;
export type MailConfig = ReturnType<typeof mailConfig> & { frontendUrl: string };
