import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { WalletsModule } from '../wallet/wallet.module';
import { PinModule } from '../pin/pin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletTransaction]),
    WalletsModule,
    PinModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}