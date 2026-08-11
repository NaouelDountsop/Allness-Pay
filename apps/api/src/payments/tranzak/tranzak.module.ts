import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranzakController } from './tranzak.controller';
import { TranzakService } from './tranzak.service';
import { TransactionsModule } from '../../modules/transactions/transactions.module';
import { WalletsModule } from '../../modules/wallet/wallet.module';
import { WalletTransaction } from '../../modules/transactions/entities/wallet-transaction.entity';

@Module({
  imports: [TransactionsModule, WalletsModule, TypeOrmModule.forFeature([WalletTransaction])],
  controllers: [TranzakController],
  providers: [TranzakService],
  exports: [TranzakService],
})
export class TranzakModule {}
