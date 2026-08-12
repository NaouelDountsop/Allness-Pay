import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { BeneficiaireController } from './beneficiaire.controller';
import { BeneficiaireService } from './beneficiaire.service';

describe('BeneficiaireController', () => {
  let controller: BeneficiaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeneficiaireController],
      providers: [{ provide: BeneficiaireService, useValue: {} }],
    }).compile();

    controller = module.get<BeneficiaireController>(BeneficiaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
