import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletsService } from './wallet.service';
import { WalletsController } from './wallet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  controllers: [WalletsController],
  providers: [WalletsService],
  // TypeOrmModule exporté => PinModule et TransactionsModule peuvent
  // injecter @InjectRepository(Wallet) directement sans le redéclarer.
  exports: [TypeOrmModule, WalletsService],
})
export class WalletsModule {}