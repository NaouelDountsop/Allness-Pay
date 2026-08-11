import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'node:path';
import { configurations, type ThrottleConfig } from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { OtpModule } from './modules/otp/otp.module';
import { MailService } from './modules/mail/mail.service';
import { MailModule } from './modules/mail/mail.module';
import { KycModule } from './modules/kyc/kyc.module';
import { WalletsModule } from './modules/wallet/wallet.module';
import { PinModule } from './modules/pin/pin.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RolesModule } from './modules/role/role.module';
import { TontineModule } from './modules/tontine/tontine.module';
import { AdminModule } from './modules/admin/admin.module';
import { BeneficiaireModule } from './modules/beneficiaire/beneficiaire.module';
import { TranzakModule } from './payments/tranzak/tranzak.module';

import { LinkedAccountModule } from './modules/linked-account/linked-account.module';

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
    UsersModule,
    AuthModule,
    OtpModule,
    MailModule,
    KycModule,
    WalletsModule,
    PinModule,
    TransactionsModule,
    RolesModule,
    TontineModule,
    AdminModule,
    BeneficiaireModule,
    TranzakModule,

    LinkedAccountModule,

    // `src/modules/README.md`.
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, MailService],
})
export class AppModule {}
