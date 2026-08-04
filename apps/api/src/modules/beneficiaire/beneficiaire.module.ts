import { Module } from '@nestjs/common';
import { BeneficiaireService } from './beneficiaire.service';
import { BeneficiaireController } from './beneficiaire.controller';

@Module({
  controllers: [BeneficiaireController],
  providers: [BeneficiaireService],
})
export class BeneficiaireModule {}