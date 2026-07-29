import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity'; // 👈 adaptez le chemin/nom réel
import { WalletsModule } from '../wallet/wallet.module';
import { PinModule } from '../pin/pin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]), 
    WalletsModule,
    PinModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}