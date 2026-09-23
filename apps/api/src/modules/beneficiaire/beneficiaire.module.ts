import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiaire } from './entities/beneficiaire.entity';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { BeneficiairesService } from './beneficiaire.service';
import { BeneficiairesController } from './beneficiaire.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficiaire, User, Wallet])],
  controllers: [BeneficiairesController],
  providers: [BeneficiairesService],
  exports: [BeneficiairesService],
})
export class BeneficiairesModule {}