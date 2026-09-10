import 'reflect-metadata';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor';
import type { AppConfig } from './config/configuration';
import { KYC_UPLOADS_DIR } from './common/config/uploads.config';
import type { Request, Response } from 'express';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const appConfig = config.getOrThrow<AppConfig>('app');
  const logger = new Logger('Bootstrap');

  // --- Securite ------------------------------------------------------------
  app.use(
    helmet({
      contentSecurityPolicy: appConfig.env === 'production',
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

  // --- Capture raw body for webhook verification (Stripe expects exact bytes)
  // Disable the default NestJS body parser so we can control raw capture ourselves.
  // This ensures req.rawBody is always populated for Stripe signature verification.
  // app.use(bodyParser.json({
  //   verify: (req: any, _res, buf: Buffer) => {
  //     req.rawBody = buf;
  //   },
  //   type: ['application/json', 'application/*+json'],
  // }));

  interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

// ...existing code...
app.use(bodyParser.json({
  verify: (req: RawBodyRequest, _res: Response, buf: Buffer) => {
    req.rawBody = buf;
  },
  type: ['application/json', 'application/*+json'],
}));

  app.enableCors({
    origin: appConfig.corsOrigins.length > 0 ? appConfig.corsOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86_400,
  });

  // --- Fichiers statiques (uploads KYC, etc.) -------------------------------
  app.useStaticAssets(join(KYC_UPLOADS_DIR, '..'), {
    prefix: '/uploads',
  });

  // --- Routage -------------------------------------------------------------
  app.setGlobalPrefix(appConfig.prefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: appConfig.version });

  // --- Validation ----------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      stopAtFirstError: false,
    }),
  );

  // --- Interception --------------------------------------------------------
  app.useGlobalInterceptors(
    new RequestContextInterceptor(),
    new LoggingInterceptor(),
    new BigIntSerializerInterceptor(),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // --- Documentation -------------------------------------------------------
  if (appConfig.env !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('AllnessPay API')
        .setDescription(
          "API de la plateforme de transfert d'argent avec portefeuille electronique.",
        )
        .setVersion(appConfig.version)
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .addServer(`http://localhost:${appConfig.port}`)
        .build(),
    );
    SwaggerModule.setup(`${appConfig.prefix}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`Documentation : http://localhost:${appConfig.port}/${appConfig.prefix}/docs`);
  }

  app.enableShutdownHooks();

  await app.listen(appConfig.port);
  logger.log(`API demarree sur le port ${appConfig.port} en mode ${appConfig.env}`);
}

void bootstrap();
