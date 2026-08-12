import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { WalletsService } from '../wallet/wallet.service';
import { PinService } from '../pin/pin.service';

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: DataSource, useValue: {} },
        { provide: WalletsService, useValue: {} },
        { provide: PinService, useValue: {} },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
