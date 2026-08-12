import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TranzakService } from './tranzak.service';
import { TransactionsService } from '../../modules/transactions/transactions.service';
import { WalletsService } from '../../modules/wallet/wallet.service';
import { WalletTransaction } from '../../modules/transactions/entities/wallet-transaction.entity';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TranzakService', () => {
  let service: TranzakService;
  let mockTransactionsService: { confirmExternalPayment: jest.Mock; recordExternalPayment: jest.Mock };
  let mockWalletTransactionRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTransactionsService = {
      confirmExternalPayment: jest.fn().mockResolvedValue({ id: 'test-id', status: 'completed' }),
      recordExternalPayment: jest.fn(),
    };

    mockWalletTransactionRepo = {
      findOne: jest.fn().mockResolvedValue({ providerRequestId: 'REQ-123' }),
    };

    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue({
        baseUrl: 'https://sandbox.dsapi.tranzak.me',
        appId: 'test-app-id',
        appKey: 'test-app-key',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranzakService,
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: WalletsService, useValue: {} },
        { provide: getRepositoryToken(WalletTransaction), useValue: mockWalletTransactionRepo },
      ],
    }).compile();

    service = module.get<TranzakService>(TranzakService);

    mockedAxios.post.mockResolvedValue({ data: { data: { token: 'fake-token' } } });
    mockedAxios.get.mockResolvedValue({ data: { data: { status: 'SUCCESSFUL' } } });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCallback', () => {
    it('should call confirmExternalPayment with COMPLETED status when SUCCESS', async () => {
      const result = await service.handleCallback('test-id', 'SUCCESS', false);

      expect(mockWalletTransactionRepo.findOne).toHaveBeenCalledWith({
        where: { provider: 'TRANZAK', providerTransactionId: 'test-id' },
      });
      expect(mockTransactionsService.confirmExternalPayment).toHaveBeenCalledWith(
        'TRANZAK',
        'test-id',
        'completed',
        false,
      );
      expect(result).toEqual({ id: 'test-id', status: 'completed' });
    });

    it('should call confirmExternalPayment with FAILED status when not SUCCESS', async () => {
      mockedAxios.get.mockResolvedValue({ data: { data: { status: 'FAILED' } } });

      const result = await service.handleCallback('test-id', 'FAILED', false);

      expect(mockTransactionsService.confirmExternalPayment).toHaveBeenCalledWith(
        'TRANZAK',
        'test-id',
        'failed',
        false,
      );
      expect(result).toEqual({ id: 'test-id', status: 'completed' });
    });
  });
});
