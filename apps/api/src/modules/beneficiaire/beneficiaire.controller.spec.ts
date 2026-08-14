import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { BeneficiairesController } from './beneficiaire.controller';
import { BeneficiairesService } from './beneficiaire.service';

describe('BeneficiairesController', () => {
  let controller: BeneficiairesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeneficiairesController],
      providers: [{ provide: BeneficiairesService, useValue: {} }],
    }).compile();

    controller = module.get<BeneficiairesController>(BeneficiairesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
