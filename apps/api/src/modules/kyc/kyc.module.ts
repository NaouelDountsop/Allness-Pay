import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { Kyc } from './entities/kyc.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../role/role.module';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { WalletsModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kyc]),
    AuthModule,
    RolesModule,
    MailModule,
    UsersModule,
    WalletsModule,
  ],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
