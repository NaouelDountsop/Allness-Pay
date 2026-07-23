import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'node:path';
import { configurations, type ThrottleConfig } from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configurations,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
      envFilePath: [join(__dirname, '../../../.env')],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const throttle = config.getOrThrow<ThrottleConfig>('throttle');
        return [{ ttl: throttle.ttl * 1000, limit: throttle.limit }];
      },
    }),
    DatabaseModule,

    // --- Modules metier ------------------------------------------------------
    // Chaque domaine s'ajoute ici, sous `src/modules/<domaine>/`, en respectant
    // le decoupage Controller -> Service -> Repository decrit dans
    // `src/modules/README.md`.
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
