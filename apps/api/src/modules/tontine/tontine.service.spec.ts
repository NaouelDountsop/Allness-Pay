import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TontineService } from './tontine.service';
import { Tontine } from './entities/tontine.entity';
import { TontineMember } from './entities/tontine-member.entity';
import { WalletsService } from '../wallet/wallet.service';

describe('TontineService', () => {
  let service: TontineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TontineService,
        { provide: getRepositoryToken(Tontine), useValue: {} },
        { provide: getRepositoryToken(TontineMember), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: WalletsService, useValue: {} },
      ],
    }).compile();

    service = module.get<TontineService>(TontineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
