import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkedAccount } from './entities/linked-account.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { LinkedAccountsService } from './linked-account.service';
import { LinkedAccountsController } from './linked-account.controller';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([LinkedAccount, Wallet]), OtpModule],
  controllers: [LinkedAccountsController],
  providers: [LinkedAccountsService],
  exports: [LinkedAccountsService],
})
export class LinkedAccountModule {}
