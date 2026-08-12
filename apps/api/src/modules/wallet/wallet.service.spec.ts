import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallet.service';

describe('WalletsService', () => {
  let service: WalletsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: WalletsService, useValue: {} }],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
