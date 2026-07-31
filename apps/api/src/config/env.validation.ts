import * as Joi from 'joi';

/**
 * Validation des variables d'environnement au demarrage.
 *
 * L'application refuse de demarrer si la configuration est incomplete ou
 * dangereuse : mieux vaut un echec immediat et bruyant qu'un service qui
 * accepte des paiements avec un secret par defaut.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
  API_PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('1'),
  CORS_ORIGINS: Joi.string().allow('').default(''),

  SMTP_HOST: Joi.string().required(),
SMTP_PORT: Joi.number().default(587),
SMTP_USER: Joi.string().required(),
SMTP_PASS: Joi.string().required(),
SMTP_SECURE: Joi.boolean().default(false),
SMTP_FROM: Joi.string().default('"AfriLinkPay" <no-reply@afrilinkpay.com>'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  // Un secret court est un secret cassable : 32 caracteres minimum, et la
  // valeur d'exemple est explicitement refusee.
  JWT_ACCESS_SECRET: Joi.string().min(32).required().invalid(
    'changeme-access-secret-minimum-32-caracteres',
  ),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().invalid(
    'changeme-refresh-secret-minimum-32-caracteres',
  ),
  JWT_REFRESH_TTL: Joi.string().default('30d'),
  PASSWORD_HASH_ROUNDS: Joi.number().min(10).max(15).default(12),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  DEFAULT_CURRENCY: Joi.string().valid('XAF', 'XOF', 'EUR', 'USD').default('XAF'),
  IDEMPOTENCY_TTL: Joi.number().default(86400),

  MTN_MOMO_BASE_URL: Joi.string().allow('').optional(),
  MTN_MOMO_SUBSCRIPTION_KEY: Joi.string().allow('').optional(),
  MTN_MOMO_API_USER: Joi.string().allow('').optional(),
  MTN_MOMO_API_KEY: Joi.string().allow('').optional(),
  ORANGE_MONEY_BASE_URL: Joi.string().allow('').optional(),
  ORANGE_MONEY_CLIENT_ID: Joi.string().allow('').optional(),
  ORANGE_MONEY_CLIENT_SECRET: Joi.string().allow('').optional(),

  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().allow('').optional(),

  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),
});
