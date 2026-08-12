import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Kyc } from '../kyc/entities/kyc.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletTransaction } from '../transactions/entities/wallet-transaction.entity';
import { Tontine } from '../tontine/entities/tontine.entity';
import { RolesModule } from '../role/role.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Kyc, Wallet, WalletTransaction, Tontine]), RolesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
