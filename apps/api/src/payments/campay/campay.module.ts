import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampayController } from './campay.controller';
import { CampayService } from './campay.service';
import { TransactionsModule } from '../../modules/transactions/transactions.module';
import { WalletsModule } from '../../modules/wallet/wallet.module';
import { WalletTransaction } from '../../modules/transactions/entities/wallet-transaction.entity';

@Module({
  imports: [TransactionsModule, WalletsModule, TypeOrmModule.forFeature([WalletTransaction])],
  controllers: [CampayController],
  providers: [CampayService],
  exports: [CampayService],
})
export class CampayModule {}
