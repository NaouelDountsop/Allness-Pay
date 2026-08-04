import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiaireService } from './beneficiaire.service';

describe('BeneficiaireService', () => {
  let service: BeneficiaireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeneficiaireService],
    }).compile();

    service = module.get<BeneficiaireService>(BeneficiaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
