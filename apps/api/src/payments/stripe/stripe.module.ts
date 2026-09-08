import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { TransactionsModule } from '../../modules/transactions/transactions.module';
import { WalletsModule } from '../../modules/wallet/wallet.module';
import { UsersModule } from '../../modules/users/users.module';
import { MailModule } from '../../modules/mail/mail.module';
import { WalletTransaction } from '../../modules/transactions/entities/wallet-transaction.entity';

@Module({
  imports: [TransactionsModule, WalletsModule, UsersModule, MailModule, TypeOrmModule.forFeature([WalletTransaction])],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
