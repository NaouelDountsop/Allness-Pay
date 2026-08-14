import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BeneficiairesService } from './beneficiaire.service';

describe('BeneficiairesService', () => {
  let service: BeneficiairesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeneficiairesService],
    }).compile();

    service = module.get<BeneficiairesService>(BeneficiairesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
