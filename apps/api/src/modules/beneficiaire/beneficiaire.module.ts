import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiaire } from './entities/beneficiaire.entity';
import { BeneficiairesService } from './beneficiaire.service';
import { BeneficiairesController } from './beneficiaire.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Beneficiaire])],
  controllers: [BeneficiairesController],
  providers: [BeneficiairesService],
  exports: [BeneficiairesService], // utile pour le futur module "transferts"
})
export class BeneficiairesModule {}